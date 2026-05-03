<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePerusahaanApi, type Perusahaan } from "~/composables/api/use-partner";
import { useSiswaApi, useTahunAjaranApi, type Siswa } from "~/composables/api/use-academic";
import { useGuruApi, type GuruProfile } from "~/composables/api/use-guru";
import {
  useSuratKeluar,
  type SuratKeluar,
  type SuratKeluarStatus,
} from "~/composables/api/use-surat-keluar";
import { buildStoredFileUrl, normalizeStoredFileRef } from "~/utils/stored-file";

definePageMeta({
  layout: "admin",
});

interface SelectedStudent {
  id_siswa: string;
  nama: string;
  nis: string;
  kelas: string;
}

const toast = useToast();

const perusahaanApi = usePerusahaanApi();
const siswaApi = useSiswaApi();
const tahunAjaranApi = useTahunAjaranApi();
const guruApi = useGuruApi();
const suratKeluarApi = useSuratKeluar();

const loadingData = ref(true);
const loadingLetters = ref(false);
const submitting = ref(false);

const perusahaanList = ref<Perusahaan[]>([]);
const siswaList = ref<Siswa[]>([]);
const penandatanganList = ref<GuruProfile[]>([]);
const suratRows = ref<SuratKeluar[]>([]);
const tahunAjaranAktif = ref("-");

const selectedStudentIds = ref<string[]>([]);
const suratSearch = ref("");
const activeStatusFilter = ref<"semua" | SuratKeluarStatus>("semua");

const form = ref({
  perusahaanId: "",
  penandatanganGuruId: "",
  filterKelas: "",
  searchSiswa: "",
  periodeMulai: "",
  periodeSelesai: "",
  perihal: "",
  isiLampiran: "",
});

const statusOptions: Array<{ label: string; value: "semua" | SuratKeluarStatus }> = [
  { label: "Semua", value: "semua" },
  { label: "Draft", value: "draft" },
  { label: "Dikirim", value: "dikirim" },
  { label: "Diterima", value: "diterima" },
];

const selectedCompany = computed(() =>
  perusahaanList.value.find((item) => item.id_perusahaan === form.value.perusahaanId),
);

const selectedSigner = computed(() =>
  penandatanganList.value.find((item) => item.id_guru === form.value.penandatanganGuruId),
);

const classOptions = computed(() => {
  const classes = new Set<string>();

  for (const siswa of siswaList.value) {
    const classLabel = getStudentClassLabel(siswa);
    if (classLabel !== "-") {
      classes.add(classLabel);
    }
  }

  return Array.from(classes).sort((left, right) => left.localeCompare(right));
});

const selectedStudents = computed<SelectedStudent[]>(() => {
  return selectedStudentIds.value
    .map((id) => siswaList.value.find((item) => item.id_siswa === id))
    .filter((item): item is Siswa => Boolean(item))
    .map((item) => ({
      id_siswa: item.id_siswa,
      nama: item.nama_siswa,
      nis: item.nis,
      kelas: getStudentClassLabel(item),
    }));
});

const activeStudentRequestIds = computed(() => {
  const ids = new Set<string>();

  for (const surat of suratRows.value) {
    if (surat.status === "diterima" || !isSuratPermohonan(surat)) {
      continue;
    }

    for (const siswa of extractStudentsFromSurat(surat)) {
      if (siswa.id_siswa) {
        ids.add(siswa.id_siswa);
      }
    }
  }

  return ids;
});

const blockedStudentCount = computed(() => activeStudentRequestIds.value.size);

const availableStudents = computed(() => {
  const keyword = form.value.searchSiswa.trim().toLowerCase();
  const selectedIds = new Set(selectedStudentIds.value);

  return siswaList.value.filter((item) => {
    const kelas = getStudentClassLabel(item);
    const matchKelas = !form.value.filterKelas || kelas === form.value.filterKelas;
    const matchKeyword =
      !keyword ||
      item.nama_siswa.toLowerCase().includes(keyword) ||
      item.nis.toLowerCase().includes(keyword) ||
      kelas.toLowerCase().includes(keyword);

    return (
      matchKelas &&
      matchKeyword &&
      !selectedIds.has(item.id_siswa) &&
      !activeStudentRequestIds.value.has(item.id_siswa)
    );
  });
});

