-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Skema pangkalan data (Supabase / PostgreSQL)
--
-- NOTA: Projek ini TIDAK menggunakan Supabase Auth / auth.users untuk
-- menyimpan data pengguna. Pengesahan dikendalikan sepenuhnya secara
-- tersuai (lihat migration 0002) berdasarkan jadual `admins` untuk admin
-- dan jadual `students` (padan `delima_id`) untuk ibu bapa/penjaga.
-- =====================================================================

-- Dayakan extension yang diperlukan (uuid, hash, token).
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Jadual: students (pelajar / rekod DELIMA)
-- delima_id berfungsi sebagai "kunci log masuk" ibu bapa (tanpa kata laluan)
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
-- Jadual: admins (pentadbir portal)
-- Kredensial (username + kata laluan) disimpan TERUS di sini.
-- Password disimpan sebagai hash (pgcrypto crypt/salt).
-- NOTA: Tiada auth_user_id / auth.users.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  nama text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
-- Jadual: app_config (kunci/rahsia aplikasi, contoh: rahsia token sesi)
-- Hanya boleh diakses melalui fungsi (tidak terus oleh client).
-- ---------------------------------------------------------------------
create table if not exists public.app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Seed rahsia untuk tanda tangan token sesi (jika belum wujud)
insert into public.app_config (key, value)
values (
  'session_secret',
  encode(gen_random_bytes(32), 'hex')
)
on conflict (key) do nothing;

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

drop trigger if exists trg_admins_updated_at on public.admins;
create trigger trg_admins_updated_at
before update on public.admins
for each row execute function public.set_updated_at();
