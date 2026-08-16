-- =====================================================================
-- SEED DATA untuk Portal Ibu Bapa SK St. Francis Xavier Keningau
--
-- UNTUK PENGGUNAAN TEMPATAN / PEMBANGUNAN SAHAJA.
-- TIDAK UNTUK DIJALANKAN DALAM PRODUKSI tanpa menukar kata laluan.
--
-- Kandungan: hanya akaun admin lalai.
-- Data pelajar/guardian TIDAK di-seed — ibu bapa log masuk menggunakan
-- delima_id dan data pelajar ditambah melalui import Excel oleh admin.
-- =====================================================================

-- Akaun admin lalai
-- Username: admin
-- Password: admin123
-- Password disimpan sebagai hash (pgcrypto crypt) - JANGAN simpan plaintext.
insert into public.admins (username, password_hash, nama)
values (
  'admin',
  crypt('admin123', gen_salt('bf')),
  'Pentadbir Sekolah'
)
on conflict (username) do nothing;
