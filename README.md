# Portal Ibu Bapa SK St. Francis Xavier Keningau

Progressive Web App (PWA) dalam Bahasa Melayu untuk ibu bapa/penjaga melihat
maklumat anak jagaan mereka, dan untuk pentadbir mengurus data DELIMA pelajar.

Modul pertama yang dibina: **Informasi ID DELIMA**.

## Stack

- Vite + React 19 + TypeScript (strict)
- React Router v6
- TanStack Query v5 + TanStack Table v8
- Zustand (state)
- Tailwind CSS v4
- shadcn/ui (komponen UI, disesuaikan)
- Supabase (Postgres + fungsi RPC)
- `xlsx` (SheetJS) untuk import Excel
- `vite-plugin-pwa` (PWA)
- `date-fns` + `date-fns-tz` (zon waktu Asia/Kuala_Lumpur)

## Pengesahan (Auth)

Projek ini **TIDAK menggunakan Supabase Auth / `auth.users`** untuk menyimpan
data pengguna. Pengesahan dikendalikan sepenuhnya secara tersuai:

- **Pentadbir** — log masuk menggunakan **nama pengguna + kata laluan**,
  yang disimpan terus dalam jadual `admins` (kata laluan di-hash dengan
  `pgcrypto crypt`). Tiada e-mel; username ialah teks biasa (cth: `admin`).
- **Ibu Bapa/Penjaga** — log masuk menggunakan **ID DELIMA anak** tanpa kata
  laluan. ID DELIMA (contoh: `m-15247730@moe-dl.edu.my`) ialah kredensial
  yang diberikan kepada ibu bapa oleh pihak sekolah. Tiada jadual `guardians`
  berasingan.

### Bagaimana ia berfungsi

1. `admins` dan `students` dijadualkan TANPA akses terus oleh `anon`/`authenticated`
   (RLS diaktifkan tanpa policy permissive + `REVOKE` grant di migration `0002`).
2. Semua baca/tulis data melalui **fungsi RPC `SECURITY DEFINER`** yang
   mengesahkan **token sesi tersuai**.
3. Token sesi ialah `role:principal:expiry` yang ditanda tangan dengan
   **HMAC-SHA256** menggunakan rahsia dalam jadual `app_config`.
4. Ibu bapa memanggil `login_guardian(delima_id)` → dapat token guardian.
   Admin memanggil `authenticate_admin(username, password)` → dapat token admin.
5. Setiap RPC admin mengesahkan token melalui `assert_admin_token()`.

> **Penting:** Kunci `anon` hanya boleh memanggil fungsi RPC yang dibenarkan.
> Jadual `students`, `admins`, `import_logs`, dan `app_config` terlindung
> sepenuhnya daripada akses SQL langsung.

## Akaun Admin Lalai

Selepas menjalankan `seed.sql`, akaun admin lalai:

| Medan | Nilai |
|-------|-------|
| **Nama Pengguna** | `admin` |
| **Kata Laluan** | `admin123` |

> **WAJIB tukar kata laluan ini** sebelum penggunaan produksi. Jalankan:
> ```sql
> update public.admins
> set password_hash = crypt('password-baharu-yang-kuat', gen_salt('bf'))
> where username = 'admin';
> ```
>
> Untuk tambah admin lain:
> ```sql
> insert into public.admins (username, password_hash, nama)
> values ('nama-admin', crypt('kata-laluan', gen_salt('bf')), 'Nama Pentadbir');
> ```

## Persediaan Tempatan

### 1. Pasang dependency

```bash
npm install
```

### 2. Sediakan Supabase

1. Cipta projek Supabase percuma di https://app.supabase.com
2. Pergi ke **SQL Editor** dan jalankan:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_custom_auth.sql`
3. Jalankan `supabase/seed.sql` untuk mencipta akaun admin lalai.
4. Tiada perlu konfigurasi Auth/SMTP — projek guna auth tersuai.

### 3. Tetapkan env vars

Salin `.env.example` ke `.env` dan isi nilai dari Supabase
**Project Settings → API**:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Jana ikon PWA (satu kali)

```bash
npm run gen:icons
```

Logo placeholder "SFXK" akan dijana. Untuk logo rasmi sekolah, gantikan
`public/favicon.svg` dan jalankan semula skrip.

### 5. Jalankan dev server

```bash
npm run dev
```

Buka http://localhost:5173

- **Admin** log masuk di `/admin/login` (username + password).
- **Ibu bapa** log masuk di `/login` (ID DELIMA).

### 6. Tambah data pelajar pertama

Tiada pelajar di-seed — semua data pelajar dimasukkan oleh admin melalui
halaman **Informasi ID DELIMA** (tambah manual atau **Import Excel**).

## Struktur Modul

Semua modul diletakkan di bawah `src/features/<nama-modul>/`:

```
features/
  auth/           # Log masuk (guardian ID DELIMA, admin username+password)
  delima-info/    # Modul Informasi ID DELIMA
    parent/       # Paparan ibu bapa
    admin/        # Paparan admin (CRUD, import)
    api.ts        # Panggilan Supabase (RPC)
    queries.ts    # TanStack Query hooks
    types.ts      # Zod schema + types
```

Untuk tambah modul baharu, cipta folder `src/features/<modul>/` dengan
struktur yang sama dan tambahkan route dalam `src/app/router.tsx` serta
item navigasi dalam `src/components/layout/`.

## Zon Waktu

Semua tarikh/masa dipaparkan dalam `Asia/Kuala_Lumpur` (UTC+8).
Guna helper dari `src/lib/date.ts` sahaja — jangan format tarikh secara
manual dalam komponen.

## Deployment ke Vercel

1. Push kod ke GitHub/GitLab.
2. Di Vercel, **Import Project** dan pilih repo.
3. Build command: `npm run build` (auto dikesan).
4. Output directory: `dist` (auto).
5. Di **Project Settings → Environment Variables**, tambah:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy. URL produksi akan automatik HTTPS (diperlukan untuk PWA).

### Domain Custom

Tambah domain sekolah (cth: `portal.sfxkeningau.edu.my`) di Vercel
Domains dan ikut arahan DNS yang diberikan.

## PWA

Selepas deploy, uji:

- **Chrome/Edge desktop**: DevTools → Application → Manifest
- **Android Chrome**: Buka URL → menu → "Add to Home Screen"
- **iOS Safari**: Buka URL → butang share → "Add to Home Screen"

PWA cache:
- App shell: cache-first
- API Supabase (`/rpc/`): dikecualikan daripada caching agresif supaya data
  pelajar sentiasa terkini.

## Bahasa Melayu

Semua teks UI dalam Bahasa Melayu Malaysia. Kamus berpusat di
`src/lib/i18n.ts` — tambah atau kemas kini istilah di situ sahaja.

## Skrip Penting

| Skrip              | Tujuan                                |
|--------------------|---------------------------------------|
| `npm run dev`      | Pelayan pembangunan (port 5173)       |
| `npm run build`    | Bina bundle produksi ke `dist/`       |
| `npm run preview`  | Pratonton bundle produksi             |
| `npm run gen:icons`| Jana ikon PWA dari `favicon.svg`      |
| `npm run lint`     | oxlint (linting)                      |

## Senarai Semak Penerimaan

Lihat seksyen 12 dalam `parent-portal-build-spec.md` untuk senarai penuh.
