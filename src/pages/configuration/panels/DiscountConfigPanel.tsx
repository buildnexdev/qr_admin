import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, TicketPercent } from 'lucide-react';
import { configApi } from '@/api/configApi';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Discount = {
  DiscountId: number;
  DiscountName: string;
  DiscountType: string;
  DiscountValue: number;
  MaxDiscount: number | null;
  MinOrderAmount: number | null;
  RequiresPermission: number;
  StartDate: string | null;
  EndDate: string | null;
};

export function DiscountConfigPanel({ branchId }: { branchId?: number | null }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['discounts', branchId],
    queryFn: () => configApi.listDiscounts(branchId),
  });
  const rows = (data as Discount[] | undefined) ?? [];

  const [form, setForm] = useState({
    DiscountName: '',
    DiscountType: 'percentage',
    DiscountValue: 10,
    MaxDiscount: 500,
    MinOrderAmount: 0,
    RequiresPermission: true,
    StartDate: '',
    EndDate: '',
  });

  const save = useMutation({
    mutationFn: () =>
      configApi.saveDiscount({
        ...form,
        BranchId: branchId,
        MaxDiscount: form.MaxDiscount || null,
        MinOrderAmount: form.MinOrderAmount || null,
        StartDate: form.StartDate || null,
        EndDate: form.EndDate || null,
      }),
    onSuccess: () => {
      toast.success('Discount rule saved');
      setForm({
        DiscountName: '',
        DiscountType: 'percentage',
        DiscountValue: 10,
        MaxDiscount: 500,
        MinOrderAmount: 0,
        RequiresPermission: true,
        StartDate: '',
        EndDate: '',
      });
      void qc.invalidateQueries({ queryKey: ['discounts'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts & Offers"
        description="Sensitive discounts can require permission. Unauthorized cashiers cannot apply them."
        icon={TicketPercent}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active rules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Permission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.DiscountId}>
                    <TableCell className="font-medium">{r.DiscountName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.DiscountType}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.DiscountType === 'percentage'
                        ? `${r.DiscountValue}%`
                        : `₹${r.DiscountValue}`}
                    </TableCell>
                    <TableCell>{r.MaxDiscount != null ? `₹${r.MaxDiscount}` : '—'}</TableCell>
                    <TableCell>{r.RequiresPermission ? 'Required' : 'Open'}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No discount rules yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create discount</CardTitle>
          <CardDescription>Percentage, fixed, coupon or promo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.DiscountName}
              onChange={(e) => setForm((f) => ({ ...f, DiscountName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={form.DiscountType}
              onChange={(e) => setForm((f) => ({ ...f, DiscountType: e.target.value }))}
            >
              {['percentage', 'fixed', 'coupon', 'promo'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              type="number"
              value={form.DiscountValue}
              onChange={(e) => setForm((f) => ({ ...f, DiscountValue: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Max discount (₹)</Label>
            <Input
              type="number"
              value={form.MaxDiscount}
              onChange={(e) => setForm((f) => ({ ...f, MaxDiscount: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Min order (₹)</Label>
            <Input
              type="number"
              value={form.MinOrderAmount}
              onChange={(e) => setForm((f) => ({ ...f, MinOrderAmount: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={form.StartDate}
              onChange={(e) => setForm((f) => ({ ...f, StartDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input
              type="date"
              value={form.EndDate}
              onChange={(e) => setForm((f) => ({ ...f, EndDate: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.RequiresPermission}
              onCheckedChange={(v) => setForm((f) => ({ ...f, RequiresPermission: v }))}
            />
            <Label>Requires permission</Label>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                if (!form.DiscountName.trim()) {
                  toast.error('Name required');
                  return;
                }
                save.mutate();
              }}
              disabled={save.isPending}
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add rule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
