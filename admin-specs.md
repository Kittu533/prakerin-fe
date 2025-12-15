🖥️ 1. Technical Stack & Dependencies (Admin Focus)
Selain stack standar, Admin membutuhkan library tambahan untuk menangani data besar dan visualisasi:

Charts: vue-chartjs (Chart.js wrapper) atau echarts (Untuk Modul 1.3 & 5.4).

Table Enhancement: Nuxt UI <UTable> sudah bagus, tapi pastikan menguasai fitur Pagination, Sorting, & Selection (Checkbox).

Excel Handling: xlsx atau sheetjs (Untuk fitur Import Siswa & Export Laporan).

Date Formatting: dayjs atau date-fns (Format tanggal laporan).

📂 2. Project Structure & Routing (Admin Scope)
Layout Admin menggunakan Sidebar Permanen di kiri agar navigasi antar menu master data cepat.

Layout: layouts/admin.vue

Route Map:

Plaintext

/pages
  /admin
    /dashboard           (Modul 1)
    /master              (Modul 2)
      /academic-years
      /departments       (Jurusan)
      /classes
      /teachers
      /students
      /companies
      /mentors
    /verification        (Modul 3 - Pengajuan)
    /placement           (Modul 4 - Penempatan)
    /monitoring          (Modul 5)
    /users               (Modul 6 - Akun)
📝 3. Detailed Component Specifications
🔹 Modul 1: Dashboard & Statistik
File: /pages/admin/dashboard.vue

Komponen:

StatsGrid.vue: 4-5 Kartu Ringkasan (Total Siswa PKL, Menunggu Verifikasi, Masalah Absensi).

ChartPlacement.vue: Pie Chart (Persentase penempatan per Jurusan).

ChartAttendance.vue: Bar Chart (Tren kehadiran minggu ini).

RecentAlerts.vue: List notifikasi sistem (menggunakan <UAlert> dalam list vertikal).

Action: Tombol "Download Laporan Kilat" (Export PDF dashboard).

🔹 Modul 2: Kelola Data Master (The Heavy Lifter)
Ini adalah modul dengan pola berulang (Repetitive Patterns). Kita perlu membuat Reusable CRUD Components.

Pola Umum Halaman Master:

Header: Judul + Tombol "Tambah Data" + Tombol "Import" (khusus Siswa).

Toolbar: Search Input + Filter Dropdown (Tahun Ajaran/Jurusan).

Table: <UTable> dengan kolom aksi (Edit, Delete, Switch Active).

Modal: <UModal> berisi form Input/Edit.

Spesifikasi Khusus per Sub-Modul:

2.1 Tahun Ajaran:

Toggle Switch: "Set Aktif". Logic: Saat satu aktif, yang lain otomatis non-aktif.

2.6 Siswa:

Bulk Import: Komponen ImportExcelModal.vue.

Step 1: Download Template (.xlsx).

Step 2: Upload File.

Step 3: Preview Data dalam Tabel Sementara.

Step 4: Commit to Database.

2.7 Perusahaan:

Quota Progress: Di tabel, tampilkan kolom "Kapasitas". Gunakan <UMeter> atau <UProgress> kecil (misal: Terisi 3/5).

🔹 Modul 3: Verifikasi Pengajuan PKL
File: /pages/admin/verification/index.vue

View: Tabel dengan Badge Status yang jelas.

🟡 Menunggu

🟢 Disetujui

🔴 Ditolak

Action Modal:

Saat klik baris, muncul Modal Detail.

Tampilkan perbandingan: Jurusan Siswa vs Bidang Perusahaan.

Tombol: Reject (Wajib isi alasan di Textarea) / Approve.

🔹 Modul 4: Penempatan Siswa (Complex Logic)
File: /pages/admin/placement/index.vue

Fitur ini menghubungkan 4 entitas: Siswa + Perusahaan + Guru + Mentor.

UI: Form Wizard atau Single Page Form yang padat.

Form Fields:

Pilih Siswa: (Readonly jika berasal dari menu Verifikasi).

