"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Minus, HelpCircle } from "lucide-react";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");

  const plans = [
    {
      name: "Starter",
      description: "Perfecto para tiendas nuevas que quieren validar el poder de la IA.",
      price: billingCycle === "annually" ? 15 : 19,
      credits: 100,
      badge: null,
      cta: "Empezar Starter",
      features: [
        "100 Créditos de Optimización IA / mes",
        "Auditoría de Salud SEO ilimitada",
        "Motor de IA Estándar (Gemini Flash)",
        "Soporte por email",
      ],
      popular: false,
    },
    {
      name: "Pro",
      description: "La experiencia completa de Katalog AI con autonomía total.",
      price: billingCycle === "annually" ? 39 : 49,
      credits: 500,
      badge: "Recomendado",
      cta: "Mejorar a Pro",
      features: [
        "500 Créditos de Optimización IA / mes",
        "Piloto Automático (Fondo)",
        "Brand Brain (2 Perfiles: 1 por tienda)",
        "Sincronización Automática (Cada 1 hora)",
        "Publicación Directa vía API",
      ],
      popular: true,
    },
    {
      name: "Negocios",
      description: "Todo el poder de Katalog con monitoreo estratégico y máxima escala.",
      price: billingCycle === "annually" ? 119 : 149,
      credits: 2000,
      badge: "Scale",
      cta: "Escalar un negocio",
      features: [
        "2,000 Créditos de Optimización IA / mes",
        "Analíticas Avanzadas (En desarrollo)",
        "Notificaciones de Inteligencia",
        "Soporte VIP Directo",
        "Prioridad Máxima en servidores",
        "Motor IA Premium (Gemini 3.0 Pro + RAG)",
      ],
      popular: false,
    },
  ];

  const comparisonData = {
    categories: [
      {
        name: "Límites de IA",
        features: [
          { name: "Auditoría de Tienda", values: ["Ilimitada", "Ilimitada", "Ilimitada"] },
          { name: "Créditos de Optimización", values: ["100 / mes", "500 / mes", "2,000 / mes"] },
          { name: "Costo crédito extra", values: ["$0.20", "$0.10", "$0.05"] },
        ],
      },
      {
        name: "I. CEREBRO (Potencia)",
        features: [
          { name: "Motor Cognitivo", values: ["Estándar (Flash)", "Avanzado (Pro)", "Ultra (Pro + Memoria)"] },
          { name: "Brand Brains", values: ["1 Perfil", "2 Perfiles", "Ilimitados"] },
          { name: "Protección anti-alucinaciones", values: [true, true, true] },
        ],
      },
      {
        name: "II. FLUJO (Autonomía)",
        features: [
          { name: "Nivel de Autonomía", values: ["Manual", "Piloto Automático", "Piloto Automático + Metrics"] },
          { name: "Publicación de Fichas", values: ["1-Clic (Manual)", "1-Clic (API Directa)", "Fondo (Sin Intervención)"] },
          { name: "Sincronización", values: ["Manual", "Automática (1h)", "Tiempo Real"] },
          { name: "Conexión con Tiendas", values: ["1 Tienda", "2 Tiendas", "Todas las disponibles"] },
        ],
      },
      {
        name: "III. SOPORTE Y PRIORIDAD",
        features: [
          { name: "Prioridad de Cola", values: ["Estándar", "Alta", "Máxima Prioridad"] },
          { name: "Soporte", values: ["Email Base", "Email Prioritario", "Soporte VIP"] },
          { name: "Analíticas", values: ["En desarrollo", "En desarrollo", "En desarrollo"] },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white pt-32 pb-20 px-4 Selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-900/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Planes Adaptados a tu <span className="text-primary italic">Escala</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Impulsa tu tienda con inteligencia artificial autónoma de última generación.
            Optimiza ventas, catálogo y soporte sin intervención humana.
          </p>

          {/* Toggle Billing */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`text-sm font-medium transition-colors ${billingCycle === "monthly" ? "text-white" : "text-zinc-500"}`}
            >
              Mensual
            </button>
            <div
              className="w-14 h-7 bg-zinc-800 rounded-full p-1 cursor-pointer flex items-center relative"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")}
            >
              <div
                className={`w-5 h-5 bg-primary rounded-full shadow-lg transform transition-transform duration-300 ease-spring ${billingCycle === "annually" ? "translate-x-7" : "translate-x-0"}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillingCycle("annually")}
                className={`text-sm font-medium transition-colors ${billingCycle === "annually" ? "text-white" : "text-zinc-500"}`}
              >
                Anual
              </button>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 animate-pulse">
                AHORRA 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group flex flex-col p-8 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] ${plan.popular
                ? "bg-zinc-900/60 border-primary/50 shadow-[0_0_40px_-5px_rgba(16,183,127,0.15)] ring-1 ring-primary/20"
                : "bg-zinc-900/40 border-white/5 hover:border-white/20"
                }`}
            >
              {plan.badge && (
                <div className={`self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border ${plan.popular ? "bg-primary text-black border-primary" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8 items-baseline flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-zinc-500 text-sm">/mes</span>
                </div>
                {billingCycle === "annually" && (
                  <span className="text-xs text-primary/80 mt-1">Cobrado anualmente</span>
                )}
              </div>

              <Link
                href="/signup"
                className={`w-full py-4 px-6 rounded-2xl font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${plan.popular
                  ? "bg-primary text-black hover:bg-white hover:shadow-xl"
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
              >
                {plan.cta}
                <ArrowRight size={18} />
              </Link>

              <div className="space-y-4 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 rounded-full p-0.5">
                      <Check size={14} className="text-primary" />
                    </div>
                    <span className="text-zinc-400 text-sm leading-tight text-left">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comparativa de Funciones</h2>
            <p className="text-zinc-500">Detalles técnicos para cada nivel de suscripción.</p>
          </div>

          <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-sm font-bold text-zinc-500 uppercase tracking-widest">Funcionalidad</th>
                  <th className="p-8 text-zinc-300 font-bold text-center">Starter</th>
                  <th className="p-8 text-primary font-bold text-center">Pro</th>
                  <th className="p-8 text-zinc-300 font-bold text-center">Negocios</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.categories.map((category) => (
                  <React.Fragment key={category.name}>
                    <tr className="bg-white/2">
                      <td colSpan={4} className="px-8 py-4 text-xs font-black text-primary/80 uppercase tracking-[0.2em]">
                        {category.name}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-8 py-6 group">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 group-hover:text-white transition-colors">{feature.name}</span>
                            <HelpCircle size={14} className="text-zinc-700 cursor-help" />
                          </div>
                        </td>
                        {feature.values.map((value, i) => (
                          <td key={i} className="px-8 py-6 text-center">
                            {typeof value === "boolean" ? (
                              value ? (
                                <Check size={20} className="text-primary mx-auto" />
                              ) : (
                                <Minus size={20} className="text-zinc-800 mx-auto" />
                              )
                            ) : (
                              <span className={`text-sm ${value.includes("Próximamente") || value.includes("desarrollo")
                                ? "text-zinc-600 italic"
                                : value === "Tiempo Real" || value.includes("Prioridad")
                                  ? "text-primary font-medium"
                                  : "text-zinc-400"
                                }`}>
                                {value}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ CTA */}
        <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 text-center space-y-6">
          <h2 className="text-3xl font-bold">¿Tienes dudas sobre los créditos?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            1 crédito equivale a una optimización completa de un producto por la IA.
            Si necesitas más de 2,000 al mes, pregunta por nuestro plan Custom.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/faq"
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-primary transition-colors"
            >
              Ir al FAQ
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-20 text-center text-zinc-600 text-xs">
          <p>© 2024 Katalog AI. Todos los precios están en USD. Los descuentos anuales se facturan por adelantado.</p>
        </div>
      </div>
    </main>
  );
};

export default PricingPage;
