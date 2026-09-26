import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Printer, Trash2, Zap } from 'lucide-react';
import { configApi } from '@/api/configApi';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type PrinterRow = {
  PrinterId: number;
  PrinterName: string;
  PrinterType: string;
  IpAddress: string | null;
  Port: number | null;
  PaperSize: string | null;
  KitchenStation: string | null;
  AutoPrint: number;
};

const empty = {
  PrinterName: '',
  PrinterType: 'receipt',
  IpAddress: '',
  Port: 9100,
  PaperSize: '80mm',
  KitchenStation: '',
  AutoPrint: false,
};

export function PrinterConfigPanel({ branchId }: { branchId?: number | null }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['printers', branchId],
    queryFn: () => configApi.listPrinters(branchId),
  });
  const printers = (data as PrinterRow[] | undefined) ?? [];
  const [form, setForm] = useState(empty);

  const save = useMutation({
    mutationFn: () =>
      configApi.savePrinter({
        ...form,
        BranchId: branchId,
        Port: Number(form.Port) || 9100,
      }),
    onSuccess: () => {
      toast.success('Printer saved');
      setForm(empty);
      void qc.invalidateQueries({ queryKey: ['printers'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const test = useMutation({
    mutationFn: (id: number) => configApi.testPrinter(id),
    onSuccess: (res) => {
      toast.success((res as { message?: string }) ? 'Test print queued' : 'Test print sent', {
        description: 'Check your printer for a NammaQR test page.',
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => configApi.deletePrinter(id),
    onSuccess: () => {
      toast.success('Printer deactivated');
      void qc.invalidateQueries({ queryKey: ['printers'] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Printers"
        description="Route receipts and KOTs. Example: Receipt → Counter · Drinks KOT → Bar."
        icon={Printer}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configured printers</CardTitle>
          <CardDescription>Receipt · KOT · Kitchen · Barcode · Label</CardDescription>
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
                  <TableHead>IP : Port</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Auto</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {printers.map((p) => (
                  <TableRow key={p.PrinterId}>
                    <TableCell className="font-medium">{p.PrinterName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.PrinterType}</Badge>
                    </TableCell>
                    <TableCell>
                      {p.IpAddress || '—'}:{p.Port ?? 9100}
                    </TableCell>
                    <TableCell>{p.KitchenStation || '—'}</TableCell>
                    <TableCell>{p.AutoPrint ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => test.mutate(p.PrinterId)}
                        disabled={test.isPending}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        Test
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm('Deactivate this printer?')) remove.mutate(p.PrinterId);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {printers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No printers yet
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
          <CardTitle className="text-base">Add printer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.PrinterName}
              onChange={(e) => setForm((f) => ({ ...f, PrinterName: e.target.value }))}
              placeholder="Cash Counter"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={form.PrinterType}
              onChange={(e) => setForm((f) => ({ ...f, PrinterType: e.target.value }))}
            >
              {['receipt', 'kot', 'kitchen', 'barcode', 'label'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>IP address</Label>
            <Input
              value={form.IpAddress}
              onChange={(e) => setForm((f) => ({ ...f, IpAddress: e.target.value }))}
              placeholder="192.168.1.50"
            />
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input
              type="number"
              value={form.Port}
              onChange={(e) => setForm((f) => ({ ...f, Port: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Paper size</Label>
            <Input
              value={form.PaperSize}
              onChange={(e) => setForm((f) => ({ ...f, PaperSize: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Kitchen station</Label>
            <Input
              value={form.KitchenStation}
              onChange={(e) => setForm((f) => ({ ...f, KitchenStation: e.target.value }))}
              placeholder="MAIN / BAR"
            />
          </div>
          <div className="flex items-center justify-between sm:col-span-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.AutoPrint}
                onCheckedChange={(v) => setForm((f) => ({ ...f, AutoPrint: v }))}
              />
              <Label>Auto print</Label>
            </div>
            <Button
              onClick={() => {
                if (!form.PrinterName.trim()) {
                  toast.error('Printer name required');
                  return;
                }
                save.mutate();
              }}
              disabled={save.isPending}
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add printer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
