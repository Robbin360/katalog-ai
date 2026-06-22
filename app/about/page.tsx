import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Brand } from "@/components/ui/brand";

const siteUrl = "https://katalog-ai-navy.vercel.app";
const title = "About Us | Katalog AI";
const description = "Learn about Katalog AI's mission to revolutionize e-commerce catalog management through AI-powered optimization and automation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/about`,
    siteName: "Katalog AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function AboutPage() {
  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen selection:bg-primary/30 antialiased">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-6">
            About <Brand className="text-primary italic" />
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            We're building the future of e-commerce catalog management through AI-powered optimization and automation.
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Katalog AI was founded with a singular mission: to empower e-commerce merchants with AI-driven catalog optimization that drives revenue growth and operational efficiency. 
              We believe that every product in your catalog deserves to be discovered, understood, and purchased by the right customers. Traditional catalog management is time-consuming, 
              error-prone, and difficult to scale. Our platform transforms this process through intelligent automation.
            </p>
            <p className="text-slate-300 leading-relaxed">
              By combining advanced natural language processing, computer vision, and machine learning algorithms, Katalog AI analyzes your product catalog to identify optimization opportunities, 
              generate compelling product descriptions, enhance SEO metadata, and prioritize revenue-generating improvements. We integrate seamlessly with Shopify, BigCommerce, WooCommerce, 
              and Magento to provide a unified optimization experience across all major e-commerce platforms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Our Team</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Katalog AI is built by a team of experienced engineers, data scientists, and e-commerce specialists who understand the challenges of managing large product catalogs at scale. 
              Our founders previously worked at leading technology companies and e-commerce platforms, where they witnessed firsthand the pain points of manual catalog management and the 
              transformative potential of AI automation.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We're backed by top-tier investors who share our vision of democratizing AI-powered optimization for e-commerce businesses of all sizes. Whether you're a small merchant with 
              hundreds of products or an enterprise retailer with millions of SKUs, Katalog AI scales to meet your needs while delivering measurable ROI through increased conversion rates, 
              improved search visibility, and reduced operational overhead.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Our Values</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Merchant-First</h3>
                <p className="text-slate-300 leading-relaxed">
                  Every feature we build starts with a deep understanding of merchant needs. We prioritize solutions that deliver immediate value and integrate seamlessly into existing workflows.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Data Privacy</h3>
                <p className="text-slate-300 leading-relaxed">
                  Your catalog data is yours alone. We maintain strict data privacy standards, use encryption at rest and in transit, and never share your proprietary product information with third parties.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Continuous Innovation</h3>
                <p className="text-slate-300 leading-relaxed">
                  The e-commerce landscape evolves rapidly. We continuously improve our AI models, add new optimization capabilities, and expand platform integrations to keep you ahead of the competition.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-16 text-center">
            <p className="text-slate-400 mb-8">
              Ready to optimize your catalog with AI?
            </p>
            <Link href="/login" className="inline-block bg-primary hover:bg-[#0da371] text-background-dark font-black px-10 py-4 rounded-xl transition-all shadow-xl shadow-primary/30">
              Get Started Free
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
