-- =====================================================================
-- VIP School of Excellence — Initial Schema, RBAC & Row-Level Security
-- Run via Supabase SQL Editor (or `supabase db push` if using CLI).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- ROLES ----------
do $$ begin
  create type user_role as enum ('admin','principal','coordinator','teacher','student','parent');
exception when duplicate_object then null; end $$;

-- ---------- CORE TABLES ----------

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text not null,
  phone text,
  role user_role not null,
  avatar_url text,
  workspace_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  grade smallint not null check (grade between 1 and 5),
  capacity smallint default 30,
  class_teacher_id uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  is_islamic boolean default false,
  created_at timestamptz default now()
);

create table if not exists teachers (
  profile_id uuid primary key references profiles(id) on delete cascade,
  employee_id text unique,
  qualification text,
  joined_at date default current_date
);

-- A teacher is assigned to (class, subject) pairs. Their RBAC is computed from this table.
create table if not exists class_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  created_at timestamptz default now(),
  unique(teacher_id, class_id, subject_id)
);

create table if not exists students (
  profile_id uuid primary key references profiles(id) on delete cascade,
  admission_no text unique not null,
  class_id uuid references classes(id),
  date_of_birth date,
  blood_group text,
  emergency_contact text,
  parent_id uuid references profiles(id),
  admitted_at date default current_date
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(profile_id) on delete cascade,
  date date not null default current_date,
  status text check (status in ('present','absent','late')) default 'present',
  remarks text,
  marked_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(student_id, date)
);

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  class_id uuid references classes(id),
  exam_date date,
  max_marks numeric default 100,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade,
  student_id uuid references students(profile_id) on delete cascade,
  subject_id uuid references subjects(id),
  marks_obtained numeric,
  grade text,
  remarks text,
  graded_by uuid references profiles(id),
  published boolean default false,
  created_at timestamptz default now(),
  unique(exam_id, student_id, subject_id)
);

