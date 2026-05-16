-- =====================================================================
-- Homework attachments + Supabase Storage policies
-- =====================================================================

-- 1) Extend assignments to support file attachment (homework)
alter table public.assignments
  add column if not exists attachment_url text,
  add column if not exists attachment_name text,
  add column if not exists attachment_size bigint;

-- 2) Create the storage bucket for homework files. Public-read so signed-in
--    users can download via a URL; uploads/deletes are gated by storage RLS.
insert into storage.buckets (id, name, public)
values ('homework', 'homework', true)
on conflict (id) do nothing;

-- 3) Storage RLS: only teachers/coordinator/principal/admin can upload;
--    anyone authenticated can read; only the uploader (or senior staff)
--    can delete.
drop policy if exists "homework: authenticated read" on storage.objects;
create policy "homework: authenticated read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'homework');

drop policy if exists "homework: staff upload" on storage.objects;
create policy "homework: staff upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'homework'
    and app_user_role() in ('teacher','coordinator','principal','admin')
  );

drop policy if exists "homework: staff update" on storage.objects;
create policy "homework: staff update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'homework'
    and (
      owner = auth.uid()
      or app_user_role() in ('coordinator','principal','admin')
    )
  );

drop policy if exists "homework: staff delete" on storage.objects;
create policy "homework: staff delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'homework'
    and (
      owner = auth.uid()
      or app_user_role() in ('coordinator','principal','admin')
    )
  );

-- 4) Convenience view: assignments_with_class for easy listings.
create or replace view public.assignments_with_class as
select
  a.*,
  c.name as class_name,
  c.grade as class_grade,
  s.name as subject_name,
  p.full_name as teacher_name
from public.assignments a
left join public.classes c on c.id = a.class_id
left join public.subjects s on s.id = a.subject_id
left join public.profiles p on p.id = a.created_by;

grant select on public.assignments_with_class to authenticated;
