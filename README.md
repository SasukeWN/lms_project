# 🎓 EduPortal LMS

EduPortal LMS adalah sistem manajemen pembelajaran (Learning Management System) modern yang dibangun menggunakan Next.js dan MySQL. Aplikasi ini dirancang untuk memudahkan interaksi antara Admin, Guru, dan Siswa dalam proses belajar mengajar secara digital.

## 🌟 Fitur Utama

- **👦 Dashboard Siswa:**
  - Menjelajahi berbagai mata pelajaran dan topik (seperti Matematika, dll).
  - Membaca materi pembelajaran dengan antarmuka yang nyaman (Fixed Layout).
  - Mengerjakan kuis interaktif (pilihan ganda) langsung dari sistem.
  - Memantau rapor dan skor dari setiap kuis yang diselesaikan.

- **👨‍🏫 Dashboard Guru:**
  - Melihat daftar mata pelajaran, topik, materi, dan kuis.
  - Memantau nilai dan skor kuis para siswa yang mengambil mata pelajaran mereka.

- **👨‍💻 Dashboard Admin:**
  - Manajemen penuh terhadap pengguna (Siswa, Guru, Admin).
  - Mengelola Mata Pelajaran, Topik, Materi, dan Pertanyaan Kuis.
  - Kontrol akses penuh terhadap sistem.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions, & API Routes)
- **Frontend:** React 19, Tailwind CSS (untuk styling responsif & modern)
- **Database:** MySQL (Cloud by [Aiven](https://aiven.io/))
- **Auth/Security:** JWT (JSON Web Tokens) di Edge Runtime Middleware, bcrypt
- **Lainnya:** Axios, TypeScript

## 🚀 Panduan Instalasi (Lokal)

Jika Anda ingin menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/username/lms_project.git
   cd lms_project
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Atur Environment Variables (.env):**
   Buat file bernama `.env` di direktori utama (root) proyek Anda dan sesuaikan dengan kredensial database MySQL Anda:
   ```env
   DB_HOST=mysql-xxxx.aivencloud.com
   DB_PORT=23832
   DB_USER=avnadmin
   DB_PASSWORD=password_database_anda
   DB_NAME=defaultdb

   JWT_SECRET=rahasia_jwt_anda
   ```
   *(Penting: Saat deploy ke layanan seperti Vercel, jangan lupa tambahkan variabel-variabel ini di dashboard pengaturan Environment Variables hosting Anda).*

4. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.


## 📦 Deployment

Proyek ini sangat siap dan optimal untuk di-deploy di [Vercel](https://vercel.com).
Middleware pada Next.js dikonfigurasi untuk menggunakan Edge Runtime sehingga autentikasi berjalan dengan sangat ringan dan instan (menggunakan dekripsi Base64 tanpa library node.js berat). Pastikan Anda menggunakan `ssl: { rejectUnauthorized: false }` pada koneksi `mysql2` di `lib/db.ts` jika menggunakan database cloud seperti Aiven.

---
Dibuat dengan ❤️ untuk kemajuan edukasi digital.