const filteredSuratRows = computed(() => {
  const keyword = suratSearch.value.trim().toLowerCase();

  return suratRows.value.filter((item) => {
    const matchStatus =
      activeStatusFilter.value === "semua" || item.status === activeStatusFilter.value;

    const siswaText = extractStudentsFromSurat(item)
      .map((siswa) => [siswa.nama, siswa.nis, siswa.kelas].filter(Boolean).join(" "))
      .join(" ")
      .toLowerCase();

    const matchKeyword =
      !keyword ||
      String(item.nomor_surat || "").toLowerCase().includes(keyword) ||
      String(item.ditujukan_kepada || "").toLowerCase().includes(keyword) ||
      String(item.perihal || "").toLowerCase().includes(keyword) ||
      siswaText.includes(keyword);

    return matchStatus && matchKeyword;
  });
});

const letterStats = computed(() => {
  const stats = {
    total: suratRows.value.length,
    draft: 0,
    dikirim: 0,
    diterima: 0,
    totalSiswa: 0,
  };

  for (const surat of suratRows.value) {
    if (surat.status === "draft") stats.draft += 1;
    if (surat.status === "dikirim") stats.dikirim += 1;
    if (surat.status === "diterima") stats.diterima += 1;
    stats.totalSiswa += extractStudentsFromSurat(surat).length;
  }

  return stats;
});

function getStudentClassLabel(item: Siswa) {
  const kelas = String(item.kelas?.nama_kelas || "").trim();
  if (kelas) return kelas;

  const fallbackKode = String(item.kelas?.kode_tingkat || "").trim();
  const jurusan = String(item.kelas?.jurusan?.nama_jurusan || "").trim();
  if (fallbackKode && jurusan) {
    return `${fallbackKode} ${jurusan}`;
  }

  return fallbackKode || jurusan || "-";
}

function isSuratPermohonan(surat: SuratKeluar) {
  const templateJenis = String(surat.template_jenis || "").toLowerCase();
  return templateJenis === "surat_permohonan" || surat.klasifikasi_surat === "permohonan";
}

