<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  useJurnalGuruApi,
  type JurnalGuruLetter,
  type JurnalGuruOption,
  type JurnalGuruParticipant,
  type JurnalGuruStageSummary,
  type JurnalGuruTaskType,
} from "~/composables/api/use-jurnal-guru";
import { type SuratKeluarStatus } from "~/composables/api/use-surat-keluar";
import { buildStoredFileUrl, normalizeStoredFileRef } from "~/utils/stored-file";

definePageMeta({
  layout: "admin",
});

type TaskType = JurnalGuruTaskType;
type MonitoringStageFilter = "semua" | TaskType;
type MonitoringStageState = "empty" | SuratKeluarStatus;
type SummaryTone = "slate" | "amber" | "blue" | "emerald";

interface GroupedPlacement {
  targetKey: string;
  batchLabel: string;
  perusahaanId: string;
  perusahaanNama: string;
  alamat: string;
  periodeMulai: string;
  periodeSelesai: string;
  siswaCount: number;
  placementIds: string[];
  siswaSummary: string[];
  siswaDetails: JurnalGuruParticipant[];
  latestStatus: string;
  stageStatuses: Record<TaskType, JurnalGuruStageSummary>;
  letters: Record<TaskType, ParsedGuruTaskLetter[]>;
}

type ParsedGuruTaskLetter = JurnalGuruLetter;

interface ParticipantDetailState {
  title: string;
  subtitle: string;
  perusahaanNama: string;
  batchLabel: string;
  participants: JurnalGuruParticipant[];
  sourceLabel: string;
}

const toast = useToast();
const jurnalGuruApi = useJurnalGuruApi();

const loading = ref(true);
const submitting = ref(false);
const suratSearch = ref("");
const industriSearch = ref("");
const statusFilter = ref<"semua" | SuratKeluarStatus>("semua");
const stageFilter = ref<MonitoringStageFilter>("semua");

const placementRows = ref<GroupedPlacement[]>([]);
const taskLetters = ref<ParsedGuruTaskLetter[]>([]);
const guruPelaksanaList = ref<JurnalGuruOption[]>([]);
const guruPenandatanganList = ref<JurnalGuruOption[]>([]);

const modalOpen = ref(false);
const detailModalOpen = ref(false);
const activeTaskType = ref<TaskType>("penerjunan");
const activeTarget = ref<GroupedPlacement | null>(null);
const detailModalState = ref<ParticipantDetailState | null>(null);
const editingDraftLetter = ref<ParsedGuruTaskLetter | null>(null);
const expandedRows = ref<Set<string>>(new Set());

const form = ref({
  guruPelaksanaId: "",
  penandatanganId: "",
  tanggalMulai: "",
  tanggalSelesai: "",
});

function toggleRow(batchKey: string) {
  if (expandedRows.value.has(batchKey)) {
    expandedRows.value.delete(batchKey);
  } else {
    expandedRows.value.add(batchKey);
  }
}

function isRowExpanded(batchKey: string) {
  return expandedRows.value.has(batchKey);
}

const taskTypeLabels: Record<TaskType, string> = {
  penerjunan: "Penerjunan",
  monitoring: "Monitoring",
  penarikan: "Penarikan",
};

const stageColumns = [
  {
    key: "penerjunan" as const,
    orderLabel: "1",
    shortLabel: "Terjunan",
    emptyLabel: "Belum ada surat penerjunan",
  },
  {
    key: "monitoring" as const,
    orderLabel: "2",
    shortLabel: "Monitoring",
    emptyLabel: "Belum ada surat monitoring",
  },
  {
    key: "penarikan" as const,
    orderLabel: "3",
    shortLabel: "Penarikan",
    emptyLabel: "Belum ada surat penarikan",
  },
];

const selectedGuruPelaksana = computed(() =>
  guruPelaksanaList.value.find((item) => item.id_guru === form.value.guruPelaksanaId),
);

