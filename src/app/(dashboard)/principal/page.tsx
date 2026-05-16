import { requireRole } from "@/lib/auth";

export default async function PrincipalPage() {
  const profile = await requireRole(["principal", "coordinator"]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {profile.role === "principal" ? "Principal" : "Coordinator"} Dashboard
      </h1>
      <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
        Welcome, {profile.full_name}. School-wide analytics and management.
      </p>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card title="Students" stat="—" hint="Total enrolled" />
        <Card title="Teachers" stat="—" hint="Active staff" />
        <Card title="Classes" stat="5" hint="Classes 1 – 5" />
      </div>
      <p className="mt-8 text-xs text-vip-muted dark:text-zinc-500">
        Live data lights up once Supabase is seeded with student/teacher records.
      </p>
    </div>
  );
}

function Card({ title, stat, hint }: { title: string; stat: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
      <div className="text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-3xl font-bold text-vip-emerald">{stat}</div>
      <div className="mt-1 text-xs text-vip-muted dark:text-zinc-500">{hint}</div>
    </div>
  );
}
