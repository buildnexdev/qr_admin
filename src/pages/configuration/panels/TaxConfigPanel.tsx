import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { configApi } from '@/api/configApi';
import { calculateLineTax } from '@/lib/tax';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type TaxRate = {
  TaxRateId: number;
  TaxName: string;
  TaxCode: string;
  TaxPercent: number;
  CGSTPercent: number;
  SGSTPercent: number;
  IGSTPercent: number;
  IsInclusive: number;
  IsDefault: number;
};

export function TaxConfigPanel({ branchId }: { branchId?: number | null }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['tax-rates', branchId],
    queryFn: () => configApi.listTaxRates(branchId),
  });

  const rates = (data as TaxRate[] | undefined) ?? [];
  const [form, setForm] = useState({
    TaxName: '',
    TaxCode: '',
    TaxPercent: 5,
    IsInclusive: false,
    IsDefault: false,
  });

  const save = useMutation({
    mutationFn: () =>
      configApi.saveTaxRate({
        ...form,
        CGSTPercent: form.TaxPercent / 2,
        SGSTPercent: form.TaxPercent / 2,
        IGSTPercent: form.TaxPercent,
        BranchId: branchId,
      }),
    onSuccess: () => {
      toast.success('Tax rate saved');
      setForm({ TaxName: '', TaxCode: '', TaxPercent: 5, IsInclusive: false, IsDefault: false });
      void qc.invalidateQueries({ queryKey: ['tax-rates'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => configApi.deleteTaxRate(id),
    onSuccess: () => {
      toast.success('Tax rate deactivated');
      void qc.invalidateQueries({ queryKey: ['tax-rates'] });
    },
  });

  const demo = calculateLineTax(100, { TaxPercent: form.TaxPercent, IsInclusive: form.IsInclusive }, {
    pricingMode: form.IsInclusive ? 'inclusive' : 'exclusive',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tax rates</CardTitle>
        <CardDescription>
          GST slabs used across POS, invoice, QR and reports via centralized tax calculator.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>CGST / SGST</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((r) => (
                <TableRow key={r.TaxRateId}>
                  <TableCell className="font-medium">
                    {r.TaxName}{' '}
                    {r.IsDefault ? <Badge variant="success" className="ml-1">Default</Badge> : null}
                  </TableCell>
                  <TableCell>{r.TaxCode}</TableCell>
                  <TableCell>{Number(r.TaxPercent)}%</TableCell>
                  <TableCell>
                    {Number(r.CGSTPercent)}% / {Number(r.SGSTPercent)}%
                  </TableCell>
                  <TableCell>{r.IsInclusive ? 'Inclusive' : 'Exclusive'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm('Deactivate this tax rate?')) remove.mutate(r.TaxRateId);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No tax rates — run db:config-tables to seed defaults.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Tax name</Label>
            <Input
              value={form.TaxName}
              onChange={(e) => setForm((f) => ({ ...f, TaxName: e.target.value }))}
              placeholder="GST 5%"
            />
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input
              value={form.TaxCode}
              onChange={(e) => setForm((f) => ({ ...f, TaxCode: e.target.value }))}
              placeholder="GST5"
            />
          </div>
          <div className="space-y-2">
            <Label>Percent</Label>
            <Input
              type="number"
              value={form.TaxPercent}
              onChange={(e) => setForm((f) => ({ ...f, TaxPercent: Number(e.target.value) }))}
            />
          </div>
          <div className="flex flex-col justify-end gap-3">
            <div className="flex items-center justify-between">
              <Label>Inclusive</Label>
              <Switch
                checked={form.IsInclusive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, IsInclusive: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Default</Label>
              <Switch
                checked={form.IsDefault}
                onCheckedChange={(v) => setForm((f) => ({ ...f, IsDefault: v }))}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 px-4 py-3 text-sm">
          <span>
            Preview ₹100 → taxable ₹{demo.taxableAmount.toFixed(2)}, tax ₹{demo.taxAmount.toFixed(2)},
            total ₹{demo.total.toFixed(2)}
          </span>
          <Button
            onClick={() => {
              if (!form.TaxName || !form.TaxCode) {
                toast.error('Name and code required');
                return;
              }
              save.mutate();
            }}
            disabled={save.isPending}
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add tax rate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
