create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft',
  title text not null,
  excerpt text not null,
  category text not null,
  tags text[] not null default '{}',
  body_markdown text not null,
  seo_title text not null,
  seo_description text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint posts_status check (status in ('draft', 'published')),
  constraint posts_category check (category in ('경제', '기술', '생활', '관찰', '리뷰')),
  constraint posts_title_present check (length(btrim(title)) > 0),
  constraint posts_excerpt_present check (length(btrim(excerpt)) > 0),
  constraint posts_body_present check (length(btrim(body_markdown)) > 0),
  constraint posts_seo_title_present check (length(btrim(seo_title)) > 0),
  constraint posts_seo_description_present check (length(btrim(seo_description)) > 0),
  constraint posts_publication_state check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
  )
);

create table public.post_sources (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  position integer not null,
  title text not null,
  publisher text not null,
  url text not null,
  accessed_at date not null,
  created_at timestamptz not null default now(),
  constraint post_sources_position check (position > 0),
  constraint post_sources_title_present check (length(btrim(title)) > 0),
  constraint post_sources_publisher_present check (length(btrim(publisher)) > 0),
  constraint post_sources_http_url check (url ~* '^https?://[^[:space:]]+$'),
  constraint post_sources_position_unique unique (post_id, position)
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  occurred_at timestamptz not null,
  page_path text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint analytics_events_name check (
    name in ('page_viewed', 'post_opened', 'search_used', 'filter_applied', 'archive_expanded', 'source_opened')
  ),
  constraint analytics_events_page_path check (
    page_path ~ '^/' and position('?' in page_path) = 0 and position('#' in page_path) = 0
  ),
  constraint analytics_events_properties_object check (jsonb_typeof(properties) = 'object')
);

create index posts_published_at_desc on public.posts (published_at desc) where status = 'published';
create index post_sources_post_position on public.post_sources (post_id, position);
create index analytics_events_occurred_at on public.analytics_events (occurred_at);
create index analytics_events_name_occurred_at on public.analytics_events (name, occurred_at);

create function public.set_post_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := clock_timestamp();
    new.updated_at := new.created_at;
    new.published_at := case when new.status = 'published' then new.created_at else null end;
  else
    new.created_at := old.created_at;
    new.updated_at := clock_timestamp();

    if old.published_at is not null and new.status <> 'published' then
      raise exception 'Published posts cannot return to draft status.';
    end if;

    new.published_at := case
      when old.published_at is not null then old.published_at
      when new.status = 'published' then new.updated_at
      else null
    end;
  end if;

  return new;
end;
$$;

create trigger posts_set_timestamps
before insert or update on public.posts
for each row execute function public.set_post_timestamps();

create function public.reject_future_source_accessed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.accessed_at > (now() at time zone 'Asia/Seoul')::date then
    raise exception 'Source accessed_at cannot be in the future.';
  end if;

  return new;
end;
$$;

create trigger post_sources_reject_future_accessed_at
before insert or update on public.post_sources
for each row execute function public.reject_future_source_accessed_at();

alter table public.posts enable row level security;
alter table public.posts force row level security;
alter table public.post_sources enable row level security;
alter table public.post_sources force row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_events force row level security;

revoke all on table public.posts from public, anon, authenticated;
revoke all on table public.post_sources from public, anon, authenticated;
revoke all on table public.analytics_events from public, anon, authenticated;
revoke all on function public.set_post_timestamps() from public;
revoke all on function public.reject_future_source_accessed_at() from public;

grant usage on schema public to anon, authenticated;
grant select on table public.posts to anon, authenticated;
grant select on table public.post_sources to anon, authenticated;

create policy "Published posts are readable publicly"
on public.posts
for select to anon, authenticated
using (status = 'published');

create policy "Sources of published posts are readable publicly"
on public.post_sources
for select to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_sources.post_id
      and posts.status = 'published'
  )
);
