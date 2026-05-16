import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen bg-vip-cream dark:bg-zinc-900 text-vip-ink dark:text-zinc-100">
      <aside className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 border-r border-vip-emerald/10 dark:border-zinc-800">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-vip-emerald text-vip-gold shadow-soft">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3 3 7v10l9 4 9-4V7l-9-4Z" />
              <path d="M7 11.5c2 2 8 2 10 0" strokeLinecap="round" />
            </svg>
          </span>
          <span className="hidden lg:block leading-tight">
            <span className="block font-bold tracking-tight">VIP School</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-vip-emerald/70">
              of Excellence
            </span>
          </span>
        </Link>

        <Menu role={profile.role} />
      </aside>

      <main className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] dark:bg-zinc-950 overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
