import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { CreateUserForm } from "./CreateUserForm";

export default async function NewUserPage() {
  await requireRole(["admin", "principal"]);
  return (
    <div className="p-6">
      <Link href="/admin/users" className="text-sm text-vip-muted hover:text-vip-emerald">
        ← Back to Users
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Create user</h1>
      <p className="mt-1 text-sm text-vip-muted dark:text-zinc-400">
        Issue a new account. Login credentials are set here; notification channels
        can be edited later.
      </p>
      <CreateUserForm />
    </div>
  );
}
