import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Katalog AI',
  description: 'Sign in to your Katalog AI dashboard to optimize your Shopify catalog.',
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><span className="text-lg text-zinc-400">Loading...</span></div>}>
      <LoginForm />
    </Suspense>
  );
}
