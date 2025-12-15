1. Technical Stack & Dependencies (Siswa Focus)
Selain stack dasar (Nuxt 4, Tailwind 4, Nuxt UI), untuk siswa kita butuh tambahan khusus:

Geolocation: @vueuse/core (fungsi useGeolocation sangat stabil untuk reactive location data).

Maps: vue-leaflet (Untuk menampilkan radius lokasi saat absen).

Camera/Image: Native HTML input (capture="environment") atau vue-camera-lib jika ingin custom UI.

Charts: vue-chartjs (Khusus untuk Radar Chart nilai kompetensi).

Rich Text: Tiptap (Versi lightweight untuk input logbook, jangan pakai editor yang terlalu berat).

📂 2. Project Structure & Routing (Siswa Scope)
Layout siswa harus adaptif: Sidebar di Desktop, tetapi berubah menjadi Bottom Navigation Bar saat di Mobile agar mudah dijangkau jempol.

Layout: layouts/siswa.vue

Route Map:

Plaintext

/pages
  /siswa
    /dashboard           (Modul 1 - Home)
    /profile             (Modul 2)
    /internship
      /apply.vue         (Modul 3 - Ajukan)
      /status.vue        (Modul 4 - Status/History)
    /attendance
      /index.vue         (Modul 5 - History/Calendar)
      /check-in.vue      (Modul 5 - Action)
    /logbook
      /index.vue         (Modul 6 - List)
      /create.vue        (Modul 6 - Form)
      /[id].vue          (Modul 6 - Edit/Revisi)
    /documents           (Modul 7 & 8)
    /grades              (Modul 9)
📝 3. Detailed Component Specifications
🔹 Modul 1: Dashboard Siswa
File: /pages/siswa/dashboard.vue

UX Focus: Informasi paling penting (Status Absen hari ini & Status Logbook terakhir) harus paling atas.

Komponen:

WelcomeBanner.vue: Menyapa siswa ("Halo, Budi!").

AttendanceStatusCard.vue: Card besar. Jika belum absen -> Tombol "Check-in" (Primary). Jika sudah -> Tampilkan jam masuk.

QuickMenu.vue: Grid 4 ikon (Logbook, Izin, Dokumen, Nilai).

RecentActivity.vue: List logbook terakhir dengan <UBadge> status.

🔹 Modul 2: Lihat Profil & Data PKL
File: /pages/siswa/profile.vue

View: Card profile dengan foto besar (<UAvatar size="3xl">).

Edit Mode: Form edit hanya untuk No HP/Email. Data NIS/Nama disabled.

Data PKL: Tampilkan dalam <UCard> terpisah: "Info Mentor" dan "Info Industri". Sertakan tombol WA/Email link (href="wa.me/...") agar siswa mudah menghubungi mentor.

🔹 Modul 3 & 4: Ajukan PKL & Status
File: /pages/siswa/internship/apply.vue

Flow (Stepper): Gunakan UI Stepper (Pilih Jalur -> Pilih/Input PT -> Submit).

Search: <UInput> dengan debounce untuk mencari database perusahaan mitra.

Form Mandiri: Validasi ketat (Wajib isi alamat lengkap).

Status Page:

Gunakan Timeline Vertical untuk tracking status (Mengajukan -> Review Guru -> Diterima/Ditolak).

Jika Rejected, tampilkan <UAlert color="red"> berisi alasan penolakan, dan tombol "Ajukan Ulang".

🔹 Modul 5: Input Absensi (Critical Feature)
File: /pages/siswa/attendance/check-in.vue

Logic Geolocation:

Saat page load, panggil useGeolocation.

Hitung jarak (Haversine formula) antara koordinat siswa vs koordinat kantor.

Jika jarak > 100m (toleransi), tombol "Absen Masuk" -> Disabled atau beri Warning.

UI Components:

Map Preview: <LMap> kecil menunjukkan titik user (biru) dan titik kantor (merah).

Camera: <UInput type="file" capture="user" accept="image/*">. Ini akan memicu kamera depan HP native.

Check-in Button: Tombol besar (block size="xl").

🔹 Modul 6: Input Logbook Harian
File: /pages/siswa/logbook/create.vue

Editor: Gunakan UTextarea dengan fitur autosize agar simpel di HP, atau Tiptap minimalis (bold, italic, list saja).

Upload Foto: <UInput type="file" multiple>. Tampilkan preview thumbnail gambar yang dipilih sebelum submit.

Revisi (Modul 6.8):

Jika status rejected, form terisi data lama.

Tampilkan "Catatan Pembimbing" di bagian paling atas form menggunakan <UAlert title="Revisi Diperlukan">.

🔹 Modul 7 & 8: Dokumen PKL
File: /pages/siswa/documents.vue

Tabs: Bagi menjadi dua tab: "Upload Dokumen" dan "Download Template".

Upload: Gunakan Drag & Drop zone yang mendukung validasi size (<5MB).

List: Gunakan <UTable> sederhana atau List Group dengan ikon PDF/DOCX.
  s
🔹 Modul 9: Lihat Nilai PKL
File: /pages/siswa/grades.vue

Visual:

Radar Chart: Visualisasi skill (Disiplin, Teknis, Sikap).

Score Card: Nilai Akhir Angka Besar.

Pass/Fail Badge: <UBadge color="green" label="LULUS">.

Export: Tombol "Download Sertifikat" (hanya aktif jika status LULUS).

📱 4. Mobile Responsiveness Strategy
Karena Nuxt UI berbasis Tailwind, gunakan utility classes ini secara agresif:

Hidden on Mobile: Kolom tabel yang tidak krusial (misal: ID Logbook) sembunyikan dengan hidden md:table-cell.

Touch Targets: Pastikan tombol tinggi minimal 44px (h-11 di tailwind) agar mudah dipencet jari.

Bottom Sheet: Untuk filter atau menu detail, pertimbangkan menggunakan <USlideover side="bottom"> (seperti drawer di aplikasi native) daripada Modal di tengah layar.

🔗 5. Data Store (Pinia)
Store: stores/siswa.ts

TypeScript

export const useSiswaStore = defineStore('siswa', () => {
  // State
  const profile = ref(null);
  const activeInternship = ref(null); // Menyimpan status PKL & Koordinat Kantor
  const currentLocation = ref({ lat: 0, lng: 0 });

  // Actions
  async function checkIn(photoFile, notes) {
    // 1. Validasi Lokasi (Client side double check)
    // 2. FormData append photo
    // 3. POST /api/siswa/attendance/check-in
  }

  async function fetchMyLogbooks() {
    // GET /api/siswa/logbooks
  }

  return { 
    profile, 
    activeInternship, 
    checkIn,
    fetchMyLogbooks 
  };
})
💡 6. Special UX Notes for "Siswa"
Offline Handling: Siswa mungkin punya kuota terbatas atau sinyal buruk.

Gunakan useOnline dari VueUse. Jika offline, disable tombol submit dan beri notifikasi.

Nice to have: Simpan draft logbook di localStorage jika submit gagal.

Validasi Foto:

Pastikan FE mengompres gambar sebelum dikirim ke backend (gunakan library seperti browser-image-compression) agar upload cepat dan hemat data server.

Gamification (Opsional):

Berikan visual progress bar "80% menuju selesai PKL" di dashboard untuk motivasi.