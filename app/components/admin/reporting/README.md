# Admin Reporting Components

Komponen modular untuk halaman reporting admin. Setiap komponen memiliki tanggung jawab yang jelas dan dapat digunakan kembali.

## 📁 Struktur Komponen

```
components/admin/reporting/
├── ReportHeader.vue          # Header dengan tombol refresh & export
├── ReportTypeSelector.vue    # Selector untuk memilih jenis laporan
├── ReportFilters.vue         # Filter dinamis berdasarkan jenis laporan
├── ReportStatistics.vue      # Statistik dengan badge dan icon
├── ReportTable.vue           # Tabel data dengan pagination
├── index.ts                  # Export semua komponen
└── README.md                 # Dokumentasi ini
```

## 🧩 Komponen

### 1. ReportHeader

Header halaman dengan tombol aksi.

**Props:**
- `loading` (boolean) - Status loading
- `hasData` (boolean) - Apakah ada data untuk di-export

**Events:**
- `@refresh` - Trigger refresh data
- `@export` - Trigger export dengan format (pdf/excel)

**Fitur:**
- Modal export dengan pilihan format
- Tombol refresh dengan loading state
- Responsive layout

### 2. ReportTypeSelector

Selector untuk memilih jenis laporan (8 jenis).

**Props:**
- `modelValue` (string) - Jenis laporan yang dipilih

**Events:**
- `@update:modelValue` - Update jenis laporan

**Jenis Laporan:**
- placement - Laporan Penempatan
- attendance - Laporan Absensi
- logbook - Laporan Logbook
- assessment - Laporan Penilaian
- monitoring - Laporan Monitoring
- application - Laporan Pengajuan
- company - Laporan Perusahaan
- teacher - Laporan Guru

### 3. ReportFilters

Filter dinamis yang berubah sesuai jenis laporan.

**Props:**
- `filters` (FilterValues) - Nilai filter saat ini
- `reportType` (string) - Jenis laporan
- `loading` (boolean) - Status loading

**Events:**
- `@update:filters` - Update nilai filter
- `@apply` - Terapkan filter
- `@reset` - Reset filter

**Filter yang Tersedia:**
- Tahun Ajaran (placement, assessment, application, teacher)
- Periode PKL (placement)
- Jurusan (placement, assessment)
- Perusahaan (placement, attendance, assessment, monitoring, application)
- Status (placement, logbook, application)
- Rentang Tanggal (attendance, logbook, monitoring)

### 4. ReportStatistics

Menampilkan statistik dengan icon dan badge.

**Props:**
- `statistics` (any) - Data statistik dari API
- `reportType` (string) - Jenis laporan

**Fitur:**
- 4 kartu statistik per laporan
- Icon dan warna dinamis
- Badge untuk informasi tambahan
- Responsive grid layout

**Statistik per Jenis Laporan:**

**Placement:**
- Total Penempatan
- Aktif
- Selesai
- Dibatalkan

**Attendance:**
- Total Siswa
- Rata-rata Kehadiran
- Kehadiran Rendah (< 80%)
- Total Hadir

**Logbook:**
- Total Entri
- Menunggu Persetujuan
- Disetujui
- Rata-rata per Minggu

**Assessment:**
- Total Penilaian
- Rata-rata Nilai
- Nilai A (90-100)
- Nilai B (80-89)

**Monitoring:**
- Total Kunjungan
- Ada Kendala
- Belum Dikunjungi
- Guru Aktif

**Application:**
- Total Pengajuan
- Menunggu
- Disetujui
- Tingkat Persetujuan

**Company:**
- Total Perusahaan
- Kerjasama Aktif
- Total Kapasitas
- Over Kapasitas

**Teacher:**
- Total Guru
- Rata-rata Siswa/Guru
- Total Kunjungan
- Rata-rata Kunjungan/Guru

### 5. ReportTable

Tabel data dengan pagination dan custom cell rendering.

**Props:**
- `data` (any[]) - Data untuk ditampilkan
- `columns` (Column[]) - Definisi kolom
- `pagination` (PaginationMeta) - Info pagination
- `loading` (boolean) - Status loading

**Events:**
- `@next-page` - Halaman berikutnya
- `@previous-page` - Halaman sebelumnya

