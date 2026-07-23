"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";

export default function CookiesPage() {
  useEffect(() => {
    document.title = "Cookies Policy | Katalog AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Cookies policy for Katalog AI. Learn how we use cookies and similar tracking technologies.');
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-display antialiased selection:bg-primary/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-neural-glow pointer-events-none opacity-50"></div>
      <div className="fixed inset-0 z-0 opacity-[0.03] bg-grid-pattern bg-grid pointer-events-none"></div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Cookies Policy
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-white text-2xl font-bold">What Are Cookies</h2>
                <p>
                  Cookies are small text files stored on your device when you visit a website. They help
                  websites remember your preferences and improve your browsing experience.
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">How We Use Cookies</h2>
                <p>
                  Katalog AI uses cookies and similar technologies for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-300">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and session management.</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., language, theme).</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website to improve our service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Third-Party Cookies</h2>
                <p>
                  We may use third-party services such as Stripe (payment processing) and Shopify (app platform)
                  that set their own cookies. These cookies are governed by the respective third-party privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Managing Cookies</h2>
                <p>
                  Most web browsers allow you to control cookies through their settings. You can block or delete
                  cookies, but this may affect the functionality of our website. To learn how to manage cookies
                  in your browser, visit the browser&apos;s help documentation.
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Contact</h2>
                <p>
                  For questions about our cookies policy, contact us at privacy@katalog.ai.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
