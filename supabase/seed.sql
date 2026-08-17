-- =====================================================================
-- SEED DATA untuk Portal Ibu Bapa PassDELIMa
--
-- UNTUK PENGGUNAAN TEMPATAN / PEMBANGUNAN SAHAJA.
-- TIDAK UNTUK DIJALANKAN DALAM PRODUKSI tanpa menukar kata laluan.
--
-- Kandungan: akaun admin lalai + akaun penonton (viewer).
-- Data pelajar/guardian TIDAK di-seed — ibu bapa log masuk menggunakan
-- delima_id dan data pelajar ditambah melalui import Excel oleh admin.
-- =====================================================================

-- Akaun admin lalai (peranan penuh)
-- Username: kartini
-- Password: 515586
insert into public.admins (username, password_hash, nama, role)
values (
  'kartini',
  crypt('515586', gen_salt('bf')),
  'Pentadbir Sekolah',
  'admin'
)
on conflict (username) do nothing;

-- Akaun penonton (baca-sahaja) — boleh lihat ID DELIMA tetapi tidak
-- boleh CRUD, tidak boleh lihat Tetapan, dan tidak boleh tukar kredensial.
-- Username: gurusfx
-- Password: sksfx1043
insert into public.admins (username, password_hash, nama, role)
values (
  'gurusfx',
  crypt('sksfx1043', gen_salt('bf')),
  'Guru SFX',
  'viewer'
)
on conflict (username) do nothing;