Pilih Perusahaan: <USelectMenu> (Searchable). Tampilkan sisa slot di label (e.g., "PT Telkom - Sisa 2 Slot").

Pilih Guru Pembimbing: <USelectMenu>. Tampilkan jumlah beban bimbingan saat ini (e.g., "Budi Santoso (12 Siswa)"). Untuk balancing beban kerja.

Pilih Mentor: Dropdown ini Reactive, hanya muncul mentor yang terlink dengan Perusahaan yang dipilih di poin 2.

Validation: Cegah submit jika Kapasitas Perusahaan penuh atau Guru melebihi batas (opsional).

🔹 Modul 5: Monitoring Status
File: /pages/admin/monitoring.vue

Filter Power: Admin butuh filter bertingkat.

Filter 1: Tahun Ajaran.

Filter 2: Jurusan.

Filter 3: Kelas.

Table Data:

Kolom: Nama Siswa, Perusahaan, % Absensi (Warna Merah jika <80%), Jml Logbook, Nilai Sementara.

Detail View: Klik siswa -> Redirect ke profil detail siswa (seperti view Guru tapi Read Only).

🔹 Modul 6: Kelola Akun
File: /pages/admin/users.vue

Fitur Keamanan:

Tombol "Reset Password": Generate string random -> Tampilkan di Modal -> Copy to Clipboard.

Tombol "Force Logout": Panggil API untuk invalidate token user (opsional/advanced).

💾 4. Data Management (Pinia Stores)
Admin perlu memuat banyak data dropdown ("Select Options"). Gunakan Pinia untuk caching agar tidak loading berulang-ulang.

Store: stores/masterData.ts

TypeScript

export const useMasterDataStore = defineStore('masterData', () => {
  const years = ref([])
  const majors = ref([])
  const classes = ref([])
  const teachers = ref([]) // Hanya list Nama & ID untuk dropdown

  // Fetch only if empty
  async function loadInitialData() {
    if (years.value.length === 0) await fetchYears()
    if (majors.value.length === 0) await fetchMajors()
    // ...
  }

  return { years, majors, classes, teachers, loadInitialData }
})
🎨 5. UI Components & Patterns (Nuxt UI)
Berikut adalah komponen kunci yang akan sering Anda gunakan di panel Admin:

A. Reusable Search & Filter Bar
Letakkan ini di atas setiap tabel Master Data.

Cuplikan kode

<template>
  <div class="flex gap-2 mb-4">
    <UInput 
      v-model="search" 
      icon="i-heroicons-magnifying-glass" 
      placeholder="Cari data..." 
      class="w-64"
    />
    <USelectMenu 
      v-model="filterJurusan" 
      :options="majors" 
      placeholder="Filter Jurusan" 
    />
    <div class="ml-auto">
      <slot name="actions" />
    </div>
  </div>
</template>
B. Status Badges Standard
Standarisasi warna badge agar Admin tidak bingung.

Active / Approved / Hadir: color="green"

Pending / Izin: color="orange"

Inactive / Rejected / Alpha: color="red"

Sakit: color="blue"

🚀 6. Workflow Implementation: Penempatan (Placement)
Ini adalah alur paling kritis bagi Admin.

Trigger: Admin membuka menu "Penempatan" -> Tab "Perlu Penempatan" (List siswa yang pengajuannya sudah di-approve tapi belum dapat Guru/Mentor).

Action: Klik tombol "Proses" pada baris Siswa A.

Modal Form:

Siswa: "Budi (RPL)" (Auto-filled).

Perusahaan: "PT Telkom" (Auto-filled dari pengajuan).

Input Guru: Admin mengetik "Siti". Dropdown muncul: "Siti Aminah (Beban: 5 siswa)". Admin memilihnya.

Input Mentor: Dropdown otomatis meload mentor dari PT Telkom. Pilih "Pak Joko".

Submit:

Frontend kirim Payload: { student_id, company_id, teacher_id, mentor_id, dates }.

Backend update DB & Kirim Notifikasi ke 4 pihak.

Result: Siswa A pindah dari tab "Perlu Penempatan" ke "Terjadwal".