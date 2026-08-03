import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

const productionConnectSrc = "'self' https://*.supabase.co https://api.stripe.com https://*.shopify.com";
const devConnectSrc = "'self' http://localhost:8000 http://127.0.0.1:8000 https://*.supabase.co https://api.stripe.com https://*.shopify.com ws://localhost:3000";

const cspHeader = [
  "default-src 'self'",
  isDev ? `connect-src ${devConnectSrc}` : `connect-src ${productionConnectSrc}`,
  // React Refresh usa eval() en desarrollo. Sin esto el cliente no hidrata
  // y ningún onClick funciona. En producción se mantiene estricto.
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
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