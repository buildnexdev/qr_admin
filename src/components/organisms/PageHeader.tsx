import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; onClick?: () => void };
  children?: React.ReactNode;
};

export function PageHeader({ title, description, icon: Icon, action, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button onClick={action.onClick}>
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
