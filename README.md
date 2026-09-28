# 📝 Noted App

**Noted** adalah aplikasi pencatatan dan dokumentasi web modern, minimalis, dan berkinerja tinggi (*lightning fast*). Dibangun menggunakan **React 19**, **TypeScript**, **Tailwind CSS v4**, dan **Vite**, aplikasi ini dilengkapi dukungan penuh **Progressive Web App (PWA)** sehingga dapat di-install dan dijalankan baik di perangkat desktop maupun mobile.

---

## ✨ Fitur Utama

- 🖊️ **Block-Based Rich Text Editor**: Didukung oleh [Editor.js](https://editorjs.io/) dengan berbagai plugin seperti Header, Checklist/To-do, Code Block, Delimiter, Inline Code, List, Quote, dan Table.
- 🔐 **Otentikasi & Autorisasi**:
  - Halaman Register & Login.
  - Penyimpanan JWT/Bearer Token dengan auto-attach di setiap request via Axios Interceptor.
  - Route Guards: `ProtectedRoute` (khusus user login) & `GuestRoute` (redirect otomatis jika sudah login).
- 📂 **Manajemen Catatan**:
  - Buat, edit, cari (*search*), dan kelola catatan.
  - Fitur auto-save dengan *debounce* untuk mencegah overload request API.
  - Sidebar responsif untuk navigasi cepat antar catatan.
- 📱 **Progressive Web App (PWA)**:
  - Dapat di-install langsung (*Add to Home Screen / Desktop App*).
  - Service Worker dengan strategi caching cerdas untuk aset dan font Google secara offline.
- 🎨 **Modern & Responsive UI**:
  - Dibangun menggunakan **Tailwind CSS v4** dengan tema modern/dark yang elegan.
  - Ikon modern menggunakan **Lucide React**.
- 🚀 **Vercel Ready**:
  - Dilengkapi konfigurasi [`vercel.json`](./vercel.json) untuk rewrite URL agar navigasi Single Page Application (SPA) tidak mengalami error 404 saat halaman di-refresh.

---

## 🛠️ Tech Stack

- **Framework / Runtime**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PWA Tooling**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) & [Workbox](https://developer.chrome.com/docs/workbox/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Rich Text Editor**: [Editor.js](https://editorjs.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: [lodash.debounce](https://www.npmjs.com/package/lodash.debounce)

---

## 📁 Struktur Direktori

```text
noted-app/
├── public/                 # Aset statis & ikon PWA (manifest, logo)
├── src/
│   ├── app/                # Konfigurasi aplikasi inti
│   │   ├── providers/      # Context / State providers
│   │   └── router/         # Konfigurasi routing (AppRouter, ProtectedRoute, GuestRoute)
│   ├── assets/             # Aset media lokal
│   ├── features/           # Modular fitur aplikasi
│   │   ├── auth/           # Fitur otentikasi (login, register, types, services)
│   │   └── notes/          # Fitur catatan (NoteEditor, NoteLibrary, NoteSidebar, types, dsb.)
│   ├── pages/              # Halaman tingkat rute (DashboardPage, LoginPage, RegisterPage)
│   ├── shared/             # Utilitas & layanan bersama
│   │   └── services/       # Konfigurasi Axios client (api.ts)
│   ├── styles/             # File style global (CSS)
│   ├── types/              # Deklarasi tipe TypeScript global
│   ├── main.tsx            # Entry point React
│   └── vite-env.d.ts       # Deklarasi tipe environment Vite
├── .env                    # Environment variables (default / production)
├── .env.development        # Environment variables khusus mode development
├── .env.example            # Template contoh environment variables
├── vercel.json             # Konfigurasi routing rewrite untuk deployment Vercel
├── vite.config.ts          # Konfigurasi Vite & VitePWA
└── package.json            # Daftar dependensi & npm scripts
```

---

## 🚀 Memulai (Getting Started)

### 1. Prasyarat

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18+ disarankan)
- [npm](https://www.npmjs.com/) atau package manager pilihan Anda (yarn, pnpm)

### 2. Kloning Repository

```bash
git clone https://github.com/ashofyan/noted-app.git
cd noted-app
```

### 3. Instalasi Dependensi

```bash
npm install
```

### 4. Konfigurasi Environment Variables

Aplikasi ini menggunakan environment variable dengan awalan `VITE_`. Buat file `.env` berdasarkan `.env.example`:

```bash
cp .env.example .env
```

Sesuaikan nilai environment variable di dalam `.env`:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

> **Mode Environment yang tersedia:**
> - `.env` : Dibaca di semua mode.
> - `.env.development` : Dibaca saat menjalankan `npm run dev`.
> - `.env.example` : Template referensi environment untuk developer lain (tanpa kredensial rahasia).

### 5. Menjalankan Aplikasi

Jalankan server pengembangan lokal:

```bash
npm run dev
```

Buka browser Anda dan akses: `http://localhost:5173`

---

## 📦 NPM Scripts

| Script | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Vite development server dengan HMR |
| `npm run build` | Menjalankan typecheck TypeScript (`tsc -b`) dan build ke folder `dist` |
| `npm run preview` | Menjalankan server lokal untuk me-review hasil build `dist` |
| `npm run lint` | Menjalankan ESLint untuk pemeriksaan kode |

---

## 🌐 Deployment ke Vercel

Aplikasi ini sudah siap di-deploy ke **Vercel** dengan konfigurasi:

1. **Framework Preset**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   Tambahkan `VITE_API_BASE_URL` pada menu **Settings > Environment Variables** di dashboard project Vercel Anda.
5. **SPA Rewrites**:
   File [`vercel.json`](./vercel.json) telah disediakan untuk mengarahkan seluruh rute ke `index.html` guna mencegah masalah error 404 saat melakukan refresh halaman.

---

## 📄 Lisensi

Project ini bersifat privat / berlisensi tertutup oleh pembuatnya kecuali dinyatakan lain.
