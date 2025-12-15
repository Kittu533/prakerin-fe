🏗️ 1. Technical Stack & Dependencies (Frontend)
Sebelum masuk ke fitur, ini adalah library pendukung yang direkomendasikan untuk ekosistem Nuxt 4 & Nuxt UI:

Framework: Nuxt 4 (Vue 3 Composition API).

UI Framework: Nuxt UI (ini sudah include Headless UI & Tailwind CSS).

Styling: Tailwind CSS v4.

State Management: Pinia (wajib untuk manajemen data siswa & auth).

Form Validation: Zod (terintegrasi baik dengan Nuxt UI <UForm>).

Icons: Nuxt UI Icon (biasanya Heroicons/Iconify).

Charts: vue-chartjs atau apexcharts (untuk Quick Stats & Grafik Kehadiran).

Date/Calendar: v-calendar atau manfaatkan UDatePicker dari Nuxt UI.

Maps: vue-leaflet (untuk fitur Geolocation Check-in, lebih ringan dari Google Maps).

📂 2. Project Structure & Routing (Guru Scope)
Kita akan menggunakan fitur Nested Routes atau layout khusus untuk memisahkan area Guru dari role lain.

Layout: layouts/guru.vue (Sidebar navigasi khusus guru).

Route Map:

Plaintext

/pages
  /guru
    /dashboard           (Modul 1)
    /students
      /index.vue         (Modul 2 - List)
      /[id].vue          (Modul 2 - Detail)
    /monitoring
      /index.vue         (Modul 3 - List/History)
      /create.vue        (Modul 3 - Form Input)
    /attendance          (Modul 4)
    /logbook             (Modul 5)
    /grading             (Modul 6)
    /reports             (Modul 7)
📝 3. Detailed Component Specifications
Berikut adalah spesifikasi per modul yang diterjemahkan ke komponen Nuxt UI.

🔹 Modul 1: Dashboard Guru
File: /pages/guru/dashboard.vue

Komponen Utama:

StatCard.vue: Menggunakan <UCard> untuk menampilkan angka (Total Siswa, Logbook Pending).

MonitoringCalendar.vue: Widget kalender kecil untuk jadwal terdekat.

NotificationList.vue: List notifikasi mendesak.

Data Fetching:

useFetch('/api/guru/dashboard-stats') (Mengambil summary data sekaligus).

Nuxt UI Components: <UContainer>, <UGrid>, <UBadge> (untuk status).

🔹 Modul 2: Lihat Data Bimbingan
File: /pages/guru/students/index.vue & [id].vue

Fitur List (Index):

Table: Gunakan <UTable> yang powerful.

Columns: Nama, Kelas, Industri, Status PKL.

Filter: <USelectMenu> untuk filter Kelas/Perusahaan.

Search: <UInput icon="i-heroicons-magnifying-glass"> dengan debounce.

Fitur Detail ([id]):

Tabs: Gunakan <UTabs> untuk memecah view: Profile, Progress Timeline, History Nilai.

Timeline: Buat komponen TimelineItem.vue (Nuxt UI mungkin belum punya native timeline, bisa styling manual dengan Tailwind border-l).

🔹 Modul 3: Input Monitoring Kunjungan
File: /pages/guru/monitoring/create.vue

Form Structure:

Gunakan <UForm> dengan schema validasi Zod.

Fields:

Select Siswa (<USelectMenu> dengan fitur search).

Tanggal & Waktu (<UDatePicker>).

Upload Foto: <UInput type="file">. Note: Handle preview image di client-side sebelum upload.

Kendala & Solusi: <UTextarea>.

Geolocation (3.5):

Buat composable useGeolocation. Saat tombol "Check-in" ditekan, ambil lat/long browser dan tampilkan di map kecil (<LMap> dari Leaflet).

🔹 Modul 4: Verifikasi Absensi
File: /pages/guru/attendance.vue

View Mode: Toggle antara "List View" (<UTable>) dan "Calendar View".

Action:

Tombol "Validasi" yang memunculkan Modal (<UModal>).

Di dalam modal, tampilkan bukti foto/dokumen izin siswa.

Alert: Gunakan <UAlert> warna merah jika kehadiran < 80%.

🔹 Modul 5: Approve/Reject Logbook
File: /pages/guru/logbook.vue

Layout: Split view atau Master-Detail. Kiri list siswa/logbook, kanan detail logbook.

Bulk Action: Checkbox di <UTable> untuk "Select All" -> tombol "Approve Selected" muncul di header.

Feedback Modal:

Saat Reject, munculkan <UModal> dengan <UTextarea> untuk alasan revisi.

Sediakan "Canned Responses" (Template Feedback) menggunakan <USelect> kecil di atas textarea.

🔹 Modul 6: Kelola Penilaian PKL
File: /pages/guru/grading.vue

Logic: Ini adalah form yang berat di kalkulasi (Feature 6.7).

Reactive State:

JavaScript

const scores = reactive({ discipline: 0, skill: 0, attitude: 0 });
const finalScore = computed(() => {
   // Rumus pembobotan
   return (scores.discipline * 0.3) + (scores.skill * 0.4) + (scores.attitude * 0.3);
});
Validation: Jika input > 100, field jadi merah (error state di <UFormGroup>).

Read-Only View: Tampilkan nilai Mentor di <UCard> terpisah dengan background abu-abu (bg-gray-50) agar terlihat disabled.

🔹 Modul 7: Generate Laporan
File: /pages/guru/reports.vue

UI: Form filter sederhana.

Preview: Gunakan PDF viewer library (seperti vue-pdf-embed) atau sekadar iframe jika backend mengembalikan URL blob.

Process:

User pilih filter -> Klik "Generate".

Frontend panggil API -> Loading state (<UButton loading>).

Browser download file.

🔗 4. Data Interaction (Store & API)
Gunakan Pinia untuk menghindari prop drilling.

Store: stores/guru.ts

TypeScript

export const useGuruStore = defineStore('guru', () => {
  // State
  const students = ref([]);
  const monitoringHistory = ref([]);

  // Actions
  async function fetchStudents() {
    // Call API /api/guru/students
    // Update state students
  }
  
  async function postMonitoring(data) {
    // Post to /api/guru/monitoring
  }

  return { students, monitoringHistory, fetchStudents, postMonitoring };
})
Antisipasi Endpoint Backend (Express): Anda perlu meminta tim backend menyediakan endpoint ini:

GET /api/guru/stats (Dashboard)

GET /api/guru/students (List siswa bimbingan)

GET /api/guru/students/:id (Detail)

POST /api/guru/monitoring (Submit monitoring)

PUT /api/guru/logbook/approval (Approve/Reject)

POST /api/guru/grading (Submit nilai)

🎨 5. UI/UX Guidelines (Nuxt UI)
Agar tampilan konsisten dan profesional:

Color Palette: Gunakan Primary Color sekolah/aplikasi di app.config.ts Nuxt UI.

Empty States: Jangan biarkan tabel kosong. Gunakan slot #empty pada <UTable> untuk menampilkan ilustrasi "Belum ada data".

Loading States: Selalu gunakan skeleton loader (<USkeleton>) saat fetch data siswa atau dashboard.

Feedback: Gunakan useToast() dari Nuxt UI untuk notifikasi sukses/gagal (contoh: "Logbook berhasil disetujui").