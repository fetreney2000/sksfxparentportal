-- =====================================================================
-- SEED DATA untuk Portal Ibu Bapa SK St. Francis Xavier Keningau
-- UNTUK PENGGUNAAN TEMPATAN / PEMBANGUNAN SAHAJA.
-- TIDAK UNTUK DIJALANKAN DALAM PRODUKSI.
--
-- Langkah:
-- 1. Cipta admin user di Supabase Auth Dashboard
--    - Email: admin@admin.sfxkeningau.internal
--    - Password: (pilihan anda)
-- 2. Cipta guardian user di Supabase Auth Dashboard (HIDUPKAN OTP)
--    - Email: ahmad@contoh.com (lihat data guardian di bawah)
-- 3. Dapatkan auth.users.id untuk kedua-dua di atas, kemudian gantik
--    placeholder di bawah.
-- 4. Jalankan seed ini.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Admin (wajib: gantikan <ADMIN_AUTH_UID> dengan uid sebenar)
-- ---------------------------------------------------------------------
-- insert into public.admins (username, auth_user_id, nama) values
--   ('admin', '<ADMIN_AUTH_UID>', 'Pentadbir Sekolah')
-- on conflict (username) do nothing;

-- ---------------------------------------------------------------------
-- 2) Guardians (placeholder: gantik <GUARDIAN_AUTH_UID> jika perlu)
--    Nota: kod aplikasi tidak memerlukan auth.users row untuk guardian
--    kerana OTP menggunakan shouldCreateUser=false. Jika e-mel sudah
--    wujud dalam auth.users (melalui Supabase Auth), ok.
-- ---------------------------------------------------------------------
insert into public.guardians (email, nama) values
  ('ahmad@contoh.com', 'Encik Ahmad bin Ali'),
  ('siti@contoh.com', 'Puan Siti binti Mohd')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------
-- 3) Students (rekod DELIMA contoh)
-- ---------------------------------------------------------------------
insert into public.students (delima_id, nama, tahun, kelas, kata_laluan) values
  ('DLM-2026-001', 'Ahmad bin Ali',  'Tahun 1', '1 Amanah', 'pwdA1234'),
  ('DLM-2026-002', 'Nurul Ain binti Ahmad', 'Tahun 2', '2 Bestari', 'pwdN1234'),
  ('DLM-2026-003', 'Siti binti Mohd',  'Tahun 3', '3 Cemerlang', 'pwdS1234'),
  ('DLM-2026-004', 'Rajesh a/l Kumar', 'Tahun 4', '4 Gemilang', 'pwdR1234')
on conflict (delima_id) do nothing;

-- ---------------------------------------------------------------------
-- 4) Hubungan guardian <-> student
-- ---------------------------------------------------------------------
insert into public.guardian_student (guardian_id, student_id, hubungan)
select g.id, s.id, 'Bapa'
from public.guardians g, public.students s
where g.email = 'ahmad@contoh.com'
  and s.delima_id in ('DLM-2026-001', 'DLM-2026-002')
on conflict do nothing;

insert into public.guardian_student (guardian_id, student_id, hubungan)
select g.id, s.id, 'Ibu'
from public.guardians g, public.students s
where g.email = 'siti@contoh.com'
  and s.delima_id in ('DLM-2026-003', 'DLM-2026-004')
on conflict do nothing;
