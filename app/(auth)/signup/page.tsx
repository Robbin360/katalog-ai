import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up | Katalog AI',
  description: 'Create your Katalog AI account and start optimizing your Shopify catalog.',
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><span className="text-lg text-zinc-400">Loading...</span></div>}>
      <SignupForm />
    </Suspense>
  );
}
