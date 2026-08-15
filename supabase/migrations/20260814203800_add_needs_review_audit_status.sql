-- Permite el estado terminal NEEDS_REVIEW tras rechazos consecutivos
-- del quality gate. Conserva todos los estados desplegados existentes.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.shopify_products
  drop constraint if exists valid_audit_status;

alter table public.shopify_products
  add constraint valid_audit_status
  check (
    audit_status is null
    or audit_status = any (
      array[
        'PENDING_AUDIT'::text,
        'NEEDS_OPTIMIZATION'::text,
        'PROCESSING'::text,
        'READY_TO_PUBLISH'::text,
        'OPTIMIZED'::text,
        'ERROR'::text,
        'OUT_OF_CREDITS'::text,
        'NEEDS_REVIEW'::text,
        'STABLE_PERFORMING'::text,
        'MONITORING'::text,
        'BENCHMARK'::text,
        'INVESTIGATE_CAUSE'::text
      ]
    )
  );

comment on constraint valid_audit_status
  on public.shopify_products
  is 'Estados válidos de auditoría. NEEDS_REVIEW es terminal tras rechazos consecutivos del quality gate.';

commit;
