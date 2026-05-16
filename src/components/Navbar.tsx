import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile, ROLE_LABEL } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = async () => {
  const profile = await getCurrentProfile();
  return (
    <header className="flex items-center justify-end gap-4 p-4 border-b border-vip-emerald/10 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm">
      <ThemeToggle />

      <Link
        href="/list/announcements"
        className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-vip-muted dark:text-zinc-400 hover:text-vip-emerald transition"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11v2l11 5V6L3 11Z" />
          <path d="M14 8.5a4 4 0 0 1 0 7" strokeLinecap="round" />
        </svg>
        Announcements
      </Link>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-semibold leading-tight">{profile?.full_name ?? "Guest"}</div>
          <div className="text-[10px] uppercase tracking-wider text-vip-muted dark:text-zinc-500">
            {profile ? ROLE_LABEL[profile.role] : ""}
          </div>
        </div>
        <div className="h-9 w-9 rounded-full bg-vip-emerald text-white grid place-items-center font-semibold overflow-hidden">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={36} height={36} className="rounded-full object-cover" />
          ) : (
            <span>{initials(profile?.full_name)}</span>
          )}
        </div>
      </div>
    </header>
  );
};

function initials(name?: string | null): string {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || name[0].toUpperCase();
}

export default Navbar;
