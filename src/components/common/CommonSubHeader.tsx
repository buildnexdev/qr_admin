import type { ReactNode } from 'react';
import { type LucideIcon, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface StatProp {
  label: string;
  value: string | number;
  color?: 'green' | 'red' | 'blue' | 'orange' | 'default';
}

export interface CommonSubHeaderProps {
  icon: LucideIcon;
  title: ReactNode;
  totalLabel?: string;
  totalCount?: number | string;
  stats?: StatProp[];
  centerContent?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  addButtonText?: string;
  onAddClick?: () => void;
  AddIcon?: LucideIcon;
}

const statColors: Record<NonNullable<StatProp['color']>, string> = {
  green: 'text-success',
  red: 'text-danger',
  blue: 'text-primary',
  orange: 'text-warning',
  default: 'text-foreground',
};

const CommonSubHeader: React.FC<CommonSubHeaderProps> = ({
  icon: Icon,
  title,
  totalLabel,
  totalCount,
  stats,
  centerContent,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  addButtonText,
  onAddClick,
  AddIcon = Plus,
}) => {
  return (
    <header className="mb-6 rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {(totalLabel !== undefined || totalCount !== undefined) && (
              <p className="text-sm text-muted-foreground">
                {totalLabel}{' '}
                {totalCount !== undefined && (
                  <span className="font-semibold text-foreground">{String(totalCount).padStart(2, '0')}</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Center stats */}
        {(centerContent || (stats && stats.length > 0)) && (
          <div className="flex flex-wrap items-center justify-center gap-3 xl:flex-1 xl:px-4">
            {centerContent ??
              stats?.map((s, idx) => (
                <div
                  key={idx}
                  className="flex min-w-[88px] flex-col items-center rounded-lg border border-border bg-muted/30 px-4 py-2"
                >
                  <span className={cn('text-lg font-bold', statColors[s.color ?? 'default'])}>{s.value}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</span>
                </div>
              ))}
          </div>
        )}

        {/* Right */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {onSearchChange && (
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 bg-muted/40"
              />
            </div>
          )}
          {onAddClick && addButtonText && (
            <Button onClick={onAddClick} className="shrink-0">
              <AddIcon className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default CommonSubHeader;
