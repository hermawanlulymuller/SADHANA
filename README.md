# SADHANA — Holistic Yoga, Nutrition & Daily Rhythm Web App

> **SADHANA** adalah aplikasi web modern, ramah pengguna (user-friendly), dan tenang (zen/organic dark aesthetic) untuk mengelola jadwal latihan yoga, pola makan Sattvic, log aktivitas energi tubuh, serta konsultasi dengan Penasehat AI Holistic.

---

## ✨ Fitur Unggulan

1. **Visual Busur Matahari (Sun & Moon Arc)**:
   - Visualisasi SVG interaktif alur waktu harian (04:00 – 22:00) yang menampilkan jam real-time serta penanda sesi latihan yoga (hijau sage) dan jadwal makan (emas).
2. **Dashboard Ritme Harian & Counter Streak**:
   - Menampilkan total hari beruntun latihan tercatat (streak flame), checklist jadwal & menu hari ini, dan widget saran harian dari AI.
3. **Manajemen Jadwal Latihan Yoga**:
   - Penyusunan sesi mingguan (Hari, Jam, Jenis Pose/Latihan, Durasi, dan Catatan) dengan filter per hari.
4. **Perencana Pola Makan Sattvic**:
   - Penjadwalan menu makanan/minuman (Sarapan, Makan Siang, Makan Malam, Camilan) yang diselaraskan dengan waktu latihan.
5. **Log Aktivitas & Energi Tubuh**:
   - Pencatatan aktivitas selesai dilengkapi skala energi (1–5 ⚡), tanggal, dan catatan sensasi fisik.
6. **Penasehat AI Holistic**:
   - Konsultasi gabungan Instruktur Yoga + Fisioterapis + Ahli Nutrisi dengan preset pertanyaan cepat, dukungan API Key pribadi (Google Gemini / Anthropic), atau Mesin Rekomendasi Pintar offline bawaan.
7. **Penyimpanan Lokal & Sinkronisasi Cloud (Google Sheet + AppSheet)**:
   - Data otomatis tersimpan cepat di `localStorage` browser (bebas hilang saat offline) dan dapat disinkronkan 1-klik ke Google Sheet & AppSheet via Google Apps Script Web App.
   - Fitur Ekspor & Impor Cadangan (.JSON).

---

## 🚀 Cara Menjalankan di Lokal (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Uji Coba Production Build**:
   ```bash
   npm run build
   ```

---

## ☁️ Cara Menghubungkan ke Vercel (Vercel Deployment)

Aplikasi ini sudah **100% Siap Vercel (Vercel-Ready)** lengkap dengan file `vercel.json` dan `vite.config.js`.

### Opsi A: Menggunakan Vercel CLI (Sangat Cepat)
1. Buka terminal di folder proyek ini:
   ```bash
   npx vercel
   ```
2. Ikuti petunjuk singkat di layar (pilih nama proyek & tekan Enter).
3. Aplikasi SADHANA Anda akan langsung online dengan URL publik HTTPS!

### Opsi B: Menggunakan GitHub + Dashboard Vercel
1. Push folder ini ke repositori **GitHub** Anda.
2. Buka [vercel.com](https://vercel.com) → Klik **Add New Project**.
3. Pilih repositori GitHub `SADHANA`.
4. Klik **Deploy** (Vercel akan otomatis mengendus Vite + React).

---

## 🔗 Hubungkan ke Google Sheet & AppSheet

1. Buat Google Sheet baru dengan 3 tab: `Jadwal`, `PolaMakan`, dan `Aktivitas`.
2. Buka *Extensions → Apps Script*, tempel isi file `google apps script.GS`, lalu pilih *Deploy → New Deployment → Web App* (Access: **Anyone**).
3. Salin URL Web App (format: `https://script.google.com/macros/s/.../exec`) dan masukkan ke tab **Sinkronisasi** di aplikasi SADHANA.
4. Di [AppSheet.com](https://www.appsheet.com), buat aplikasi baru dari Google Sheet tersebut untuk memperoleh notifikasi pengingat otomatis di ponsel Android/iOS Anda!
