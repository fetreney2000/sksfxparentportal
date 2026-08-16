-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Migration 0007: Ubah nama pengguna & kata laluan admin sendiri.
--
-- Membolehkan admin menukar kredensial log masuk mereka (disimpan dalam
-- jadual admins). Kata laluan semasa WAJIB disahkan sebelum perubahan.
-- =====================================================================

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
  v_admin := assert_admin_token(p_token);

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

grant execute on function public.change_admin_credentials(text, text, text, text) to anon, authenticated;
