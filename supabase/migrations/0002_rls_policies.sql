-- =====================================================================
-- Row Level Security (RLS) untuk Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Aktifkan RLS pada semua jadual, dan tentukan policies.
-- Pendekatan: Admin CRUD dari client (guna RLS berasaskan jadual admins).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Aktifkan RLS
-- ---------------------------------------------------------------------
alter table public.students enable row level security;
alter table public.guardians enable row level security;
alter table public.guardian_student enable row level security;
alter table public.admins enable row level security;
alter table public.import_logs enable row level security;

-- ---------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------

-- Ibu bapa: boleh baca rekod anak jagaan sendiri sahaja
drop policy if exists "Guardian can view own children" on public.students;
create policy "Guardian can view own children"
on public.students
for select
to authenticated
using (
  exists (
    select 1
    from public.guardian_student gs
    join public.guardians g on g.id = gs.guardian_id
    where gs.student_id = students.id
      and lower(g.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- Admin: penuh (CRUD)
drop policy if exists "Admin full access to students" on public.students;
create policy "Admin full access to students"
on public.students
for all
to authenticated
using (
  exists (
    select 1 from public.admins a where a.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admins a where a.auth_user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------
-- guardians
-- ---------------------------------------------------------------------

-- Ibu bapa: boleh baca profil sendiri sahaja
drop policy if exists "Guardian can view own profile" on public.guardians;
create policy "Guardian can view own profile"
on public.guardians
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- Admin: penuh
drop policy if exists "Admin full access to guardians" on public.guardians;
create policy "Admin full access to guardians"
on public.guardians
for all
to authenticated
using (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
);

-- ---------------------------------------------------------------------
-- guardian_student
-- ---------------------------------------------------------------------

-- Ibu bapa: boleh baca perhubungan anak sendiri
drop policy if exists "Guardian can view own relationships" on public.guardian_student;
create policy "Guardian can view own relationships"
on public.guardian_student
for select
to authenticated
using (
  exists (
    select 1
    from public.guardians g
    where g.id = guardian_student.guardian_id
      and lower(g.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- Admin: penuh
drop policy if exists "Admin full access to guardian_student" on public.guardian_student;
create policy "Admin full access to guardian_student"
on public.guardian_student
for all
to authenticated
using (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
);

-- ---------------------------------------------------------------------
-- admins
-- ---------------------------------------------------------------------

-- Admin: boleh baca (untuk semakan dalam App.tsx ProtectedRoute)
drop policy if exists "Admin can view self" on public.admins;
create policy "Admin can view self"
on public.admins
for select
to authenticated
using (auth_user_id = auth.uid());

-- Admin: boleh urus admins lain (untuk kegunaan masa hadapan)
drop policy if exists "Admin can manage admins" on public.admins;
create policy "Admin can manage admins"
on public.admins
for all
to authenticated
using (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
);

-- ---------------------------------------------------------------------
-- import_logs
-- ---------------------------------------------------------------------

-- Admin: penuh
drop policy if exists "Admin full access to import_logs" on public.import_logs;
create policy "Admin full access to import_logs"
on public.import_logs
for all
to authenticated
using (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins a where a.auth_user_id = auth.uid())
);
