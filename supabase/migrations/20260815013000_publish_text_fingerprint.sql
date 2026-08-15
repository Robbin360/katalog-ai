begin;

-- Huella semántica de contenido: tolera reescritura cosmética de HTML
-- (tags, atributos, entidades) y cualquier whitespace, pero detecta
-- contenido realmente distinto.
--
-- Existe porque la ruta (JS trim) y la RPC (btrim) normalizaban distinto:
-- trim() de JS elimina \n \t &nbsp;; btrim() solo espacios ASCII. Eso
-- causaba proposal_mismatch permanente con Shopify ya actualizado.
-- La normalización ahora vive SOLO aquí.
create or replace function public.publish_text_fingerprint(p_text text)
returns text
language sql
immutable
set search_path to 'pg_catalog', 'pg_temp'
as $function$
  select btrim(
    regexp_replace(
      regexp_replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(coalesce(p_text, ''), chr(160), ' '),
                  '&nbsp;', ' '
                ),
                '&', '&'
              ),
              '<', '<'
            ),
            '>', '>'
          ),
          '"', '"'
        ),
        '<[^>]*>', ' ', 'g'
      ),
      '[[:space:]]+', ' ', 'g'
    )
  );
$function$;

comment on function public.publish_text_fingerprint(text)
  is 'Huella de contenido para comparar texto publicado: sin tags, entidades comunes decodificadas, whitespace colapsado.';

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
  if publish_text_fingerprint(p_confirmed_title) = '' then
    return query select false, 'invalid_title'::text, null::uuid;
    return;
  end if;

  if publish_text_fingerprint(p_confirmed_body_html) = '' then
    return query select false, 'invalid_body_html'::text, null::uuid;
    return;
  end if;

  select user_id, audit_status, current_title, current_body_html, ai_proposal
    into v_owner_id, v_audit_status, v_current_title, v_current_body_html, v_proposal
  from shopify_products
  where id = p_product_id
  for update;

  if not found then
    return query select false, 'product_not_found'::text, null::uuid;
    return;
  end if;

  if v_owner_id is distinct from p_user_id then
    return query select false, 'user_mismatch'::text, null::uuid;
    return;
  end if;

  -- Idempotencia por contenido: mismo texto ya publicado.
  if v_audit_status = 'OPTIMIZED'
     and publish_text_fingerprint(v_current_title) = publish_text_fingerprint(p_confirmed_title)
     and publish_text_fingerprint(v_current_body_html) = publish_text_fingerprint(p_confirmed_body_html)
  then
    return query select true, 'already_completed'::text, null::uuid;
    return;
  end if;

  if v_audit_status is distinct from 'READY_TO_PUBLISH' then
    return query select false, 'not_ready_to_publish'::text, null::uuid;
    return;
  end if;

  v_proposal_title := v_proposal->>'new_title';
  v_proposal_body  := v_proposal->>'new_body_html';

  if v_proposal_title is null or v_proposal_body is null then
    return query select false, 'proposal_missing'::text, null::uuid;
    return;
  end if;

  -- Guard contra bugs del llamador. Compara CONTENIDO, no formato:
  -- Shopify puede reescribir HTML legítimamente y eso no es un fallo.
  if publish_text_fingerprint(v_proposal_title) is distinct from publish_text_fingerprint(p_confirmed_title)
     or publish_text_fingerprint(v_proposal_body) is distinct from publish_text_fingerprint(p_confirmed_body_html)
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
    v_description_length := length(publish_text_fingerprint(p_confirmed_body_html));
  end if;

  -- Se persiste lo que Shopify devolvió, tal cual: es la autoridad
  -- sobre su propio contenido. Solo se recortan bordes.
  insert into optimizations (
    user_id, product_id, title_generated, description_generated,
    framework_used, tone_used, description_length,
    title_previous, description_previous, status, published_at
  ) values (
    p_user_id, p_product_id, btrim(p_confirmed_title), btrim(p_confirmed_body_html),
    v_framework, v_tone, v_description_length,
    v_current_title, v_current_body_html, 'published', v_now
  )
  returning id into v_optimization_id;

  update shopify_products
  set audit_status = 'OPTIMIZED',
      current_title = btrim(p_confirmed_title),
      current_body_html = btrim(p_confirmed_body_html),
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

revoke all on function public.publish_text_fingerprint(text) from public;
revoke all on function public.publish_text_fingerprint(text) from anon;
revoke all on function public.publish_text_fingerprint(text) from authenticated;

commit;