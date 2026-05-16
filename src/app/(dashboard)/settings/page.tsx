import { requireProfile, ROLE_LABEL } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function SettingsPage() {
  const profile = await requireProfile();
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
          Manage your account and preferences.
        </p>
      </header>

      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <h2 className="font-semibold">Account</h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Row label="Full name" value={profile.full_name} />
          <Row label="Email" value={profile.email ?? "—"} />
          <Row label="Phone" value={profile.phone ?? "—"} />
          <Row label="Role" value={ROLE_LABEL[profile.role]} />
          {profile.workspace_email && (
            <Row label="Workspace Email" value={profile.workspace_email} />
          )}
        </dl>
      </section>

      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
              Switch between light and dark mode. Saved on this device.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-vip-emerald/10 dark:border-zinc-800 p-6">
        <h2 className="font-semibold">Session</h2>
        <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
          Sign out of this device.
        </p>
        <form action="/auth/signout" method="post" className="mt-4">
          <button className="rounded-full bg-red-50 text-red-700 hover:bg-red-100 px-5 py-2 text-sm font-semibold transition">
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-vip-muted dark:text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
