-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Skema pangkalan data (Supabase / PostgreSQL)
-- Fasa 1: jadual asas + trigger updated_at
-- =====================================================================

-- Dayakan extension untuk gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Jadual: students (pelajar / rekod DELIMA)
-- ---------------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  delima_id text not null unique,
  nama text not null,
  tahun text not null,
  kelas text not null,
  kata_laluan text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_tahun on public.students(tahun);
create index if not exists idx_students_kelas on public.students(kelas);
create index if not exists idx_students_nama on public.students(nama);

-- ---------------------------------------------------------------------
-- Jadual: guardians (penjaga / ibu bapa)
-- ---------------------------------------------------------------------
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nama text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Jadual perhubungan: guardian_student
-- ---------------------------------------------------------------------
create table if not exists public.guardian_student (
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  hubungan text,
  primary key (guardian_id, student_id)
);

create index if not exists idx_gs_student on public.guardian_student(student_id);

-- ---------------------------------------------------------------------
-- Jadual: admins (admin portal)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  nama text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Jadual: import_logs (sejarah import)
-- ---------------------------------------------------------------------
create table if not exists public.import_logs (
  id uuid primary key default gen_random_uuid(),
  imported_by uuid references public.admins(id) on delete set null,
  filename text,
  total_rows int,
  success_rows int,
  failed_rows int,
  error_detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_import_logs_created_at
  on public.import_logs(created_at desc);

-- ---------------------------------------------------------------------
-- Trigger: kemas kini updated_at automatik
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();
