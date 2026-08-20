-- ROLLBACK MANUAL ONLY
-- Este rollback retira la RPC, el índice y la constraint, pero conserva las
-- columnas publish_* para no borrar diagnóstico ni datos de producción.
-- La eliminación de columnas requiere una migración posterior explícita,
-- después de verificar que ningún consumidor las usa.

begin;

revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from public;
revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from anon;
revoke all on function public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean) from authenticated;
drop function if exists public.record_publish_failure(uuid, bigint, text, text, boolean, text, jsonb, timestamptz, boolean);

drop index if exists public.shopify_products_publish_retry_idx;
alter table public.shopify_products
  drop constraint if exists shopify_products_publish_attempts_nonnegative;

commit;

-- Las columnas publish_* permanecen intencionalmente. Si deben eliminarse,
-- crear una migración separada con back-up, comprobación de consumidores y
-- ventana de rollback.
