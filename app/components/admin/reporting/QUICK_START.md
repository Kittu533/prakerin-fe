# Quick Start - Admin Reporting

## 🚀 Setup Cepat

### 1. Import Composable
```vue
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
</script>
```

### 2. Gunakan Komponen
```vue
<template>
    <div class="space-y-6">
        <AdminReportingReportHeader
            :loading="loading"
            :has-data="reportData.length > 0"
            @refresh="fetchReportData"
            @export="exportReport"
        />

        <AdminReportingReportTypeSelector
            v-model="selectedReportType"
        />

        <AdminReportingReportFilters
            v-model:filters="filters"
            :report-type="selectedReportType"
            @apply="applyFilters"
            @reset="resetFilters"
        />

        <AdminReportingReportStatistics
            :statistics="statistics"
            :report-type="selectedReportType"
        />

        <AdminReportingReportTable
            :data="reportData"
            :columns="currentColumns"
            :pagination="pagination"
            @next-page="nextPage"
            @previous-page="previousPage"
        />
    </div>
</template>
```

### 3. Load Data
```vue
<script setup lang="ts">
onMounted(() => {
    fetchReportData();
});
</script>
```

## 📦 Komponen

| Komponen | Fungsi | Props | Events |
|----------|--------|-------|--------|
| `ReportHeader` | Header & export | `loading`, `hasData` | `@refresh`, `@export` |
| `ReportTypeSelector` | Pilih jenis | `modelValue` | `@update:modelValue` |
| `ReportFilters` | Filter data | `filters`, `reportType` | `@apply`, `@reset` |
| `ReportStatistics` | Statistik | `statistics`, `reportType` | - |
| `ReportTable` | Tabel data | `data`, `columns`, `pagination` | `@next-page`, `@previous-page` |

## 🎯 Jenis Laporan

1. **placement** - Penempatan siswa
2. **attendance** - Kehadiran
3. **logbook** - Jurnal harian
4. **assessment** - Penilaian
5. **monitoring** - Kunjungan
6. **application** - Pengajuan
7. **company** - Perusahaan
8. **teacher** - Guru

## 🔧 API Endpoints

```
GET /api/reporting/placements
GET /api/reporting/attendance
GET /api/reporting/logbooks
GET /api/reporting/assessments
GET /api/reporting/monitoring
GET /api/reporting/applications
GET /api/reporting/companies
GET /api/reporting/teachers

GET /api/reporting/{type}/export?format=pdf|excel
```

## 📝 Filter Options

```typescript
{
    tahun_ajaran_id: string | null
    id_periode_pkl: string | null
    id_jurusan: string | null
    id_perusahaan: string | null
    status: string | null
    tanggal_mulai: string | null
    tanggal_selesai: string | null
}
```

## 🎨 Customization

### Tambah Kolom Baru
```typescript
// di use-reporting.ts
case "placement":
    return [
        { accessorKey: "field", header: "Header" },
        // tambah kolom baru
    ];
```

### Custom Cell Rendering
```vue
<!-- di ReportTable.vue -->
<template #custom_field-cell="{ row }">
    <div>{{ row.original.custom_field }}</div>
</template>
```

### Tambah Statistik
```typescript
// di ReportStatistics.vue
case "placement":
    return {
        newStat: {
            label: "Label",
            value: statistics.value,
            icon: "lucide:icon",
            bgColor: "bg-sky-100",
            iconColor: "text-sky-600",
        },
    };
```

## 🐛 Debug

```typescript
// Log state
console.log({
    loading: loading.value,
    reportType: selectedReportType.value,
    data: reportData.value,
    stats: statistics.value,
});

// Log API response
const response = await api.getPlacementReport(params);
console.log('API Response:', response);
```

## ✅ Checklist

- [ ] Import composable
- [ ] Setup komponen
- [ ] Load data on mount
- [ ] Test filter
- [ ] Test pagination
- [ ] Test export
- [ ] Handle errors
- [ ] Add loading states

## 📚 Docs

- [README.md](./README.md) - Dokumentasi lengkap
- [REPORTING_IMPLEMENTATION.md](../../../REPORTING_IMPLEMENTATION.md) - Implementasi detail
