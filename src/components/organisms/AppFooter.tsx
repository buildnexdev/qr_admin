export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="flex h-11 items-center justify-between gap-4 px-4 text-[11px] tracking-wide text-muted-foreground sm:px-6 lg:px-8">
        <span>© {year} NammaQR</span>
        <span className="uppercase">Restaurant POS · QR Ordering · Billing</span>
      </div>
    </footer>
  );
}

export default AppFooter;
