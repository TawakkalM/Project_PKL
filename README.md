# BBGTK Profil Pola Pikir

Aplikasi web untuk pemetaan **profil pola pikir** yang dikembangkan untuk **BBGTK Provinsi Sumatera Utara** menggunakan Node.js, Express.js, MongoDB, dan Tailwind CSS.

&#x20; &#x20;

---

## 📁 Struktur Folder

```
project-root/
├── public/         # Halaman HTML dan asset statis
├── styles/         # Tailwind dan custom CSS
├── lib/            # Koneksi MongoDB dan helper
├── server.js       # Main Express server
├── tailwind.config.ts
└── ...
```

---

## 🚀 Setup dan Instalasi

### Prerequisites

- Node.js (v16 atau lebih baru)
- MongoDB (lokal atau cloud)
- npm

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd bbgtk-profil-pola-pikir
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Jalankan aplikasi**

   **Development mode:**

   ```bash
   npm run dev
   ```

4. **Production mode:**

   ```bash
   npm start
   ```

---

## 🔧 Scripts Available

| Command        | Fungsi                       |
| -------------- | ---------------------------- |
| `npm start`    | Jalankan server production   |
| `npm run dev`  | Development mode + nodemon   |

---

## 🗄️ Database

Setelah `npm run seed`, kamu bisa login menggunakan data berikut:

| NIK              | Password    | Nama           |
| ---------------- | ----------- | -------------- |
| 1234567890123456 | password123 | Ahmad Rizki    |
| 2345678901234567 | password456 | Siti Nurhaliza |
| 3456789012345678 | password789 | Budi Santoso   |
| 4567890123456789 | mypassword  | Dewi Sartika   |
| 5678901234567890 | secret123   | Andi Wijaya    |

---

## 🎯 Fitur Utama

- ✅ Responsive dengan Tailwind CSS
- ✅ Autentikasi JWT + HTTP-only cookie
- ✅ Sistem kuis dengan start-end session
- ✅ Progress tracking user
- ✅ Halaman HTML statis
- ✅ Bisa dipakai di mobile & desktop

---

## 🎨 Custom Warna

| Nama               | Hex       |
| ------------------ | --------- |
| `bbgtk-blue`       | `#003692` |
| `bbgtk-light-blue` | `#5375c6` |
| `bbgtk-yellow`     | `#FEB902` |
| `bbgtk-dark`       | `#1E0E62` |

---

## 🔐 Keamanan

- Gunakan `.env` untuk menyimpan data sensitif.
- File `.env` sudah diabaikan dengan `.gitignore`.
- Gunakan `NODE_ENV=production` untuk environment live.

---

## 📝 License

```
MIT License - BBGTK Provinsi Sumatera Utara
```
