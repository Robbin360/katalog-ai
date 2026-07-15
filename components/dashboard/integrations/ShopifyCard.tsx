'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ShieldCheck, RefreshCw, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

interface ShopifyCardProps {
  userId: string;
}

function ShopifyCardInner({ userId }: ShopifyCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [shopInput, setShopInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const connected = searchParams.get('connected');
  const error = searchParams.get('error');

  const { data: integration, isLoading } = useQuery({
    queryKey: ['integration-shopify', userId],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('integrations_safe')
        .select('id, provider, shop_url, scopes, installed_at, uninstalled_at, shop_name')
        .eq('user_id', userId)
        .eq('provider', 'shopify')
        .is('uninstalled_at', null)
        .maybeSingle();
      if (queryError) throw queryError;
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (connected === '1' || error) {
      if (connected === '1') {
        toast.success('Store connected!', {
          description: 'Your Shopify store was successfully connected.',
        });
      }
      if (error) {
        const messages: Record<string, string> = {
          missing_params: 'Missing parameters in Shopify\'s response.',
          invalid_shop: 'The store URL is not valid.',
          server_config: 'Server configuration error.',
          hmac_failed: 'We couldn\'t verify Shopify\'s authenticity.',
          state_mismatch: 'Session expired. Please try again.',
          stale_callback: 'The response expired. Please try again.',
          shop_already_connected: 'This store is already connected to another Katalog account.',
          token_exchange_failed: 'We couldn\'t connect your store. Please try again.',
          db_error: 'Error saving the connection. Please try again.',
        };
        const errorMsg = error.includes('missing_scopes:')
          ? `Missing critical permissions: ${error.split(':')[1]}`
          : (messages[String(error)] || 'An unexpected error occurred.');
        toast.error('Error', { description: errorMsg });

      }
      const url = new URL(window.location.href);
      url.searchParams.delete('connected');
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [connected, error]);

  const handleConnect = async () => {
    const cleanShop = shopInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    if (!cleanShop.includes('.myshopify.com')) {
      toast.error('Invalid URL', {
        description: 'Must be your Shopify URL (e.g., my-store.myshopify.com)',
      });
      return;
    }

    setLoading(true);
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(cleanShop)}`;
  };

  const handleDisconnect = async () => {
    if (!integration) return;
    if (!confirm('Disconnect this store from Katalog? Your token will be revoked on Shopify.')) return;

    setDisconnecting(true);
    try {
      const res = await fetch(`/api/integrations/${integration.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Disconnect failed');

      toast.success('Store disconnected', {
        description: 'Your store was disconnected and the token was revoked on Shopify.',
      });
      queryClient.invalidateQueries({ queryKey: ['integration-shopify'] });
    } catch (err) {
      toast.error('Error', { description: 'We couldn\'t disconnect the store.' });
    } finally {
      setDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (integration) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/shopify-glyph.svg" alt="Shopify Logo" className="w-6 h-6" />
              <div>
                <CardTitle>{integration.shop_name || integration.shop_url}</CardTitle>
                <CardDescription>{integration.shop_url}</CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" /> Connected
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Connected since</dt>
              <dd className="font-medium">
                {integration.installed_at
                  ? new Date(integration.installed_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Permissions</dt>
              <dd className="font-medium text-xs">{integration.scopes || '—'}</dd>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <RefreshCw className="w-4 h-4 mr-2" /> Go to Dashboard
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Disconnect
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <img src="/shopify-glyph.svg" alt="Shopify Logo" className="w-6 h-6" />
          <div>
            <CardTitle>Shopify Integration</CardTitle>
            <CardDescription>Connect your store in one click. No need to create custom apps or copy tokens.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="space-y-3">
          <Label>Your Shopify store URL</Label>
          <div className="flex items-center rounded-lg border overflow-hidden">
            <div className="px-3 flex items-center h-11 border-r">
              <span className="font-mono text-sm">https://</span>
            </div>
            <Input
              value={shopInput}
              onChange={(e) => setShopInput(e.target.value)}
              placeholder="mi-tienda.myshopify.com"
              disabled={loading}
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We will redirect you to Shopify to authorize Katalog AI with the necessary permissions.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button
          onClick={handleConnect}
          disabled={loading || !shopInput}
          className="bg-[#95bf47] text-white hover:bg-[#74993a]"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to Shopify...</>
          ) : (
            <>Connect my Shopify store <ExternalLink className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ShopifyCard(props: ShopifyCardProps) {
  return (
    <Suspense fallback={<Card className="p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></Card>}>
      <ShopifyCardInner {...props} />
    </Suspense>
  );
}
