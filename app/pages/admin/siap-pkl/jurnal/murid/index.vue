<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePenempatanApi } from "~/composables/api/use-internship";
import { useSuratKeluar, type SuratKeluar } from "~/composables/api/use-surat-keluar";
import { useGuruApi } from "~/composables/api/use-guru";

definePageMeta({
  layout: "admin",
});

interface StudentRow {
  id: string;
  id_siswa: string;
  nama: string;
  nis: string;
  kelas: string;
  industri: string;
  alamat: string;
  periode: string;
  durasi: string;
  isTerbit: boolean;
  docxPath?: string;
  pdfPath?: string;
  selected: boolean;
}

const toast = useToast();
const config = useRuntimeConfig();

const penempatanApi = usePenempatanApi();
const suratKeluarApi = useSuratKeluar();
const guruApi = useGuruApi();

const loading = ref(false);
const generating = ref(false);

const search = ref("");
const selectedPlotFilter = ref("SEMUA PLOTTING");
const selectedDokumenFilter = ref("SEMUA DOKUMEN");

const studentData = ref<StudentRow[]>([]);
const suratTugasRows = ref<SuratKeluar[]>([]);

const kepalaSekolahId = ref("");
const kepalaSekolahNama = ref("Kepala Sekolah");

const selectAll = ref(false);

const plottedOptions = computed(() => {
  const options = new Set<string>();
  studentData.value.forEach((row) => {
    if (row.industri) options.add(row.industri);
  });
  return ["SEMUA PLOTTING", ...Array.from(options).sort((a, b) => a.localeCompare(b))];
});

const filteredStudents = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  return studentData.value.filter((row) => {
    const matchKeyword =
      !keyword ||
      row.nama.toLowerCase().includes(keyword) ||
      row.nis.toLowerCase().includes(keyword) ||
      row.industri.toLowerCase().includes(keyword);

    const matchPlot =
      selectedPlotFilter.value === "SEMUA PLOTTING" ||
      row.industri === selectedPlotFilter.value;

    const matchDokumen =
      selectedDokumenFilter.value === "SEMUA DOKUMEN" ||
      (selectedDokumenFilter.value === "SUDAH TERBIT" && row.isTerbit) ||
      (selectedDokumenFilter.value === "BELUM TERBIT" && !row.isTerbit);

    return matchKeyword && matchPlot && matchDokumen;
  });
});

const selectedRows = computed(() => filteredStudents.value.filter((row) => row.selected));

const pageSummary = computed(() => {
  const total = filteredStudents.value.length;
  if (total === 0) return "Menampilkan 0 data";
  return `Menampilkan 1 - ${total} dari ${total} data`;
});

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPeriode(startDate: string, endDate: string) {
  return `${formatDate(startDate)} s.d ${formatDate(endDate)}`;
}

function calculateDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
  );
  return `${months} Bulan`;
}

function normalizeFilePath(path?: string | null) {
  const value = String(path || "").trim();
  return value.length > 0 ? value : undefined;
}

function buildFileUrl(filePath: string) {
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const apiUrl = String(config.public.apiUrl || "").replace(/\/+$/, "");
  const baseOrigin = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  const cleanedPath = filePath.replace(/^\/+/, "");

  if (!baseOrigin) {
    return cleanedPath.startsWith("uploads/") ? `/${cleanedPath}` : `/uploads/${cleanedPath}`;
  }

  return cleanedPath.startsWith("uploads/")
    ? `${baseOrigin}/${cleanedPath}`
    : `${baseOrigin}/uploads/${cleanedPath}`;
}

