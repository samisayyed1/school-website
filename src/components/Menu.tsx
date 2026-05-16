import Link from "next/link";
import type { AppRole } from "@/lib/supabase/middleware";
import { roleHome } from "@/lib/auth";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  visible: AppRole[];
};

type MenuSection = { title: string; items: MenuItem[] };

const Section = ({ children }: { children: React.ReactNode }) => (
  <span className="hidden lg:block text-xs font-semibold uppercase tracking-[0.16em] text-vip-muted/70 dark:text-zinc-500 mt-6 mb-2 px-3">
    {children}
  </span>
);

const ALL: AppRole[] = ["admin", "principal", "coordinator", "teacher", "student", "parent"];

const menuItems: MenuSection[] = [
  {
    title: "MENU",
    items: [
      { label: "Dashboard", href: "/", icon: <IconHome />, visible: ALL },
      { label: "Homework", href: "/homework", icon: <IconBook />, visible: ALL },
      { label: "Attendance", href: "/list/attendance", icon: <IconCheck />, visible: ALL },
      { label: "Exams", href: "/exams", icon: <IconAward />, visible: ["teacher", "coordinator", "principal"] },
      { label: "Results", href: "/list/results", icon: <IconAward />, visible: ALL },
      { label: "Fees", href: "/list/fees", icon: <IconRupee />, visible: ["admin", "principal", "student", "parent"] },
      { label: "Announcements", href: "/list/announcements", icon: <IconMegaphone />, visible: ALL },
      { label: "Events", href: "/list/events", icon: <IconCalendar />, visible: ALL },
    ],
  },
  {
    title: "MANAGE",
    items: [
      { label: "Users", href: "/admin/users", icon: <IconUsers />, visible: ["admin", "principal"] },
      { label: "Classes", href: "/admin/classes", icon: <IconClasses />, visible: ["admin", "principal", "coordinator"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { label: "Profile", href: "/profile", icon: <IconAvatar />, visible: ALL },
      { label: "Settings", href: "/settings", icon: <IconGear />, visible: ALL },
    ],
  },
];

const Menu = ({ role }: { role: AppRole }) => {
  const homeHref = roleHome(role);
  return (
    <nav className="mt-2 text-sm">
      {menuItems.map((section) => (
        <div key={section.title}>
          <Section>{section.title}</Section>
          <ul className="flex flex-col gap-1">
            {section.items
              .filter((item) => item.visible.includes(role))
              .map((item) => {
                const href = item.href === "/" ? homeHref : item.href;
                return (
                  <li key={item.label}>
                    <Link
                      href={href}
                      className="flex items-center justify-center lg:justify-start gap-3 text-vip-muted dark:text-zinc-400 py-2 px-3 rounded-lg hover:bg-vip-emerald/10 dark:hover:bg-zinc-800 hover:text-vip-emerald dark:hover:text-emerald-300 transition"
                    >
                      <span className="h-5 w-5 text-vip-emerald">{item.icon}</span>
                      <span className="hidden lg:block">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}

      <form action="/auth/signout" method="post" className="mt-6">
        <button
          type="submit"
          className="w-full flex items-center justify-center lg:justify-start gap-3 text-vip-muted dark:text-zinc-400 py-2 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition"
        >
          <IconLogout />
          <span className="hidden lg:block">Sign out</span>
        </button>
      </form>
    </nav>
  );
};

export default Menu;

/* Icons */
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 21c.7-3.5 3.5-5.5 6.5-5.5s5.8 2 6.5 5.5" />
      <circle cx="17" cy="9" r="2.8" />
      <path d="M21.5 19.5c-.5-2.5-2.3-4-4.5-4" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5Z" />
      <path d="M8 7h8M8 11h8" strokeLinecap="round" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 11l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconAward() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="9" r="6" />
      <path d="M8 14l-2 7 6-3 6 3-2-7" />
    </svg>
  );
}
function IconRupee() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M6 6h12M6 10h12M9 10c4 0 4 6 0 6h-3l9 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMegaphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 11v2l11 5V6L3 11Z" />
      <path d="M14 8.5a4 4 0 0 1 0 7" strokeLinecap="round" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
function IconClasses() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 4h18M3 9h18M3 14h18M3 19h18" strokeLinecap="round" />
    </svg>
  );
}
function IconAvatar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M15 17l5-5-5-5M20 12H9M12 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