function extractStudentsFromSurat(surat: SuratKeluar) {
  return Array.isArray(surat.template_payload?.siswa) ? surat.template_payload.siswa : [];
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";

  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatusLabel(status: SuratKeluarStatus) {
  if (status === "draft") return "Draft";
  if (status === "dikirim") return "Dikirim";
  return "Diterima";
}

function statusBadgeClass(status: SuratKeluarStatus) {
  if (status === "draft") return "bg-amber-100 text-amber-700 border border-amber-200";
  if (status === "dikirim") return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
}

function buildDefaultPerihal() {
  const companyName = selectedCompany.value?.nama_perusahaan || "IDUKA tujuan";
  const jumlahSiswa = selectedStudents.value.length;
  const suffix = jumlahSiswa > 0 ? ` untuk ${jumlahSiswa} siswa` : "";

  return `Permohonan Praktik Kerja Lapangan (PKL)${suffix} di ${companyName}`;
}

function buildDefaultLampiran() {
  const lampiran = [
    `Tahun Ajaran: ${tahunAjaranAktif.value || "-"}`,
    `Jumlah Siswa: ${selectedStudents.value.length}`,
  ];

  if (form.value.periodeMulai && form.value.periodeSelesai) {
    lampiran.push(
      `Periode PKL: ${formatDate(form.value.periodeMulai)} s.d. ${formatDate(form.value.periodeSelesai)}`,
    );
  }

  if (selectedStudents.value.length > 0) {
    lampiran.push(
      `Daftar Siswa: ${selectedStudents.value.map((item) => `${item.nama} (${item.kelas})`).join(", ")}`,
    );
  }

  return lampiran.join("\n");
}

function normalizeFilePath(path?: string | null) {
  return normalizeStoredFileRef(path);
}

function downloadFile(path?: string | null) {
  const normalizedPath = normalizeFilePath(path);
  if (!normalizedPath) return;

  const link = document.createElement("a");
  link.href = buildStoredFileUrl(normalizedPath);
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function addStudent(id: string) {
  if (!selectedStudentIds.value.includes(id)) {
    selectedStudentIds.value = [...selectedStudentIds.value, id];
  }
}

function removeStudent(id: string) {
  selectedStudentIds.value = selectedStudentIds.value.filter((item) => item !== id);
}

function resetForm() {
  form.value = {
    perusahaanId: "",
    penandatanganGuruId: form.value.penandatanganGuruId,
    filterKelas: "",
    searchSiswa: "",
    periodeMulai: "",
    periodeSelesai: "",
    perihal: "",
    isiLampiran: "",
  };
  selectedStudentIds.value = [];
}

async function loadLetters(showErrorToast = false) {
  loadingLetters.value = true;

  try {
    const response = await suratKeluarApi.getAll({
      page: 1,
      limit: 1000,
      klasifikasi_surat: "permohonan",
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || "Gagal memuat surat permohonan");
    }

    suratRows.value = (response.data.data || []).filter((item) => isSuratPermohonan(item));
  } catch (error: any) {
    if (showErrorToast) {
      toast.add({
        title: "Gagal memuat data surat",
        description: error?.message || "Terjadi kesalahan saat memuat surat permohonan",
        color: "error",
      });
    }
  } finally {
    loadingLetters.value = false;
  }
}

async function loadInitialData() {
  loadingData.value = true;

  try {
    const [perusahaanRes, siswaRes, guruRes, tahunAjaranRes, suratRes] = await Promise.all([
      perusahaanApi.getAll({
        page: 1,
        limit: 1000,
        mou_aktif: true,
        arsip: false,
      }),
      siswaApi.getAll({
        page: 1,
        limit: 1000,
        pkl_status: "unplaced",
      }),
      guruApi.getAllGuru({
        page: 1,
        limit: 1000,
        penandatangan: true,
      }),
      tahunAjaranApi.getActive(),
      suratKeluarApi.getAll({
        page: 1,
        limit: 1000,
        klasifikasi_surat: "permohonan",
      }),
    ]);

    perusahaanList.value = [...(perusahaanRes.data || [])].sort((left, right) =>
      String(left.nama_perusahaan || "").localeCompare(String(right.nama_perusahaan || "")),
    );

    siswaList.value = [...(siswaRes.data || [])].sort((left, right) =>
      String(left.nama_siswa || "").localeCompare(String(right.nama_siswa || "")),
    );

    if (!guruRes.success) {
      throw new Error(guruRes.message || "Gagal memuat guru penandatangan");
    }

    penandatanganList.value = [...(guruRes.data?.data || [])]
      .filter((item) => item.status_aktif !== false)
      .sort((left, right) =>
        String(left.nama_guru || "").localeCompare(String(right.nama_guru || "")),
      );

    if (!form.value.penandatanganGuruId && penandatanganList.value.length > 0) {
      form.value.penandatanganGuruId = penandatanganList.value[0].id_guru;
    }

    tahunAjaranAktif.value = String(tahunAjaranRes.data?.nama_tahun_ajaran || "-");

    if (!suratRes.success || !suratRes.data) {
      throw new Error(suratRes.message || "Gagal memuat surat permohonan");
    }

    suratRows.value = (suratRes.data.data || []).filter((item) => isSuratPermohonan(item));
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat halaman",
      description: error?.message || "Terjadi kesalahan saat sinkronisasi data frontend dan backend",
      color: "error",
    });
  } finally {
    loadingData.value = false;
  }
}

