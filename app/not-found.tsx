import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Page not found. The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to homepage
      </Link>
    </main>
  );
}
