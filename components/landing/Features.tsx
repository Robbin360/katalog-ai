"use client";

import { useI18n } from "@/lib/i18n-context";

export const Features = () => {
  const { t } = useI18n();

  return (
    <>
      {/* How It Works */}
      <section className="py-24 relative overflow-hidden" id="process">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('landing.how_it_works.title') || 'Cómo Funciona'}</h2>
            <p className="mt-4 text-lg text-slate-400">{t('landing.how_it_works.subtitle') || 'Del caos a la claridad en tres pasos automatizados.'}</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center max-w-xs group">
              <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">1</span>
                <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors notranslate" translate="no" lang="zxx">query_stats</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white leading-tight">{t('landing.how_it_works.step1.title') || 'Auditoría'}</h3>
              <p className="mt-2 text-sm text-slate-400">{t('landing.how_it_works.step1.desc') || 'La IA escanea todo tu catálogo en busca de datos faltantes y errores de conversión.'}</p>
            </div>
            <div className="hidden lg:flex w-32 h-[2px] bg-border-dark relative mx-4"></div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center max-w-xs group">
              <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">2</span>
                <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors notranslate" translate="no" lang="zxx">auto_fix_high</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white leading-tight">{t('landing.how_it_works.step2.title') || 'Optimización'}</h3>
              <p className="mt-2 text-sm text-slate-400">{t('landing.how_it_works.step2.desc') || 'Redes neuronales regeneran títulos, corrigen imágenes y priorizan por impacto en ventas.'}</p>
            </div>
            <div className="hidden lg:flex w-32 h-[2px] bg-border-dark relative mx-4"></div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center max-w-xs group">
              <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">3</span>
                <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors notranslate" translate="no" lang="zxx">sync_saved_locally</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white leading-tight">{t('landing.how_it_works.step3.title') || 'Sincronización'}</h3>
              <p className="mt-2 text-sm text-slate-400">{t('landing.how_it_works.step3.desc') || 'Las actualizaciones se envían a Shopify al instante sin tiempo de inactividad.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-24 sm:py-32 bg-surface-darker/30" id="features">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('landing.features_bento.title') || 'Capacidades Principales'}</h2>
            <p className="mt-4 text-lg text-slate-400">{t('landing.features_bento.subtitle') || 'Libera el potencial oculto de tu catálogo con nuestro motor de procesamiento avanzado.'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                <span className="material-symbols-outlined text-2xl notranslate" translate="no" lang="zxx">health_metrics</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{t('landing.features_bento.item1.title') || 'Control de Salud del Inventario'}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{t('landing.features_bento.item1.desc') || 'Un escaneo profundo que identifica instantáneamente qué productos de tu tienda Shopify necesitan atención. Priorizamos tus activos basándonos en el impacto SEO y la completitud de los datos.'}</p>
              <div className="mt-auto flex flex-col items-center justify-center py-6 bg-slate-900/40 rounded-xl border border-border-dark/50">
                <div className="relative flex items-center justify-center">
                  <svg className="h-28 w-28 transform -rotate-90">
                    <circle className="text-slate-800" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-primary drop-shadow-[0_0_12px_#10b77f]" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301.59" strokeDashoffset="54.28" strokeWidth="8"></circle>
                  </svg>
                  <span className="absolute text-2xl font-black text-white">82%</span>
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl -z-10"></div>
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px] notranslate" translate="no" lang="zxx">warning</span> 32 {t('landing.features_bento.item1.footer_risk') || 'Productos en Riesgo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                <span className="material-symbols-outlined text-2xl notranslate" translate="no" lang="zxx">history_edu</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{t('landing.features_bento.item2.title') || 'Escritura de Contenido IA'}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{t('landing.features_bento.item2.desc') || 'Genera títulos SEO y descripciones optimizadas para conversión. Nuestra IA analiza tus datos de Shopify para crear textos que rankean y venden.'}</p>
              <div className="mt-auto space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-border-dark">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold block mb-2">{t('landing.features_bento.item2.current_listing') || 'Listing Actual'}</span>
                  <span className="text-sm text-slate-500 font-medium italic">Camiseta algodón azul talla L</span>
                </div>
                <div className="relative p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(16,183,127,0.05)] overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none"></div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-bold block mb-2 relative z-10">{t('landing.features_bento.item2.ai_opt') || 'Optimización IA'}</span>
                  <span className="text-sm text-white font-bold leading-tight relative z-10 block">Premium Navy Cotton Tee - Athletics Fit (Large)</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden glass-card p-8 hover:border-red-500/30 transition-all duration-300 flex flex-col h-full">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-red-500 shadow-inner">
                <span className="material-symbols-outlined text-2xl notranslate" translate="no" lang="zxx">monitoring</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{t('landing.features_bento.item3.title') || 'Radar de Ingresos en Riesgo'}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{t('landing.features_bento.item3.desc') || 'No optimices a ciegas. Nuestra IA calcula el valor monetario de cada mejora, permitiéndote priorizar los cambios que realmente mueven la aguja de tus ingresos mensuales.'}</p>
              <div className="mt-auto relative rounded-2xl bg-black/60 border border-border-dark/60 p-6 backdrop-blur-2xl shadow-xl overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('landing.features_bento.item3.loss_label') || 'Pérdida Mensual Estimada'}</span>
                  <div className="flex items-end gap-3 w-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
                      <span className="material-symbols-outlined text-xl notranslate" translate="no" lang="zxx">trending_down</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]">$1,240.00</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-red-500/30 via-transparent to-transparent my-1"></div>
                  <div className="flex items-center justify-between w-full">
                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      {t('landing.features_bento.item3.badge') || 'ALTO RIESGO'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      32 {t('landing.features_bento.item3.footer') || 'activos críticos sin optimizar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 (Large) */}
            <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 md:col-span-2">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none"></div>
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-3xl notranslate" translate="no" lang="zxx">analytics</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{t('landing.features_bento.item4.title') || 'Métrica de Salud Global'}</h3>
                  <p className="text-slate-400 text-sm max-w-lg mb-6 leading-relaxed">{t('landing.features_bento.item4.desc') || 'Analizamos la integridad de tus metadatos, calidad de etiquetas y consistencia visual para generar un diagnóstico accionable en tiempo real.'}</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-slate-500">{t('landing.features_bento.item4.metric_label') || 'Optimización de Catálogo'}</span>
                      <span className="text-primary">82% {t('landing.features_bento.item4.metric_value') || 'Excelente'}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full border border-border-dark overflow-hidden p-0.5">
                      <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(16,183,127,0.6)]" style={{ width: "82%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                <span className="material-symbols-outlined text-2xl notranslate" translate="no" lang="zxx">sync_alt</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{t('landing.features_bento.item5.title') || 'Sincronización Total'}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{t('landing.features_bento.item5.desc') || 'Integración perfecta con Shopify. Cambios en vivo en segundos con un solo clic.'}</p>
              <div className="mt-auto flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-border-dark/50">
                <div className="h-10 w-10 rounded-lg bg-slate-800 border border-border-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-300 text-sm notranslate" translate="no" lang="zxx">shopping_bag</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-3 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
                  <span className="absolute top-1/2 left-1/2 -track-x-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xs bg-surface-dark px-1 notranslate" translate="no" lang="zxx">bolt</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">auto_awesome</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
