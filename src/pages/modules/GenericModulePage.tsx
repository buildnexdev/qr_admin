import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type ModuleDefinition = {
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'live' | 'beta' | 'coming_soon';
  features: string[];
  /** Sample table columns for preview UI */
  columns?: string[];
  sampleRows?: string[][];
};

type GenericModulePageProps = {
  module: ModuleDefinition;
};

export function GenericModulePage({ module }: GenericModulePageProps) {
  const Icon = module.icon;
  const isComingSoon = module.status === 'coming_soon';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title={module.title}
        description={module.description}
        icon={Icon}
        action={isComingSoon ? undefined : { label: `Add ${module.title}` }}
      >
        <Badge variant={module.status === 'live' ? 'success' : module.status === 'beta' ? 'warning' : 'secondary'}>
          {module.status === 'live' ? 'Live' : module.status === 'beta' ? 'Beta' : 'Coming Soon'}
        </Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>Module capabilities and roadmap</CardDescription>
          </CardHeader>
          <CardContent>
            {isComingSoon ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Construction className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Under Development</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {module.title} is being built with enterprise-grade features. Check back soon.
                </p>
                <Button variant="outline" className="mt-6" disabled>
                  Notify when ready
                </Button>
              </div>
            ) : (
              module.columns &&
              module.sampleRows && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {module.columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {module.sampleRows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {module.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
