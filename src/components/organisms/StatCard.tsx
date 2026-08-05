import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type StatCardProps = {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  loading?: boolean;
  prefix?: 'currency' | 'none';
};

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  loading,
  prefix = 'none',
}: StatCardProps) {
  const displayValue =
    prefix === 'currency' && typeof value === 'number' ? formatCurrency(value) : value;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{displayValue}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-danger',
                changeType === 'neutral' && 'text-muted-foreground'
              )}
            >
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
