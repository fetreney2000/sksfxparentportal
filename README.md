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
- Supabase (auth + Postgres + RLS)
- `xlsx` (SheetJS) untuk import Excel
- `vite-plugin-pwa` (PWA)
- `date-fns` + `date-fns-tz` (zon waktu Asia/Kuala_Lumpur)

## Persediaan Tempatan

### 1. Pasang dependency

```bash
npm install
```

### 2. Sediakan Supabase

1. Cipta projek Supabase percuma di https://app.supabase.com
2. Pergi ke **SQL Editor** dan jalankan:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
3. (Pilihan) Jalankan `supabase/seed.sql` untuk data contoh.
   - Untuk admin, anda perlu cipta akaun Supabase Auth secara manual
     dahulu (lihat "Konfigurasi Admin" di bawah).
4. Pergi ke **Authentication → Providers** dan pastikan **Email** diaktifkan.
   - Untuk e-mel OTP, bahagian "Email" mesti diaktifkan.
   - Disyorkan: **Disable sign-ups** supaya akaun baharu tidak boleh
     dicipta secara rawak (ibu bapa/admin ditambah secara manual).

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

### 6. Build produksi

```bash
npm run build
```

Output di `dist/`.

## Konfigurasi Admin

Login admin menggunakan **nama pengguna + kata laluan**, bukannya e-mel.
Untuk cipta admin:

1. Di Supabase Dashboard → **Authentication → Users → Add user**:
   - Email: `admin@admin.sfxkeningau.internal` (atau apa-apa nama
     pengguna yang dikehendaki, format: `<username>@admin.sfxkeningau.internal`)
   - Password: kata laluan sebenar
   - Auto Confirm User: ya
2. Di **SQL Editor**, jalankan:
   ```sql
   insert into public.admins (username, auth_user_id, nama)
   values (
     'admin',  -- username yang akan digunakan untuk login
     '<AUTH_USER_ID>',  -- uid dari auth.users
     'Pentadbir Sekolah'
   );
   ```
3. Untuk login, guna username `admin` dan kata laluan yang ditetapkan di langkah 1.

## Struktur Modul

Semua modul diletakkan di bawah `src/features/<nama-modul>/`:

```
features/
  auth/           # Log masuk (parent OTP, admin username+password)
  delima-info/    # Modul Informasi ID DELIMA
    parent/       # Paparan ibu bapa
    admin/        # Paparan admin (CRUD, import)
    api.ts        # Panggilan Supabase
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
- API Supabase (`/rest/v1/`): network-first, fallback ke cache 5 minit
  untuk paparan terakhir yang berjaya.

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