**Fitur:**
- Custom cell templates untuk status, nilai, dll
- Badge dengan warna dinamis
- Empty state dengan icon
- Loading skeleton
- Pagination controls

## 🎯 Penggunaan

### Basic Usage

```vue
<template>
    <div class="space-y-6">
        <AdminReportingReportHeader
            :loading="loading"
            :has-data="hasData"
            @refresh="refresh"
            @export="handleExport"
        />

        <AdminReportingReportTypeSelector
            v-model="reportType"
        />

        <AdminReportingReportFilters
            v-model:filters="filters"
            :report-type="reportType"
            @apply="applyFilters"
            @reset="resetFilters"
        />

        <AdminReportingReportStatistics
            :statistics="statistics"
            :report-type="reportType"
        />

        <AdminReportingReportTable
            :data="data"
            :columns="columns"
            :pagination="pagination"
            @next-page="nextPage"
            @previous-page="previousPage"
        />
    </div>
</template>

<script setup lang="ts">
import { useReporting } from "~/composables/use-reporting";

const {
    loading,
    selectedReportType,
    reportData,
    statistics,
    pagination,
    filters,
    currentColumns,
    fetchReportData,
    applyFilters,
    resetFilters,
    nextPage,
    previousPage,
    exportReport,
} = useReporting();

onMounted(() => {
    fetchReportData();
});
</script>
```

### Dengan Composable

Gunakan composable `use-reporting` untuk mengelola state:

```typescript
const {
    // State
    loading,
    selectedReportType,
    reportData,
    statistics,
    pagination,
    filters,
    
    // Computed
    currentColumns,
    
    // Methods
    fetchReportData,
    applyFilters,
    resetFilters,
    nextPage,
    previousPage,
    exportReport,
} = useReporting();
```

## 🔧 Kustomisasi

### Menambah Jenis Laporan Baru

1. Tambahkan di `ReportTypeSelector.vue`:
```typescript
{
    value: "new-report",
    label: "Laporan Baru",
    description: "Deskripsi laporan",
    icon: "lucide:icon-name",
}
```

2. Tambahkan filter di `ReportFilters.vue`:
```typescript
const filterMap: Record<string, string[]> = {
    // ...
    "new-report": ["tahun_ajaran", "status"],
};
```

3. Tambahkan statistik di `ReportStatistics.vue`:
```typescript
case "new-report":
    return {
        stat1: { label: "...", value: ..., icon: "...", ... },
        // ...
    };
```

4. Tambahkan kolom di `use-reporting.ts`:
```typescript
case "new-report":
    return [
        { accessorKey: "field1", header: "Header 1" },
        // ...
    ];
```

5. Tambahkan API call di `use-reporting.ts`:
```typescript
case "new-report":
    response = await api.getNewReport(params);
    break;
```

### Custom Cell Rendering

Tambahkan template di `ReportTable.vue`:

```vue
<template #custom_field-cell="{ row }">
    <div class="custom-rendering">
        {{ row.original.custom_field }}
    </div>
</template>
```

## 📊 Data Flow

```
User Action
    ↓
Component Event
    ↓
Composable Method
    ↓
API Call
    ↓
Update State
    ↓
Component Re-render
```

## 🎨 Styling

Semua komponen menggunakan:
- Tailwind CSS untuk styling
- Nuxt UI components (UButton, USelectMenu, UTable, dll)
- Lucide icons
- Color scheme: sky-500 (primary), slate (neutral)

## 📝 Type Safety

Semua komponen dan composable menggunakan TypeScript dengan:
- Interface untuk props
- Type untuk events
- Generic types untuk data

## 🧪 Testing

Untuk testing komponen:

```typescript
import { mount } from '@vue/test-utils';
import ReportHeader from './ReportHeader.vue';

describe('ReportHeader', () => {
    it('emits refresh event', async () => {
        const wrapper = mount(ReportHeader);
        await wrapper.find('button').trigger('click');
        expect(wrapper.emitted('refresh')).toBeTruthy();
    });
});
```

## 📚 Dependencies

- Vue 3
- Nuxt 3
- Nuxt UI
- TypeScript
- Tailwind CSS

## 🔗 Related Files

- `composables/api/use-reporting-api.ts` - API calls
- `composables/use-reporting.ts` - State management
- `pages/admin/reporting-modular.vue` - Main page
