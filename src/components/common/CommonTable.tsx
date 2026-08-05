import type { ReactNode } from 'react';
import CommonPagination from './CommonPagination';
import type { CommonPaginationProps } from './CommonPagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  header: string;
  render?: (row: any, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface CommonTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  emptySlot?: ReactNode;
  pagination?: CommonPaginationProps;
}

const alignClass = (align?: 'left' | 'center' | 'right') =>
  align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

const CommonTable: React.FC<CommonTableProps> = ({
  columns,
  data,
  emptyMessage = 'No records found.',
  emptySlot,
  pagination,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((col) => (
              <TableHead key={col.key} className={cn('font-semibold text-xs uppercase tracking-wide', alignClass(col.align))}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow key={String(row.id ?? rowIndex)} className="group">
                {columns.map((col) => (
                  <TableCell key={col.key} className={alignClass(col.align)}>
                    {col.render ? col.render(row, rowIndex) : String(row[col.key] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {emptySlot ?? emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && <CommonPagination {...pagination} />}
    </div>
  );
};

export default CommonTable;
