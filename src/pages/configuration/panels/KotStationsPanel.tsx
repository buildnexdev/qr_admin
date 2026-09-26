import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChefHat, Loader2, Plus } from 'lucide-react';
import { configApi } from '@/api/configApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Station = {
  StationId: number;
  StationName: string;
  StationCode: string;
  SortOrder: number;
  PrinterId: number | null;
};

export function KotStationsPanel({ branchId }: { branchId?: number | null }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['kitchen-stations', branchId],
    queryFn: () => configApi.listStations(branchId),
  });
  const stations = (data as Station[] | undefined) ?? [];
  const [form, setForm] = useState({ StationName: '', StationCode: '', SortOrder: 0 });

  const save = useMutation({
    mutationFn: () =>
      configApi.saveStation({
        ...form,
        BranchId: branchId,
      }),
    onSuccess: () => {
      toast.success('Kitchen station saved');
      setForm({ StationName: '', StationCode: '', SortOrder: 0 });
      void qc.invalidateQueries({ queryKey: ['kitchen-stations'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">Kitchen stations</CardTitle>
            <CardDescription>
              Route categories: Pizza → Main Kitchen · Drinks → Bar · Dessert → Dessert Station
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((s) => (
                <TableRow key={s.StationId}>
                  <TableCell className="font-medium">{s.StationName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.StationCode}</Badge>
                  </TableCell>
                  <TableCell>{s.SortOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.StationName}
              onChange={(e) => setForm((f) => ({ ...f, StationName: e.target.value }))}
              placeholder="Main Kitchen"
            />
          </div>
          <div className="space-y-1">
            <Label>Code</Label>
            <Input
              value={form.StationCode}
              onChange={(e) => setForm((f) => ({ ...f, StationCode: e.target.value.toUpperCase() }))}
              placeholder="MAIN"
            />
          </div>
          <div className="space-y-1">
            <Label>Sort</Label>
            <Input
              type="number"
              value={form.SortOrder}
              onChange={(e) => setForm((f) => ({ ...f, SortOrder: Number(e.target.value) }))}
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => {
                if (!form.StationName || !form.StationCode) {
                  toast.error('Name and code required');
                  return;
                }
                save.mutate();
              }}
              disabled={save.isPending}
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add station
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
