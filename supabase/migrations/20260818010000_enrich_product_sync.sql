-- 20260818010000_enrich_product_sync.sql
-- Enriquecimiento del sync de Shopify.
--
-- Estos campos ya llegaban en la query de fetch_all_products (productType, seo,
-- sku) pero save_products_to_db los descartaba: solo guardaba 9 campos de
-- contenido. Cuatro consumidores esperaban esos datos y estaban ciegos:
--   - helpers.classify_product_type        -> siempre GENERIC
--   - researcher_agent.needs_web_research  -> gaps falsos
--   - helpers.build_product_fingerprint    -> product_type cadena vacia
--   - orchestrator_agent.inject_product_context -> expediente incompleto
--
-- product_type alimenta classify_product_type y build_product_fingerprint.
-- metafields se guarda SIN interpretar (cada tienda inventa namespaces y
-- formatos); la traduccion a hechos vive en core/helpers.extract_verified_facts.

alter table shopify_products
  add column if not exists product_type    text,
  add column if not exists sku             text,
  add column if not exists barcode         text,
  add column if not exists seo_title       text,
  add column if not exists seo_description text,
  add column if not exists metafields      jsonb default '{}'::jsonb;