function downloadFile(path?: string) {
  if (!path) return;
  const link = document.createElement("a");
  link.href = buildFileUrl(path);
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function isSuratTugasMurid(surat: SuratKeluar) {
  const templateJenis = String((surat as { template_jenis?: string }).template_jenis || "").toLowerCase();
  const perihal = String(surat.perihal || "").toLowerCase();
  const hasGeneratedFile = Boolean(
    normalizeFilePath(surat.file_surat_docx) || normalizeFilePath(surat.file_surat_pdf || surat.file_surat),
  );

  if (templateJenis) {
    return templateJenis === "surat_tugas_murid";
  }

  return hasGeneratedFile && (perihal.includes("pelaksanaan pkl") || perihal.includes("a.n."));
}

function inferSuratForSiswa(nis: string, nama: string) {
  const targetNis = nis.trim().toLowerCase();
  const targetNama = nama.trim().toLowerCase();

  return suratTugasRows.value.find((surat) => {
    if (!isSuratTugasMurid(surat)) return false;

    const perihal = String(surat.perihal || "").toLowerCase();
    const ditujukan = String(surat.ditujukan_kepada || "").toLowerCase();
    const matchByNis = Boolean(targetNis) && (perihal.includes(targetNis) || ditujukan.includes(targetNis));
    const matchByNama = Boolean(targetNama) && (perihal.includes(targetNama) || ditujukan === targetNama);

    return matchByNis || matchByNama;
  });
}

async function fetchKepalaSekolah() {
  const guruRes = await guruApi.getAllGuru({ page: 1, limit: 1000, penandatangan: true });

  if (!guruRes.success || !guruRes.data?.data?.length) {
    throw new Error("Data penandatangan kepala sekolah tidak ditemukan");
  }

  const activeSigners = guruRes.data.data.filter((guru) => guru.status_aktif !== false);
  const preferred = activeSigners.find((guru) => {
    const nama = String(guru.nama_guru || "").toLowerCase();
    const jabatan = String((guru as unknown as { jabatan?: string }).jabatan || "").toLowerCase();
    return nama.includes("kepala sekolah") || jabatan.includes("kepala sekolah");
  });

  if (!preferred?.id_guru) {
    throw new Error("Guru penandatangan dengan jabatan kepala sekolah belum ditemukan");
  }

  kepalaSekolahId.value = preferred.id_guru;
  kepalaSekolahNama.value = preferred.nama_guru || "Kepala Sekolah";
}

async function fetchSuratTugasRows() {
  const suratRes = await suratKeluarApi.getAll({ page: 1, limit: 1000 });

  if (!suratRes.success || !suratRes.data) {
    throw new Error(suratRes.message || "Gagal memuat data surat tugas");
  }

  suratTugasRows.value = (suratRes.data.data || []).filter((item) => isSuratTugasMurid(item));
}

async function fetchPlottedStudents() {
  const penempatanRes = await penempatanApi.getAll({ page: 1, limit: 1000 });

  if (!penempatanRes.success) {
    throw new Error(penempatanRes.message || "Gagal memuat data penempatan");
  }

  const placements = (penempatanRes.data || []).filter(
    (item) => String(item.status_penempatan || "") === "aktif" && item.siswa,
  );

  studentData.value = placements.map((item) => {
    const relatedSurat = inferSuratForSiswa(item.siswa?.nis || "", item.siswa?.nama_siswa || "");

    return {
      id: item.id_penempatan,
      id_siswa: item.siswa_id,
      nama: item.siswa?.nama_siswa || "-",
      nis: item.siswa?.nis || "-",
      kelas: item.siswa?.kelas?.nama_kelas || "-",
      industri: item.perusahaan?.nama_perusahaan || "-",
      alamat: item.perusahaan?.alamat || "-",
      periode: formatPeriode(item.tanggal_mulai, item.tanggal_selesai),
      durasi: calculateDuration(item.tanggal_mulai, item.tanggal_selesai),
      isTerbit: Boolean(relatedSurat),
      docxPath: normalizeFilePath(relatedSurat?.file_surat_docx),
      pdfPath: normalizeFilePath(relatedSurat?.file_surat_pdf || relatedSurat?.file_surat),
      selected: false,
    };
  });

  selectAll.value = false;
}

async function fetchAll() {
  loading.value = true;
  try {
    await fetchKepalaSekolah();
    await fetchSuratTugasRows();
    await fetchPlottedStudents();
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat data",
      description: error?.message || "Terjadi kesalahan saat memuat halaman",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

function toggleSelectAll() {
  filteredStudents.value.forEach((item) => {
    item.selected = selectAll.value;
  });
}

function clearSelections() {
  studentData.value.forEach((item) => {
    item.selected = false;
  });
  selectAll.value = false;
}

async function generateSelected() {
  if (!kepalaSekolahId.value) {
    toast.add({
      title: "Penandatangan kepala sekolah belum tersedia",
      color: "error",
    });
    return;
  }

  const targets = selectedRows.value;
  if (targets.length === 0) {
    toast.add({
      title: "Pilih minimal 1 siswa",
      color: "warning",
    });
    return;
  }

  generating.value = true;

  try {
    let successCount = 0;

    for (const row of targets) {
      const nomorRes = await suratKeluarApi.generateNomor("surat_keluar");
      if (!nomorRes.success || !nomorRes.data?.nomor_surat) {
        throw new Error(nomorRes.message || `Gagal generate nomor surat untuk ${row.nama}`);
      }

      const createRes = await suratKeluarApi.create({
        nomor_surat: nomorRes.data.nomor_surat,
        tanggal_surat: new Date().toISOString(),
        ditujukan_kepada: row.nama,
        alamat_tujuan: row.alamat,
        perihal: `Pelaksanaan PKL a.n. ${row.nama} (${row.nis})`,
        klasifikasi_surat: "lainnya",
        sifat_surat: "biasa",
        isi_lampiran: `Penempatan PKL ${row.periode}`,
        template_jenis: "surat_tugas_murid",
        template_payload: {
          siswa: [
            {
              id_siswa: row.id_siswa,
              nama: row.nama,
              nis: row.nis,
              kelas: row.kelas,
            },
          ],
        },
        penandatangan_guru_id: kepalaSekolahId.value,
      });

      if (!createRes.success) {
        throw new Error(createRes.message || `Gagal membuat surat tugas untuk ${row.nama}`);
      }

      const generatedSurat = createRes.data as SuratKeluar | undefined;
      const generatedDocx = normalizeFilePath(generatedSurat?.file_surat_docx);
      const generatedPdf = normalizeFilePath(generatedSurat?.file_surat_pdf || generatedSurat?.file_surat);

      row.isTerbit = true;
      row.docxPath = generatedDocx;
      row.pdfPath = generatedPdf;
      row.selected = false;

      if (generatedSurat) {
        const generatedId = String((generatedSurat as { id?: string }).id || "");
        suratTugasRows.value = [
          generatedSurat,
          ...suratTugasRows.value.filter((item) => {
            if (generatedId) {
              return String((item as { id?: string }).id || "") !== generatedId;
            }
            return item.nomor_surat !== generatedSurat.nomor_surat;
          }),
        ];
      }

      successCount += 1;
    }

    toast.add({
      title: "Generate surat berhasil",
      description: `${successCount} surat tugas murid berhasil dibuat dan ditandatangani ${kepalaSekolahNama.value}`,
      color: "success",
    });

    clearSelections();
    await fetchAll();
  } catch (error: any) {
    toast.add({
      title: "Generate surat gagal",
      description: error?.message || "Terjadi kesalahan saat membuat surat tugas murid",
      color: "error",
    });
  } finally {
    generating.value = false;
  }
}

onMounted(() => {
  fetchAll();
});

useHead({
  title: "Surat Tugas PKL Murid | Admin",
});
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <div class="bg-white rounded-3xl shadow-sm p-8 border border-slate-100 space-y-6">
      <div class="flex items-center gap-6">
        <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-100 shadow-inner">
          <img src="/assets/img/logo-skanda.png" alt="Logo" class="w-14 h-14 object-contain" />
        </div>
        <div class="space-y-1">
          <h1 class="text-3xl font-black text-blue-600 tracking-tight uppercase">MANAJEMEN SURAT TUGAS PKL : MURID</h1>
          <div class="flex items-center gap-3">
            <span class="bg-blue-600 text-white text-[10px] px-4 py-1 rounded font-black uppercase tracking-widest">SMK Gita Laras</span>
            <div class="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
              <Icon name="lucide:pen-square" class="w-4 h-4" />
              TTD: {{ kepalaSekolahNama }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 flex items-start gap-3 rounded-r-xl">
        <Icon name="lucide:alert-circle" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p class="text-xs text-amber-800 leading-relaxed font-bold">
          <span class="text-red-600 uppercase">Penting:</span>
          Pilih siswa yang sudah terplot ke mitra, lalu generate surat tugas PKL untuk membuat file DOCX/PDF otomatis.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 flex flex-wrap items-center gap-3">
      <button
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
        :disabled="generating"
        @click="generateSelected"
      >
        <Icon name="lucide:zap" class="w-4 h-4" />
        {{ generating ? "GENERATING..." : "GENERATE TERPILIH" }}
      </button>

      <button
        class="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all"
        :disabled="loading"
        @click="fetchAll"
      >
        <Icon name="lucide:refresh-cw" class="w-5 h-5" />
      </button>

      <div class="relative">
        <select
          v-model="selectedPlotFilter"
          class="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <option v-for="plot in plottedOptions" :key="plot" :value="plot">{{ plot }}</option>
        </select>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div class="relative">
        <select
          v-model="selectedDokumenFilter"
          class="appearance-none bg-white border border-blue-200 rounded-xl pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <option value="SEMUA DOKUMEN">SEMUA DOKUMEN</option>
          <option value="SUDAH TERBIT">SUDAH TERBIT</option>
          <option value="BELUM TERBIT">BELUM TERBIT</option>
        </select>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div class="flex-1 min-w-[200px] relative">
        <input
          v-model="search"
          type="text"
          placeholder="Cari nama, NIS, atau industri..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-xs text-slate-400">{{ pageSummary }}</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <th class="px-8 py-5 w-12">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </th>
              <th class="px-4 py-5">IDENTITAS SISWA</th>
              <th class="px-6 py-5">INDUSTRI & ALAMAT</th>
              <th class="px-6 py-5">PERIODE & DURASI</th>
              <th class="px-6 py-5">DOKUMEN</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-10 text-center text-slate-500">Memuat data siswa terplot...</td>
            </tr>
            <tr v-else-if="filteredStudents.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-slate-500">Belum ada data siswa terplot yang sesuai filter.</td>
            </tr>
            <tr v-for="student in filteredStudents" v-else :key="student.id" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-8 py-6">
                <input type="checkbox" v-model="student.selected" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </td>
              <td class="px-4 py-6">
                <div class="space-y-1">
                  <div class="font-black text-slate-800 text-sm tracking-tight">{{ student.nama }}</div>
                  <div class="text-[10px] font-bold text-slate-400">NIS: {{ student.nis }} | {{ student.kelas }}</div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1.5 max-w-[350px]">
                  <div class="font-bold text-blue-600 text-sm tracking-tight">{{ student.industri }}</div>
                  <div class="flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed italic">
                    <Icon name="lucide:map-pin" class="w-3 h-3 shrink-0 mt-0.5" />
                    {{ student.alamat }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-2">
                  <div class="font-bold text-slate-700 text-xs">{{ student.periode }}</div>
                  <div class="flex items-center gap-1.5 text-green-600 font-black text-[9px] uppercase tracking-wider">
                    <Icon name="lucide:clock" class="w-3.5 h-3.5" />
                    Durasi: {{ student.durasi }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div v-if="student.isTerbit" class="flex items-center gap-2">
                  <button
                    class="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase hover:bg-blue-100 transition-all"
                    @click="downloadFile(student.docxPath)"
                  >
                    DOCX
                  </button>
                  <button
                    class="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-black uppercase hover:bg-red-100 transition-all"
                    @click="downloadFile(student.pdfPath)"
                  >
                    PDF
                  </button>
                </div>
                <div v-else>
                  <span class="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">Belum Terbit</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM KEMITRAAN &copy; 2026 | SMKN 7 SEMARANG</p>
    </div>
  </div>
</template>

<style scoped>
table thead th {
  background-color: #f8fafc;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
