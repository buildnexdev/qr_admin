import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clock, Loader2, Save } from 'lucide-react';
import { configApi } from '@/api/configApi';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type HourRow = {
  DayOfWeek: number;
  IsClosed: boolean;
  OpenTime: string;
  CloseTime: string;
  BreakStart: string;
  BreakEnd: string;
};

function defaultDays(): HourRow[] {
  return DAYS.map((_, i) => ({
    DayOfWeek: i,
    IsClosed: i === 0,
    OpenTime: '09:00',
    CloseTime: '23:00',
    BreakStart: '',
    BreakEnd: '',
  }));
}

export function HoursConfigPanel({ branchId }: { branchId?: number | null }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['business-hours', branchId],
    queryFn: () => configApi.listHours(branchId),
  });

  const [days, setDays] = useState<HourRow[]>(defaultDays());

  useEffect(() => {
    const rows = data as Array<Record<string, unknown>> | undefined;
    if (!rows?.length) return;
    const next = defaultDays();
    for (const r of rows) {
      const d = Number(r.DayOfWeek);
      if (d >= 0 && d <= 6) {
        next[d] = {
          DayOfWeek: d,
          IsClosed: Boolean(r.IsClosed),
          OpenTime: String(r.OpenTime || '09:00').slice(0, 5),
          CloseTime: String(r.CloseTime || '23:00').slice(0, 5),
          BreakStart: r.BreakStart ? String(r.BreakStart).slice(0, 5) : '',
          BreakEnd: r.BreakEnd ? String(r.BreakEnd).slice(0, 5) : '',
        };
      }
    }
    setDays(next);
  }, [data]);

  const save = useMutation({
    mutationFn: () => configApi.saveHours(days as unknown as Record<string, unknown>[], branchId),
    onSuccess: () => {
      toast.success('Business hours saved — POS can respect these hours');
      void qc.invalidateQueries({ queryKey: ['business-hours'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Hours"
        description="Per-day hours with optional break. POS can respect configured hours."
        icon={Clock}
      >
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save hours
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly schedule</CardTitle>
          <CardDescription>
            {branchId ? `Branch #${branchId} override` : 'Company-wide hours'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {days.map((day, idx) => (
                <div
                  key={day.DayOfWeek}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-border p-3 md:grid-cols-6 md:items-center"
                >
                  <p className="font-medium text-sm md:col-span-1">{DAYS[idx]}</p>
                  <div className="flex items-center gap-2 md:col-span-1">
                    <Switch
                      checked={!day.IsClosed}
                      onCheckedChange={(v) =>
                        setDays((all) =>
                          all.map((d, i) => (i === idx ? { ...d, IsClosed: !v } : d))
                        )
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {day.IsClosed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  {!day.IsClosed && (
                    <>
                      <Input
                        type="time"
                        value={day.OpenTime}
                        onChange={(e) =>
                          setDays((all) =>
                            all.map((d, i) => (i === idx ? { ...d, OpenTime: e.target.value } : d))
                          )
                        }
                      />
                      <Input
                        type="time"
                        value={day.CloseTime}
                        onChange={(e) =>
                          setDays((all) =>
                            all.map((d, i) => (i === idx ? { ...d, CloseTime: e.target.value } : d))
                          )
                        }
                      />
                      <Input
                        type="time"
                        value={day.BreakStart}
                        placeholder="Break start"
                        onChange={(e) =>
                          setDays((all) =>
                            all.map((d, i) =>
                              i === idx ? { ...d, BreakStart: e.target.value } : d
                            )
                          )
                        }
                      />
                      <Input
                        type="time"
                        value={day.BreakEnd}
                        placeholder="Break end"
                        onChange={(e) =>
                          setDays((all) =>
                            all.map((d, i) => (i === idx ? { ...d, BreakEnd: e.target.value } : d))
                          )
                        }
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
