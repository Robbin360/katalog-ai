import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-dark px-6 text-slate-100">
      <section className="mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-400">
          This URL does not exist. Return to Katalog AI to review Shopify catalog
          optimization, SEO metadata, and revenue opportunities.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-background-dark transition hover:bg-emerald-400"
          >
            Back to Katalog AI
          </Link>
        </div>
      </section>
    </main>
  );
}
