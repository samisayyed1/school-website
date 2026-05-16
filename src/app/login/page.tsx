import Link from "next/link";
import { LoginForm } from "./LoginForm";

const PORTAL_LABELS: Record<string, { title: string; sub: string }> = {
  student: { title: "Student Portal", sub: "Sign in to view your timetable, results, and announcements." },
  parent: { title: "Parent Portal", sub: "Sign in to follow your child's progress, attendance, and fees." },
  teacher: { title: "Teacher Portal", sub: "Sign in to manage your classes, attendance, and grades." },
  staff: { title: "Staff Portal", sub: "Sign in to access administrative tools and school-wide analytics." },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { role?: string; next?: string; error?: string };
}) {
  const roleKey = (searchParams.role ?? "").toLowerCase();
  const portal = PORTAL_LABELS[roleKey] ?? {
    title: "Portal Login",
    sub: "Sign in to your VIP School account.",
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-vip-hero text-white p-12 overflow-hidden">
        <div className="absolute inset-0 vip-pattern" />
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-vip-gold/15 blur-3xl" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-vip-emerald text-vip-gold shadow-soft border border-white/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3 3 7v10l9 4 9-4V7l-9-4Z" />
                <path d="M7 11.5c2 2 8 2 10 0" strokeLinecap="round" />
              </svg>
            </span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">VIP School</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-vip-goldSoft">
                of Excellence
              </div>
            </div>
          </Link>
        </div>
        <div className="relative max-w-md">
          <p className="text-xs uppercase tracking-[0.22em] text-vip-goldSoft">Welcome back</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            One portal.{" "}
            <span className="text-vip-goldSoft">Every role.</span>
          </h2>
          <p className="mt-4 text-white/75 leading-relaxed">
            Students, parents, teachers, and staff — sign in with your school
            credentials. Your dashboard adapts to what you do.
          </p>
        </div>
        <div className="relative text-xs text-white/50">
          © {new Date().getFullYear()} The VIP School of Excellence · Nizamabad
        </div>
      </aside>

      {/* Right form panel */}
      <section className="flex items-center justify-center p-6 sm:p-12 bg-vip-cream">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-sm text-vip-emerald mb-8">
            ← Back to site
          </Link>
          <div className="text-xs uppercase tracking-[0.22em] text-vip-emerald/70">
            {portal.title}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-3 text-vip-muted leading-relaxed">{portal.sub}</p>

          {searchParams.error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {decodeURIComponent(searchParams.error)}
            </div>
          )}

          <LoginForm nextPath={searchParams.next} />

          <div className="mt-8 text-sm text-vip-muted">
            Need an account? <span className="text-vip-emerald font-medium">Contact the school office</span> — accounts are issued by the admin.
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            {(["student", "parent", "teacher", "staff"] as const).map((r) => (
              <Link
                key={r}
                href={`/login?role=${r}`}
                className={`rounded-full border px-3 py-1.5 transition ${
                  roleKey === r
                    ? "border-vip-emerald bg-vip-emerald text-white"
                    : "border-vip-emerald/20 text-vip-muted hover:border-vip-emerald/40 hover:text-vip-emerald"
                }`}
              >
                {r[0].toUpperCase() + r.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
