'use client';

import { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  planTier?: 'free' | 'pro' | 'business' | 'starter';
}

export function ExportButton({ planTier }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (planTier === 'free' || planTier === 'starter') {
    return null;
  }

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/audit/export', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.status === 403) {
        setError('Upgrade to Pro to export your audit results');
        return;
      }

      if (response.status === 404) {
        setError('No products to export yet');
        return;
      }

      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `katalog-audit-${new Date().toISOString().split('T')[0]}.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        className="border-border hover:bg-accent text-sm font-semibold h-11"
        onClick={handleExport}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </>
        )}
      </Button>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
