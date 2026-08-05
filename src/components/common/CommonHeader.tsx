import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CommonHeaderProps {
  title: string;
  icon: LucideIcon;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddClick?: () => void;
  addButtonLabel?: string;
}

const CommonHeader = ({
  title,
  icon: Icon,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onAddClick,
  addButtonLabel = 'Add New',
}: CommonHeaderProps) => {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">Manage and monitor your {title.toLowerCase()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 bg-muted/40 border-border/60"
            aria-label={searchPlaceholder}
          />
        </div>
        {onAddClick && (
          <Button onClick={onAddClick} className="shrink-0">
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>
    </header>
  );
};

export default CommonHeader;
