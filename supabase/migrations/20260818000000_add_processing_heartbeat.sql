-- Heartbeat de corridas del grafo.
--
-- El Zombie Sweeper medía updated_at, que el grafo escribe una sola vez (Nodo 0).
-- Con timeout de 15 min y corridas reales de 21+ min, declaraba zombie trabajo
-- vivo: lo marcaba ERROR, reembolsaba el crédito, y el grafo escribía
-- READY_TO_PUBLISH encima al terminar. Con latido por nodo, "N minutos sin
-- latir" sí significa muerto.
--
-- Solo datos. La política (cada cuánto late, cuándo se declara muerto, qué pasa
-- con la reserva) vive en Python: core/graph.py y core/worker.py.
--
-- Nota: trigger_refresh_kpis dispara AFTER UPDATE sin lista de columnas, así que
-- cada latido recalcula los KPIs del usuario. Irrelevante a 18 productos;
-- limitar sus columnas queda pendiente.
alter table shopify_products
  add column if not exists processing_heartbeat_at timestamptz;

create index if not exists idx_products_processing_heartbeat
  on shopify_products (processing_heartbeat_at)
  where audit_status = 'PROCESSING';

comment on column shopify_products.processing_heartbeat_at is
  'Última señal de vida de una corrida del grafo. Lo escribe core/graph.py en cada nodo; lo lee el Zombie Sweeper en core/worker.py. NULL cuando no hay corrida activa.';
