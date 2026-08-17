-- =====================================================================
-- Portal Ibu Bapa PassDELIMa
-- Migration 0008: Peranan admin ("admin" penuh vs "viewer" baca-sahaja).
--
-- - Tambah lajur `role` pada jadual admins: 'admin' (urus penuh) atau
--   'viewer' (lihat sahaja).
-- - `assert_admin_token` = mana-mana akaun admin (admin ATAU viewer)
--   -> digunakan oleh fungsi BACA.
-- - `assert_admin_full`   = hanya peranan 'admin' (penuh)
--   -> digunakan oleh fungsi TULIS & pengurusan (CRUD, import, sejarah,
--      tukar kredensial).
-- - `authenticate_admin` mengembalikan `role` dan menandakan token sesi
--   dengan peranan sebenar.
-- =====================================================================

alter table public.admins
  add column if not exists role text not null default 'admin';

-- ---------------------------------------------------------------------
-- Semakan: mana-mana akaun admin (admin / viewer) — untuk BACA
-- ---------------------------------------------------------------------
create or replace function public.assert_admin_token(p_token text)
returns uuid
language plpgsql
security definer
as $$
declare
  v jsonb;
begin
  v := verify_token(p_token);
  if v is null then
    raise exception 'Sesi tidak sah atau telah tamat tempoh. Sila log masuk semula.';
  end if;
  if v->>'role' not in ('admin', 'viewer') then
    raise exception 'Tidak dibenarkan.';
  end if;
  if not exists (select 1 from public.admins where id = (v->>'principal')::uuid) then
    raise exception 'Akaun admin tidak wujud.';
  end if;
  return (v->>'principal')::uuid;
end;
$$;

-- ---------------------------------------------------------------------
-- Semakan: pentadbir penuh sahaja (peranan 'admin') — untuk TULIS/urus
-- ---------------------------------------------------------------------
create or replace function public.assert_admin_full(p_token text)
returns uuid
language plpgsql
security definer
as $$
declare
  v jsonb;
begin
  v := verify_token(p_token);
  if v is null then
    raise exception 'Sesi tidak sah atau telah tamat tempoh. Sila log masuk semula.';
  end if;
  if v->>'role' <> 'admin' then
    raise exception 'Tindakan ini memerlukan akaun pentadbir penuh.';
  end if;
  if not exists (select 1 from public.admins where id = (v->>'principal')::uuid) then
    raise exception 'Akaun admin tidak wujud.';
  end if;
  return (v->>'principal')::uuid;
end;
$$;

-- ---------------------------------------------------------------------
-- Log masuk admin: kembalikan & kekalkan peranan sebenar dalam token
-- ---------------------------------------------------------------------
create or replace function public.authenticate_admin(
  p_username text,
  p_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_admin admins%rowtype;
  v_token text;
begin
  select * into v_admin
  from public.admins
  where username = lower(trim(p_username))
  limit 1;

  if v_admin.id is null then
    return jsonb_build_object('ok', false, 'error', 'Nama pengguna atau kata laluan salah.');
  end if;

  if v_admin.password_hash != crypt(coalesce(p_password, ''), v_admin.password_hash) then
    return jsonb_build_object('ok', false, 'error', 'Nama pengguna atau kata laluan salah.');
  end if;

  v_token := make_token(v_admin.id::text, coalesce(v_admin.role, 'admin'));

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'username', v_admin.username,
    'name', v_admin.nama,
    'role', coalesce(v_admin.role, 'admin')
  );
end;
$$;

-- =====================================================================
-- Fungsi TULIS & pengurusan — kini memerlukan peranan 'admin' penuh
-- =====================================================================

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
  perform assert_admin_full(p_token);
  begin
    insert into public.students (delima_id, nama, kata_laluan)
    values (trim(p_delima_id), trim(p_nama), p_kata_laluan);
  exception
    when unique_violation then
      raise exception 'ID Delima ini sudah wujud dalam pangkalan data.';
  end;
end;
$$;

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
  perform assert_admin_full(p_token);
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

create or replace function public.delete_student_admin(p_token text, p_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  perform assert_admin_full(p_token);
  delete from public.students where id = p_id;
end;
$$;

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
  perform assert_admin_full(p_token);

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

create or replace function public.log_import(
  p_token text,
  p_filename text,
  p_total integer,
  p_success integer,
  p_failed integer,
  p_error jsonb default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_admin uuid;
begin
  v_admin := assert_admin_full(p_token);
  insert into public.import_logs (
    imported_by, filename, total_rows, success_rows, failed_rows, error_detail
  ) values (v_admin, p_filename, p_total, p_success, p_failed, p_error);
end;
$$;

create or replace function public.list_import_logs_admin(p_token text)
returns setof public.import_logs
language plpgsql
security definer
as $$
begin
  perform assert_admin_full(p_token);
  return query
    select * from public.import_logs
    order by created_at desc
    limit 100;
end;
$$;

create or replace function public.change_admin_credentials(
  p_token text,
  p_current_password text,
  p_new_username text,
  p_new_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_admin uuid;
  v_admin_row admins%rowtype;
begin
  v_admin := assert_admin_full(p_token);

  select * into v_admin_row
  from public.admins
  where id = v_admin;

  if v_admin_row.password_hash != crypt(coalesce(p_current_password, ''), v_admin_row.password_hash) then
    return jsonb_build_object('ok', false, 'error', 'Kata laluan semasa salah.');
  end if;

  begin
    update public.admins
    set username = lower(trim(coalesce(p_new_username, ''))),
        password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = now()
    where id = v_admin;
  exception
    when unique_violation then
      return jsonb_build_object('ok', false, 'error', 'Nama pengguna ini sudah wujud.');
  end;

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------
-- Hak execute
-- ---------------------------------------------------------------------
grant execute on function public.assert_admin_token(text) to anon, authenticated;
grant execute on function public.assert_admin_full(text) to anon, authenticated;
grant execute on function public.authenticate_admin(text, text) to anon, authenticated;
grant execute on function public.create_student_admin(text, text, text, text) to anon, authenticated;
grant execute on function public.update_student_admin(text, uuid, text, text, text) to anon, authenticated;
grant execute on function public.delete_student_admin(text, uuid) to anon, authenticated;
grant execute on function public.batch_upsert_students_admin(text, jsonb, text) to anon, authenticated;
grant execute on function public.log_import(text, text, integer, integer, integer, jsonb) to anon, authenticated;
grant execute on function public.list_import_logs_admin(text) to anon, authenticated;
grant execute on function public.change_admin_credentials(text, text, text, text) to anon, authenticated;
