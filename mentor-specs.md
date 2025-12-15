Karakteristik utama user Mentor adalah mereka bukan orang sekolah, melainkan profesional industri yang sibuk. Maka, UX untuk mentor harus:

To-the-point: Langsung ke daftar tugas (approve/verifikasi).

Mobile Friendly: Kemungkinan besar diakses via HP saat di lapangan.

Low Friction: Minimal klik untuk menyelesaikan tugas.

🏗️ 1. Technical Stack & Dependencies (Mentor Focus)
UI Components: Nuxt UI (<UCard>, <UForm>, <UBadge>).

Icons: Fokus pada ikon status (Check, X, Clock) yang jelas.

State Management: Pinia (untuk menyimpan list siswa bimbingan yang biasanya sedikit, 1-5 orang).

Communication: Integrasi href="wa.me/..." untuk tombol kontak Guru/Siswa.

📂 2. Project Structure & Routing (Mentor Scope)
Layout: layouts/mentor.vue Layout yang lebih sederhana dibandingkan Admin/Guru. Fokus pada "Task List".

Route Map:

Plaintext

/pages
  /mentor
    /dashboard           (Modul 1)
    /students
      /index.vue         (Modul 2 - List)
      /[id].vue          (Modul 2 - Detail)
    /verification        (Modul 3 - Absensi)
    /logbook             (Modul 4 - Approval)
    /grading
      /index.vue         (Modul 5 - List)
      /[id].vue          (Modul 5 - Form Input)
    /profile             (Modul 6)
📝 3. Detailed Component Specifications
🔹 Modul 1: Dashboard Mentor
File: /pages/mentor/dashboard.vue

Konsep: "Action Center". Jangan tampilkan grafik yang rumit. Tampilkan apa yang harus dilakukan.

Komponen:

WelcomeCard.vue: Menyapa mentor.

TaskAlerts.vue: List notifikasi horizontal. Contoh: "3 Logbook menunggu review", "2 Absensi hari ini belum diverifikasi".

MyStudentsGrid.vue: Grid card sederhana menampilkan siswa bimbingan (Foto, Nama, Sekolah).

🔹 Modul 2: Lihat Data Siswa
File: /pages/mentor/students/index.vue

List View: Gunakan Card Grid (<UCard>) daripada Table, karena siswa mentor biasanya sedikit (<10).

Detail Modal/Page:

Tampilkan Info Siswa & Info Guru Pembimbing.

Feature 2.7 (Kontak): Tombol "Hubungi Guru" (Link WhatsApp) sangat krusial di sini agar mentor mudah komplain/koordinasi.

🔹 Modul 3: Verifikasi Absensi
File: /pages/mentor/verification.vue

Workflow:

Mentor melihat list absensi Hari Ini.

Sistem sudah memvalidasi Lokasi (GPS). Mentor hanya validasi fisik/kehadiran.

UI Component:

Tabel sederhana: Nama | Jam Masuk | Status Sistem (GPS OK/Far) | Aksi.

Bulk Action: Tombol "Verifikasi Semua Hadir" di pojok kanan atas (Untuk mempercepat kerja mentor).

Jika ada izin/sakit, tombol "Lihat Surat" memunculkan modal preview gambar.

🔹 Modul 4: Approve Logbook
File: /pages/mentor/logbook.vue

View Mode: List logbook yang statusnya "Pending" saja secara default.

Detail Component (Modal):

Kiri/Atas: Isi Logbook & Foto Kegiatan siswa.

Kanan/Bawah: Form Approval.

Feedback: <UTextarea> opsional jika approve, wajib jika reject.

Quick Buttons: Tombol besar "Terima" (Hijau) dan "Revisi" (Merah).

🔹 Modul 5: Input Penilaian (Critical)
File: /pages/mentor/grading/[id].vue

UX Focus: Form ini panjang. Gunakan Accordion atau Tabs per kategori aspek agar tidak memusingkan.

Structure:

Header: Nama Siswa & Periode.

Section 1: Aspek Teknis/Skill (Form Input Angka 0-100).

Section 2: Aspek Non-Teknis (Disiplin, Kerjasama, Inisiatif).

Section 3: Feedback Kualitatif (Textarea "Kelebihan", "Kekurangan").

Validation: Nilai tidak boleh kosong, range 0-100.

Draft Feature: Auto-save ke localStorage agar jika tidak sengaja ter-close, data nilai yang sudah diinput tidak hilang.

🔹 Modul 6: Profile Mentor
File: /pages/mentor/profile.vue

Standard form edit profile.

Pastikan fitur Ganti Password mudah diakses.

🔄 4. Workflow & Logic Specification: Penilaian (Grading)
Ini adalah fitur terpenting Mentor. Berikut detail logic-nya:

Akses: Mentor masuk menu Penilaian -> Pilih Siswa -> Klik "Input Nilai".

Pengisian:

Frontend menyediakan form dengan validasi type="number" min="0" max="100".

Gunakan komponen <URange> (Slider) bersanding dengan <UInput> agar visualisasi nilai lebih mudah.

Review: Sebelum submit, munculkan Modal "Konfirmasi Nilai". Tampilkan rekap nilai rata-rata.

Submit:

Status nilai di DB berubah menjadi submitted.

Mentor tidak bisa edit lagi setelah submit (Lock).

Trigger notifikasi ke Guru Pembimbing.