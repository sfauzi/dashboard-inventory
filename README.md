# 📦 Dashboard Stok Barang - Inventory Management System

Sistem manajemen inventaris barang berbasis web dengan fitur realtime stock update, multi-user role, dan dashboard interaktif. Dibangun dengan **Nuxt.js 4** dan **Supabase** sebagai database.

## ✨ Fitur Utama

- 🔐 **Multi-role Authentication** (Admin & Operator)
- 📦 **CRUD Master Barang** dengan validasi stok
- 📊 **CRUD Transaksi** (Barang Masuk/Keluar) dengan auto update stok
- 👥 **Manajemen User** (khusus Admin)
- 🔄 **Realtime Update** stok antar browser
- ⚠️ **Peringatan Stok Menipis** (stok < 10)

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Keterangan |
|-----------|-------|-------------|
| **Nuxt.js** | 4.x | Framework Vue.js untuk SSR & SPA |
| **Supabase** | Latest | Backend-as-a-Service (Database, Auth, Realtime) |
| **TailwindCSS** | 3.x | Utility-first CSS framework |
| **Vue 3** | 3.x | Progressive JavaScript Framework |
| **TypeScript** | 5.x | JavaScript dengan sintaks type |

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:

- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- Akun [Supabase](https://supabase.com/) (gratis)

## 🚀 Instalasi & Konfigurasi

### 1. Clone Repository

```bash
git clone https://github.com/sfauzi/dashboard-inventory.git
cd dashboard-inventory
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Database Supabase

#### a. Buat Project Baru di Supabase
1. Login ke [Supabase Dashboard](https://app.supabase.com/)
2. Klik "New Project"
3. Isi nama project (contoh: `dashboard-inventory`)
4. Setup database password (simpan dengan aman)
5. Pilih region terdekat
6. Tunggu hingga project selesai dibuat

#### b. Jalankan SQL Setup

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan script SQL berikut:

```sql
-- =====================================================
-- 1. Buat tabel users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. Buat tabel barang
-- =====================================================
CREATE TABLE IF NOT EXISTS public.barang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(100) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  stok INTEGER DEFAULT 0 CHECK (stok >= 0),
  lokasi_rak VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. Buat tabel transaksi
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transaksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_barang UUID REFERENCES public.barang(id) ON DELETE CASCADE,
  tanggal TIMESTAMP DEFAULT NOW(),
  tipe_transaksi VARCHAR(20) CHECK (tipe_transaksi IN ('masuk', 'keluar')),
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  id_user UUID REFERENCES public.users(id),
  catatan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. Buat function trigger untuk auto update stok
-- =====================================================
CREATE OR REPLACE FUNCTION process_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tipe_transaksi = 'masuk' THEN
    UPDATE public.barang 
    SET stok = stok + NEW.jumlah,
        updated_at = NOW()
    WHERE id = NEW.id_barang;
  ELSIF NEW.tipe_transaksi = 'keluar' THEN
    IF (SELECT stok FROM public.barang WHERE id = NEW.id_barang) >= NEW.jumlah THEN
      UPDATE public.barang 
      SET stok = stok - NEW.jumlah,
          updated_at = NOW()
      WHERE id = NEW.id_barang;
    ELSE
      RAISE EXCEPTION 'Stok tidak mencukupi';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- =====================================================
-- 5. Buat trigger
-- =====================================================
DROP TRIGGER IF EXISTS process_transaction_trigger ON public.transaksi;
CREATE TRIGGER process_transaction_trigger
AFTER INSERT ON public.transaksi
FOR EACH ROW
EXECUTE FUNCTION process_transaction();

-- =====================================================
-- 6. Insert data awal (Admin & Operator)
-- =====================================================
INSERT INTO public.users (id, name, username, password, role, created_at)
VALUES 
  (gen_random_uuid(), 'Administrator', 'admin', 'password', 'admin', NOW()),
  (gen_random_uuid(), 'Operator Utama', 'operator', 'password', 'operator', NOW());

-- =====================================================
-- 7. Insert sample data barang
-- =====================================================
INSERT INTO public.barang (id, kode, nama, stok, lokasi_rak, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'BRG-001', 'Laptop ASUS ROG', 25, 'RAK-A01', NOW(), NOW()),
  (gen_random_uuid(), 'BRG-002', 'Mouse Logitech MX', 8, 'RAK-B02', NOW(), NOW()),
  (gen_random_uuid(), 'BRG-003', 'Keyboard Mechanical', 5, 'RAK-B03', NOW(), NOW()),
  (gen_random_uuid(), 'BRG-004', 'Monitor Samsung 24"', 12, 'RAK-C01', NOW(), NOW()),
  (gen_random_uuid(), 'BRG-005', 'Printer Epson L3110', 3, 'RAK-D01', NOW(), NOW());

-- =====================================================
-- 8. Disable RLS untuk kemudahan (opsional)
-- =====================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi DISABLE ROW LEVEL SECURITY;
```

#### c. Dapatkan Credentials Supabase

Dari Supabase Dashboard, buka **Project Settings > API**:

- **URL**: `https://xxxxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Konfigurasi Environment Variables

Buat file `.env` di root proyek:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

> **Catatan**: Ganti `your-project.supabase.co` dan `your-anon-public-key` dengan credentials dari Supabase Anda.

### 5. Jalankan Aplikasi

```bash
# Mode development
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🔑 Credentials Default

| Role | Username | Password | Akses |
|------|----------|----------|-------|
| **Admin** | `admin` | `password` | Semua fitur termasuk manajemen user |
| **Operator** | `operator` | `password` | Master Barang & Transaksi (tanpa manajemen user) |

## 🌐 Demo Aplikasi

Aplikasi dapat diakses melalui link berikut:

🔗 http://dashboard-inventory-nu.vercel.app/

## 📁 Struktur Proyek

```
dashboard-stok/
├── assets/              # CSS, gambar, dll
│   └── css/
│       └── main.css
├── components/          # Vue components
│   ├── Layout/
│   │   ├── Sidebar.vue
│   │   └── Navbar.vue
│   ├── Barang/
│   │   ├── BarangForm.vue
│   │   └── StockWarning.vue
│   ├── Transaksi/
│   │   ├── TransaksiForm.vue
│   │   └── EditTransaksiForm.vue
│   ├── ToastContainer.vue
│   └── DataTable.vue
├── composables/         # Composables functions
│   ├── useAuth.ts
│   ├── useBarang.ts
│   ├── useTransaksi.ts
│   ├── useToast.ts
│   ├── useInterval.ts
│   └── useTableData.ts
├── layouts/             # Layout templates
│   └── default.vue
├── middleware/          # Route middleware
│   ├── auth.ts
│   └── guest.ts
├── pages/               # Halaman aplikasi
│   ├── index.vue        # Redirect ke dashboard
│   ├── login.vue
│   ├── dashboard/
│   │   └── index.vue
│   ├── barang/
│   │   └── index.vue
│   ├── transaksi/
│   │   └── index.vue
│   └── users/
│       └── index.vue
├── plugins/             # Nuxt plugins
│   └── supabase.client.ts
├── public/              # Static files
├── tests/               # Testing files
│   └── k6/
│       └── transaksi-test.js
├── nuxt.config.ts       # Nuxt configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 📱 Screenshot Fitur

### Login Page
Halaman login dengan validasi credential dan toast notification.

### Dashboard
- Statistik total barang, total stok, stok menipis, transaksi bulan ini
- Peringatan stok menipis (stok < 10)
- Daftar 10 transaksi terbaru

### Master Barang
- CRUD barang (Tambah, Edit, Hapus)
- Pencarian dan filter stok (menipis/normal)
- Sorting kolom (klik header)
- Pagination (5/10/25/50 data per halaman)

### Transaksi
- CRUD transaksi (Tambah, Edit, Hapus)
- Auto update stok via database trigger
- Filter berdasarkan tipe transaksi dan barang
- Edit transaksi akan menyesuaikan stok otomatis
- Hapus transaksi akan mengembalikan stok

### Manajemen User (Admin Only)
- CRUD user (Tambah, Edit, Hapus)
- Role management (Admin/Operator)
- Proteksi akses halaman

## 🗄️ Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| name | VARCHAR(255) | Nama lengkap user |
| username | VARCHAR(255) | Username untuk login (unique) |
| password | VARCHAR(255) | Password (plain text untuk demo) |
| role | VARCHAR(50) | 'admin' atau 'operator' |
| created_at | TIMESTAMP | Waktu pembuatan |

### barang
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| kode | VARCHAR(100) | Kode barang (unique) |
| nama | VARCHAR(255) | Nama barang |
| stok | INTEGER | Jumlah stok (default 0, >=0) |
| lokasi_rak | VARCHAR(100) | Lokasi penyimpanan |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update terakhir |

### transaksi
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| id_barang | UUID | Foreign Key ke barang |
| tanggal | TIMESTAMP | Waktu transaksi |
| tipe_transaksi | VARCHAR(20) | 'masuk' atau 'keluar' |
| jumlah | INTEGER | Jumlah barang (>0) |
| id_user | UUID | Foreign Key ke users |
| catatan | TEXT | Catatan tambahan |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu update terakhir |

## 🐛 Troubleshooting

### Error: `useSupabaseClient is not defined`
**Solusi**: Pastikan `@nuxtjs/supabase` sudah terinstall dan terdaftar di `modules` pada `nuxt.config.ts`

### Error: `relation "users" does not exist`
**Solusi**: Jalankan script SQL setup di Supabase SQL Editor terlebih dahulu

### Error: `Cannot read properties of undefined (reading 'auth')`
**Solusi**: Clear cache dengan `rm -rf .nuxt .output node_modules/.cache` lalu `npm run dev`

### Data tidak tampil di tabel
**Solusi**: 
1. Cek koneksi Supabase di console browser (F12)
2. Pastikan environment variables sudah benar
3. Cek apakah data ada di database Supabase

### Login gagal
**Solusi**: 
1. Pastikan username dan password sesuai credentials di atas
2. Cek tabel `users` di Supabase apakah data admin/operator sudah ada
3. Jalankan ulang query insert user
---

**Current Version:** `v1.0.0` (Stable Release)  
**Release Date:** 14 May 2026  
**Status:** ✅ Production Ready

**Dibuat dengan ❤️ menggunakan Nuxt.js 4 & Supabase**
