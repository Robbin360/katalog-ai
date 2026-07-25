import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Brand } from "@/components/ui/brand";
import { Mail, Headset, Handshake, Users } from 'lucide-react'
import { FAQAccordion } from "@/components/landing/FAQSection";

const CONTACT_FAQS = [
  {
    question: "What is your typical response time?",
    answer: "We aim to respond to all inquiries within 24 hours during business days (Monday-Friday, 9am-6pm PST). Technical support requests from paid customers receive priority handling."
  },
  {
    question: "Do you offer phone support?",
    answer: "Phone support is available for Enterprise plan customers. Contact your account manager for direct phone access. All other customers can reach us via email for comprehensive written support."
  },
  {
    question: "Can I schedule a demo?",
    answer: "Yes! Email us at hello@katalog.ai with \"Demo Request\" in the subject line. Include your company name, e-commerce platform, and approximate catalog size. We'll schedule a personalized walkthrough."
  }
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://katalog-ai-navy.vercel.app';
const title = "Contact Us | Katalog AI";
const description = "Get in touch with the Katalog AI team for support, partnerships, or general inquiries about our AI-powered catalog optimization platform.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/contact`,
    siteName: "Katalog AI",
    type: "website",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Katalog AI — Contact' }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen selection:bg-primary/30 antialiased">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-6">
            Contact <Brand className="text-primary" />
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our team for support, partnerships, or general inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Contact Methods */}
          <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="text-primary text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Email</h3>
                <a href="mailto:hello@katalog.ai" className="text-slate-400 hover:text-primary transition-colors">
                  hello@katalog.ai
                </a>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              For general inquiries, support questions, or partnership opportunities. We typically respond within 24 hours.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Headset className="text-primary text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Support</h3>
                <a href="mailto:support@katalog.ai" className="text-slate-400 hover:text-primary transition-colors">
                  support@katalog.ai
                </a>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Technical support for existing customers. Include your account email and a detailed description of your issue.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Handshake className="text-primary text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Partnerships</h3>
                <a href="mailto:partnerships@katalog.ai" className="text-slate-400 hover:text-primary transition-colors">
                  partnerships@katalog.ai
                </a>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Interested in partnering with Katalog AI? Let's explore integration opportunities and strategic collaborations.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="text-primary text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Social Media</h3>
                <div className="flex gap-3 mt-1">
                  <a href="https://twitter.com/katalogai" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                    Twitter
                  </a>
                  <span className="text-slate-700">·</span>
                  <a href="https://linkedin.com/company/katalog-ai" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Follow us for product updates, industry insights, and e-commerce optimization best practices.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-card rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <FAQAccordion items={CONTACT_FAQS} />
        </div>

        {/* Office Information */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Office</h2>
          <p className="text-slate-400 mb-2">Katalog AI Inc.</p>
          <p className="text-slate-500 text-sm">San Francisco, California</p>
          <p className="text-slate-500 text-sm">United States</p>
        </div>
      </main>
    </div>
  );
}