const isRevisionMode = computed(() => Boolean(editingDraftLetter.value));
const modalTitle = computed(() =>
  `${isRevisionMode.value ? "Revisi Draft Surat Tugas" : "Konfigurasi Surat Tugas"} ${getTaskTypeLabel(activeTaskType.value)}`,
);
const modalDescription = computed(() =>
  isRevisionMode.value
    ? "Perbarui data draft surat tugas, lalu sistem akan regenerate dokumen DOCX/PDF."
    : "Pilih guru pelaksana dan periode tugas sebelum generate surat.",
);
const modalSubmitLabel = computed(() => {
  if (submitting.value) {
    return isRevisionMode.value ? "Menyimpan Revisi..." : "Menyimpan...";
  }
  return isRevisionMode.value ? "Simpan Revisi Draft" : "Generate Surat Tugas";
});

const filteredPlacements = computed(() => {
  const keyword = industriSearch.value.trim().toLowerCase();
  if (!keyword) return placementRows.value;

  return placementRows.value.filter((item) => {
    const siswaText = item.siswaDetails
      .map((participant) => `${participant.nama_siswa} ${participant.kelas}`)
      .join(" ")
      .toLowerCase();

    return (
      item.perusahaanNama.toLowerCase().includes(keyword) ||
      item.alamat.toLowerCase().includes(keyword) ||
      item.batchLabel.toLowerCase().includes(keyword) ||
      siswaText.includes(keyword)
    );
  });
});

const filteredTaskLetters = computed(() => {
  const keyword = suratSearch.value.trim().toLowerCase();

  return taskLetters.value.filter((item) => {
    const matchStatus =
      statusFilter.value === "semua" || item.surat.status === statusFilter.value;
    const matchStage =
      stageFilter.value === "semua" || item.meta.task_type === stageFilter.value;
    const participantText = item.participants
      .map((participant) => `${participant.nama_siswa} ${participant.kelas}`)
      .join(" ")
      .toLowerCase();

    const matchKeyword =
      !keyword ||
      item.surat.nomor_surat.toLowerCase().includes(keyword) ||
      item.surat.perihal.toLowerCase().includes(keyword) ||
      item.meta.perusahaan_nama.toLowerCase().includes(keyword) ||
      item.meta.guru_pelaksana_nama.toLowerCase().includes(keyword) ||
      item.batch_label.toLowerCase().includes(keyword) ||
      participantText.includes(keyword);

    return matchStatus && matchStage && matchKeyword;
  });
});

const statusFilterOptions = computed(() => [
  { value: "semua" as const, label: "Semua", count: taskLetters.value.length },
  {
    value: "draft" as const,
    label: "Draft",
    count: taskLetters.value.filter((item) => item.surat.status === "draft").length,
  },
  {
    value: "dikirim" as const,
    label: "Dikirim",
    count: taskLetters.value.filter((item) => item.surat.status === "dikirim").length,
  },
  {
    value: "diterima" as const,
    label: "Diterima",
    count: taskLetters.value.filter((item) => item.surat.status === "diterima").length,
  },
]);

const stageFilterOptions = computed(() => [
  { value: "semua" as const, label: "Semua Tahap", count: taskLetters.value.length },
  ...stageColumns.map((stage) => ({
    value: stage.key,
    label: stage.shortLabel,
    count: taskLetters.value.filter((item) => item.meta.task_type === stage.key).length,
  })),
]);

function sortLettersByDate(items: ParsedGuruTaskLetter[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.surat.tanggal_surat).getTime() -
      new Date(left.surat.tanggal_surat).getTime(),
  );
}

function getLatestStageLetter(items: ParsedGuruTaskLetter[]) {
  return sortLettersByDate(items)[0];
}

function getStageState(items: ParsedGuruTaskLetter[]): MonitoringStageState {
  const latest = getLatestStageLetter(items);
  if (!latest) return "empty";
  return latest.surat.status;
}

function getStageStateLabel(state: MonitoringStageState) {
  if (state === "empty") return "Belum dibuat";
  if (state === "draft") return "Draft";
  if (state === "dikirim") return "Menunggu konfirmasi";
  return "Diterima";
}

function getStageDotClass(state: MonitoringStageState) {
  if (state === "empty") return "bg-slate-200";
  if (state === "draft") return "bg-slate-500";
  if (state === "dikirim") return "bg-blue-500";
  return "bg-emerald-500";
}

