import { Footer } from "@/components/landing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-zinc-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <header>
        <nav>
        </nav>
      </header>
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
