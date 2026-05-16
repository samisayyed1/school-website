import Image from "next/image";
import Link from "next/link";
import type { AppRole } from "@/lib/supabase/middleware";

type MenuItem = {
  icon: string;
  label: string;
  href: string;
  visible: AppRole[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuItems: MenuSection[] = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Dashboard", href: "/", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "principal", "coordinator"] },
      { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "principal", "coordinator", "teacher"] },
      { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "principal", "coordinator", "teacher"] },
      { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin", "principal", "coordinator"] },
      { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "principal", "coordinator", "teacher"] },
      { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: ["admin", "principal", "coordinator", "teacher"] },
      { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/attendance.png", label: "Attendance", href: "/list/attendance", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/finance.png", label: "Fees", href: "/list/fees", visible: ["admin", "principal", "student", "parent"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "principal", "coordinator", "teacher", "student", "parent"] },
    ],
  },
];

const Menu = ({ role }: { role: AppRole }) => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items
            .filter((item) => item.visible.includes(role))
            .map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-vip-emerald/10 hover:text-vip-emerald transition"
              >
                <Image src={item.icon} alt="" width={20} height={20} />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ))}
        </div>
      ))}

      <form action="/auth/signout" method="post" className="mt-4">
        <button
          type="submit"
          className="w-full flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-red-50 hover:text-red-600 transition"
        >
          <Image src="/logout.png" alt="" width={20} height={20} />
          <span className="hidden lg:block">Sign out</span>
        </button>
      </form>
    </div>
  );
};

export default Menu;
