import type { NextConfig } from "next";

const productionConnectSrc = "'self' https://*.supabase.co https://api.stripe.com https://*.shopify.com";
const devConnectSrc = "'self' http://localhost:8000 http://127.0.0.1:8000 https://*.supabase.co https://api.stripe.com https://*.shopify.com";

const cspHeader = [
  "default-src 'self'",
  process.env.NODE_ENV === 'production'
    ? `connect-src ${productionConnectSrc}`
    : `connect-src ${devConnectSrc}`,
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection', value: '0' },
        ],
      },
    ];
  },
};

export default nextConfig;
