# Admin Reporting - Implementasi Modular

Dokumentasi lengkap implementasi fitur reporting admin dengan pendekatan modular.

## 📋 Overview

Fitur reporting admin memungkinkan administrator untuk:
- Melihat 8 jenis laporan berbeda
- Filter data berdasarkan berbagai kriteria
- Melihat statistik real-time
- Export laporan ke PDF atau Excel
- Navigasi dengan pagination

## 🏗️ Arsitektur

### Struktur File

```
prakerin-fe/
├── app/
│   ├── components/
│   │   └── admin/
│   │       └── reporting/
│   │           ├── ReportHeader.vue          # Header & export modal
│   │           ├── ReportTypeSelector.vue    # Selector jenis laporan
│   │           ├── ReportFilters.vue         # Filter dinamis
│   │           ├── ReportStatistics.vue      # Kartu statistik
│   │           ├── ReportTable.vue           # Tabel data
│   │           ├── index.ts                  # Export komponen
│   │           └── README.md                 # Dokumentasi komponen
│   │
│   ├── composables/
│   │   ├── api/
│   │   │   └── use-reporting-api.ts          # API calls & types
│   │   └── use-reporting.ts                  # State management
│   │
│   └── pages/
│       └── admin/
│           ├── reporting.vue                 # Versi monolithic (backup)
│           └── reporting-modular.vue         # Versi modular (recommended)
│
└── REPORTING_IMPLEMENTATION.md               # Dokumentasi ini
```

## 🧩 Komponen

### 1. ReportHeader
**Tanggung Jawab:** Header halaman dengan aksi refresh dan export

**Props:**
- `loading: boolean` - Status loading
- `hasData: boolean` - Apakah ada data

**Events:**
- `@refresh` - Refresh data
- `@export(format)` - Export dengan format

**Fitur:**
- Modal export dengan pilihan PDF/Excel
- Loading state pada tombol
- Disable export jika tidak ada data

### 2. ReportTypeSelector
**Tanggung Jawab:** Memilih jenis laporan

**Props:**
- `modelValue: string` - Jenis laporan terpilih

**Events:**
- `@update:modelValue` - Update pilihan

**8 Jenis Laporan:**
1. Placement - Penempatan siswa
2. Attendance - Kehadiran
3. Logbook - Jurnal harian
4. Assessment - Penilaian
5. Monitoring - Kunjungan
6. Application - Pengajuan
7. Company - Perusahaan
8. Teacher - Guru pembimbing

### 3. ReportFilters
**Tanggung Jawab:** Filter data berdasarkan jenis laporan

**Props:**
- `filters: FilterValues` - Nilai filter
- `reportType: string` - Jenis laporan
- `loading: boolean` - Status loading

**Events:**
- `@update:filters` - Update filter
- `@apply` - Terapkan filter
- `@reset` - Reset filter

**Filter Dinamis:**
- Tahun Ajaran
- Periode PKL
- Jurusan
- Perusahaan
- Status
- Rentang Tanggal

### 4. ReportStatistics
**Tanggung Jawab:** Menampilkan statistik

**Props:**
- `statistics: any` - Data statistik
- `reportType: string` - Jenis laporan

**Fitur:**
- 4 kartu statistik per laporan
- Icon dan warna dinamis
- Badge untuk info tambahan
- Responsive grid

### 5. ReportTable
**Tanggung Jawab:** Menampilkan data dalam tabel

**Props:**
- `data: any[]` - Data tabel
- `columns: Column[]` - Definisi kolom
- `pagination: PaginationMeta` - Info pagination
- `loading: boolean` - Status loading

**Events:**
- `@next-page` - Halaman berikutnya
- `@previous-page` - Halaman sebelumnya

**Fitur:**
- Custom cell rendering
- Badge untuk status
- Empty state
- Loading skeleton
- Pagination controls

## 🔧 Composables

### use-reporting.ts
**Tanggung Jawab:** State management untuk reporting

**State:**
```typescript
{
    loading: Ref<boolean>
    selectedReportType: Ref<string>
    reportData: Ref<any[]>
    statistics: Ref<any>
    pagination: Ref<PaginationMeta>
    filters: Ref<ReportFilters>
}
```

**Computed:**
```typescript
{
    currentColumns: ComputedRef<ReportColumn[]>
}
```

**Methods:**
```typescript
{
    fetchReportData(): Promise<void>
    applyFilters(): void
    resetFilters(): void
    nextPage(): void
    previousPage(): void
    exportReport(format): Promise<void>
}
```

### use-reporting-api.ts
**Tanggung Jawab:** API calls ke backend

