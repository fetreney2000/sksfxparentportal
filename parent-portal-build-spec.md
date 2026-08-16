# Spesifikasi Pembinaan: Portal Ibu Bapa SK St. Francis Xavier Keningau

**Dokumen ini adalah arahan pembinaan lengkap untuk agen AI/agentic coding.** Ikuti setiap fasa secara berurutan. Jangan lompat fasa. Jika sesuatu tidak jelas, buat andaian yang paling munasabah, catatkan andaian itu dalam kod (komen) atau README, dan teruskan — jangan berhenti untuk bertanya melainkan benar-benar menyekat kemajuan.

---

## 0. Ringkasan Projek

Bina sebuah **Progressive Web App (PWA)** bernama **"Portal Ibu Bapa SK St. Francis Xavier Keningau"** yang membolehkan:

- **Ibu bapa / penjaga (parent/guardian)** log masuk tanpa kata laluan (guna e-mel sahaja, disahkan melalui One-Time Password/OTP) untuk melihat maklumat anak/anak jagaan mereka.
- **Admin** log masuk menggunakan username + kata laluan untuk mengurus keseluruhan portal (CRUD penuh + import Excel).
- Sistem direka **modular** — hanya satu modul dibina sekarang (**"Informasi ID DELIMA"**), tetapi struktur kod mesti membenarkan modul baharu ditambah pada masa hadapan tanpa refactor besar.

Semua UI yang dilihat oleh pengguna (parent & admin) **mesti dalam Bahasa Melayu Malaysia**. Semua tarikh/masa mesti menggunakan zon waktu **Asia/Kuala_Lumpur (UTC+8)**.

### Nama Sekolah
`SK ST. FRANCIS XAVIER KENINGAU` — paparkan nama penuh ini di header, halaman log masuk, dan tajuk PWA.

---

## 1. Tech Stack (WAJIB — jangan tukar pakej lain tanpa sebab kukuh)

