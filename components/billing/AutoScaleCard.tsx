'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AutoScaleData {
  isActive: boolean;
  creditsIncluded: number;
  creditsUsed: number;
  autoRechargesCount: number;
  rechargePackSize: number;
  additionalCharges: number;
  monthlyCap: number;
}

export function AutoScaleCard() {
  const queryClient = useQueryClient();
  const [capValue, setCapValue] = useState('100');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery<AutoScaleData>({
    queryKey: ['auto-scale'],
    queryFn: async () => {
      const res = await fetch('/api/billing/auto-scale');
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setCapValue(String(json.monthlyCap));
      return json;
    },
  });

  const saveCapMutation = useMutation({
    mutationFn: async (newCap: number) => {
      const res = await fetch('/api/billing/auto-scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capAmount: newCap }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Monthly cap saved');
      queryClient.invalidateQueries({ queryKey: ['auto-scale'] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error('Error', { description: error.message });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await fetch('/api/billing/auto-scale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to toggle');
      }
      return res.json();
    },
    onSuccess: (res) => {
      toast.success(res.isActive ? 'Auto-Recharge activated' : 'Auto-Recharge deactivated');
      queryClient.invalidateQueries({ queryKey: ['auto-scale'] });
    },
    onError: (error: Error) => {
      toast.error('Error', { description: error.message });
    },
  });

  if (isLoading || !data) {
    return (
      <Card className="mt-8 p-8 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-white" />
      </Card>
    );
  }

  const usagePercentage = Math.min(Math.round((data.creditsUsed / data.creditsIncluded) * 100), 100);
  const approxProducts = Math.floor(Number(capValue) / 0.25);
  const isCapValid = Number(capValue) >= 10;

  return (
    <Card className={`mt-8 transition-colors ${data.isActive ? 'border-emerald-500/20' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${data.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
            <div>
              <CardTitle>Auto-Recharge</CardTitle>
              <CardDescription>Automatically refill credits before you run out.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{data.isActive ? 'ON' : 'OFF'}</span>
            <Switch
              checked={data.isActive}
              onCheckedChange={(checked) => toggleMutation.mutate(checked)}
              disabled={toggleMutation.isPending}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Credits included:</span>
          <span className="text-sm font-medium" translate="no">{data.creditsIncluded} /mo</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Used this month:</span>
            <span className="text-sm font-medium" translate="no">{data.creditsUsed} ({usagePercentage}%)</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Recharges this month:</span>
          <span className="text-sm font-medium" translate="no">{data.autoRechargesCount} pack ({data.rechargePackSize} credits)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Additional charges this month:</span>
          <span className="text-sm font-medium" translate="no">${data.additionalCharges}</span>
        </div>

        {data.isActive ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 text-sm text-emerald-600">
            ✓ When you've used 80% of your credits, we'll add 40 credits for $10 — up to a ${data.monthlyCap} monthly cap.
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 text-sm text-amber-600">
            ⚠ Auto-Recharge is off. If you run out of credits, your work may be interrupted. Turn it back on anytime — your spend cap is saved.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Monthly cap:</span>
            <span className="text-lg font-bold" translate="no">${data.monthlyCap}</span>
          </div>
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">Edit</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Monthly Spend Cap</AlertDialogTitle>
                <AlertDialogDescription>
                  Set the maximum you're willing to spend on automatic recharges each month. This doesn't turn on Auto-Recharge — use the toggle for that.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cap">Monthly Spend Cap ($)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">$</span>
                    <Input
                      id="cap"
                      type="number"
                      value={capValue}
                      onChange={(e) => setCapValue(e.target.value)}
                      min={10}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground" translate="no">≈ {approxProducts} products</p>
                  {!isCapValid && (
                    <p className="text-xs text-red-500">Minimum: $10</p>
                  )}
                </div>
                <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">How it works:</p>
                  When you reach 80% of your monthly credits, we automatically add 40 credits ($10). This stops when you reach your cap. Use the toggle on the card to activate or deactivate.
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={!isCapValid || saveCapMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    saveCapMutation.mutate(Number(capValue));
                  }}
                >
                  {saveCapMutation.isPending ? 'Saving...' : 'Save'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-xs text-muted-foreground" translate="no">≈ {Math.floor(data.monthlyCap / 0.25)} products</p>
      </CardFooter>
    </Card>
  );
}