**Functions:**
```typescript
{
    getPlacementReport(params): Promise<ReportResponse>
    getAttendanceReport(params): Promise<ReportResponse>
    getLogbookReport(params): Promise<ReportResponse>
    getAssessmentReport(params): Promise<ReportResponse>
    getMonitoringReport(params): Promise<ReportResponse>
    getApplicationReport(params): Promise<ReportResponse>
    getCompanyReport(params): Promise<ReportResponse>
    getTeacherReport(params): Promise<ReportResponse>
    exportReport(type, params): Promise<Blob>
}
```

## 🎯 Cara Penggunaan

### 1. Akses Halaman
```
URL: /admin/reporting-modular
```

### 2. Pilih Jenis Laporan
Klik salah satu dari 8 kartu jenis laporan

### 3. Atur Filter
Filter akan muncul sesuai jenis laporan yang dipilih

### 4. Terapkan Filter
Klik tombol "Terapkan Filter"

### 5. Lihat Data
Data akan ditampilkan dalam tabel dengan statistik di atas

### 6. Export (Opsional)
Klik tombol "Export" dan pilih format (PDF/Excel)

## 🔄 Data Flow

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Component      │
│  Event          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Composable     │
│  Method         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Call       │
│  (Backend)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update State   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Component      │
│  Re-render      │
└─────────────────┘
```

## 🎨 Design System

### Colors
- **Primary:** sky-500 (#0ea5e9)
- **Success:** green-500 (#22c55e)
- **Warning:** amber-500 (#f59e0b)
- **Error:** red-500 (#ef4444)
- **Neutral:** slate-500 (#64748b)

### Components
- **Buttons:** Nuxt UI UButton
- **Select:** Nuxt UI USelectMenu
- **Table:** Nuxt UI UTable
- **Badge:** Nuxt UI UBadge
- **Modal:** Nuxt UI UModal
- **Skeleton:** Nuxt UI USkeleton

### Icons
- **Library:** Lucide Icons
- **Prefix:** lucide:

## 📊 API Integration

### Endpoint Pattern
```
GET /api/reporting/{report-type}
```

### Request Parameters
```typescript
{
    // Filters (optional)
    tahun_ajaran_id?: string
    id_periode_pkl?: string
    id_jurusan?: string
    id_perusahaan?: string
    status?: string
    tanggal_mulai?: string
    tanggal_selesai?: string
    
    // Pagination
    page?: number
    limit?: number
}
```

### Response Format
```typescript
{
    success: boolean
    message?: string
    data: Array<any>
    statistics: {
        // Statistics specific to report type
    }
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}
```

### Export Endpoint
```
GET /api/reporting/{report-type}/export?format={pdf|excel}
```

## 🧪 Testing

### Unit Tests
```typescript
// Test component
import { mount } from '@vue/test-utils'
import ReportHeader from './ReportHeader.vue'

describe('ReportHeader', () => {
    it('emits refresh event', async () => {
        const wrapper = mount(ReportHeader)
        await wrapper.find('[data-test="refresh-btn"]').trigger('click')
        expect(wrapper.emitted('refresh')).toBeTruthy()
    })
})
```

### Integration Tests
```typescript
// Test composable
import { useReporting } from '~/composables/use-reporting'

describe('useReporting', () => {
    it('fetches data on mount', async () => {
        const { fetchReportData, reportData } = useReporting()
        await fetchReportData()
        expect(reportData.value.length).toBeGreaterThan(0)
    })
})
```

## 🚀 Deployment

### Build
```bash
npm run build
```

### Environment Variables
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 📝 Maintenance

### Menambah Jenis Laporan Baru

1. **Update ReportTypeSelector.vue**
```typescript
{
    value: "new-report",
    label: "Laporan Baru",
    description: "Deskripsi",
    icon: "lucide:icon",
}
```

2. **Update ReportFilters.vue**
```typescript
const filterMap = {
    "new-report": ["filter1", "filter2"],
}
```

3. **Update ReportStatistics.vue**
```typescript
case "new-report":
    return { /* statistics */ }
```

4. **Update use-reporting.ts**
```typescript
case "new-report":
    return [ /* columns */ ]
```

5. **Update use-reporting-api.ts**
```typescript
async function getNewReport(params) {
    // API call
}
```

### Update Filter Options

Edit di `ReportFilters.vue`:
```typescript
const tahunAjaranOptions = ref([
    // Fetch from API
])
```

## 🐛 Troubleshooting

### Data tidak muncul
- Cek koneksi ke backend
- Cek console untuk error
- Pastikan filter sudah diterapkan

### Export tidak berfungsi
- Cek endpoint export di backend
- Cek format parameter
- Cek browser console untuk error

### Filter tidak bekerja
- Cek mapping filter di `showFilter()`
- Cek parameter yang dikirim ke API
- Cek validasi di backend

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Vue 3 Documentation](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

## 👥 Contributors

- Frontend: Modular component architecture
- Backend: RESTful API endpoints
- Design: Consistent UI/UX patterns

## 📄 License

Internal project - All rights reserved

---

**Last Updated:** 2024
**Version:** 1.0.0
