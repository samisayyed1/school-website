# The VIP School of Excellence — Website & Portal

Public marketing site **and** a full school management portal for **The VIP School of Excellence (Visionary Institute of Piety)**, Nizamabad. Built end-to-end on Next.js + Supabase with database-enforced role-based access.

- **Public site** at `/` — admissions, curriculum, contact
- **Role-based portals** — separate dashboards for Student, Parent, Teacher, Coordinator, Principal, Admin
- **DB-level RBAC** — Postgres Row-Level Security enforces who can read/write what, even if the frontend is bypassed
- **Notifications** scaffolded for Email (Resend) + WhatsApp (Meta Cloud API)
- **Google Workspace** user provisioning scaffolded for issuing `@vipschoolnizamabad.com` accounts to students/staff
- **Light + Dark mode**

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Auth + DB:** Supabase (Postgres) — `@supabase/ssr` for cookie-based sessions
- **Charts/Calendar:** Recharts, react-big-calendar
- **Notifications:** Resend (email), Meta WhatsApp Cloud API
- **Workspace:** Google Admin SDK (JWT service account)

---

## Quickstart

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + (later) notification keys
npm run dev
```

Open http://localhost:3000.

---

## 1. Supabase setup (required)

The Supabase project is at: **https://fasaminhyrvtvrtpuqsv.supabase.co**

### Run the migration

1. Open the Supabase Dashboard → **SQL Editor**
2. Paste the contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
3. Click **Run**. This creates:
   - All tables (`profiles`, `classes`, `students`, `teachers`, `attendance`, `results`, `fees`, `announcements`, `events`, `assignments`, `notifications`, `class_assignments`)
   - Enums + helper functions (`current_role()`, `teaches_class()`, `teaches_student()`)
   - Triggers (auto-creates a `profiles` row when an `auth.users` row appears)
   - **Row Level Security policies for every role**
   - Seeds for Classes 1–5 and standard subjects

### Bootstrap the first admin user

After running the migration:

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**
2. Set email/password (e.g. `admin@vipschoolnizamabad.com`)
3. Then in **SQL Editor**, promote them to admin:
   ```sql
   update profiles set role = 'admin' where email = 'admin@vipschoolnizamabad.com';
   ```
4. Sign in at `/login`.

### Roles & access matrix

| Role | Access |
|---|---|
| **Student** | Own attendance, own published results, own fees, own timetable, school announcements |
| **Parent** | Their children's records (linked via `students.parent_id`) |
| **Teacher** | Only students in classes they're assigned to (`class_assignments` table) — read + write attendance/results for those classes |
| **Coordinator** | All academic data; write attendance/results/events/announcements; **no** fee/user-admin |
| **Principal** | Same as Coordinator + fees + user management |
| **Admin (IT)** | User accounts, fees, system config; **no** grade access |

All enforced **both** in middleware (UX) and Postgres RLS (DB).

---

## 2. Notifications (optional, plug in when ready)

### Email (Resend)
1. Sign up at [resend.com](https://resend.com), verify the school's domain
2. Create an API key → put in `.env.local` as `RESEND_API_KEY`
3. Set `RESEND_FROM_EMAIL=no-reply@vipschoolnizamabad.com`

### WhatsApp (Meta Cloud API)
1. Set up Meta WhatsApp Business → get **Phone Number ID** and a long-lived token
2. Add to `.env.local`:
   ```
   WHATSAPP_API_TOKEN=...
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_PROVIDER=meta
   ```

Once set, `notify({email, phone}, payload)` from `src/lib/notifications/index.ts` will fan out automatically. With no keys, sends are silently no-op'd — safe for dev.

---

## 3. Google Workspace user provisioning (optional)

When admin creates a new student/teacher, the system can auto-issue them a `@yourdomain` workspace email.

1. Buy a domain (e.g. `vipschoolnizamabad.com`) and set up Google Workspace
2. In Google Cloud Console:
   - Create a service account
   - Generate a JSON key
   - In Workspace Admin → **Security → API controls → Domain-wide delegation**, authorize the service account for scope `https://www.googleapis.com/auth/admin.directory.user`
3. Fill `.env.local`:
   ```
   GOOGLE_WORKSPACE_DOMAIN=vipschoolnizamabad.com
   GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@your-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   GOOGLE_WORKSPACE_ADMIN_EMAIL=admin@vipschoolnizamabad.com
   ```

Then call `provisionWorkspaceUser(...)` from `src/lib/google-workspace/provision.ts` in your "create student" flow.

---

## 4. Route map

| Route | Purpose | Who can access |
|---|---|---|
| `/` | Public landing page | Everyone |
| `/login` | Sign-in (with `?role=` for portal label) | Public |
| `/auth/callback` | Email-link / OAuth callback | Public |
| `/auth/signout` | POST → ends session | Authenticated |
| `/admin` | Admin dashboard | `admin` |
| `/principal` | Principal dashboard | `principal`, `coordinator` |
| `/teacher` | Teacher dashboard | `teacher` |
| `/student` | Student dashboard | `student` |
| `/parent` | Parent dashboard | `parent` |
| `/list/*` | Shared lists (students, classes, exams, results, …) | Filtered server-side + RLS |
| `/settings` | Profile + theme + sign-out | All authenticated |

`middleware.ts` enforces auth on every protected route. Postgres RLS enforces data access.

---

## 5. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Lint |

---

## 6. Deployment checklist

- [ ] Run migration in Supabase production project
- [ ] Create first admin user, promote to `admin` role
- [ ] Set Supabase **Auth → URL Configuration** redirect to `https://yourdomain.com/auth/callback`
- [ ] Buy & connect custom domain
- [ ] Deploy to Vercel (set all `.env.local` vars in Vercel project settings)
- [ ] Set up Google Workspace + service account
- [ ] Enable Resend + WhatsApp Business
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live URL

---

## Credits

UI scaffold adapted from [MiladJoodi/School_Management_Dashboard_UI_Design](https://github.com/MiladJoodi/School_Management_Dashboard_UI_Design) (MIT). Original `LICENSE` preserved.
