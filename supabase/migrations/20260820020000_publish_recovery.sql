begin;

-- Publicación Shopify: metadata persistente para distinguir fallos permanentes,
-- fallos transitorios y cierre local pendiente después de una confirmación remota.
-- No añade estados nuevos: conserva compatibilidad con la máquina actual.
alter table public.shopify_products
  add column if not exists publish_attempts integer not null default 0,
  add column if not exists publish_next_retry_at timestamptz,
  add column if not exists publish_error_code text,
  add column if not exists publish_error_stage text,
  add column if not exists publish_error_retryable boolean not null default false,
  add column if not exists publish_error_at timestamptz,
  add column if not exists publish_error_details jsonb;

alter table public.shopify_products
  drop constraint if exists shopify_products_publish_attempts_nonnegative;

alter table public.shopify_products
  add constraint shopify_products_publish_attempts_nonnegative
  check (publish_attempts >= 0);

comment on column public.shopify_products.publish_attempts is 'Intentos exclusivos de publicación Shopify. No mezcla retries del optimizador.';
comment on column public.shopify_products.publish_next_retry_at is 'Próximo momento UTC para reintentar la publicación o el cierre local.';
comment on column public.shopify_products.publish_error_code is 'Código estable del error de publicación, sin secretos.';
comment on column public.shopify_products.publish_error_stage is 'Etapa del fallo: preflight, shopify_request, shopify_verify o local_finalize.';
comment on column public.shopify_products.publish_error_retryable is 'Indica si el fallo puede reintentarse automáticamente o manualmente.';
comment on column public.shopify_products.publish_error_at is 'Momento UTC del último error de publicación.';
comment on column public.shopify_products.publish_error_details is 'Detalles sanitizados del error. Nunca guardar tokens ni cabeceras secretas.';

create index if not exists shopify_products_publish_retry_idx
  on public.shopify_products (publish_next_retry_at)
  where publish_error_retryable = true
    and publish_next_retry_at is not null;

-- Registra fallos de publicación sin degradar un estado final válido.
-- p_shopify_confirmed=true significa que Shopify ya confirmó el cambio,
-- pero el cierre local falló: conservamos READY_TO_PUBLISH y reintentamos
-- solo el cierre local, sin refund ni doble cobro.
create or replace function public.record_publish_failure(
  p_user_id uuid,
  p_product_id bigint,
  p_code text,
  p_stage text,
  p_retryable boolean,
  p_message text,
  p_details jsonb default '{}'::jsonb,
  p_next_retry_at timestamptz default null,
  p_shopify_confirmed boolean default false
)
returns table (
  recorded boolean,
  reason text,
  audit_status text,
  publish_attempts integer,
  retryable boolean,
  shopify_confirmed boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_owner_id uuid;
  v_status text;
  v_new_status text;
  v_details jsonb;
  v_attempts integer;
  v_updated integer;
  v_effective_retryable boolean;
begin
  select user_id, audit_status, coalesce(publish_attempts, 0)
    into v_owner_id, v_status, v_attempts
  from public.shopify_products
  where id = p_product_id
  for update;

  if not found then
    return query select false, 'product_not_found'::text, null::text, 0, false, coalesce(p_shopify_confirmed, false);
    return;
  end if;

  if v_owner_id is distinct from p_user_id then
    return query select false, 'user_mismatch'::text, v_status, v_attempts, false, coalesce(p_shopify_confirmed, false);
    return;
  end if;

  if v_status = 'OPTIMIZED' then
    return query select false, 'already_optimized'::text, v_status, v_attempts, false, coalesce(p_shopify_confirmed, false);
    return;
  end if;

  if coalesce(p_shopify_confirmed, false) then
    v_new_status := 'READY_TO_PUBLISH';
    v_effective_retryable := true;
  else
    v_new_status := 'ERROR';
    v_effective_retryable := coalesce(p_retryable, false);
  end if;

  v_details := case
    when jsonb_typeof(coalesce(p_details, '{}'::jsonb)) = 'object' then coalesce(p_details, '{}'::jsonb)
    else jsonb_build_object('value', left(coalesce(p_details, '{}'::jsonb)::text, 2000))
  end;

  update public.shopify_products
  set
    audit_status = v_new_status,
    error_log = left(coalesce(p_message, p_code, 'publish_failed'), 4000),
    publish_attempts = v_attempts + 1,
    publish_next_retry_at = case when v_effective_retryable then p_next_retry_at else null end,
    publish_error_code = left(coalesce(p_code, 'unknown'), 120),
    publish_error_stage = left(coalesce(p_stage, 'unknown'), 80),
    publish_error_retryable = v_effective_retryable,
    publish_error_at = now(),
    publish_error_details = v_details,
    updated_at = now()
  where id = p_product_id
    and user_id = p_user_id
    and audit_status <> 'OPTIMIZED';

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    return query select false, 'concurrent_state_change'::text, v_status, v_attempts, v_effective_retryable, coalesce(p_shopify_confirmed, false);
    return;
  end if;

  return query select true, 'recorded'::text, v_new_status, v_attempts + 1, v_effective_retryable, coalesce(p_shopify_confirmed, false);
end;
$function$;

revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from public;
revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from anon;
revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from authenticated;
grant execute on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) to service_role;

commit;
