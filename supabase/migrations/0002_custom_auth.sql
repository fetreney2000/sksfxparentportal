-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Pengesahan Tersuai + Kunci Akses + Fungsi RPC
--
-- Pendekatan:
--  - Semua jadual dikunci daripada akses langsung anon/authenticated
--    (RLS diaktifkan TANPA policy permissive + REVOKE grant).
--  - Semua baca/tulis data dilakukan melalui fungsi RPC (SECURITY DEFINER)
--    yang mengesahkan token sesi tersuai.
--  - Token sesi dijana/divalidasi dengan HMAC-SHA256 menggunakan rahsia
--    dalam jadual app_config.
--
-- Tiada Supabase Auth / auth.users digunakan.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Kunci akses terus kepada jadual untuk anon/authenticated.
-- Semua akses mesti melalui fungsi RPC di bawah.
-- ---------------------------------------------------------------------
revoke all on table public.students from anon, authenticated;
revoke all on table public.admins from anon, authenticated;
revoke all on table public.import_logs from anon, authenticated;
revoke all on table public.app_config from anon, authenticated;

-- RLS diaktifkan sebagai lapisan keselamatan tambahan (tiada policy
-- permissive bermakna akses langsung ditolak; fungsi bypass melalui definit).
alter table public.students enable row level security;
alter table public.admins enable row level security;
alter table public.import_logs enable row level security;
alter table public.app_config enable row level security;

-- ---------------------------------------------------------------------
-- Bantuan token (HMAC-SHA256)
-- ---------------------------------------------------------------------

create or replace function public.app_secret()
returns text
language sql
stable
as $$
  select value from public.app_config where key = 'session_secret';
$$;

create or replace function public.make_token(
  p_principal text,
  p_role text,
  p_ttl_seconds int default 28800 -- 8 jam
)
returns text
language plpgsql
security definer
as $$
declare
  v_exp bigint;
  v_payload text;
begin
  v_exp := (extract(epoch from now()))::bigint + p_ttl_seconds;
  v_payload := p_role || ':' || p_principal || ':' || v_exp;
  return v_payload || '.' || encode(hmac(v_payload, app_secret(), 'sha256'), 'hex');
end;
$$;

-- Mengembalikan jsonb { role, principal, exp } jika token sah, atau NULL.
create or replace function public.verify_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_parts text[];
  v_payload text;
  v_sig text;
  v_calc text;
  v_arr text[];
  v_role text;
  v_principal text;
  v_exp bigint;
begin
  if p_token is null then
    return null;
  end if;

  v_parts := string_to_array(p_token, '.');
  if cardinality(v_parts) <> 2 then
    return null;
  end if;

  v_payload := v_parts[1];
  v_sig := v_parts[2];
  v_calc := encode(hmac(v_payload, app_secret(), 'sha256'), 'hex');

  if v_sig <> v_calc then
    return null;
  end if;

  v_arr := string_to_array(v_payload, ':');
  if cardinality(v_arr) <> 3 then
    return null;
  end if;

  v_role := v_arr[1];
  v_principal := v_arr[2];
  v_exp := v_arr[3]::bigint;

  if v_exp < (extract(epoch from now()))::bigint then
    return null;
  end if;

  return jsonb_build_object(
    'role', v_role,
    'principal', v_principal,
    'exp', v_exp
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Pengesahan Admin (username + password DIJADUAL admins)
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

  -- Bandingkan password dengan hash (pgcrypto crypt)
  if v_admin.password_hash != crypt(coalesce(p_password, ''), v_admin.password_hash) then
    return jsonb_build_object('ok', false, 'error', 'Nama pengguna atau kata laluan salah.');
  end if;

  v_token := make_token(v_admin.id::text, 'admin');

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'username', v_admin.username,
    'name', v_admin.nama
  );
end;
$$;

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
-- Helper: sahkan token admin, pulangkan admin id, atau baling ralat.
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
  if v->>'role' <> 'admin' then
    raise exception 'Tidak dibenarkan.';
  end if;
  if not exists (select 1 from public.admins where id = (v->>'principal')::uuid) then
    raise exception 'Akaun admin tidak wujud.';
  end if;
  return (v->>'principal')::uuid;
end;
$$;

-- ---------------------------------------------------------------------
-- Ibu Bapa: data pelajar sendiri (token guardian / delima_id)
-- ---------------------------------------------------------------------

create or replace function public.get_guardian_student(p_token text)
returns setof public.students
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
  return query
    select * from public.students
    where delima_id = (v->>'principal')
    limit 1;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: CRUD pelajar (semua memerlukan token admin)
-- ---------------------------------------------------------------------

create or replace function public.list_students_admin(p_token text)
returns setof public.students
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  return query
    select * from public.students
    order by nama;
end;
$$;

create or replace function public.list_student_ids_admin(p_token text)
returns setof text
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  return query select delima_id from public.students;
end;
$$;

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

  -- ordinality mula dari 1; tolak 1 untuk indeks 0-based (sepadan batch client)
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
-- Admin: sejarah import
-- ---------------------------------------------------------------------

create or replace function public.list_import_logs_admin(p_token text)
returns setof public.import_logs
language plpgsql
security definer
as $$
begin
  perform assert_admin_token(p_token);
  return query
    select * from public.import_logs
    order by created_at desc
    limit 100;
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
  v_admin := assert_admin_token(p_token);
  insert into public.import_logs (
    imported_by, filename, total_rows, success_rows, failed_rows, error_detail
  ) values (v_admin, p_filename, p_total, p_success, p_failed, p_error);
end;
$$;

-- ---------------------------------------------------------------------
-- Beri hak execute fungsi kepada anon/authenticated.
-- (Tabel TIDAK diberi hak akses terus.)
-- ---------------------------------------------------------------------
grant execute on function public.app_secret() to anon, authenticated;
grant execute on function public.make_token(text, text, int) to anon, authenticated;
grant execute on function public.verify_token(text) to anon, authenticated;
grant execute on function public.assert_admin_token(text) to anon, authenticated;
grant execute on function public.authenticate_admin(text, text) to anon, authenticated;
grant execute on function public.login_guardian(text) to anon, authenticated;
grant execute on function public.get_guardian_student(text) to anon, authenticated;
grant execute on function public.list_students_admin(text) to anon, authenticated;
grant execute on function public.list_student_ids_admin(text) to anon, authenticated;
grant execute on function public.create_student_admin(text, text, text, text) to anon, authenticated;
grant execute on function public.update_student_admin(text, uuid, text, text, text) to anon, authenticated;
grant execute on function public.delete_student_admin(text, uuid) to anon, authenticated;
grant execute on function public.batch_upsert_students_admin(text, jsonb, text) to anon, authenticated;
grant execute on function public.list_import_logs_admin(text) to anon, authenticated;
grant execute on function public.log_import(text, text, integer, integer, integer, jsonb) to anon, authenticated;
