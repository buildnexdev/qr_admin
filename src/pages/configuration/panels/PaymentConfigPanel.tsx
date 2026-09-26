import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Wallet } from 'lucide-react';
import { configApi } from '@/api/configApi';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type PayMethod = {
  PaymentMethodId: number;
  MethodCode: string;
  DisplayName: string;
  Instructions: string | null;
  SortOrder: number;
  IsEnabled: number;
};

export function PaymentConfigPanel({ branchId }: { branchId?: number | null }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['payment-methods', branchId],
    queryFn: () => configApi.listPayments(branchId),
  });

  const methods = (data as PayMethod[] | undefined) ?? [];

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => configApi.savePayment(payload),
    onSuccess: () => {
      toast.success('Payment method updated — POS checkout will reflect this');
      void qc.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Methods"
        description="Enable or disable tender types. Disabled methods are hidden from POS checkout."
        icon={Wallet}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active tenders</CardTitle>
          <CardDescription>Cash · Card · UPI · QR · Online · Wallet · Credit</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {methods.map((m) => (
                <div
                  key={m.PaymentMethodId}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{m.DisplayName}</p>
                      <Badge variant="secondary">{m.MethodCode}</Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Display name</Label>
                        <Input
                          defaultValue={m.DisplayName}
                          onBlur={(e) => {
                            if (e.target.value !== m.DisplayName) {
                              save.mutate({
                                PaymentMethodId: m.PaymentMethodId,
                                DisplayName: e.target.value,
                                Instructions: m.Instructions,
                                SortOrder: m.SortOrder,
                                IsEnabled: m.IsEnabled,
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Instructions</Label>
                        <Input
                          defaultValue={m.Instructions ?? ''}
                          placeholder="Shown at checkout"
                          onBlur={(e) => {
                            if (e.target.value !== (m.Instructions ?? '')) {
                              save.mutate({
                                PaymentMethodId: m.PaymentMethodId,
                                DisplayName: m.DisplayName,
                                Instructions: e.target.value,
                                SortOrder: m.SortOrder,
                                IsEnabled: m.IsEnabled,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {m.IsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={Boolean(m.IsEnabled)}
                      onCheckedChange={(v) =>
                        save.mutate({
                          PaymentMethodId: m.PaymentMethodId,
                          DisplayName: m.DisplayName,
                          Instructions: m.Instructions,
                          SortOrder: m.SortOrder,
                          IsEnabled: v,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
              {methods.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No payment methods. Run <code>npm run db:config-tables</code> on the backend.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
