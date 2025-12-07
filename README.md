## 👥 Tim Pengembang

Ferdian destrinata (D1041221025) as Backend Engineer
Fazareza Nugraha (D1041221031) as Frontend Engineer
Pasaur Alharits Lutfullah (D1041221083) as Database Engineer

# 📅 Informate - Event Management App

**Informate** adalah aplikasi *mobile* berbasis React Native yang dirancang untuk memudahkan mahasiswa dalam mencari informasi kegiatan/event di lingkungan kampus, serta memudahkan penyelenggara (admin) dalam mengelola publikasi acara.

Proyek ini disusun untuk memenuhi tugas Mata Kuliah Pemrograman Perangkat Bergerak.

**NOTE : Ibu bisa test .apk untuk mengecek fungsi-fungsi pada aplikasi ini karena aplikasi ini kami deploy agar ibu gampang untuk testing dan tidak perlu setup server.
Akun ADMIN : admin1@gmail.com
Password   : admin123**
---

## 📱 Fitur Unggulan

### 👤 Pengguna (Mahasiswa)
* **Jelajah Event:** Melihat daftar event terbaru dengan tampilan Card yang menarik.
* **Pencarian & Filter:** Cari event berdasarkan nama, atau filter berdasarkan kategori (Seminar, Workshop, Lomba, dll).
* **Detail Event:** Melihat informasi lengkap (Deskripsi, Lokasi, Harga, Kuota, Poster).
* **Bookmark:** Menyimpan event favorit agar mudah diakses kembali.
* **Profil:** Mengelola akun dan mengganti password.

### 🛡️ Admin (Penyelenggara)
* **Dashboard Manajemen:** Memantau semua event yang terdaftar.
* **CRUD Event:** Membuat event baru, mengedit informasi, dan menghapus event.
* **Upload Poster:** Mendukung upload gambar poster (Disimpan secara *persistent* di Database).

---

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan arsitektur **Client-Server (REST API)**:

* **Frontend (Mobile):**
    * React Native (Expo SDK 52)
    * Expo Router (Navigasi berbasis file)
    * TypeScript
* **Backend (API):**
    * Node.js & Express.js
    * Multer (Memory Storage & Buffer conversion)
* **Database:**
    * MySQL (Hosted on **Railway**)
    * Penyimpanan Gambar: Base64 (`LONGTEXT` column) - *Cloud Compatible*
* **Deployment:**
    * Backend & DB: Railway.app

---

## 🚀 Cara Menjalankan Aplikasi

### A. Persiapan (Prerequisites)
Pastikan di komputer Anda sudah terinstall:
* Node.js (LTS Version)
* Git
* Aplikasi **Expo Go** di HP Android/iOS Anda.

### B. Setup Backend (Server)
*Server saat ini sudah di-deploy secara LIVE di Railway. Anda tidak perlu menjalankan backend lokal untuk mengetes APK.*

Jika ingin menjalankan secara lokal (Development):
1.  Masuk ke folder backend: `cd backend`
2.  Install dependencies: `npm install`
3.  Buat file `.env` dan sesuaikan konfigurasi database lokal Anda.
4.  Jalankan server: `npm run dev`

### C. Setup Frontend (Aplikasi Mobile)
1.  Masuk ke folder frontend:
    ```bash
    cd InformateApp
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Konfigurasi Koneksi Server:**
    Buka file `src/api.js`. Pastikan `API_URL` mengarah ke server Railway agar bisa diakses dari mana saja.
    ```javascript
    // src/api.js
    export const API_URL = '[https://informate-production.up.railway.app/api](https://informate-production.up.railway.app/api)';
    ```
4.  Jalankan Expo:
    ```bash
    npx expo start
    ```
5.  Scan QR Code yang muncul di terminal menggunakan aplikasi **Expo Go** di HP Anda.

---

## 📂 Struktur Database

Berikut adalah skema tabel utama yang digunakan:

1.  **users**: Menyimpan data pengguna (nama, email, password hash, role).
2.  **events**: Menyimpan data acara.
    * *Catatan Teknis:* Kolom `banner_image` menggunakan tipe data `LONGTEXT` untuk menyimpan gambar dalam format Base64, memastikan gambar tetap aman meskipun server cloud melakukan restart.
3.  **bookmarks**: Menyimpan relasi event yang disimpan oleh user.

---

## 📸 Dokumentasi API (Singkat)

| Method | Endpoint               | Deskripsi                          | Auth |
| :---   | :---                   | :---                               | :--- |
| POST   | `/api/auth/login`      | Masuk aplikasi & dapatkan Token    | No   |
| POST   | `/api/auth/register`   | Daftar akun baru                   | No   |
| GET    | `/api/events`          | Ambil semua data event (+ filter)  | No   |
| GET    | `/api/events/:id`      | Ambil detail satu event            | No   |
| POST   | `/api/events`          | Tambah event baru (Upload Gambar)  | Yes  |
| PUT    | `/api/events/:id`      | Update data event                  | Yes  |
| DELETE | `/api/events/:id`      | Hapus event                        | Yes  |
Dan lain-lain
---