async function submitSuratPermohonan() {
  if (!selectedCompany.value) {
    toast.add({
      title: "Pilih perusahaan tujuan",
      color: "warning",
    });
    return;
  }

  if (!form.value.penandatanganGuruId) {
    toast.add({
      title: "Pilih guru penandatangan",
      color: "warning",
    });
    return;
  }

  if (!form.value.periodeMulai || !form.value.periodeSelesai) {
    toast.add({
      title: "Lengkapi periode PKL",
      color: "warning",
    });
    return;
  }

  if (selectedStudents.value.length === 0) {
    toast.add({
      title: "Pilih minimal 1 siswa",
      color: "warning",
    });
    return;
  }

  submitting.value = true;

  try {
    const nomorRes = await suratKeluarApi.generateNomor("surat_keluar");
    if (!nomorRes.success || !nomorRes.data?.nomor_surat) {
      throw new Error(nomorRes.message || "Gagal menghasilkan nomor surat");
    }

    const createRes = await suratKeluarApi.create({
      nomor_surat: nomorRes.data.nomor_surat,
      tanggal_surat: new Date().toISOString(),
      ditujukan_kepada: selectedCompany.value.nama_perusahaan,
      alamat_tujuan: selectedCompany.value.alamat || "",
      perihal: form.value.perihal.trim() || buildDefaultPerihal(),
      klasifikasi_surat: "permohonan",
      sifat_surat: "biasa",
      isi_lampiran: form.value.isiLampiran.trim() || buildDefaultLampiran(),
      template_jenis: "surat_permohonan",
      template_payload: {
        perusahaan_id: selectedCompany.value.id_perusahaan,
        nama_perusahaan: selectedCompany.value.nama_perusahaan,
        siswa: selectedStudents.value.map((item) => ({
          id_siswa: item.id_siswa,
          nama: item.nama,
          nis: item.nis,
          kelas: item.kelas,
        })),
      },
      penandatangan_guru_id: form.value.penandatanganGuruId,
    });

    if (!createRes.success) {
      throw new Error(createRes.message || "Gagal membuat surat permohonan");
    }

    toast.add({
      title: "Surat permohonan berhasil dibuat",
      description: `Dokumen untuk ${selectedCompany.value.nama_perusahaan} berhasil digenerate`,
      color: "success",
    });

    resetForm();
    await loadLetters();
  } catch (error: any) {
    toast.add({
      title: "Gagal membuat surat permohonan",
      description: error?.message || "Terjadi kesalahan saat membuat surat permohonan",
      color: "error",
    });
  } finally {
    submitting.value = false;
  }
}

