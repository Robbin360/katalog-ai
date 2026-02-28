"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    ChevronDown,
    MessageCircle,
    Zap,
    ShieldCheck,
    Globe,
    CreditCard,
    MessageSquare,
    Sparkles
} from "lucide-react";

type FAQItem = {
    question: string;
    answer: string;
    category: string;
};

const FAQ_DATA: FAQItem[] = [
    // General
    {
        category: "General",
        question: "¿Qué es Katalog AI?",
        answer: "Katalog AI es una plataforma de automatización de catálogos de última generación que utiliza Inteligencia Artificial para optimizar descripciones, imágenes y SEO de tus productos de forma 100% autónoma y profesional."
    },
    {
        category: "General",
        question: "¿Cómo ayuda a mi tienda?",
        answer: "Katalog AI elimina el trabajo manual de redactar fichas de producto. Aumenta tu conversión con textos persuasivos, mejora tu posicionamiento en Google y te permite escalar tu catálogo de 10 a 10,000 productos en minutos."
    },
    {
        category: "General",
        question: "¿Es difícil de configurar?",
        answer: "En absoluto. Katalog AI es 'plug & play'. Conectas tu tienda vía API en un clic y nuestro motor comienza a analizar tu catálogo inmediatamente sin necesidad técnica de tu parte."
    },
    // IA & Créditos
    {
        category: "IA & Créditos",
        question: "¿Cómo funcionan los créditos?",
        answer: "1 crédito equivale a la optimización completa de un producto (título, descripción, meta-tags y alt-text de imágenes). Los créditos se renuevan mensualmente según tu plan seleccionado."
    },
    {
        category: "IA & Créditos",
        question: "¿El contenido generado es original?",
        answer: "Sí. Nuestra IA genera contenido único basado en los atributos técnicos de tus productos. Además, contamos con una capa de 'Protección Anti-Alucinaciones' para asegurar que la información sea veraz y coherente con tu marca."
    },
    {
        category: "IA & Créditos",
        question: "¿Puedo entrenar la IA con mi estilo?",
        answer: "Sí, mediante nuestra función 'Brand Brain'. Puedes subir documentos, guías de marca o ejemplos de textos anteriores para que la IA aprenda y replique exactamente el tono de voz de tu negocio."
    },
    // Integraciones
    {
        category: "Integraciones",
        question: "¿Qué tiendas soporta?",
        answer: "Actualmente ofrecemos soporte nativo total para Shopify. Estamos trabajando activamente en integraciones para Etsy, WooCommerce y Amazon, que estarán disponibles en el futuro cercano."
    },
    {
        category: "Integraciones",
        question: "¿Es seguro conectar mi tienda?",
        answer: "Totalmente. Utilizamos las APIs oficiales de cada plataforma con permisos granulares. Todos los datos están cifrados y nunca compartimos información de tus ventas o clientes con terceros."
    },
    {
        category: "Integraciones",
        question: "¿Katalog borra mis productos originales?",
        answer: "Nunca. Katalog AI trabaja creando borradores o actualizando campos específicos bajo tu supervisión. Además, siempre guardamos un historial para que puedas revertir cualquier cambio en un clic (Rollback)."
    },
    // Planes
    {
        category: "Planes",
        question: "¿Puedo cambiar de plan en cualquier momento?",
        answer: "Sí, puedes subir o bajar de nivel de suscripción cuando lo desees desde tu panel de facturación. Los cambios de precio se prorratean automáticamente."
    },
    {
        category: "Planes",
        question: "¿Qué es el Piloto Automático?",
        answer: "Es nuestra función estrella. A diferencia del modo manual donde tú apruebas cada cambio, el Piloto Automático detecta nuevos productos en tu tienda y los optimiza y publica en segundo plano sin que tengas que intervenir."
    }
];

const CATEGORIES = ["Todas", "General", "IA & Créditos", "Integraciones", "Planes"];