const stats = computed(() => ({
  totalTarget: placementRows.value.length,
  totalSurat: taskLetters.value.length,
  draft: taskLetters.value.filter((item) => item.surat.status === "draft").length,
  aktifGuru: new Set(taskLetters.value.map((item) => item.meta.guru_pelaksana_id)).size,
}));

function getTaskTypeLabel(type: TaskType) {
  return taskTypeLabels[type];
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPeriod(start?: string, end?: string) {
  if (!start && !end) return "-";
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function getTaskBadgeClass(type: TaskType) {
  if (type === "penerjunan") return "bg-blue-100 text-blue-700 border border-blue-200";
  if (type === "monitoring") return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
}

function getStatusBadgeClass(status: SuratKeluarStatus) {
  if (status === "draft") return "bg-slate-100 text-slate-700 border border-slate-200";
  if (status === "dikirim") return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
}

function getTargetStageSummary(row: GroupedPlacement, stage: TaskType) {
  return row.stageStatuses[stage];
}

function getDraftLetterForTargetStage(row: GroupedPlacement, stage: TaskType) {
  return taskLetters.value
    .filter(
      (item) =>
        item.batch_key === row.targetKey &&
        item.meta.task_type === stage &&
        item.surat.status === "draft",
    )
    .sort(
      (left, right) =>
        new Date(right.surat.tanggal_surat).getTime() -
        new Date(left.surat.tanggal_surat).getTime(),
    )[0];
}

function canCreateStage(row: GroupedPlacement, stage: TaskType) {
  return !getTargetStageSummary(row, stage)?.exists;
}

function canReviseStage(row: GroupedPlacement, stage: TaskType) {
  return Boolean(getDraftLetterForTargetStage(row, stage));
}

function getTargetStageActionLabel(row: GroupedPlacement, stage: TaskType) {
  const summary = getTargetStageSummary(row, stage);
  if (!summary?.exists) return getTaskTypeLabel(stage);
  if (summary.state === "draft") return "Revisi Draft";
  if (summary.state === "dikirim") return "Menunggu";
  return "Selesai";
}

function getTargetStageActionClass(row: GroupedPlacement, stage: TaskType) {
  const summary = getTargetStageSummary(row, stage);

  if (summary?.state === "draft") {
    return "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
  }

  if (summary?.exists) {
    return "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400";
  }

  if (stage === "penerjunan") {
    return "border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100";
  }
  if (stage === "monitoring") {
    return "border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100";
  }
  return "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100";
}

function getTargetStageHint(row: GroupedPlacement, stage: TaskType) {
  const summary = getTargetStageSummary(row, stage);
  if (!summary?.exists) return "Belum ada surat";
  return `${getStageStateLabel(summary.state)}${summary.nomor_surat ? ` • ${summary.nomor_surat}` : ""}`;
}

function getTargetByBatchKey(batchKey: string) {
  return placementRows.value.find((row) => row.targetKey === batchKey) || null;
}

function resetMonitoringFilters() {
  suratSearch.value = "";
  statusFilter.value = "semua";
  stageFilter.value = "semua";
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

function openParticipantModal(payload: ParticipantDetailState) {
  detailModalState.value = payload;
  detailModalOpen.value = true;
}

function openTargetParticipants(row: GroupedPlacement) {
  openParticipantModal({
    title: `Peserta Batch ${row.batchLabel}`,
    subtitle: "Daftar siswa di batch ini dipakai sebagai dasar pembuatan surat tugas guru.",
    perusahaanNama: row.perusahaanNama,
    batchLabel: row.batchLabel,
    participants: row.siswaDetails,
    sourceLabel: "Target penugasan",
  });
}

function openLetterParticipants(letter: ParsedGuruTaskLetter) {
  openParticipantModal({
    title: `Peserta Surat ${letter.surat.nomor_surat}`,
    subtitle: "Daftar siswa ini tersimpan di metadata surat tugas guru yang sudah digenerate.",
    perusahaanNama: letter.meta.perusahaan_nama,
    batchLabel: letter.batch_label,
    participants: letter.participants,
    sourceLabel: `Surat ${getTaskTypeLabel(letter.meta.task_type)}`,
  });
}

function closeParticipantModal() {
  detailModalOpen.value = false;
  detailModalState.value = null;
}

function openConfigModal(type: TaskType, target: GroupedPlacement) {
  const draftLetter = getDraftLetterForTargetStage(target, type);
  const stageSummary = getTargetStageSummary(target, type);
  if (stageSummary?.exists && stageSummary.state !== "draft") return;

  activeTaskType.value = type;
  activeTarget.value = target;
  editingDraftLetter.value = draftLetter || null;
  form.value = {
    guruPelaksanaId: draftLetter?.meta.guru_pelaksana_id || "",
    penandatanganId:
      draftLetter?.surat.penandatangan_guru?.id_guru ||
      form.value.penandatanganId ||
      guruPenandatanganList.value[0]?.id_guru ||
      "",
    tanggalMulai: draftLetter?.meta.tanggal_mulai || target.periodeMulai?.slice(0, 10) || "",
    tanggalSelesai: draftLetter?.meta.tanggal_selesai || target.periodeSelesai?.slice(0, 10) || "",
  };
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  activeTarget.value = null;
  editingDraftLetter.value = null;
}

async function loadData(showRefreshToast = false) {
  loading.value = true;

  try {
    const response = await jurnalGuruApi.getOverview();
    if (!response.success || !response.data) {
      throw new Error(response.message || "Gagal memuat data jurnal guru");
    }

    guruPelaksanaList.value = response.data.options.guru_pelaksana || [];
    guruPenandatanganList.value = response.data.options.penandatangan || [];
    taskLetters.value = response.data.letters || [];
    placementRows.value = (response.data.targets || []).map((item) => {
      const letters: Record<TaskType, ParsedGuruTaskLetter[]> = {
        penerjunan: [],
        monitoring: [],
        penarikan: [],
      };

      taskLetters.value.forEach((letter) => {
        if (letter.batch_key === item.target_key) {
          letters[letter.meta.task_type].push(letter);
        }
      });

      // Sort letters by date within each stage
      (Object.keys(letters) as TaskType[]).forEach((stage) => {
        letters[stage] = sortLettersByDate(letters[stage]);
      });

      return {
        targetKey: item.target_key,
        batchLabel: item.batch_label,
        perusahaanId: item.perusahaan_id,
        perusahaanNama: item.perusahaan_nama,
        alamat: item.alamat,
        periodeMulai: item.periode_mulai,
        periodeSelesai: item.periode_selesai,
        siswaCount: item.siswa_count,
        placementIds: item.penempatan_ids,
        siswaSummary: item.siswa_summary,
        siswaDetails: item.siswa_details,
        latestStatus: item.latest_status,
        stageStatuses: item.stage_statuses,
        letters,
      };
    });

    if (showRefreshToast) {
      toast.add({
        title: "Data diperbarui",
        color: "success",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat jurnal guru",
      description: error?.message || "Terjadi kesalahan saat sinkronisasi data",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function createGuruTaskLetter() {
  if (!activeTarget.value) return;

  if (!form.value.guruPelaksanaId || !selectedGuruPelaksana.value) {
    toast.add({
      title: "Pilih guru pelaksana",
      color: "warning",
    });
    return;
  }

  if (!form.value.penandatanganId) {
    toast.add({
      title: "Pilih guru penandatangan",
      color: "warning",
    });
    return;
  }

  if (!form.value.tanggalMulai || !form.value.tanggalSelesai) {
    toast.add({
      title: "Lengkapi periode tugas",
      color: "warning",
    });
    return;
  }

  submitting.value = true;

  try {
    if (editingDraftLetter.value) {
      const reviseRes = await jurnalGuruApi.reviseTaskLetter(editingDraftLetter.value.surat.id, {
        guru_pelaksana_id: selectedGuruPelaksana.value.id_guru,
        penandatangan_id: form.value.penandatanganId,
        tanggal_mulai: form.value.tanggalMulai,
        tanggal_selesai: form.value.tanggalSelesai,
      });

      if (!reviseRes.success) {
        throw new Error(reviseRes.message || "Gagal merevisi draft surat tugas guru");
      }

      toast.add({
        title: "Draft surat tugas berhasil direvisi",
        description: `${editingDraftLetter.value.surat.nomor_surat} berhasil diperbarui dan digenerate ulang`,
        color: "success",
      });
    } else {
      const createRes = await jurnalGuruApi.createTaskLetter({
        task_type: activeTaskType.value,
        guru_pelaksana_id: selectedGuruPelaksana.value.id_guru,
        penandatangan_id: form.value.penandatanganId,
        perusahaan_id: activeTarget.value.perusahaanId,
        tanggal_mulai: form.value.tanggalMulai,
        tanggal_selesai: form.value.tanggalSelesai,
        penempatan_ids: activeTarget.value.placementIds,
      });

      if (!createRes.success) {
        throw new Error(createRes.message || "Gagal membuat surat tugas guru");
      }

      toast.add({
        title: "Surat tugas guru berhasil dibuat",
        description: `${getTaskTypeLabel(activeTaskType.value)} untuk batch ${activeTarget.value.batchLabel} berhasil digenerate`,
        color: "success",
      });
    }

    closeModal();
    await loadData();
  } catch (error: any) {
    toast.add({
      title: "Gagal membuat surat tugas guru",
      description: error?.message || "Terjadi kesalahan saat membuat surat tugas",
      color: "error",
    });
  } finally {
    submitting.value = false;
  }
}

async function updateLetterStatus(item: ParsedGuruTaskLetter, nextStatus: SuratKeluarStatus) {
  const confirmed = window.confirm(
    `Ubah status ${item.surat.nomor_surat} menjadi ${nextStatus}?`,
  );
  if (!confirmed) return;

  const response = await jurnalGuruApi.updateTaskLetterStatus(item.surat.id, nextStatus);
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
    color: "success",
  });
  await loadData();
}

onMounted(() => {
  loadData();
});

useHead({
  title: "Jurnal Guru PKL | Admin",
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6 font-sans">
    <div class="space-y-6">
      <div class="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex items-center gap-5">
            <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-sky-100 bg-sky-50 shadow-inner">
              <img src="/assets/img/logo-skanda.png" alt="Logo" class="h-14 w-14 object-contain" />
            </div>
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-sky-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">SIAP PKL</span>
                <span class="rounded-full bg-slate-100 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">Jurnal Guru</span>
              </div>
              <h1 class="text-3xl font-black uppercase tracking-tight text-slate-900">
                Surat Tugas dan Penugasan Guru PKL
              </h1>
              <p class="max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
                Halaman ini sekarang bekerja per batch penempatan, jadi satu mitra bisa punya beberapa
                target surat jika periodenya berbeda, tanpa bentrok antar gelombang siswa.
              </p>
            </div>
          </div>

          <div class="grid min-w-[280px] grid-cols-2 gap-3">
            <div class="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-sky-500">Target Batch</div>
              <div class="mt-2 text-3xl font-black text-sky-700">{{ stats.totalTarget }}</div>
            </div>
            <div class="rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-violet-500">Surat Tugas</div>
              <div class="mt-2 text-3xl font-black text-violet-700">{{ stats.totalSurat }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-100 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Surat Draft</div>
              <div class="mt-2 text-3xl font-black text-slate-700">{{ stats.draft }}</div>
            </div>
            <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500">Guru Aktif</div>
              <div class="mt-2 text-3xl font-black text-emerald-700">{{ stats.aktifGuru }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 bg-slate-50 px-8 py-6">
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 class="text-sm font-black uppercase tracking-[0.25em] text-slate-700">
                  Data Penugasan Guru PKL
                </h2>
                <p class="mt-1 text-xs font-medium text-slate-500">
                  Kelola surat tugas per batch penempatan. Klik baris untuk melihat histori surat.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="relative flex-1 min-w-[300px]">
                  <input
                    v-model="industriSearch"
                    type="text"
                    placeholder="Cari mitra, batch, atau siswa..."
                    class="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                  />
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  class="rounded-2xl bg-white border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50 active:scale-95"
                  :disabled="loading"
                  @click="loadData(true)"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mr-2">Filter Tahap:</span>
                <button
                  v-for="option in stageFilterOptions"
                  :key="option.value"
                  class="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  :class="stageFilter === option.value ? 'bg-sky-600 text-white shadow-md shadow-sky-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                  @click="stageFilter = option.value"
                >
                  {{ option.label }}
                </button>
              </div>

              <div class="h-6 w-px bg-slate-200 hidden xl:block" />

              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mr-2">Status Surat:</span>
                <button
                  v-for="option in statusFilterOptions"
                  :key="option.value"
                  class="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  :class="statusFilter === option.value ? 'bg-slate-800 text-white shadow-md shadow-slate-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                  @click="statusFilter = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1260px] border-collapse text-left">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                <th class="px-8 py-5">Informasi Batch & Industri</th>
                <th class="px-8 py-5">Peserta</th>
                <th class="px-8 py-5 text-center">Workflow Status</th>
                <th class="px-8 py-5 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="row in filteredPlacements" :key="row.targetKey">
                <tr
                  class="group cursor-pointer align-top transition-colors hover:bg-slate-50"
                  :class="isRowExpanded(row.targetKey) ? 'bg-slate-50/50' : ''"
                  @click="toggleRow(row.targetKey)"
                >
                  <td class="px-8 py-6">
                    <div class="flex items-start gap-4">
                      <div
                        class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-sky-200 group-hover:bg-sky-50 group-hover:text-sky-500"
                        :class="isRowExpanded(row.targetKey) ? 'border-sky-200 bg-sky-50 text-sky-500' : ''"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform" :class="isRowExpanded(row.targetKey) ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div class="space-y-1.5">
                        <div class="flex items-center gap-2">
                          <span class="rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                            {{ row.batchLabel }}
                          </span>
                          <span class="text-xs font-semibold text-slate-400">
                            {{ formatPeriod(row.periodeMulai, row.periodeSelesai) }}
                          </span>
                        </div>
                        <div class="text-base font-bold tracking-tight text-slate-800">
                          {{ row.perusahaanNama }}
                        </div>
                        <div class="max-w-[300px] text-xs font-medium leading-relaxed text-slate-500">
                          {{ row.alamat }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="space-y-3">
                      <div class="flex items-center gap-2">
                        <div class="flex -space-x-2">
                          <div v-for="i in Math.min(row.siswaCount, 3)" :key="i" class="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {{ i }}
                          </div>
                        </div>
                        <span class="text-xs font-bold text-slate-700">{{ row.siswaCount }} Peserta</span>
                      </div>
                      <div class="max-w-[240px] truncate text-[11px] font-medium text-slate-500" :title="row.siswaSummary.join(', ')">
                        {{ row.siswaSummary.join(", ") }}
                      </div>
                      <button
                        class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 active:scale-95"
                        @click.stop="openTargetParticipants(row)"
                      >
                        Detail Peserta
                      </button>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="flex flex-col items-center gap-4">
                      <!-- Stepper -->
                      <div class="relative flex w-full max-w-[360px] items-center justify-between">
                        <!-- Line -->
                        <div class="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-slate-100" />
                        
                        <div
                          v-for="(stage, idx) in stageColumns"
                          :key="stage.key"
                          class="relative z-10 flex flex-col items-center gap-2"
                        >
                          <div
                            class="flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all"
                            :class="[
                              getTargetStageSummary(row, stage.key).exists ? 'bg-white' : 'bg-slate-50',
                              getTargetStageSummary(row, stage.key).state === 'diterima' ? 'border-emerald-500 text-emerald-500' : 
                              getTargetStageSummary(row, stage.key).state === 'dikirim' ? 'border-blue-500 text-blue-500' : 
                              getTargetStageSummary(row, stage.key).state === 'draft' ? 'border-amber-500 text-amber-500' : 
                              'border-slate-100 text-slate-300'
                            ]"
                          >
                            <span v-if="getTargetStageSummary(row, stage.key).state === 'diterima'" class="text-lg font-bold">✓</span>
                            <span v-else class="text-xs font-black">{{ idx + 1 }}</span>
                          </div>
                          <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {{ stage.shortLabel }}
                          </span>
                        </div>
                      </div>
                      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Status: {{ row.latestStatus }}
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="flex flex-col gap-2">
                      <button
                        v-for="stage in stageColumns"
                        :key="stage.key"
                        class="group/btn flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 transition-all active:scale-95"
                        :class="[
                          !getTargetStageSummary(row, stage.key).exists ? 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50' : 
                          getTargetStageSummary(row, stage.key).state === 'draft' ? 'border-amber-200 bg-amber-50 hover:bg-amber-100' : 
                          'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        ]"
                        :disabled="!canCreateStage(row, stage.key) && !canReviseStage(row, stage.key)"
                        @click.stop="openConfigModal(stage.key, row)"
                      >
                        <span
                          class="text-[10px] font-black uppercase tracking-wider transition-colors"
                          :class="[
                            !getTargetStageSummary(row, stage.key).exists ? 'text-slate-600 group-hover/btn:text-sky-600' : 
                            getTargetStageSummary(row, stage.key).state === 'draft' ? 'text-amber-700' : 
                            'text-slate-400'
                          ]"
                        >
                          {{ getTargetStageActionLabel(row, stage.key) }}
                        </span>
                        <svg v-if="!getTargetStageSummary(row, stage.key).exists || getTargetStageSummary(row, stage.key).state === 'draft'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover/btn:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expanded Detail -->
                <tr v-if="isRowExpanded(row.targetKey)" class="bg-slate-50/30">
                  <td colspan="4" class="px-8 py-0">
                    <div class="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                        <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Histori Surat Tugas Guru</h3>
                        <span class="text-[10px] font-bold text-slate-400">{{ row.letters.penerjunan.length + row.letters.monitoring.length + row.letters.penarikan.length }} Surat Ditemukan</span>
                      </div>
                      
                      <div class="p-6">
                        <div class="grid grid-cols-3 gap-6">
                          <div v-for="stage in stageColumns" :key="stage.key" class="space-y-4">
                            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                              <span class="h-2 w-2 rounded-full" :class="getStageDotClass(getStageState(row.letters[stage.key]))"></span>
                              <h4 class="text-[11px] font-black uppercase tracking-widest text-slate-500">{{ stage.shortLabel }}</h4>
                            </div>

                            <div v-if="row.letters[stage.key].length === 0" class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
                              <span class="text-[10px] font-bold text-slate-400 uppercase">Belum ada surat</span>
                            </div>

                            <div v-for="letter in row.letters[stage.key]" :key="letter.surat.id" class="space-y-3 rounded-xl border border-slate-200 bg-slate-50/30 p-4">
                              <div class="flex items-start justify-between">
                                <span class="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm" :class="getStatusBadgeClass(letter.surat.status)">
                                  {{ letter.surat.status }}
                                </span>
                                <span class="text-[9px] font-bold text-slate-400">{{ formatDate(letter.surat.tanggal_surat) }}</span>
                              </div>
                              
                              <div class="space-y-1">
                                <div class="text-[13px] font-bold text-slate-800">{{ letter.meta.guru_pelaksana_nama }}</div>
                                <div class="text-[10px] font-medium text-slate-500">{{ letter.surat.nomor_surat }}</div>
                              </div>

                              <div class="flex flex-wrap gap-1.5 pt-2">
                                <button
                                  class="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[9px] font-black uppercase tracking-tighter text-slate-600 transition hover:bg-slate-50"
                                  @click="openLetterParticipants(letter)"
                                >
                                  Siswa
                                </button>
                                <button
                                  class="flex-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1.5 text-[9px] font-black uppercase tracking-tighter text-sky-700 transition hover:bg-sky-100"
                                  @click="downloadFile(letter.surat.file_surat_pdf || letter.surat.file_surat)"
                                >
                                  PDF
                                </button>
                                <button
                                  v-if="letter.surat.status === 'draft'"
                                  class="flex-1 rounded-lg border border-blue-200 bg-blue-600 px-2 py-1.5 text-[9px] font-black uppercase tracking-tighter text-white transition hover:bg-blue-700"
                                  @click="updateLetterStatus(letter, 'dikirim')"
                                >
                                  Kirim
                                </button>
                                <button
                                  v-if="letter.surat.status === 'dikirim'"
                                  class="flex-1 rounded-lg border border-emerald-200 bg-emerald-600 px-2 py-1.5 text-[9px] font-black uppercase tracking-tighter text-white transition hover:bg-emerald-700"
                                  @click="updateLetterStatus(letter, 'diterima')"
                                >
                                  Terima
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <UModal
      v-model:open="detailModalOpen"
      title="Detail Siswa Batch / Surat"
      size="xl"
    >
      <template #body>
        <div class="space-y-5">
          <div class="rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <div class="text-[10px] font-black uppercase tracking-[0.25em] text-sky-500">
              {{ detailModalState?.sourceLabel || "Detail" }}
            </div>
            <div class="mt-2 text-base font-black leading-snug text-sky-700">
              {{ detailModalState?.title || "-" }}
            </div>
            <div class="mt-1 text-xs font-medium text-slate-500">
              {{ detailModalState?.subtitle || "-" }}
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
              <span>{{ detailModalState?.perusahaanNama || "-" }}</span>
              <span>•</span>
              <span>{{ detailModalState?.batchLabel || "-" }}</span>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <thead class="bg-slate-50">
                <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th class="px-4 py-4">Siswa</th>
                  <th class="px-4 py-4">Kelas</th>
                  <th class="px-4 py-4">Periode PKL</th>
                  <th class="px-4 py-4">ID Penempatan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr
                  v-for="participant in detailModalState?.participants || []"
                  :key="participant.id_penempatan"
                >
                  <td class="px-4 py-4 text-sm font-black text-slate-800">
                    {{ participant.nama_siswa }}
                  </td>
                  <td class="px-4 py-4 text-sm font-medium text-slate-600">
                    {{ participant.kelas }}
                  </td>
                  <td class="px-4 py-4 text-sm font-medium text-slate-600">
                    {{ formatPeriod(participant.tanggal_mulai, participant.tanggal_selesai) }}
                  </td>
                  <td class="px-4 py-4 text-[11px] font-medium text-slate-500">
                    {{ participant.id_penempatan }}
                  </td>
                </tr>
                <tr v-if="(detailModalState?.participants || []).length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">
                    Tidak ada data siswa untuk ditampilkan.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full items-center justify-end">
          <button
            class="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
            @click="closeParticipantModal"
          >
            Tutup
          </button>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="modalOpen"
      :title="modalTitle"
      :description="modalDescription"
      size="lg"
    >
      <template #body>
        <div class="space-y-6">
          <div class="rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <div class="text-[10px] font-black uppercase tracking-[0.25em] text-sky-500">Target Batch</div>
            <div class="mt-2 text-base font-black leading-snug text-sky-700">
              {{ activeTarget?.perusahaanNama || "-" }}
            </div>
            <div class="mt-1 text-xs font-medium text-slate-500">
              {{ activeTarget?.batchLabel || "-" }} • {{ activeTarget?.alamat || "-" }}
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="rounded-full border border-sky-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">
                {{ activeTarget?.siswaCount || 0 }} siswa
              </span>
              <button
                v-if="activeTarget"
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
                @click="openTargetParticipants(activeTarget)"
              >
                Lihat Detail Siswa
              </button>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                Guru Pelaksana
              </label>
              <select
                v-model="form.guruPelaksanaId"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Pilih guru pelaksana</option>
                <option v-for="guru in guruPelaksanaList" :key="guru.id_guru" :value="guru.id_guru">
                  {{ guru.nama_guru }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                Guru Penandatangan
              </label>
              <select
                v-model="form.penandatanganId"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Pilih guru penandatangan</option>
                <option v-for="guru in guruPenandatanganList" :key="guru.id_guru" :value="guru.id_guru">
                  {{ guru.nama_guru }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                Mulai Tugas
              </label>
              <input
                v-model="form.tanggalMulai"
                type="date"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                Selesai Tugas
              </label>
              <input
                v-model="form.tanggalSelesai"
                type="date"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs font-medium leading-relaxed text-slate-500">
            Surat disimpan ke backend `surat-keluar` dengan metadata batch.
            Stage yang sama untuk batch yang sama tidak bisa dibuat dua kali, tetapi draft yang sudah ada masih bisa direvisi dan digenerate ulang.
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full items-center justify-end gap-3">
          <button
            class="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
            @click="closeModal"
          >
            Batal
          </button>
          <button
            class="rounded-2xl bg-sky-700 px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            :disabled="submitting"
            @click="createGuruTaskLetter"
          >
            {{ modalSubmitLabel }}
          </button>
        </div>
      </template>
    </UModal>
  </div>
</template>
