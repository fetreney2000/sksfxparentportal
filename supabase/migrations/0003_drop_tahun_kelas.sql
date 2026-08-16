-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Migration 0003: Buang lajur tahun & kelas daripada jadual students.
--
-- Untuk pangkalan data yang telah sedia ada:
--  - Lajur tahun & kelas tidak lagi diperlukan.
-- Untuk pemasangan baharu: 0001 tidak mencipta lajur ini lagi, jadi
--  pernyataan IF EXISTS berikut ialah no-op.
-- =====================================================================

drop index if exists public.idx_students_tahun;
drop index if exists public.idx_students_kelas;

alter table public.students
  drop column if exists tahun,
  drop column if exists kelas;
