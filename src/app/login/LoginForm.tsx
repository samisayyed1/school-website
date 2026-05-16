"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // After auth, look up role and redirect.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user!.id)
      .single();

    if (profileError || !profile) {
      setError(
        "Signed in, but your profile is not provisioned yet. Contact the school office."
      );
      setLoading(false);
      return;
    }

    const role = profile.role as string;
    const home =
      nextPath ??
      (role === "admin"
        ? "/admin"
        : role === "principal" || role === "coordinator"
        ? "/principal"
        : role === "teacher"
        ? "/teacher"
        : role === "parent"
        ? "/parent"
        : "/student");

    router.push(home);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-vip-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 bg-white px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15 transition"
          placeholder="you@vipschoolnizamabad.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-vip-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-vip-emerald/15 bg-white px-4 py-3 outline-none focus:border-vip-emerald focus:ring-2 focus:ring-vip-emerald/15 transition"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-vip-emerald text-white font-semibold px-6 py-3.5 shadow-soft hover:bg-vip-emeraldDark transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
