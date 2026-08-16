-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Migration 0006: Selari semula make_token & verify_token
--
-- PUNCA RALAT: Token sesi ibu bapa memakai delima_id sebagai principal,
-- dan delima_id mengandungi TITIK (cth: m-15247730@moe-dl.edu.my).
-- Pemisah token dahulu ialah '.', jadi verify_token berpecah kepada lebih
-- daripada 2 bahagian dan menolak token (P0001 "Sesi tidak sah").
--
-- PEMBAIKAN: tukar pemisah kepada '~' (tidak pernah muncul dalam delima_id,
-- peranan, atau ekspirasi). Kesannya token lama perlu dikeluarkan semula
-- (pengguna perlu log masuk semula).
-- =====================================================================

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
  -- Pemisah '~' supaya delima_id yang mengandungi titik tidak memecahkan token
  return v_payload || '~' || encode(hmac(v_payload, app_secret(), 'sha256'), 'hex');
end;
$$;

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

  v_parts := string_to_array(p_token, '~');
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

grant execute on function public.make_token(text, text, int) to anon, authenticated;
grant execute on function public.verify_token(text) to anon, authenticated;