| Kategori | Pilihan |
|---|---|
| Build Tool | Vite (guna template `react-ts`) |
| Bahasa | TypeScript (strict mode) |
| Framework | React 18+ |
| Routing | React Router v6 |
| Data Fetching / Server State | TanStack Query v5 |
| Global/Client State | Zustand |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (guna CLI rasmi `npx shadcn@latest add ...`) |
| Backend / Database / Auth | Supabase (free tier) |
| Data Table | TanStack Table v8 (digabung dengan shadcn Table primitives) |
| Date Picker | shadcn Date Picker — https://ui.shadcn.com/docs/components/base/date-picker |
| Combobox | shadcn Combobox — https://ui.shadcn.com/docs/components/base/combobox |
| Tema Warna | Tweakcn theme "Light Green" (https://tweakcn.com/themes/cmlhfpjhw000004l4f4ax3m7z) — **nilai CSS penuh disertakan dalam Seksyen 9, tidak perlu fetch URL** |
| Form + Validation | react-hook-form + zod (standard pairing dengan shadcn Form) |
| Excel Parsing | `xlsx` (SheetJS) atau `exceljs` |
| Toast/Notification | shadcn `sonner` |
| PWA | `vite-plugin-pwa` |
| Timezone Handling | `date-fns` + `date-fns-tz` |
| Deployment | Vercel (Hobby tier) |

**Pakej tambahan yang dibenarkan jika perlu:** `lucide-react` (ikon, sudah termasuk dengan shadcn), `clsx`/`tailwind-merge` (dijana oleh shadcn init).

---

## 2. Struktur Folder Projek

Bina struktur ini secara eksplisit — jangan biarkan komponen bertaburan:

```
/src
  /app
    App.tsx                 # Root component, providers
    router.tsx               # React Router config (route definitions)
    providers.tsx            # QueryClientProvider, ThemeProvider, dll.
  /components
    /ui                      # shadcn generated components (jangan edit manual)
    /layout
      ParentLayout.tsx
      AdminLayout.tsx
      AppHeader.tsx
      AppSidebar.tsx
    /common
      LoadingSpinner.tsx
      EmptyState.tsx
      ErrorState.tsx
      ProtectedRoute.tsx
      ConfirmDialog.tsx
  /features
    /auth
      /parent
        ParentLoginPage.tsx
        useParentAuth.ts
      /admin
        AdminLoginPage.tsx
        useAdminAuth.ts
    /delima-info                    # Modul "Informasi ID DELIMA"
      /parent
        ParentDelimaPage.tsx        # Paparan senarai anak + info Delima
        DelimaCard.tsx
      /admin
        AdminDelimaListPage.tsx     # CRUD table
        DelimaFormDialog.tsx        # Tambah/Edit
        DelimaImportDialog.tsx      # Import xlsx
        columns.tsx                 # Definisi TanStack Table columns
      api.ts                        # Supabase query/mutation functions
      types.ts                      # Zod schema + TS types
      queries.ts                    # TanStack Query hooks (useDelimaList, dll.)
  /lib
    supabaseClient.ts
    date.ts                         # Helper zon waktu Kuala Lumpur
    i18n.ts                         # (opsyenal) kamus string BM berpusat
    utils.ts                        # cn() dari shadcn, dll.
  /stores
    authStore.ts                    # Zustand store untuk session state
    uiStore.ts                      # Zustand store untuk UI state (sidebar open, dll.)
  main.tsx
  index.css
/public
  manifest.webmanifest (dijana vite-plugin-pwa jika guna auto-generate)
  /icons                            # Ikon PWA pelbagai saiz
/supabase
  /migrations                       # SQL migration files
    0001_init_schema.sql
    0002_rls_policies.sql
  seed.sql                          # Data contoh untuk testing tempatan
.env.example
README.md
```

---

## 3. Kamus Terjemahan UI (Bahasa Melayu Malaysia)

Guna istilah ini secara konsisten di seluruh aplikasi. Jangan campur Bahasa Inggeris dalam UI yang dilihat pengguna (log/console/kod boleh guna English).

| English (konteks) | Bahasa Melayu (guna dalam UI) |
|---|---|
| Login | Log Masuk |
| Logout | Log Keluar |
| Email | E-mel |
| Password | Kata Laluan |
| Username | Nama Pengguna |
| Dashboard | Papan Pemuka |
| Student | Pelajar / Anak |
| Guardian/Parent | Ibu Bapa / Penjaga |
| Class | Kelas |
| Year (school year/grade level) | Tahun |
| Name | Nama |
| Search | Cari |
| Add New | Tambah Baharu |
| Edit | Kemas Kini / Edit |
| Delete | Padam |
| Save | Simpan |
| Cancel | Batal |
| Import | Import |
| Export | Eksport |
| Upload File | Muat Naik Fail |
| Download | Muat Turun |
| Loading... | Sedang Memuatkan... |
| No data found | Tiada Data Dijumpai |
| Success | Berjaya |
| Error / Failed | Ralat / Gagal |
| Confirm | Sahkan |
| Are you sure? | Adakah anda pasti? |
| This action cannot be undone | Tindakan ini tidak boleh dibatalkan |
| Send OTP / Verification code | Hantar Kod Pengesahan |
| Enter verification code | Masukkan Kod Pengesahan |
| Welcome | Selamat Datang |
| My Children | Anak / Anak Jagaan Saya |
| Delima ID Info module | Informasi ID DELIMA |
| Delima Account ID | ID Delima |
| Class/Grade | Kelas |
| Admin | Pentadbir |
| Settings | Tetapan |
| Profile | Profil |
| Show password | Papar Kata Laluan |
| Hide password | Sembunyi Kata Laluan |
| Import History | Sejarah Import |
| Total Records | Jumlah Rekod |
| Rows imported successfully | Baris berjaya diimport |
| Rows failed | Baris gagal |

Tambah istilah lain mengikut keperluan tetapi kekalkan konsistensi (contoh: jangan guna "Kelas" dan "Class" bercampur).

---

## 4. Pengendalian Zon Waktu (Kuala Lumpur)

Buat fail `src/lib/date.ts` yang menjadi **satu-satunya** tempat logik tarikh/masa berlaku. Semua paparan tarikh dalam UI dan semua penulisan timestamp ke database MESTI melalui helper ini.

Keperluan:
- Zon waktu tetap: `Asia/Kuala_Lumpur` (UTC+8, tiada DST).
- Simpan semua timestamp dalam Supabase sebagai `timestamptz` (UTC di storage), tetapi **paparkan** kepada pengguna dalam waktu Kuala Lumpur.
- Format paparan tarikh lalai: `dd/MM/yyyy` (contoh: `16/08/2026`).
- Format paparan masa lalai: 24 jam, `HH:mm` (contoh: `14:30`).
- Sediakan fungsi: `formatDateKL(date)`, `formatDateTimeKL(date)`, `nowKL()`.
- Date picker component (shadcn) mesti guna locale/timezone ini sebagai asas — pastikan tarikh yang dipilih tidak "tergelincir" sehari akibat isu UTC/local timezone semasa penukaran.

---

## 5. Reka Bentuk Pangkalan Data (Supabase / PostgreSQL)

Cipta migration SQL di `/supabase/migrations/0001_init_schema.sql`. Skema minimum:

```sql
-- Jadual pelajar (rekod Delima)
create table students (
  id uuid primary key default gen_random_uuid(),
  delima_id text not null unique,
  nama text not null,
  tahun text not null,           -- contoh: "1", "2", ... "6" atau "Tahun 1"
  kelas text not null,           -- contoh: "1 Amanah"
  kata_laluan text not null,     -- kata laluan akaun DELIMA pelajar (BUKAN kata laluan login sistem ini)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jadual penjaga/ibu bapa
create table guardians (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nama text,
  created_at timestamptz not null default now()
);

-- Jadual perhubungan many-to-many: seorang penjaga boleh ada >1 anak,
-- seorang pelajar boleh ada >1 penjaga
create table guardian_student (
  guardian_id uuid not null references guardians(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  hubungan text,                 -- contoh: "Ibu", "Bapa", "Penjaga"
  primary key (guardian_id, student_id)
);

-- Jadual admin (jika tidak guna Supabase Auth users terus — lihat Seksyen 6.2)
create table admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  nama text,
  created_at timestamptz not null default now()
);

-- Log sejarah import Excel
create table import_logs (
  id uuid primary key default gen_random_uuid(),
  imported_by uuid references admins(id),
  filename text,
  total_rows int,
  success_rows int,
  failed_rows int,
  error_detail jsonb,
  created_at timestamptz not null default now()
);

-- Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_students_updated_at
before update on students
for each row execute function set_updated_at();
```

### 5.1 Row Level Security (RLS) — WAJIB diaktifkan

```sql
alter table students enable row level security;
alter table guardians enable row level security;
alter table guardian_student enable row level security;
alter table admins enable row level security;
alter table import_logs enable row level security;

-- Ibu bapa hanya boleh baca rekod anak sendiri
create policy "Guardian can view own children"
on students for select
using (
  exists (
    select 1 from guardian_student gs
    join guardians g on g.id = gs.guardian_id
    where gs.student_id = students.id
    and g.email = auth.jwt() ->> 'email'
  )
);

-- Admin (guna service role di server / edge function) memintas RLS sepenuhnya.
-- JANGAN dedahkan service role key kepada client. Semua operasi tulis (insert/update/delete)
-- untuk admin mesti dilakukan melalui Supabase Edge Function atau guna
-- policy khas yang menyemak admins table (lihat contoh di bawah, pilih salah satu pendekatan).

-- Pilihan alternatif: benarkan admin CRUD terus dari client dengan policy berasaskan role
create policy "Admin full access to students"
on students for all
using (
  exists (select 1 from admins a where a.auth_user_id = auth.uid())
)
with check (
  exists (select 1 from admins a where a.auth_user_id = auth.uid())
);
```

> **Nota untuk agen pembina:** Pilih SATU pendekatan sahaja untuk operasi admin — sama ada (a) RLS policy berasaskan `admins` table seperti di atas dengan client memanggil Supabase terus (lebih mudah untuk Vercel Hobby tier, disyorkan), atau (b) Edge Functions dengan service role key. Pendekatan (a) disyorkan kerana kesederhanaan dan had Vercel Hobby tier (serverless function execution time/jumlah invocation terhad).

---

## 6. Pengesahan (Authentication)

### 6.1 Ibu Bapa/Penjaga — Log Masuk Tanpa Kata Laluan (Email OTP)

- Guna **Supabase Auth `signInWithOtp({ email })`** (magic code, BUKAN magic link — guna kod 6-digit supaya mesra mudah alih).
- Alur:
  1. Ibu bapa masukkan e-mel di `ParentLoginPage`.
  2. Sistem semak dahulu (query ke jadual `guardians`) sama ada e-mel wujud dalam pangkalan data. Jika tidak wujud, papar mesej ralat mesra: *"E-mel tidak dijumpai dalam rekod sekolah. Sila hubungi pihak sekolah."* — **jangan hantar OTP** kepada e-mel yang tidak berdaftar (elak abuse).
  3. Jika wujud, panggil `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`.
  4. Papar borang untuk masukkan kod 6-digit yang diterima melalui e-mel.
  5. Sahkan dengan `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
  6. Selepas berjaya, redirect ke `/portal/delima-info` (papar terus modul yang ada).
- Simpan status sesi dalam `authStore` (Zustand) + guna Supabase session persistence (auto refresh token).
- **Keselamatan:** hadkan kadar permintaan OTP (rate limit) — Supabase Auth sudah ada had lalai; jangan nyahaktifkan.

### 6.2 Admin — Log Masuk Username + Kata Laluan

Supabase Auth secara asal guna e-mel, bukan username. Gunakan pendekatan berikut supaya UI admin kekal "username + password":

- Semasa cipta akaun admin (secara manual melalui Supabase Studio / seed script buat masa ini — tiada UI daftar admin diperlukan dalam skop ini), gunakan e-mel sintetik: `<username>@admin.sfxkeningau.internal` sebagai e-mel Supabase Auth, dengan kata laluan sebenar.
- Daftarkan juga baris dalam jadual `admins` (`username`, `auth_user_id`).
- Di `AdminLoginPage`, borang hanya papar medan **Nama Pengguna** dan **Kata Laluan**. Semasa submit:
  1. Query jadual `admins` untuk cari `auth_user_id`/e-mel sintetik berdasarkan `username` (guna anonymous/public RPC function selamat, ATAU simpan mapping username→email secara predictable seperti format di atas supaya tidak perlu query awal).
  2. Panggil `supabase.auth.signInWithPassword({ email: syntheticEmail, password })`.
  3. Jika gagal, papar: *"Nama pengguna atau kata laluan salah."*
- Selepas log masuk, sahkan pengguna wujud dalam jadual `admins` sebelum benarkan akses ke `/admin/*` (guna `ProtectedRoute` dengan semakan role).

### 6.3 Laluan Dilindungi (Protected Routes)

- `/portal/*` — hanya boleh diakses oleh sesi ibu bapa yang sah.
- `/admin/*` — hanya boleh diakses oleh sesi admin yang sah (wujud dalam jadual `admins`).
- Jika sesi tiada/tamat tempoh, redirect ke halaman log masuk yang berkaitan (`/login` untuk ibu bapa, `/admin/login` untuk admin).

---

## 7. Modul: "Informasi ID DELIMA"

### 7.1 Medan Data (Fields)

| Medan | Label BM | Jenis | Nota |
|---|---|---|---|
| `delima_id` | ID Delima | text, unique | Wajib |
| `nama` | Nama | text | Wajib, nama pelajar |
| `tahun` | Tahun | text/select | Wajib — guna Combobox dengan senarai tetap (contoh: Tahun 1–6, atau Prasekolah jika berkenaan) |
| `kelas` | Kelas | text/select | Wajib — guna Combobox; senarai kelas boleh diisi dinamik dari data sedia ada (distinct values) atau senarai tetap yang admin boleh urus kemudian |
| `kata_laluan` | Kata Laluan | text | Wajib. Ini kata laluan akaun DELIMA pelajar (rujukan sahaja, bukan kata laluan log masuk portal ini). Papar dengan togol "Papar/Sembunyi" (mata bertutup, seperti medan password biasa) di kedua-dua paparan ibu bapa DAN admin, atas sebab privasi visual (elak "shoulder surfing"). |

### 7.2 Paparan Ibu Bapa (`ParentDelimaPage`)

- Papar **kad (card)** untuk setiap anak/anak jagaan yang berkaitan dengan e-mel penjaga yang log masuk (join melalui `guardian_student`).
- Setiap kad papar: Nama, ID Delima, Tahun, Kelas, dan Kata Laluan (dengan togol papar/sembunyi, lalai tersembunyi — bertitik `••••••••`).
- Jika penjaga ada >1 anak, papar semua dalam senarai/grid responsif.
- Jika tiada rekod dijumpai, papar `EmptyState`: *"Tiada maklumat pelajar dijumpai. Sila hubungi pihak sekolah jika ini satu kesilapan."*
- Sediakan butang "Salin" (copy to clipboard) di sebelah ID Delima dan Kata Laluan untuk memudahkan ibu bapa menyalin ke peranti lain.
- Reka bentuk **mobile-first** — kebanyakan ibu bapa akan akses melalui telefon.

### 7.3 Paparan Admin — Senarai & CRUD (`AdminDelimaListPage`)

- Guna **TanStack Table** + shadcn Table untuk paparan data table dengan ciri:
  - Carian (search) berdasarkan Nama / ID Delima.
  - Penapis (filter) berdasarkan Tahun dan Kelas (guna Combobox).
  - Penyusunan (sort) setiap lajur.
  - Pagination (client-side memadai untuk skala sekolah, ~< 2000 pelajar).
  - Lajur Kata Laluan dipaparkan bertitik dengan togol papar/sembunyi per-baris.
- Butang "Tambah Baharu" buka `DelimaFormDialog` (modal) dengan borang react-hook-form + zod validation.
- Setiap baris ada aksi: Edit (buka `DelimaFormDialog` pra-isi) dan Padam (buka `ConfirmDialog` sebelum padam — WAJIB pengesahan dua langkah untuk padam).
- Selepas setiap operasi CRUD, invalidate TanStack Query cache dan papar toast (Berjaya/Gagal).
- Borang mesti sahkan `delima_id` unik (papar ralat jelas jika bertindih).

### 7.4 Import Excel (.xlsx) — Admin

Bina `DelimaImportDialog` dengan alur **berbilang langkah (wizard)** yang intuitif:

**Langkah 1 — Muat Naik Fail**
- Zon lepas (drag-and-drop) + butang pilih fail. Terima `.xlsx` sahaja. Papar nama fail & saiz selepas dipilih.
- Sediakan pautan "Muat Turun Templat Contoh" (jana fail `.xlsx` templat kosong dengan lajur: ID Delima, Nama, Tahun, Kelas, Kata Laluan) supaya admin tahu format yang dijangka.

> **PENTING:** Spesifikasi tepat lajur xlsx akan diberikan kemudian oleh pemilik projek. Buat masa ini, bina parser yang **fleksibel**: baca baris pertama sebagai header, dan sediakan **Langkah 2 (Pemetaan Lajur)** supaya admin boleh padankan lajur fail dengan medan sistem secara manual — ini mengelakkan keperluan format xlsx yang tegar sebelum spesifikasi sebenar diterima. Reka kod parser (`parseDelimaExcel.ts`) supaya senang dikemas kini apabila spesifikasi sebenar diberikan (letak nama lajur jangkaan dalam satu konstant array yang mudah ditukar).

**Langkah 2 — Pemetaan Lajur (Column Mapping)**
- Papar senarai lajur yang dikesan dari fail, dan untuk setiap medan sistem (ID Delima, Nama, Tahun, Kelas, Kata Laluan) sediakan dropdown/Combobox untuk pilih lajur fail yang sepadan.
- Cuba auto-padan (fuzzy match nama lajur) sebagai lalai, tetapi admin boleh ubah.

**Langkah 3 — Pratonton & Pengesahan (Preview & Validation)**
- Papar jadual pratonton (10–20 baris pertama, atau semua jika data kecil) hasil pemetaan.
- Jalankan pengesahan client-side: medan wajib tidak kosong, `delima_id` tidak bertindih dalam fail itu sendiri.
- Semak juga bertindih dengan rekod sedia ada dalam DB — beri pilihan **"Kemas Kini jika ID Delima sudah wujud (upsert)"** atau **"Langkau baris yang bertindih"** — biarkan admin pilih tingkah laku ini melalui toggle/radio button sebelum import.
- Papar ringkasan: X baris sah, Y baris ada ralat (dengan sebab ralat per baris, contoh: "Baris 5: Medan Nama kosong").

**Langkah 4 — Import & Keputusan**
- Butang "Import Sekarang" — jalankan insert/upsert secara **kelompok (batch)** ke Supabase (elak timeout Vercel Hobby — pecahkan kepada batch ~100 baris setiap panggilan jika data besar).
- Papar progress bar/indicator semasa import berjalan.
- Selepas siap, papar ringkasan keputusan (Berjaya: n, Gagal: n) dan rekod ke jadual `import_logs`.
- Jika ada baris gagal, sediakan butang "Muat Turun Log Ralat" (fail `.xlsx` atau `.csv` berisi baris gagal + sebab, supaya admin boleh betulkan dan cuba semula).

**Langkah 5 — Sejarah Import**
- Sediakan tab/halaman "Sejarah Import" yang senaraikan rekod `import_logs` (tarikh dalam waktu KL, nama fail, jumlah baris, admin yang import).

---

## 8. PWA (Progressive Web App)

- Guna `vite-plugin-pwa` dengan mod `autoUpdate`.
- `manifest`:
  - `name`: "Portal Ibu Bapa SK St. Francis Xavier Keningau"
  - `short_name`: "Portal SFXK" (atau nama pendek sesuai — pastikan muat dalam label ikon)
  - `description`: "Portal untuk ibu bapa/penjaga melihat maklumat pelajar SK St. Francis Xavier Keningau"
  - `theme_color` & `background_color`: guna warna dari tema Tweakcn yang ditetapkan (Seksyen 9)
  - `display`: `standalone`
  - `start_url`: `/`
  - Sediakan ikon dalam pelbagai saiz (192x192, 512x512, maskable icon) — jana placeholder ikon ringkas berasaskan singkatan sekolah jika logo sebenar tiada.
- Strategi caching:
  - App shell (JS/CSS/HTML): cache-first dengan auto-update.
  - Panggilan Supabase API: **network-first** (jangan cache data sensitif pelajar secara agresif — data mesti sentiasa terkini apabila online; benarkan fallback offline hanya untuk paparan terakhir yang berjaya dimuat, bukan untuk mutasi).
- Uji bahawa app boleh dipasang (installable) di Chrome/Android dan Safari/iOS (Add to Home Screen).

---

## 9. Tema & Reka Bentuk Visual

Tema warna rasmi projek ini ialah tema Tweakcn **"Light Green"** (https://tweakcn.com/themes/cmlhfpjhw000004l4f4ax3m7z). Nilai CSS sebenar telah diambil dan **disertakan terus di bawah** — agen pembina **TIDAK PERLU** melayari pautan tersebut atau menjana nilai sendiri. Guna nilai ini secara literal (salin-tampal).

### 9.1 Isi kandungan `src/index.css`

Projek ini guna **Tailwind CSS v4** (sintaks `@import "tailwindcss"` dan `@theme inline`). Jika CLI/init `shadcn` memasang Tailwind v3 sebaliknya, tukar suai sintaks ke format `tailwind.config` v3 setara (kekalkan nilai OKLCH dan nama variable yang sama) — tetapi utamakan Tailwind v4 mengikut tech stack semasa.

Gantikan/isi kandungan `src/index.css` sepenuhnya dengan berikut:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.9892 0.0054 117.9205);
  --foreground: oklch(0.2077 0.0398 265.7549);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.2077 0.0398 265.7549);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.2077 0.0398 265.7549);
  --primary: oklch(0.8871 0.2122 128.5041);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.3717 0.0392 257.2870);
  --secondary-foreground: oklch(0.9842 0.0034 247.8575);
  --muted: oklch(0.9683 0.0069 247.8956);
  --muted-foreground: oklch(0.5544 0.0407 257.4166);
  --accent: oklch(0.9819 0.0181 155.8263);
  --accent-foreground: oklch(0.4479 0.1083 151.3277);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.9288 0.0126 255.5078);
  --input: oklch(0.9288 0.0126 255.5078);
  --ring: oklch(0.8871 0.2122 128.5041);
  --chart-1: oklch(0.8871 0.2122 128.5041);
  --chart-2: oklch(0.3717 0.0392 257.2870);
  --chart-3: oklch(0.7227 0.1920 149.5793);
  --chart-4: oklch(0.5544 0.0407 257.4166);
  --chart-5: oklch(0.7107 0.0351 256.7878);
  --sidebar: oklch(1.0000 0 0);
  --sidebar-foreground: oklch(0.2077 0.0398 265.7549);
  --sidebar-primary: oklch(0.8871 0.2122 128.5041);
  --sidebar-primary-foreground: oklch(0 0 0);
  --sidebar-accent: oklch(0.9842 0.0034 247.8575);
  --sidebar-accent-foreground: oklch(0.2077 0.0398 265.7549);
  --sidebar-border: oklch(0.9683 0.0069 247.8956);
  --sidebar-ring: oklch(0.8871 0.2122 128.5041);
  --font-sans: Inter, system-ui, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 1rem;
  --shadow-x: 0px;
  --shadow-y: 8px;
  --shadow-blur: 20px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.05;
  --shadow-color: #000000;
  --shadow-2xs: 0px 8px 20px 0px hsl(0 0% 0% / 0.03);
  --shadow-xs: 0px 8px 20px 0px hsl(0 0% 0% / 0.03);
  --shadow-sm: 0px 8px 20px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05);
  --shadow: 0px 8px 20px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05);
  --shadow-md: 0px 8px 20px 0px hsl(0 0% 0% / 0.05), 0px 2px 4px -1px hsl(0 0% 0% / 0.05);
  --shadow-lg: 0px 8px 20px 0px hsl(0 0% 0% / 0.05), 0px 4px 6px -1px hsl(0 0% 0% / 0.05);
  --shadow-xl: 0px 8px 20px 0px hsl(0 0% 0% / 0.05), 0px 8px 10px -1px hsl(0 0% 0% / 0.05);
  --shadow-2xl: 0px 8px 20px 0px hsl(0 0% 0% / 0.13);
  --tracking-normal: -0.01em;
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0.1288 0.0406 264.6952);
  --foreground: oklch(0.9842 0.0034 247.8575);
  --card: oklch(0.2077 0.0398 265.7549);
  --card-foreground: oklch(0.9842 0.0034 247.8575);
  --popover: oklch(0.2077 0.0398 265.7549);
  --popover-foreground: oklch(0.9842 0.0034 247.8575);
  --primary: oklch(0.8871 0.2122 128.5041);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.2795 0.0368 260.0310);
  --secondary-foreground: oklch(0.9842 0.0034 247.8575);
  --muted: oklch(0.2795 0.0368 260.0310);
  --muted-foreground: oklch(0.7107 0.0351 256.7878);
  --accent: oklch(0.3925 0.0896 152.5353);
  --accent-foreground: oklch(0.8871 0.2122 128.5041);
  --destructive: oklch(0.4437 0.1613 26.8994);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.2795 0.0368 260.0310);
  --input: oklch(0.2795 0.0368 260.0310);
  --ring: oklch(0.8871 0.2122 128.5041);
  --chart-1: oklch(0.8871 0.2122 128.5041);
  --chart-2: oklch(0.6231 0.1880 259.8145);
  --chart-3: oklch(0.7227 0.1920 149.5793);
  --chart-4: oklch(0.6268 0.2325 303.9004);
  --chart-5: oklch(0.7686 0.1647 70.0804);
  --sidebar: oklch(0.1288 0.0406 264.6952);
  --sidebar-foreground: oklch(0.9842 0.0034 247.8575);
  --sidebar-primary: oklch(0.8871 0.2122 128.5041);
  --sidebar-primary-foreground: oklch(0 0 0);
  --sidebar-accent: oklch(0.2795 0.0368 260.0310);
  --sidebar-accent-foreground: oklch(0.9842 0.0034 247.8575);
  --sidebar-border: oklch(0.2795 0.0368 260.0310);
  --sidebar-ring: oklch(0.8871 0.2122 128.5041);
  --font-sans: Inter, system-ui, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 1rem;
  --shadow-x: 0px;
  --shadow-y: 10px;
  --shadow-blur: 25px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.4;
  --shadow-color: #000000;
  --shadow-2xs: 0px 10px 25px 0px hsl(0 0% 0% / 0.20);
  --shadow-xs: 0px 10px 25px 0px hsl(0 0% 0% / 0.20);
  --shadow-sm: 0px 10px 25px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow: 0px 10px 25px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow-md: 0px 10px 25px 0px hsl(0 0% 0% / 0.40), 0px 2px 4px -1px hsl(0 0% 0% / 0.40);
  --shadow-lg: 0px 10px 25px 0px hsl(0 0% 0% / 0.40), 0px 4px 6px -1px hsl(0 0% 0% / 0.40);
  --shadow-xl: 0px 10px 25px 0px hsl(0 0% 0% / 0.40), 0px 8px 10px -1px hsl(0 0% 0% / 0.40);
  --shadow-2xl: 0px 10px 25px 0px hsl(0 0% 0% / 1.00);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    letter-spacing: var(--tracking-normal);
  }
}
```

> **Nota:** `@import "tw-animate-css";` memerlukan pakej npm `tw-animate-css` (`npm install tw-animate-css`). Jika pakej ini tidak dipasang oleh `shadcn init` secara automatik, pasang secara manual.

### 9.2 Fon (Fonts) — Penyesuaian untuk Vite (bukan Next.js)

Nilai tema asal menggunakan `next/font/google` (projek sumber ialah Next.js), tetapi tech stack projek ini ialah **Vite**. Fon yang diperlukan: **Inter** (sans, guna untuk hampir semua teks UI), **Georgia** (serif, fon sistem — tiada muat turun diperlukan), **JetBrains Mono** (mono, untuk sebarang paparan kod/ID jika berkenaan).

Sediakan fon dengan salah satu cara berikut (pilih cara pakej npm untuk elak pergantungan CDN luaran semasa runtime):

**Cara disyorkan — pakej `@fontsource`:**
```bash
npm install @fontsource/inter @fontsource/jetbrains-mono
```
Kemudian import di `src/main.tsx` (sebelum import `./index.css`):
```ts
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "./index.css";
```
Georgia tidak perlu diimport — ia fon sistem lalai pada hampir semua peranti (fallback ke serif generik jika tiada).

### 9.3 Warna Primer & Kegunaan

- Warna `--primary` ialah hijau terang (oklch lightness ~0.89, hue ~128°) dengan teks primer **hitam** (`--primary-foreground: oklch(0 0 0)`) — bukan putih. Pastikan komponen `Button` varian `default`/`primary` guna teks gelap di atas latar hijau ini untuk kontras yang betul (shadcn generate ini secara automatik melalui token `--color-primary-foreground`, jangan override secara manual).
- `--radius` global ialah `1rem` — komponen (Card, Button, Input, Dialog) akan kelihatan lebih bulat/lembut berbanding lalai shadcn (`0.625rem`). Ini disengajakan; jangan kecilkan radius tanpa sebab.
- Mod gelap (`.dark`) turut disediakan sepenuhnya di atas — pastikan `ThemeProvider`/toggle mod gelap (jika dibina) menambah/buang kelas `dark` pada elemen `<html>`, selaras dengan `@custom-variant dark (&:is(.dark *))`.

- Layout mesti **mobile-first & responsif** — majoriti pengguna (ibu bapa) akan guna telefon pintar.
- Guna komponen shadcn/ui secara konsisten (Button, Card, Dialog, Table, Form, Input, Select, Combobox, DatePicker, Sonner/Toast, Skeleton untuk loading state, Badge, Tabs).
- Sediakan `EmptyState`, `LoadingSpinner`/Skeleton, dan `ErrorState` yang konsisten untuk setiap paparan data.

---

## 10. Pemboleh Ubah Persekitaran (Environment Variables)

Cipta `.env.example`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- **JANGAN** letak service role key di sisi client/`VITE_*` — ia akan terdedah kepada browser. Jika edge function diperlukan pada masa hadapan, letak service role key hanya dalam persekitaran server (Supabase Edge Function secrets atau Vercel serverless function env, bukan `VITE_` prefix).
- Tetapkan env vars yang sama di Vercel Project Settings semasa deployment.

---

## 11. Pelan Pembinaan Berfasa (WAJIB IKUT TURUTAN)

### Fasa 0 — Persediaan
1. Cipta projek Vite: `npm create vite@latest . -- --template react-ts`.
2. Pasang semua pakej dari Seksyen 1.
3. Sediakan Tailwind CSS.
4. Jalankan `npx shadcn@latest init` dan konfigurasikan.
5. Tambah komponen shadcn yang diperlukan: `button`, `card`, `dialog`, `table`, `form`, `input`, `select`, `combobox` (base), `date-picker` (base), `sonner`, `skeleton`, `badge`, `tabs`, `alert-dialog`, `dropdown-menu`, `avatar`, `label`, `separator`.
6. Cipta struktur folder mengikut Seksyen 2.

### Fasa 1 — Supabase
1. Cipta projek Supabase (jika belum ada) — nyatakan dalam README langkah manual yang perlu dilakukan pemilik projek (cipta akaun, cipta projek baharu di free tier, salin URL & anon key).
2. Tulis & jalankan migration SQL (Seksyen 5) menggunakan Supabase CLI atau Studio SQL editor.
3. Aktifkan RLS dan policies.
4. Cipta `seed.sql` dengan sekurang-kurangnya 3 rekod pelajar contoh, 2 penjaga contoh, dan hubungan guardian_student, serta 1 akaun admin contoh, untuk memudahkan testing tempatan.
5. Konfigurasikan Supabase Auth: aktifkan Email OTP; nyahaktifkan public sign-up jika perlu (`shouldCreateUser: false` dikendalikan di kod, tetapi juga semak tetapan Auth di dashboard).

### Fasa 2 — Client Setup & Tema
1. Cipta `src/lib/supabaseClient.ts`.
2. Terapkan tema warna Tweakcn (Seksyen 9).
3. Bina `AppHeader`, `ParentLayout`, `AdminLayout` asas (belum berfungsi penuh).

### Fasa 3 — Pengesahan
1. Bina `ParentLoginPage` + alur OTP penuh (Seksyen 6.1).
2. Bina `AdminLoginPage` + alur username/password (Seksyen 6.2).
3. Bina `authStore` (Zustand) untuk simpan status sesi & role (parent/admin).
4. Bina `ProtectedRoute` dan konfigurasikan `router.tsx` dengan laluan awam & dilindungi.

### Fasa 4 — Modul Informasi ID DELIMA (Ibu Bapa)
1. Bina `api.ts`/`queries.ts` untuk fetch data pelajar berdasarkan e-mel penjaga log masuk (guna TanStack Query, hormati RLS).
2. Bina `ParentDelimaPage` + `DelimaCard` (Seksyen 7.2).
3. Uji dengan data seed.

### Fasa 5 — Modul Informasi ID DELIMA (Admin CRUD)
1. Bina `columns.tsx` + `AdminDelimaListPage` dengan TanStack Table (Seksyen 7.3).
2. Bina `DelimaFormDialog` (Tambah/Edit) dengan react-hook-form + zod.
3. Bina fungsi padam dengan `ConfirmDialog`.
4. Uji semua operasi CRUD end-to-end.

### Fasa 6 — Import Excel
1. Bina parser fleksibel (`parseDelimaExcel.ts`) — Seksyen 7.4.
2. Bina `DelimaImportDialog` wizard 4 langkah penuh.
3. Bina fungsi jana templat xlsx contoh untuk dimuat turun.
4. Bina batching untuk insert/upsert besar-besaran.
5. Bina & uji halaman "Sejarah Import".

### Fasa 7 — PWA
1. Konfigurasikan `vite-plugin-pwa` (Seksyen 8).
2. Jana/sediakan ikon.
3. Uji "Add to Home Screen" pada mudah alih (atau simulasi Lighthouse PWA audit).

### Fasa 8 — Localization Pass
1. Semak **setiap** teks yang dilihat pengguna (label, placeholder, mesej ralat, toast, tajuk halaman, meta title) — pastikan semuanya Bahasa Melayu. Rujuk kamus di Seksyen 3.
2. Semak setiap paparan tarikh/masa guna helper dari `src/lib/date.ts` (Seksyen 4) — tiada tarikh mentah/UTC dipaparkan terus kepada pengguna.

### Fasa 9 — QA & Ujian Penerimaan
Jalankan senarai semak di Seksyen 12 sepenuhnya sebelum deployment.

### Fasa 10 — Deployment
1. Push kod ke repositori Git (GitHub/GitLab).
2. Sambungkan repo ke Vercel, tetapkan build command (`npm run build`) dan output directory (`dist`).
3. Tetapkan environment variables di Vercel (Seksyen 10).
4. Deploy dan uji URL produksi (termasuk uji OTP e-mel sebenar berfungsi, dan uji log masuk admin).
5. Uji semula PWA install pada domain produksi (HTTPS diperlukan untuk PWA — Vercel sediakan ini secara automatik).

---

## 12. Senarai Semak Penerimaan (Definition of Done)

- [ ] Semua teks UI (label, butang, mesej, tajuk) dalam Bahasa Melayu — tiada teks Inggeris tertinggal di UI.
- [ ] Semua paparan tarikh/masa konsisten dalam zon waktu Asia/Kuala_Lumpur.
- [ ] Ibu bapa boleh log masuk hanya dengan e-mel + OTP (tiada medan kata laluan pada log masuk ibu bapa).
- [ ] Log masuk ibu bapa dengan e-mel yang tiada dalam rekod sekolah dilayan dengan mesej ralat sesuai (bukan hantar OTP secara senyap).
- [ ] Ibu bapa hanya nampak maklumat anak/anak jagaan sendiri (diuji dengan >1 akaun penjaga berbeza — pastikan tiada kebocoran data merentas keluarga, sahkan RLS berfungsi).
- [ ] Ibu bapa dengan >1 anak nampak semua anak dalam satu paparan.
- [ ] Admin boleh log masuk dengan username + kata laluan.
- [ ] Admin boleh Cipta, Baca, Kemas Kini, Padam rekod Informasi ID DELIMA sepenuhnya.
- [ ] Padam rekod memerlukan pengesahan dua langkah.
- [ ] Kata laluan DELIMA (medan `kata_laluan`) tersembunyi secara lalai dengan togol papar/sembunyi, di kedua-dua paparan ibu bapa dan admin.
- [ ] Admin boleh muat naik fail `.xlsx`, memetakan lajur, pratonton & sahkan data, dan import secara berkelompok dengan laporan keputusan yang jelas.
- [ ] Templat xlsx contoh boleh dimuat turun oleh admin.
- [ ] Baris import yang gagal boleh dimuat turun sebagai log ralat.
- [ ] Sejarah import boleh dilihat oleh admin.
- [ ] Aplikasi responsif dan boleh digunakan dengan baik pada skrin mudah alih (mobile-first).
- [ ] Aplikasi boleh dipasang sebagai PWA (Add to Home Screen) pada Android & iOS.
- [ ] Tiada service role key atau kunci sensitif terdedah di sisi client/bundle JS.
- [ ] RLS diaktifkan pada semua jadual dan diuji (cuba akses data tanpa sesi sah mesti gagal).
- [ ] Build produksi (`npm run build`) berjaya tanpa ralat TypeScript.
- [ ] Aplikasi berjaya di-deploy ke Vercel dan boleh diakses secara awam melalui HTTPS.
- [ ] README mengandungi arahan setup tempatan (env vars, migration, seed) dan arahan deployment.

---

## 13. Perkara yang Perlu Diklarifikasi Kemudian (Jangan Halang Pembinaan)

Item berikut **belum ditetapkan** dan akan diberi kemudian oleh pemilik projek. Bina sistem supaya fleksibel terhadap perkara ini (rujuk nota berkaitan di setiap seksyen di atas), dan **jangan tangguhkan pembinaan** kerana item ini:

1. Format tepat lajur fail Excel (nama lajur sebenar, susunan, format data Tahun/Kelas). → Diselesaikan dengan UI pemetaan lajur fleksibel (Seksyen 7.4).
2. Senarai tetap nilai "Tahun" dan "Kelas" yang sah (jika ada standard sekolah). → Buat masa ini, terbitkan senarai combobox secara dinamik daripada nilai unik (`distinct`) yang wujud dalam data, dan benarkan admin taip nilai baharu secara bebas (freeform) jika kombobox tidak menepati.
3. Logo rasmi sekolah untuk header & ikon PWA. → Guna placeholder teks/singkatan buat masa ini; struktur kod supaya logo mudah digantikan (`src/assets/logo.svg`).
4. Modul tambahan pada masa hadapan. → Struktur folder `/features` sedia direka supaya modul baharu (contoh: kehadiran, keputusan peperiksaan, yuran) boleh ditambah sebagai folder baharu tanpa mengganggu modul sedia ada. Sediakan juga struktur navigasi (`AppSidebar`) yang senang menerima item menu tambahan.

---

## 14. Nota Tambahan untuk Agen Pembina

- Sentiasa tulis kod dalam **TypeScript strict** — elak `any` melainkan benar-benar perlu.
- Guna **zod schema** sebagai satu sumber kebenaran untuk validasi borang DAN jenis TypeScript (`z.infer<...>`) untuk elak duplikasi definisi jenis.
- Setiap panggilan Supabase yang boleh gagal mesti dikendalikan dengan `try/catch` atau `onError` TanStack Query, dan papar toast ralat yang mesra pengguna dalam Bahasa Melayu (bukan mesej ralat teknikal mentah).
- Elak "prop drilling" berlebihan — guna Zustand untuk state global (sesi auth, status UI seperti sidebar), dan TanStack Query untuk semua state berkaitan server/data.
- Semua komponen borang mesti ada state "loading" (butang disabled + spinner) semasa submit, untuk elak submit berganda.
- Jangan hardcode URL/kunci Supabase — sentiasa guna environment variables.
- Tulis README yang jelas merangkumi: cara jalankan projek secara tempatan, cara sediakan Supabase (migration + seed), cara deploy ke Vercel, dan senarai environment variables yang diperlukan.

---

*Akhir dokumen. Ikuti fasa 0 hingga 10 secara berurutan, dan sahkan setiap item dalam Senarai Semak Penerimaan (Seksyen 12) sebelum mengisytiharkan projek selesai.*