async function updateLetterStatus(surat: SuratKeluar, nextStatus: SuratKeluarStatus) {
  const actionLabel = formatStatusLabel(nextStatus).toLowerCase();
  const confirmed = window.confirm(
    `Ubah status surat ${surat.nomor_surat} menjadi ${actionLabel}?`,
  );

  if (!confirmed) {
    return;
  }

  const response = await suratKeluarApi.updateStatus(surat.id, nextStatus);
  if (!response.success) {
    toast.add({
      title: "Gagal memperbarui status",
      description: response.message || "Status surat tidak berhasil diperbarui",
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Status surat diperbarui",
    description: `${surat.nomor_surat} sekarang berstatus ${actionLabel}`,
    color: "success",
  });

  await loadLetters();
}

async function deleteLetter(surat: SuratKeluar) {
  const confirmed = window.confirm(`Hapus surat ${surat.nomor_surat}?`);
  if (!confirmed) {
    return;
  }

  const response = await suratKeluarApi.remove(surat.id);
  if (!response.success) {
    toast.add({
      title: "Gagal menghapus surat",
      description: response.message || "Surat tidak berhasil dihapus",
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Surat dihapus",
    description: `${surat.nomor_surat} telah dihapus dari daftar`,
    color: "success",
  });

  await loadLetters();
}

onMounted(() => {
  loadInitialData();
});

useHead({
  title: "Surat Permohonan PKL IDUKA | Admin",
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6 font-sans">
    <div class="space-y-6">
      <div class="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-5">
            <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-blue-100 bg-blue-50 shadow-inner">
              <img src="/assets/img/logo-skanda.png" alt="Logo" class="h-14 w-14 object-contain" />
            </div>
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">SIAP PKL</span>
                <span class="rounded-full bg-slate-100 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">IDUKA</span>
              </div>
              <h1 class="text-3xl font-black uppercase tracking-tight text-slate-900">
                Surat Permohonan PKL ke Dunia Industri
              </h1>
              <p class="max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
                Halaman ini sekarang langsung sinkron dengan backend `surat-keluar`, master perusahaan
                bermoU aktif, data siswa belum ditempatkan, dan guru penandatangan.
              </p>
            </div>
          </div>

          <div class="grid min-w-[280px] grid-cols-2 gap-3">
            <div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">Mitra Siap PKL</div>
              <div class="mt-2 text-3xl font-black text-blue-700">{{ perusahaanList.length }}</div>
            </div>
            <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500">Siswa Siap Ajukan</div>
              <div class="mt-2 text-3xl font-black text-emerald-700">{{ siswaList.length }}</div>
            </div>
            <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Surat Draft</div>
              <div class="mt-2 text-3xl font-black text-amber-700">{{ letterStats.draft }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-100 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Surat Aktif</div>
              <div class="mt-2 text-3xl font-black text-slate-700">{{ letterStats.total }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-black uppercase tracking-[0.25em] text-slate-700">
                  Generate Surat Permohonan
                </h2>
                <p class="mt-1 text-xs font-medium text-slate-500">
                  Backend akan membuat nomor surat, menyimpan data, dan menghasilkan file DOCX/PDF.
                </p>
              </div>
              <div class="rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                Tahun Ajaran: {{ tahunAjaranAktif }}
              </div>
            </div>
          </div>

          <div class="space-y-6 p-6">
            <div v-if="loadingData" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Memuat master perusahaan, siswa, penandatangan, dan data surat...
            </div>

            <template v-else>
              <div class="grid gap-5 md:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Perusahaan / IDUKA Tujuan
                  </label>
                  <select
                    v-model="form.perusahaanId"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Pilih perusahaan bermoU aktif</option>
                    <option
                      v-for="item in perusahaanList"
                      :key="item.id_perusahaan"
                      :value="item.id_perusahaan"
                    >
                      {{ item.nama_perusahaan }}
                    </option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Guru Penandatangan
                  </label>
                  <select
                    v-model="form.penandatanganGuruId"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Pilih penandatangan</option>
                    <option v-for="guru in penandatanganList" :key="guru.id_guru" :value="guru.id_guru">
                      {{ guru.nama_guru }}
                    </option>
                  </select>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Alamat Tujuan
                  </label>
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                    {{ selectedCompany?.alamat || "Alamat perusahaan akan tampil otomatis di sini." }}
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Periode PKL Mulai
                  </label>
                  <input
                    v-model="form.periodeMulai"
                    type="date"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Periode PKL Selesai
                  </label>
                  <input
                    v-model="form.periodeSelesai"
                    type="date"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Perihal Surat
                  </label>
                  <textarea
                    v-model="form.perihal"
                    rows="3"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Kosongkan jika ingin memakai format otomatis."
                  />
                  <p class="text-xs text-slate-400">
                    Preview otomatis: {{ buildDefaultPerihal() }}
                  </p>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Lampiran / Keterangan Surat
                  </label>
                  <textarea
                    v-model="form.isiLampiran"
                    rows="5"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Kosongkan jika ingin memakai ringkasan otomatis."
                  />
                  <p class="whitespace-pre-line rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium leading-relaxed text-slate-500">
                    {{ buildDefaultLampiran() }}
                  </p>
                </div>
              </div>

              <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 class="text-sm font-black uppercase tracking-[0.25em] text-slate-700">
                      Pemilihan Siswa
                    </h3>
                    <p class="mt-1 text-xs font-medium text-slate-500">
                      Siswa yang sudah punya permohonan aktif tidak akan ditampilkan lagi.
                    </p>
                  </div>
                  <div class="rounded-full bg-rose-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-rose-600">
                    Terkunci oleh permohonan aktif: {{ blockedStudentCount }}
                  </div>
                </div>

                <div class="mt-5 grid gap-3 md:grid-cols-[220px_1fr]">
                  <select
                    v-model="form.filterKelas"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Semua kelas</option>
                    <option v-for="kelas in classOptions" :key="kelas" :value="kelas">
                      {{ kelas }}
                    </option>
                  </select>

                  <input
                    v-model="form.searchSiswa"
                    type="text"
                    placeholder="Cari nama siswa, NIS, atau kelas..."
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div class="mt-5 grid gap-5 xl:grid-cols-2">
                  <div class="rounded-3xl border border-slate-200 bg-white">
                    <div class="border-b border-slate-100 px-5 py-4">
                      <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                        Siswa Tersedia ({{ availableStudents.length }})
                      </div>
                    </div>
                    <div class="custom-scrollbar max-h-[340px] space-y-3 overflow-y-auto p-4">
                      <div
                        v-if="availableStudents.length === 0"
                        class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
                      >
                        Tidak ada siswa yang cocok dengan filter saat ini.
                      </div>

                      <div
                        v-for="item in availableStudents"
                        :key="item.id_siswa"
                        class="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div class="min-w-0 space-y-1">
                          <div class="truncate text-sm font-black text-slate-800">
                            {{ item.nama_siswa }}
                          </div>
                          <div class="text-xs font-medium text-slate-500">
                            NIS {{ item.nis }} • {{ getStudentClassLabel(item) }}
                          </div>
                        </div>
                        <button
                          class="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-700"
                          @click="addStudent(item.id_siswa)"
                        >
                          Pilih
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-rose-200 bg-white">
                    <div class="border-b border-rose-100 px-5 py-4">
                      <div class="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">
                        Siswa Terpilih ({{ selectedStudents.length }})
                      </div>
                    </div>
                    <div class="custom-scrollbar max-h-[340px] space-y-3 overflow-y-auto p-4">
                      <div
                        v-if="selectedStudents.length === 0"
                        class="rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-500"
                      >
                        Belum ada siswa yang dipilih.
                      </div>

                      <div
                        v-for="item in selectedStudents"
                        :key="item.id_siswa"
                        class="flex items-start justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3"
                      >
                        <div class="min-w-0 space-y-1">
                          <div class="truncate text-sm font-black text-slate-800">
                            {{ item.nama }}
                          </div>
                          <div class="text-xs font-medium text-slate-500">
                            NIS {{ item.nis }} • {{ item.kelas }}
                          </div>
                        </div>
                        <button
                          class="shrink-0 rounded-xl border border-rose-200 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-100"
                          @click="removeStudent(item.id_siswa)"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                <div class="space-y-1">
                  <div class="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">
                    Siap Diproses
                  </div>
                  <div class="text-sm font-medium text-blue-700">
                    Tujuan: {{ selectedCompany?.nama_perusahaan || "-" }} • Penandatangan:
                    {{ selectedSigner?.nama_guru || "-" }}
                  </div>
                </div>

                <button
                  class="rounded-2xl bg-blue-700 px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  :disabled="submitting"
                  @click="submitSuratPermohonan"
                >
                  {{ submitting ? "Menyimpan..." : "Generate Surat Permohonan" }}
                </button>
              </div>
            </template>
          </div>
        </div>

        <div class="space-y-6">
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Total Surat</div>
              <div class="mt-3 text-4xl font-black text-slate-900">{{ letterStats.total }}</div>
            </div>
            <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Total Siswa Terlampir</div>
              <div class="mt-3 text-4xl font-black text-slate-900">{{ letterStats.totalSiswa }}</div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Ringkasan Status</div>
            <div class="mt-4 grid grid-cols-3 gap-3 text-center">
              <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Draft</div>
                <div class="mt-2 text-3xl font-black text-amber-700">{{ letterStats.draft }}</div>
              </div>
              <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Dikirim</div>
                <div class="mt-2 text-3xl font-black text-blue-700">{{ letterStats.dikirim }}</div>
              </div>
              <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Diterima</div>
                <div class="mt-2 text-3xl font-black text-emerald-700">{{ letterStats.diterima }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 class="text-sm font-black uppercase tracking-[0.25em] text-slate-700">
                Data Surat Permohonan IDUKA
              </h2>
              <p class="mt-1 text-xs font-medium text-slate-500">
                Menampilkan data nyata dari backend dengan status `draft`, `dikirim`, dan `diterima`.
              </p>
            </div>

            <div class="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="item in statusOptions"
                  :key="item.value"
                  class="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition"
                  :class="
                    activeStatusFilter === item.value
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                  "
                  @click="activeStatusFilter = item.value"
                >
                  {{ item.label }}
                </button>
              </div>

              <div class="flex items-center gap-3">
                <input
                  v-model="suratSearch"
                  type="text"
                  placeholder="Cari nomor, tujuan, atau siswa..."
                  class="w-full min-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  class="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
                  :disabled="loadingLetters"
                  @click="loadLetters(true)"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1200px] border-collapse text-left">
            <thead>
              <tr class="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                <th class="px-6 py-5">Nomor Surat</th>
                <th class="px-6 py-5">Perusahaan Tujuan</th>
                <th class="px-6 py-5">Daftar Siswa</th>
                <th class="px-6 py-5">Periode / Lampiran</th>
                <th class="px-6 py-5">Dokumen</th>
                <th class="px-6 py-5">Status</th>
                <th class="px-6 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loadingLetters">
                <td colspan="7" class="px-6 py-10 text-center text-sm text-slate-500">
                  Memuat surat permohonan...
                </td>
              </tr>
              <tr v-else-if="filteredSuratRows.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-sm text-slate-500">
                  Belum ada surat permohonan yang sesuai filter.
                </td>
              </tr>
              <tr
                v-for="surat in filteredSuratRows"
                v-else
                :key="surat.id"
                class="align-top transition hover:bg-slate-50/70"
              >
                <td class="px-6 py-6">
                  <div class="space-y-2">
                    <div class="text-sm font-black text-slate-900">{{ surat.nomor_surat }}</div>
                    <div class="text-xs font-medium text-slate-500">
                      Tanggal surat: {{ formatDate(surat.tanggal_surat) }}
                    </div>
                    <div class="text-xs font-medium text-slate-400">
                      Penandatangan: {{ surat.penandatangan || "-" }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="max-w-[280px] space-y-2">
                    <div class="text-sm font-black leading-snug text-blue-700">
                      {{ surat.ditujukan_kepada }}
                    </div>
                    <div class="text-xs font-medium italic leading-relaxed text-slate-500">
                      {{ surat.alamat_tujuan || "Alamat belum tercatat" }}
                    </div>
                    <div class="text-xs font-medium leading-relaxed text-slate-500">
                      {{ surat.perihal }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="space-y-2">
                    <div
                      v-for="student in extractStudentsFromSurat(surat)"
                      :key="`${surat.id}-${student.id_siswa || student.nis}`"
                      class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div class="text-sm font-black text-slate-800">{{ student.nama }}</div>
                      <div class="text-xs font-medium text-slate-500">
                        NIS {{ student.nis }} • {{ student.kelas }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="max-w-[280px] whitespace-pre-line text-xs font-medium leading-relaxed text-slate-500">
                    {{ surat.isi_lampiran || "-" }}
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="flex flex-col gap-2">
                    <button
                      class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 transition hover:bg-blue-100"
                      :disabled="!normalizeFilePath(surat.file_surat_docx)"
                      @click="downloadFile(surat.file_surat_docx)"
                    >
                      Unduh DOCX
                    </button>
                    <button
                      class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-100"
                      :disabled="!normalizeFilePath(surat.file_surat_pdf || surat.file_surat)"
                      @click="downloadFile(surat.file_surat_pdf || surat.file_surat)"
                    >
                      Unduh PDF
                    </button>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <span
                    class="inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em]"
                    :class="statusBadgeClass(surat.status)"
                  >
                    {{ formatStatusLabel(surat.status) }}
                  </span>
                </td>
                <td class="px-6 py-6">
                  <div class="flex flex-col gap-2">
                    <button
                      v-if="surat.status === 'draft'"
                      class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 transition hover:bg-blue-100"
                      @click="updateLetterStatus(surat, 'dikirim')"
                    >
                      Tandai Dikirim
                    </button>
                    <button
                      v-if="surat.status === 'dikirim'"
                      class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 transition hover:bg-emerald-100"
                      @click="updateLetterStatus(surat, 'diterima')"
                    >
                      Tandai Diterima
                    </button>
                    <button
                      class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-100"
                      @click="deleteLetter(surat)"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
