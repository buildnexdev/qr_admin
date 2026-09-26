import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ConfigType } from '@/api/configApi';
import { configApi } from '@/api/configApi';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export type FieldDef =
  | { key: string; label: string; type: 'text' | 'number' | 'email' | 'url' | 'textarea'; help?: string; required?: boolean }
  | { key: string; label: string; type: 'switch'; help?: string }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: 'nested-switch'; parent: string; nestedKey: string; help?: string };

type Props = {
  configType: ConfigType;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: FieldDef[];
  branchId?: number | null;
  preview?: (data: Record<string, unknown>) => React.ReactNode;
  dangerNote?: string;
};

function getNested(obj: Record<string, unknown>, parent: string, key: string): boolean {
  const p = obj[parent];
  if (p && typeof p === 'object') return Boolean((p as Record<string, unknown>)[key]);
  return false;
}

function setNested(
  obj: Record<string, unknown>,
  parent: string,
  key: string,
  value: boolean
): Record<string, unknown> {
  const prev = (obj[parent] as Record<string, unknown>) || {};
  return { ...obj, [parent]: { ...prev, [key]: value } };
}

export function ConfigFormPage({
  configType,
  title,
  description,
  icon,
  fields,
  branchId,
  preview,
  dangerNote,
}: Props) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['config', configType, branchId],
    queryFn: () => configApi.get(configType, branchId),
  });

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data && typeof data === 'object' && 'data' in data) {
      setForm({ ...((data as { data: Record<string, unknown> }).data || {}) });
      setDirty(false);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => configApi.update(configType, form, branchId),
    onSuccess: () => {
      toast.success('Configuration saved', {
        description: `${title} now applies to POS, billing, and related modules.`,
      });
      setDirty(false);
      void qc.invalidateQueries({ queryKey: ['config', configType] });
      void qc.invalidateQueries({ queryKey: ['config-hub'] });
    },
    onError: (err: Error) => {
      toast.error('Save failed', { description: err.message });
    },
  });

  const updatedAt = useMemo(() => {
    const d = data as { updatedDate?: string } | undefined;
    return d?.updatedDate ? new Date(d.updatedDate).toLocaleString('en-IN') : null;
  }, [data]);

  const handleSave = () => {
    if (dangerNote && !window.confirm(dangerNote)) return;
    mutation.mutate();
  };

  const handleReset = () => {
    if (data && typeof data === 'object' && 'data' in data) {
      setForm({ ...((data as { data: Record<string, unknown> }).data || {}) });
      setDirty(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger/30">
        <CardContent className="py-8 text-sm text-danger">
          {(error as Error).message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} icon={icon}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!dirty || mutation.isPending}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!dirty || mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </PageHeader>

      {updatedAt && (
        <p className="text-xs text-muted-foreground -mt-4">Last updated {updatedAt}</p>
      )}

      <div className={`grid gap-6 ${preview ? 'xl:grid-cols-5' : ''}`}>
        <Card className={preview ? 'xl:col-span-3' : ''}>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>
              Changes apply to POS behavior after save.
              {branchId ? ` Branch #${branchId} override.` : ' Company-wide defaults.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {fields.map((field) => {
              if (field.type === 'switch') {
                return (
                  <div key={field.key} className="flex items-center justify-between gap-4">
                    <div>
                      <Label>{field.label}</Label>
                      {field.help && (
                        <p className="text-xs text-muted-foreground mt-0.5">{field.help}</p>
                      )}
                    </div>
                    <Switch
                      checked={Boolean(form[field.key])}
                      onCheckedChange={(v) => {
                        setForm((f) => ({ ...f, [field.key]: v }));
                        setDirty(true);
                      }}
                    />
                  </div>
                );
              }

              if (field.type === 'nested-switch') {
                return (
                  <div key={`${field.parent}.${field.nestedKey}`} className="flex items-center justify-between gap-4">
                    <div>
                      <Label>{field.label}</Label>
                      {field.help && (
                        <p className="text-xs text-muted-foreground mt-0.5">{field.help}</p>
                      )}
                    </div>
                    <Switch
                      checked={getNested(form, field.parent, field.nestedKey)}
                      onCheckedChange={(v) => {
                        setForm((f) => setNested(f, field.parent, field.nestedKey, v));
                        setDirty(true);
                      }}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                      value={String(form[field.key] ?? '')}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, [field.key]: e.target.value }));
                        setDirty(true);
                      }}
                    >
                      {field.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </Label>
                    <textarea
                      className="flex min-h-[88px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                      value={String(form[field.key] ?? '')}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, [field.key]: e.target.value }));
                        setDirty(true);
                      }}
                    />
                    {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </Label>
                  <Input
                    type={field.type === 'number' ? 'number' : field.type}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => {
                      const val =
                        field.type === 'number'
                          ? e.target.value === ''
                            ? ''
                            : Number(e.target.value)
                          : e.target.value;
                      setForm((f) => ({ ...f, [field.key]: val }));
                      setDirty(true);
                    }}
                  />
                  {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
                </div>
              );
            })}

            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!dirty}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!dirty || mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {preview && (
          <div className="xl:col-span-2">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-base">Live preview</CardTitle>
                <CardDescription>Updates as you edit (save to apply)</CardDescription>
              </CardHeader>
              <CardContent>{preview(form)}</CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