create table if not exists fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(profile_id) on delete cascade,
  description text not null,
  amount numeric not null,
  due_date date,
  paid boolean default false,
  paid_at timestamptz,
  payment_ref text,
  created_at timestamptz default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  target_role user_role,
  class_id uuid references classes(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  class_id uuid references classes(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  class_id uuid references classes(id),
  subject_id uuid references subjects(id),
  due_date date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  channel text check (channel in ('email','whatsapp','in_app')) not null,
  subject text,
  body text,
  status text check (status in ('queued','sent','failed')) default 'queued',
  meta jsonb,
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- ---------- HELPERS ----------

-- Auto-create profile when an auth user signs up. Role + name come from raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Current user's role — used in RLS policies.
create or replace function public.current_role()
returns user_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Is the current teacher assigned to teach in this class?
create or replace function public.teaches_class(p_class_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.class_assignments
    where teacher_id = auth.uid() and class_id = p_class_id
  )
$$;

-- Does the current teacher teach the class this student belongs to?
create or replace function public.teaches_student(p_student_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1
    from public.students s
    join public.class_assignments ca on ca.class_id = s.class_id
    where s.profile_id = p_student_id and ca.teacher_id = auth.uid()
  )
$$;

-- ---------- INDEXES ----------
create index if not exists idx_students_class on students(class_id);
create index if not exists idx_students_parent on students(parent_id);
create index if not exists idx_attendance_student_date on attendance(student_id, date desc);
create index if not exists idx_results_student on results(student_id);
create index if not exists idx_results_exam on results(exam_id);
create index if not exists idx_fees_student on fees(student_id);
create index if not exists idx_assignments_class on assignments(class_id);
create index if not exists idx_events_start on events(start_at desc);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_class_assignments_teacher on class_assignments(teacher_id);

-- ---------- ROW LEVEL SECURITY ----------
alter table profiles            enable row level security;
alter table classes             enable row level security;
alter table subjects            enable row level security;
alter table teachers            enable row level security;
alter table class_assignments   enable row level security;
alter table students            enable row level security;
alter table attendance          enable row level security;
alter table exams               enable row level security;
alter table results             enable row level security;
alter table fees                enable row level security;
alter table announcements       enable row level security;
alter table events              enable row level security;
alter table assignments         enable row level security;
alter table notifications       enable row level security;

-- profiles
drop policy if exists "profiles: self read" on profiles;
create policy "profiles: self read" on profiles for select using (auth.uid() = id);
drop policy if exists "profiles: staff read all" on profiles;
create policy "profiles: staff read all" on profiles for select
  using (current_role() in ('admin','principal','coordinator','teacher'));
drop policy if exists "profiles: self update" on profiles;
create policy "profiles: self update" on profiles for update using (auth.uid() = id);
drop policy if exists "profiles: admin/principal write" on profiles;
create policy "profiles: admin/principal write" on profiles for all
  using (current_role() in ('admin','principal'))
  with check (current_role() in ('admin','principal'));

-- classes / subjects: readable to all authenticated; writable by admin+principal+coordinator
drop policy if exists "classes: read all" on classes;
create policy "classes: read all" on classes for select to authenticated using (true);
drop policy if exists "classes: staff write" on classes;
create policy "classes: staff write" on classes for all
  using (current_role() in ('admin','principal','coordinator'))
  with check (current_role() in ('admin','principal','coordinator'));

drop policy if exists "subjects: read all" on subjects;
create policy "subjects: read all" on subjects for select to authenticated using (true);
drop policy if exists "subjects: staff write" on subjects;
create policy "subjects: staff write" on subjects for all
  using (current_role() in ('admin','principal','coordinator'))
  with check (current_role() in ('admin','principal','coordinator'));

-- teachers
drop policy if exists "teachers: read all" on teachers;
create policy "teachers: read all" on teachers for select to authenticated using (true);
drop policy if exists "teachers: staff write" on teachers;
create policy "teachers: staff write" on teachers for all
  using (current_role() in ('admin','principal'))
  with check (current_role() in ('admin','principal'));

-- class_assignments
drop policy if exists "class_assignments: teacher read own" on class_assignments;
create policy "class_assignments: teacher read own" on class_assignments for select
  using (teacher_id = auth.uid());
drop policy if exists "class_assignments: staff read all" on class_assignments;
create policy "class_assignments: staff read all" on class_assignments for select
  using (current_role() in ('admin','principal','coordinator'));
drop policy if exists "class_assignments: staff write" on class_assignments;
create policy "class_assignments: staff write" on class_assignments for all
  using (current_role() in ('admin','principal','coordinator'))
  with check (current_role() in ('admin','principal','coordinator'));

-- students
drop policy if exists "students: self read" on students;
create policy "students: self read" on students for select using (auth.uid() = profile_id);
drop policy if exists "students: parent read" on students;
create policy "students: parent read" on students for select using (auth.uid() = parent_id);
drop policy if exists "students: teacher read own classes" on students;
create policy "students: teacher read own classes" on students for select
  using (current_role() = 'teacher' and teaches_student(profile_id));
drop policy if exists "students: senior staff read all" on students;
create policy "students: senior staff read all" on students for select
  using (current_role() in ('admin','principal','coordinator'));
drop policy if exists "students: admin/principal write" on students;
create policy "students: admin/principal write" on students for all
  using (current_role() in ('admin','principal'))
  with check (current_role() in ('admin','principal'));

-- attendance
drop policy if exists "attendance: self read" on attendance;
create policy "attendance: self read" on attendance for select using (auth.uid() = student_id);
drop policy if exists "attendance: parent read" on attendance;
create policy "attendance: parent read" on attendance for select using (
  exists (select 1 from students s where s.profile_id = attendance.student_id and s.parent_id = auth.uid())
);
drop policy if exists "attendance: teacher read own classes" on attendance;
create policy "attendance: teacher read own classes" on attendance for select
  using (current_role() = 'teacher' and teaches_student(student_id));
drop policy if exists "attendance: senior staff read all" on attendance;
create policy "attendance: senior staff read all" on attendance for select
  using (current_role() in ('admin','principal','coordinator'));
drop policy if exists "attendance: teacher write own classes" on attendance;
create policy "attendance: teacher write own classes" on attendance for all
  using (current_role() = 'teacher' and teaches_student(student_id))
  with check (current_role() = 'teacher' and teaches_student(student_id));
drop policy if exists "attendance: coordinator/principal write" on attendance;
create policy "attendance: coordinator/principal write" on attendance for all
  using (current_role() in ('principal','coordinator'))
  with check (current_role() in ('principal','coordinator'));

-- exams: readable to all auth users; teachers can create for their classes; coordinator/principal full
drop policy if exists "exams: read all" on exams;
create policy "exams: read all" on exams for select to authenticated using (true);
drop policy if exists "exams: teacher write own classes" on exams;
create policy "exams: teacher write own classes" on exams for all
  using (current_role() = 'teacher' and teaches_class(class_id))
  with check (current_role() = 'teacher' and teaches_class(class_id));
drop policy if exists "exams: coordinator/principal write" on exams;
create policy "exams: coordinator/principal write" on exams for all
  using (current_role() in ('principal','coordinator'))
  with check (current_role() in ('principal','coordinator'));

-- results
drop policy if exists "results: self read published" on results;
create policy "results: self read published" on results for select
  using (auth.uid() = student_id and published = true);
drop policy if exists "results: parent read published" on results;
create policy "results: parent read published" on results for select using (
  published = true
  and exists (select 1 from students s where s.profile_id = results.student_id and s.parent_id = auth.uid())
);
drop policy if exists "results: teacher read own students" on results;
create policy "results: teacher read own students" on results for select
  using (current_role() = 'teacher' and teaches_student(student_id));
drop policy if exists "results: senior staff read all" on results;
create policy "results: senior staff read all" on results for select
  using (current_role() in ('admin','principal','coordinator'));
drop policy if exists "results: teacher write own students" on results;
create policy "results: teacher write own students" on results for all
  using (current_role() = 'teacher' and teaches_student(student_id))
  with check (current_role() = 'teacher' and teaches_student(student_id));
drop policy if exists "results: coordinator/principal write" on results;
create policy "results: coordinator/principal write" on results for all
  using (current_role() in ('principal','coordinator'))
  with check (current_role() in ('principal','coordinator'));

-- fees: students+parents see own; admin+principal manage. (Teachers/coordinator no access by design.)
drop policy if exists "fees: self read" on fees;
create policy "fees: self read" on fees for select using (auth.uid() = student_id);
drop policy if exists "fees: parent read" on fees;
create policy "fees: parent read" on fees for select using (
  exists (select 1 from students s where s.profile_id = fees.student_id and s.parent_id = auth.uid())
);
drop policy if exists "fees: admin/principal manage" on fees;
create policy "fees: admin/principal manage" on fees for all
  using (current_role() in ('admin','principal'))
  with check (current_role() in ('admin','principal'));

-- announcements: visible to target role; teachers post for own classes; coordinator/principal post anywhere.
drop policy if exists "announcements: read targeted" on announcements;
create policy "announcements: read targeted" on announcements for select to authenticated using (
  (target_role is null or target_role = current_role())
  and (
    class_id is null
    or current_role() in ('admin','principal','coordinator')
    or (current_role() = 'teacher' and teaches_class(class_id))
    or (current_role() = 'student' and exists (select 1 from students s where s.profile_id = auth.uid() and s.class_id = announcements.class_id))
    or (current_role() = 'parent' and exists (select 1 from students s where s.parent_id = auth.uid() and s.class_id = announcements.class_id))
  )
);
drop policy if exists "announcements: teacher write own classes" on announcements;
create policy "announcements: teacher write own classes" on announcements for all
  using (current_role() = 'teacher' and (class_id is null or teaches_class(class_id)))
  with check (current_role() = 'teacher' and (class_id is null or teaches_class(class_id)));
drop policy if exists "announcements: coordinator/principal/admin write" on announcements;
create policy "announcements: coordinator/principal/admin write" on announcements for all
  using (current_role() in ('admin','principal','coordinator'))
  with check (current_role() in ('admin','principal','coordinator'));

-- events
drop policy if exists "events: read all" on events;
create policy "events: read all" on events for select to authenticated using (true);
drop policy if exists "events: teacher write own classes" on events;
create policy "events: teacher write own classes" on events for all
  using (current_role() = 'teacher' and (class_id is null or teaches_class(class_id)))
  with check (current_role() = 'teacher' and (class_id is null or teaches_class(class_id)));
drop policy if exists "events: senior staff write" on events;
create policy "events: senior staff write" on events for all
  using (current_role() in ('admin','principal','coordinator'))
  with check (current_role() in ('admin','principal','coordinator'));

-- assignments
drop policy if exists "assignments: read all" on assignments;
create policy "assignments: read all" on assignments for select to authenticated using (true);
drop policy if exists "assignments: teacher write own classes" on assignments;
create policy "assignments: teacher write own classes" on assignments for all
  using (current_role() = 'teacher' and teaches_class(class_id))
  with check (current_role() = 'teacher' and teaches_class(class_id));
drop policy if exists "assignments: senior staff write" on assignments;
create policy "assignments: senior staff write" on assignments for all
  using (current_role() in ('admin','principal','coordinator'))
  with check (current_role() in ('admin','principal','coordinator'));

-- notifications: user reads own; inserts via service_role only (not exposed to client)
drop policy if exists "notifications: self read" on notifications;
create policy "notifications: self read" on notifications for select using (auth.uid() = user_id);

-- ---------- SEED: classes 1–5, common subjects ----------
insert into classes (name, grade) values
  ('Class 1', 1), ('Class 2', 2), ('Class 3', 3), ('Class 4', 4), ('Class 5', 5)
on conflict (name) do nothing;

insert into subjects (name, code, is_islamic) values
  ('English',        'ENG', false),
  ('Mathematics',    'MTH', false),
  ('Science',        'SCI', false),
  ('Social Studies', 'SOC', false),
  ('Computer',       'CMP', false),
  ('Hindi',          'HIN', false),
  ('Quran Shareef',  'QUR', true),
  ('Islamic Studies','ISL', true),
  ('Arabic',         'ARB', true)
on conflict (code) do nothing;
