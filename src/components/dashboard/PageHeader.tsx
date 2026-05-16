export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-vip-emerald/10 dark:border-zinc-800">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-vip-emerald/20 dark:border-zinc-700 bg-white/40 dark:bg-zinc-900/40 p-10 text-center">
      <p className="text-sm font-semibold text-vip-ink dark:text-zinc-100">{title}</p>
      {body && (
        <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">{body}</p>
      )}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
