import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
          }
        },
      },
    }
  );
}

let _serviceClient: SupabaseClient | null = null;
export function createSupabaseServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return _serviceClient;
}

export type { SupabaseClient };

export async function encryptShopifyToken(
  serviceClient: SupabaseClient,
  plaintext: string
): Promise<string> {
  const { data, error } = await serviceClient
    .rpc('encrypt_shopify_token', { p_plaintext: plaintext });
  if (error) throw error;
  return data as string;
}

export async function decryptShopifyToken(
  serviceClient: SupabaseClient,
  ciphertextB64: string
): Promise<string> {
  const { data, error } = await serviceClient
    .rpc('decrypt_shopify_token', { p_ciphertext_b64: ciphertextB64 });
  if (error) throw error;
  return data as string;
}
