create table public.analytics_daily_metrics (
  metric_date date not null,
  event_name text not null,
  page_path text not null,
  post_slug text not null default '',
  dimension_value text not null default '',
  event_count bigint not null default 0,
  primary_value_sum bigint not null default 0,
  secondary_value_sum bigint not null default 0,
  positive_result_count bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (metric_date, event_name, page_path, post_slug, dimension_value),
  constraint analytics_daily_metrics_name check (
    event_name in ('page_viewed', 'post_opened', 'search_used', 'filter_applied', 'archive_expanded', 'source_opened')
  ),
  constraint analytics_daily_metrics_counts check (
    event_count >= 0
    and primary_value_sum >= 0
    and secondary_value_sum >= 0
    and positive_result_count >= 0
    and positive_result_count <= event_count
  )
);

create index analytics_daily_metrics_date_name
on public.analytics_daily_metrics (metric_date desc, event_name);

alter table public.analytics_daily_metrics enable row level security;
alter table public.analytics_daily_metrics force row level security;

revoke all on table public.analytics_daily_metrics from public, anon, authenticated;
grant select on table public.analytics_daily_metrics to service_role;

create function public.record_analytics_event(
  event_name text,
  event_occurred_at timestamptz,
  event_page_path text,
  event_properties jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
  metric_post_slug text := '';
  metric_dimension text := '';
  metric_primary bigint := 0;
  metric_secondary bigint := 0;
  metric_positive bigint := 0;
  primary_numeric numeric := 0;
  secondary_numeric numeric := 0;
  expected_category text;
begin
  if event_name not in ('page_viewed', 'post_opened', 'search_used', 'filter_applied', 'archive_expanded', 'source_opened') then
    raise exception using errcode = '22023', message = 'Unsupported analytics event.';
  end if;

  if event_occurred_at < clock_timestamp() - interval '24 hours'
    or event_occurred_at > clock_timestamp() + interval '5 minutes' then
    raise exception using errcode = '22023', message = 'Analytics timestamp is outside the accepted window.';
  end if;

  if length(event_page_path) > 300
    or event_page_path !~ '^/$|^/about$|^/posts/[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception using errcode = '22023', message = 'Unsupported analytics path.';
  end if;

  if jsonb_typeof(event_properties) <> 'object' then
    raise exception using errcode = '22023', message = 'Analytics properties must be an object.';
  end if;

  if event_name = 'page_viewed' then
    if event_properties <> '{}'::jsonb then
      raise exception using errcode = '22023', message = 'Unexpected page_viewed properties.';
    end if;
    if event_page_path like '/posts/%' then
      metric_post_slug := substring(event_page_path from 8);
      if not exists (
        select 1 from public.posts where slug = metric_post_slug and status = 'published'
      ) then
        raise exception using errcode = '22023', message = 'Unknown published post.';
      end if;
    end if;

  elsif event_name = 'post_opened' then
    if (select count(*) from jsonb_object_keys(event_properties)) <> 2
      or not (event_properties ?& array['post_slug', 'category'])
      or jsonb_typeof(event_properties->'post_slug') <> 'string'
      or jsonb_typeof(event_properties->'category') <> 'string' then
      raise exception using errcode = '22023', message = 'Invalid post_opened properties.';
    end if;
    metric_post_slug := event_properties->>'post_slug';
    metric_dimension := event_properties->>'category';
    select category into expected_category
    from public.posts
    where slug = metric_post_slug and status = 'published';
    if expected_category is null or expected_category <> metric_dimension then
      raise exception using errcode = '22023', message = 'Post metadata does not match a published post.';
    end if;

  elsif event_name = 'search_used' then
    if (select count(*) from jsonb_object_keys(event_properties)) <> 2
      or not (event_properties ?& array['query_length', 'results_count'])
      or jsonb_typeof(event_properties->'query_length') <> 'number'
      or jsonb_typeof(event_properties->'results_count') <> 'number' then
      raise exception using errcode = '22023', message = 'Invalid search_used properties.';
    end if;
    primary_numeric := (event_properties->>'query_length')::numeric;
    secondary_numeric := (event_properties->>'results_count')::numeric;
    if primary_numeric <> trunc(primary_numeric)
      or secondary_numeric <> trunc(secondary_numeric)
      or primary_numeric < 0 or primary_numeric > 10000
      or secondary_numeric < 0 or secondary_numeric > 10000 then
      raise exception using errcode = '22023', message = 'Search counts are outside the accepted range.';
    end if;
    metric_primary := primary_numeric::bigint;
    metric_secondary := secondary_numeric::bigint;
    metric_positive := case when metric_secondary > 0 then 1 else 0 end;

  elsif event_name = 'filter_applied' then
    if (select count(*) from jsonb_object_keys(event_properties)) <> 1
      or not (event_properties ? 'value')
      or jsonb_typeof(event_properties->'value') <> 'string'
      or event_properties->>'value' not in ('경제', '기술', '생활', '관찰', '리뷰') then
      raise exception using errcode = '22023', message = 'Invalid filter_applied properties.';
    end if;
    metric_dimension := event_properties->>'value';

  elsif event_name = 'archive_expanded' then
    if (select count(*) from jsonb_object_keys(event_properties)) <> 2
      or not (event_properties ?& array['visible_count', 'total_count'])
      or jsonb_typeof(event_properties->'visible_count') <> 'number'
      or jsonb_typeof(event_properties->'total_count') <> 'number' then
      raise exception using errcode = '22023', message = 'Invalid archive_expanded properties.';
    end if;
    primary_numeric := (event_properties->>'visible_count')::numeric;
    secondary_numeric := (event_properties->>'total_count')::numeric;
    if primary_numeric <> trunc(primary_numeric)
      or secondary_numeric <> trunc(secondary_numeric)
      or primary_numeric < 0 or primary_numeric > secondary_numeric
      or secondary_numeric > 10000 then
      raise exception using errcode = '22023', message = 'Archive counts are outside the accepted range.';
    end if;
    metric_primary := primary_numeric::bigint;
    metric_secondary := secondary_numeric::bigint;

  else
    if (select count(*) from jsonb_object_keys(event_properties)) <> 2
      or not (event_properties ?& array['post_slug', 'source_host'])
      or jsonb_typeof(event_properties->'post_slug') <> 'string'
      or jsonb_typeof(event_properties->'source_host') <> 'string' then
      raise exception using errcode = '22023', message = 'Invalid source_opened properties.';
    end if;
    metric_post_slug := event_properties->>'post_slug';
    metric_dimension := lower(event_properties->>'source_host');
    if length(metric_dimension) > 253
      or metric_dimension !~ '^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
      or not exists (
        select 1
        from public.posts
        join public.post_sources on post_sources.post_id = posts.id
        where posts.slug = metric_post_slug
          and posts.status = 'published'
          and lower(substring(post_sources.url from '^https?://([^/:?#]+)')) = metric_dimension
      ) then
      raise exception using errcode = '22023', message = 'Source metadata does not match a published post.';
    end if;
  end if;

  insert into public.analytics_events (name, occurred_at, page_path, properties)
  values (event_name, event_occurred_at, event_page_path, event_properties)
  returning id into saved_id;

  insert into public.analytics_daily_metrics (
    metric_date,
    event_name,
    page_path,
    post_slug,
    dimension_value,
    event_count,
    primary_value_sum,
    secondary_value_sum,
    positive_result_count
  ) values (
    (event_occurred_at at time zone 'Asia/Seoul')::date,
    event_name,
    event_page_path,
    metric_post_slug,
    metric_dimension,
    1,
    metric_primary,
    metric_secondary,
    metric_positive
  )
  on conflict on constraint analytics_daily_metrics_pkey
  do update set
    event_count = analytics_daily_metrics.event_count + 1,
    primary_value_sum = analytics_daily_metrics.primary_value_sum + excluded.primary_value_sum,
    secondary_value_sum = analytics_daily_metrics.secondary_value_sum + excluded.secondary_value_sum,
    positive_result_count = analytics_daily_metrics.positive_result_count + excluded.positive_result_count,
    updated_at = clock_timestamp();

  return saved_id;
end;
$$;

revoke all on function public.record_analytics_event(text, timestamptz, text, jsonb) from public;
grant execute on function public.record_analytics_event(text, timestamptz, text, jsonb) to anon, authenticated;

create function public.prune_analytics_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.analytics_events
  where occurred_at < clock_timestamp() - interval '90 days';

  delete from public.analytics_daily_metrics
  where metric_date < ((clock_timestamp() at time zone 'Asia/Seoul')::date - interval '24 months')::date;
end;
$$;

revoke all on function public.prune_analytics_data() from public, anon, authenticated;
grant execute on function public.prune_analytics_data() to service_role;

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'yeobaek-prune-analytics',
  '17 3 * * *',
  'select public.prune_analytics_data();'
);
