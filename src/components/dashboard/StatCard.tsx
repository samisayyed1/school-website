type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "emerald" | "gold" | "neutral";
  icon?: React.ReactNode;
};

export function StatCard({ label, value, hint, accent = "emerald", icon }: Props) {
  const accentBg =
    accent === "gold"
      ? "bg-vip-gold/10 text-vip-gold"
      : accent === "neutral"
      ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      : "bg-vip-emerald/10 text-vip-emerald";

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-vip-muted dark:text-zinc-500">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-vip-emerald dark:text-emerald-300">
            {value}
          </div>
          {hint && (
            <div className="mt-1 text-xs text-vip-muted dark:text-zinc-500">{hint}</div>
          )}
        </div>
        {icon && (
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accentBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
