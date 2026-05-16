import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export type AppRole =
  | "admin"
  | "principal"
  | "coordinator"
  | "teacher"
  | "student"
  | "parent";

const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  principal: "/principal",
  coordinator: "/principal",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
};

const PUBLIC_PREFIXES = ["/", "/login", "/auth", "/api/auth"];
const ROLE_PREFIXES: Record<string, AppRole[]> = {
  "/admin": ["admin"],
  "/principal": ["principal", "coordinator"],
  "/teacher": ["teacher"],
  "/student": ["student"],
  "/parent": ["parent"],
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Static assets / Next internals — skip.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/)
  ) {
    return response;
  }

  // Allow public routes.
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) {
    // If logged-in user hits /login, bounce them to their dashboard.
    if (user && pathname.startsWith("/login")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const home = profile?.role ? ROLE_HOME[profile.role as AppRole] : "/";
      return NextResponse.redirect(new URL(home, request.url));
    }
    return response;
  }

  // From here, route is protected.
  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Find which role prefix this route belongs to.
  const matchedPrefix = Object.keys(ROLE_PREFIXES).find(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (matchedPrefix) {
    const allowed = ROLE_PREFIXES[matchedPrefix];
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role as AppRole | undefined;
    if (!role || !allowed.includes(role)) {
      const home = role ? ROLE_HOME[role] : "/login";
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return response;
}
