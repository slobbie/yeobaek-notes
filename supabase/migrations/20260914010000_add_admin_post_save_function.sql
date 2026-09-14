create function public.save_admin_post(
  post_id uuid,
  post_data jsonb,
  sources_data jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  saved_id uuid;
  source_item jsonb;
  source_position integer := 0;
begin
  if jsonb_typeof(post_data) <> 'object' then
    raise exception 'post_data must be an object.' using errcode = '22023';
  end if;

  if jsonb_typeof(sources_data) <> 'array' then
    raise exception 'sources_data must be an array.' using errcode = '22023';
  end if;

  if post_id is null then
    insert into public.posts (
      status,
      slug,
      title,
      excerpt,
      category,
      tags,
      body_markdown,
      seo_title,
      seo_description
    )
    values (
      post_data->>'status',
      post_data->>'slug',
      post_data->>'title',
      post_data->>'excerpt',
      post_data->>'category',
      array(select jsonb_array_elements_text(coalesce(post_data->'tags', '[]'::jsonb))),
      post_data->>'body_markdown',
      post_data->>'seo_title',
      post_data->>'seo_description'
    )
    returning id into saved_id;
  else
    update public.posts as target
    set
      status = post_data->>'status',
      slug = post_data->>'slug',
      title = post_data->>'title',
      excerpt = post_data->>'excerpt',
      category = post_data->>'category',
      tags = array(select jsonb_array_elements_text(coalesce(post_data->'tags', '[]'::jsonb))),
      body_markdown = post_data->>'body_markdown',
      seo_title = post_data->>'seo_title',
      seo_description = post_data->>'seo_description'
    where target.id = post_id
    returning target.id into saved_id;

    if saved_id is null then
      raise exception 'Post not found.' using errcode = 'P0002';
    end if;
  end if;

  delete from public.post_sources as source
  where source.post_id = saved_id;

  for source_item in select value from jsonb_array_elements(sources_data)
  loop
    source_position := source_position + 1;
    insert into public.post_sources (
      post_id,
      position,
      title,
      publisher,
      url,
      accessed_at
    )
    values (
      saved_id,
      source_position,
      source_item->>'title',
      source_item->>'publisher',
      source_item->>'url',
      (source_item->>'accessed_at')::date
    );
  end loop;

  return saved_id;
end;
$$;

revoke all on function public.save_admin_post(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_admin_post(uuid, jsonb, jsonb) to service_role;
