-- ROLLBACK MANUAL ONLY
-- No colocar este archivo dentro de supabase/migrations: Supabase no debe
-- ejecutarlo automáticamente. Ejecutar solo después de detener consumidores
-- de publish_error_* y confirmar que no se necesita el historial de errores.

begin;

revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from public;
revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from anon;
revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from authenticated;
drop function if exists public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean);

drop index if exists public.shopify_products_publish_retry_idx;
alter table public.shopify_products
  drop constraint if exists shopify_products_publish_attempts_nonnegative;

alter table public.shopify_products
  drop column if exists publish_error_details,
  drop column if exists publish_error_at,
  drop column if exists publish_error_retryable,
  drop column if exists publish_error_stage,
  drop column if exists publish_error_code,
  drop column if exists publish_next_retry_at,
  drop column if exists publish_attempts;

commit;
