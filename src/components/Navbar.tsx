import Image from "next/image";
import { getCurrentProfile, ROLE_LABEL } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = async () => {
  const profile = await getCurrentProfile();
  return (
    <div className="flex items-center justify-between p-4">
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-6 justify-end w-full">
        <ThemeToggle />
        <div className="bg-white dark:bg-zinc-800 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
        </div>

        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {profile?.full_name ?? "Guest"}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 text-right">
            {profile ? ROLE_LABEL[profile.role] : ""}
          </span>
        </div>

        <Image
          src={profile?.avatar_url ?? "/avatar.png"}
          alt=""
          width={36}
          height={36}
          className="rounded-full"
        />

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-xs text-vip-emerald hover:text-vip-emeraldDark font-medium"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
};

export default Navbar;