const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todas");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const filteredFaqs = useMemo(() => {
        return FAQ_DATA.filter(faq => {
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "Todas" || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    return (
        <main className="min-h-screen bg-[#09090b] text-white pt-32 pb-20 px-4">
            {/* Background Decorative Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-primary/20 blur-[130px] rounded-full"></div>
                <div className="absolute bottom-[-5%] right-[5%] w-[400px] h-[400px] bg-emerald-900/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Preguntas <span className="text-primary italic">Frecuentes</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Todo lo que necesitas saber sobre la automatización de catálogos impulsada por Inteligencia Artificial.
                    </p>

                    {/* Search Bar */}
                    <div className="relative mt-12 max-w-xl mx-auto group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Busca tu duda..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-xl transition-all"
                        />
                        <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
                            <span className="text-[10px] font-mono text-zinc-700 border border-zinc-800 px-1.5 py-0.5 rounded leading-none uppercase">Ctrl K</span>
                        </div>
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat
                                    ? "bg-primary text-black"
                                    : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* FAQ List (Accordion) */}
                <div className="space-y-4 min-h-[400px]">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={faq.question}
                                    className={`group rounded-2xl border transition-all duration-300 ${isOpen
                                            ? "bg-zinc-900/60 border-primary/30 shadow-[0_4px_20px_-10px_rgba(16,183,127,0.1)]"
                                            : "bg-zinc-900/30 border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg transition-colors ${isOpen ? "bg-primary/10 text-primary" : "bg-zinc-800/50 text-zinc-500"}`}>
                                                {faq.category === "General" && <Globe size={18} />}
                                                {faq.category === "IA & Créditos" && <Sparkles size={18} />}
                                                {faq.category === "Integraciones" && <ShieldCheck size={18} />}
                                                {faq.category === "Planes" && <CreditCard size={18} />}
                                            </div>
                                            <span className={`font-semibold text-lg transition-colors ${isOpen ? "text-white" : "text-zinc-300"}`}>
                                                {faq.question}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
                                            size={20}
                                        />
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                    >
                                        <div className="px-6 pb-6 pt-0 ml-14">
                                            <p className="text-zinc-400 leading-relaxed text-base">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/5">
                            <div className="inline-flex p-4 rounded-full bg-zinc-800/50 text-zinc-500 mb-4">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-medium text-white">No se encontraron resultados</h3>
                            <p className="text-zinc-500 mt-2">Prueba con palabras clave como 'créditos', 'Shopify' o 'IA'.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("Todas"); }}
                                className="mt-6 text-primary hover:underline underline-offset-4 text-sm font-medium"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Suggestions Section */}
                <div className="mt-32 relative group">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 rounded-full scale-75"></div>
                    <div className="relative p-10 md:p-14 rounded-[3rem] bg-zinc-900/40 border border-white/5 backdrop-blur-3xl text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <Zap size={12} fill="currentColor" /> Soporte Directo
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                            ¿Tienes una <span className="text-primary">sugerencia</span>?
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                            Tu opinión nos ayuda a mejorar Katalog AI. Si tienes una idea para una nueva función o no encontraste la respuesta que buscabas, nuestro equipo está listo para escucharte.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href="mailto:soporte@katalog.ai"
                                className="w-full sm:w-auto px-10 py-4 bg-primary text-black font-bold rounded-2xl hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(16,183,127,0.3)] hover:scale-105"
                            >
                                <MessageSquare size={20} />
                                Enviar Sugerencia
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto px-10 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                                Contactar Soporte
                            </Link>
                        </div>
                        <div className="flex items-center justify-center gap-6 pt-8 grayscale opacity-30">
                            <div className="flex items-center gap-2 text-xs font-medium"><MessageCircle size={14} /> WhatsApp</div>
                            <div className="flex items-center gap-2 text-xs font-medium"><Globe size={14} /> Email 24/7</div>
                        </div>
                    </div>
                </div>

                {/* Legal Disclaimer */}
                <div className="mt-24 text-center text-zinc-600 text-[10px] uppercase tracking-widest">
                    <p>© 2024 Katalog AI. Resolviendo dudas para la escala masiva.</p>
                </div>
            </div>
        </main>
    );
};

export default FAQPage;
