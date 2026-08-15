begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

create or replace function public.finalize_product_publish(
  p_user_id uuid,
  p_product_id bigint,
  p_confirmed_title text,
  p_confirmed_body_html text
)
returns table (
  success boolean,
  reason text,
  optimization_id uuid
)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_owner_id uuid;
  v_audit_status text;
  v_current_title text;
  v_current_body_html text;
  v_proposal jsonb;
  v_proposal_title text;
  v_proposal_body text;
  v_framework text;
  v_tone text;
  v_description_length integer;
  v_optimization_id uuid;
  v_now timestamptz := now();
begin
  if p_confirmed_title is null or btrim(p_confirmed_title) = '' then
    return query select false, 'invalid_title'::text, null::uuid;
    return;
  end if;

  if p_confirmed_body_html is null or btrim(p_confirmed_body_html) = '' then
    return query select false, 'invalid_body_html'::text, null::uuid;
    return;
  end if;

  -- Bloqueo de fila: serializa requests concurrentes del mismo producto.
  select user_id, audit_status, current_title, current_body_html, ai_proposal
    into v_owner_id, v_audit_status, v_current_title, v_current_body_html, v_proposal
  from shopify_products
  where id = p_product_id
  for update;

  if not found then
    return query select false, 'product_not_found'::text, null::uuid;
    return;
  end if;

  -- SECURITY DEFINER omite RLS: la propiedad se valida a mano.
  if v_owner_id is distinct from p_user_id then
    return query select false, 'user_mismatch'::text, null::uuid;
    return;
  end if;

  -- Idempotencia por contenido: request duplicado.
  if v_audit_status = 'OPTIMIZED'
     and v_current_title = p_confirmed_title
     and v_current_body_html = p_confirmed_body_html
  then
    return query select true, 'already_completed'::text, null::uuid;
    return;
  end if;

  if v_audit_status is distinct from 'READY_TO_PUBLISH' then
    return query select false, 'not_ready_to_publish'::text, null::uuid;
    return;
  end if;

  -- Lo confirmado por Shopify debe ser la propuesta aprobada.
  v_proposal_title := v_proposal->>'new_title';
  v_proposal_body  := v_proposal->>'new_body_html';

  if v_proposal_title is null or v_proposal_body is null then
    return query select false, 'proposal_missing'::text, null::uuid;
    return;
  end if;

  if v_proposal_title is distinct from p_confirmed_title
     or v_proposal_body is distinct from p_confirmed_body_html
  then
    return query select false, 'proposal_mismatch'::text, null::uuid;
    return;
  end if;

  v_framework := coalesce(nullif(btrim(v_proposal->>'framework_used'), ''), 'manual_publish');
  v_tone      := coalesce(nullif(btrim(v_proposal->>'tone_used'), ''), 'default');

  begin
    v_description_length := (v_proposal->>'description_length')::integer;
  exception when others then
    v_description_length := null;
  end;

  if v_description_length is null or v_description_length < 0 then
    v_description_length := length(
      btrim(
        regexp_replace(
          regexp_replace(p_confirmed_body_html, '<[^>]*>', ' ', 'g'),
          '\s+', ' ', 'g'
        )
      )
    );
  end if;

  insert into optimizations (
    user_id,
    product_id,
    title_generated,
    description_generated,
    framework_used,
    tone_used,
    description_length,
    title_previous,
    description_previous,
    status,
    published_at
  ) values (
    p_user_id,
    p_product_id,
    p_confirmed_title,
    p_confirmed_body_html,
    v_framework,
    v_tone,
    v_description_length,
    v_current_title,
    v_current_body_html,
    'published',
    v_now
  )
  returning id into v_optimization_id;

  update shopify_products
  set audit_status = 'OPTIMIZED',
      current_title = p_confirmed_title,
      current_body_html = p_confirmed_body_html,
      error_log = null,
      consecutive_failures = 0,
      retry_attempts = 0,
      next_retry_at = null,
      last_audit_at = v_now,
      updated_at = v_now
  where id = p_product_id
    and user_id = p_user_id;

  return query select true, 'completed'::text, v_optimization_id;
end;
$function$;

comment on function public.finalize_product_publish(uuid, bigint, text, text)
  is 'Cierra una publicacion manual: historial + producto en una sola transaccion. No toca creditos. Solo servidor.';

revoke all on function public.finalize_product_publish(uuid, bigint, text, text) from public;
revoke all on function public.finalize_product_publish(uuid, bigint, text, text) from anon;
revoke all on function public.finalize_product_publish(uuid, bigint, text, text) from authenticated;
grant execute on function public.finalize_product_publish(uuid, bigint, text, text) to service_role;

commit;