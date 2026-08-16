-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Migration 0004: Selari semula fungsi RPC pelajar selepas buang lajur
--                  tahun & kelas.
--
-- Punca: Fungsi dalam pangkalan data yang SEDIA ADA masih merujuk kepada
-- lajur tahun/kelas yang telah dibuang oleh 0003, menyebabkan ralat 400
-- pada list_students_admin (dan lain-lain).
--
-- Fail ini IDEMPOTEN (guna create or replace) — selamat dijalankan
-- berulang kali pada pangkalan data sedia ada. Untuk pemasangan baharu,
-- 0001 + 0002 + 0003 sudah memadai.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Pengesahan Ibu Bapa/Penjaga (delima_id sahaja, tiada password)
-- ---------------------------------------------------------------------
create or replace function public.login_guardian(p_delima_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_student students%rowtype;
  v_token text;
begin
  select * into v_student
  from public.students
  where delima_id = trim(p_delima_id)
  limit 1;

  if v_student.id is null then
    return jsonb_build_object('ok', false, 'error', 'ID DELIMA tidak dijumpai. Sila semak semula atau hubungi pihak sekolah.');
  end if;

  v_token := make_token(trim(p_delima_id), 'guardian');

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'student', jsonb_build_object(
      'delima_id', v_student.delima_id,
      'nama', v_student.nama,
      'kata_laluan', v_student.kata_laluan
    )
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Ibu Bapa: data pelajar sendiri (token guardian / delima_id)
--
-- DROP dahulu kerana jenis pulangan berubah daripada SETOF kepada JSONB.
-- Pulangan ialah jsonb array (0 atau 1 item).
-- ---------------------------------------------------------------------
drop function if exists public.get_guardian_student(text);
create function public.get_guardian_student(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v jsonb;
begin
  v := verify_token(p_token);
  if v is null or v->>'role' <> 'guardian' then
    raise exception 'Sesi tidak sah atau telah tamat tempoh. Sila log masuk semula.';
  end if;
  return coalesce((
    select jsonb_agg(s order by s.nama)
    from public.students s
    where delima_id = (v->>'principal')
  ), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: senarai pelajar (JSONB - elak had 1000 baris PostgREST)
--
-- DROP dahulu kerana jenis pulangan berubah daripada SETOF kepada JSONB
-- (PostgreSQL tidak membenarkan CREATE OR REPLACE menukar jenis pulangan).
-- ---------------------------------------------------------------------
drop function if exists public.list_students_admin(text);
create function public.list_students_admin(p_token text)
returns jsonb
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  return coalesce((
    select jsonb_agg(s order by s.nama)
    from public.students s
  ), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: senarai ID Delima (JSONB - elak had 1000 baris PostgREST)
-- ---------------------------------------------------------------------
drop function if exists public.list_student_ids_admin(text);
create function public.list_student_ids_admin(p_token text)
returns jsonb
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  return coalesce((
    select jsonb_agg(delima_id order by delima_id)
    from public.students
  ), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: cipta pelajar
-- ---------------------------------------------------------------------
create or replace function public.create_student_admin(
  p_token text,
  p_delima_id text,
  p_nama text,
  p_kata_laluan text
)
returns void
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  begin
    insert into public.students (delima_id, nama, kata_laluan)
    values (trim(p_delima_id), trim(p_nama), p_kata_laluan);
  exception
    when unique_violation then
      raise exception 'ID Delima ini sudah wujud dalam pangkalan data.';
  end;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: kemas kini pelajar
-- ---------------------------------------------------------------------
create or replace function public.update_student_admin(
  p_token text,
  p_id uuid,
  p_delima_id text,
  p_nama text,
  p_kata_laluan text
)
returns void
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  begin
    update public.students
    set delima_id = trim(p_delima_id),
        nama = trim(p_nama),
        kata_laluan = p_kata_laluan,
        updated_at = now()
    where id = p_id;
  exception
    when unique_violation then
      raise exception 'ID Delima ini sudah wujud dalam pangkalan data.';
  end;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: padam pelajar
-- ---------------------------------------------------------------------
create or replace function public.delete_student_admin(p_token text, p_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  delete from public.students where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: import berkelompok (upsert / skip)
-- ---------------------------------------------------------------------
create or replace function public.batch_upsert_students_admin(
  p_token text,
  p_rows jsonb,
  p_conflict text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_rec record;
  v_item jsonb;
  v_idx int;
  v_success int := 0;
  v_errors jsonb := '[]';
begin
  perform assert_admin_token(p_token);

  for v_rec in
    select t.ordinality - 1 as idx, t.value
    from jsonb_array_elements(p_rows) with ordinality as t(value, ordinality)
  loop
    v_item := v_rec.value;
    v_idx := v_rec.idx;
    begin
      if p_conflict = 'upsert' then
        insert into public.students (delima_id, nama, kata_laluan)
        values (
          trim(v_item->>'delima_id'),
          trim(v_item->>'nama'),
          v_item->>'kata_laluan'
        )
        on conflict (delima_id) do update
        set nama = excluded.nama,
            kata_laluan = excluded.kata_laluan,
            updated_at = now();
      else
        insert into public.students (delima_id, nama, kata_laluan)
        values (
          trim(v_item->>'delima_id'),
          trim(v_item->>'nama'),
          v_item->>'kata_laluan'
        )
        on conflict (delima_id) do nothing;
      end if;
      v_success := v_success + 1;
    exception
      when others then
        v_errors := v_errors || jsonb_build_object(
          'index', v_idx,
          'delima_id', v_item->>'delima_id',
          'error', format('%s', SQLERRM)
        );
    end;
  end loop;

  return jsonb_build_object(
    'success', v_success,
    'failed', jsonb_array_length(v_errors),
    'errors', v_errors
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Beri hak execute (idempoten)
-- ---------------------------------------------------------------------
grant execute on function public.login_guardian(text) to anon, authenticated;
grant execute on function public.get_guardian_student(text) to anon, authenticated;
grant execute on function public.list_students_admin(text) to anon, authenticated;
grant execute on function public.list_student_ids_admin(text) to anon, authenticated;
grant execute on function public.create_student_admin(text, text, text, text) to anon, authenticated;
grant execute on function public.update_student_admin(text, uuid, text, text, text) to anon, authenticated;
grant execute on function public.delete_student_admin(text, uuid) to anon, authenticated;
grant execute on function public.batch_upsert_students_admin(text, jsonb, text) to anon, authenticated;
