-- =====================================================================
-- Portal Ibu Bapa SK St. Francis Xavier Keningau
-- Migration 0005: Pengesahan sesi pada permulaan aplikasi.
--
-- Membolehkan klien mengesahkan token sesi tersuai semasa memuatkan app
-- supaya token yang tamat tempoh / tidak sah dapat dibersihkan secara
-- automatik (dan pengguna diarahkan semula ke log masuk) berbanding hanya
-- memaparkan ralat.
-- =====================================================================

create or replace function public.validate_session(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v jsonb;
begin
  v := verify_token(p_token);
  if v is null then
    return jsonb_build_object('ok', false, 'error', 'Sesi tidak sah atau telah tamat tempoh.');
  end if;
  return jsonb_build_object('ok', true, 'role', v->>'role');
end;
$$;

grant execute on function public.validate_session(text) to anon, authenticated;
