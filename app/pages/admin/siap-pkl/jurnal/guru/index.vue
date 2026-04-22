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
}

type ParsedGuruTaskLetter = JurnalGuruLetter;

interface MonitoringRow {
  batchKey: string;
  batchLabel: string;
  perusahaanId: string;
  perusahaanNama: string;
  alamat: string;
  periodeMulai: string;
  periodeSelesai: string;
  siswaCount: number;
  participants: JurnalGuruParticipant[];
  stages: Record<TaskType, ParsedGuruTaskLetter[]>;
  summary: {
    totalLetters: number;
    generatedStages: number;
    completedStages: number;
    progressPercent: number;
    currentStageLabel: string;
    nextActionLabel: string;
    nextActionTone: SummaryTone;
    priority: number;
  };
}

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

const form = ref({
  guruPelaksanaId: "",
  penandatanganId: "",
  tanggalMulai: "",
  tanggalSelesai: "",
});

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

function createEmptyStages(): Record<TaskType, ParsedGuruTaskLetter[]> {
  return {
    penerjunan: [],
    monitoring: [],
    penarikan: [],
  };
}

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

function getStageStateClass(state: MonitoringStageState) {
  if (state === "empty") {
    return "border border-dashed border-slate-200 bg-slate-50 text-slate-400";
  }
  if (state === "draft") return "border border-slate-200 bg-slate-100 text-slate-700";
  if (state === "dikirim") return "border border-blue-200 bg-blue-50 text-blue-700";
  return "border border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getStageDotClass(state: MonitoringStageState) {
  if (state === "empty") return "bg-slate-200";
  if (state === "draft") return "bg-slate-500";
  if (state === "dikirim") return "bg-blue-500";
  return "bg-emerald-500";
}

function getSummaryToneClass(tone: SummaryTone) {
  if (tone === "amber") return "border border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "blue") return "border border-blue-200 bg-blue-50 text-blue-700";
  if (tone === "emerald") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border border-slate-200 bg-slate-100 text-slate-700";
}

function buildRowSummary(stages: Record<TaskType, ParsedGuruTaskLetter[]>) {
  const stageStates = stageColumns.map((stage) => ({
    key: stage.key,
    state: getStageState(stages[stage.key]),
  }));
  const latestExistingStage = [...stageColumns]
    .reverse()
    .find((stage) => stages[stage.key].length > 0);
  const generatedStages = stageStates.filter((item) => item.state !== "empty").length;
  const completedStages = stageStates.filter((item) => item.state === "diterima").length;

  let nextActionLabel = "Belum ada surat yang dibuat";
  let nextActionTone: SummaryTone = "slate";
  let priority = 3;

  if (stageStates.some((item) => item.state === "draft")) {
    nextActionLabel = "Ada surat draft yang perlu dikirim";
    nextActionTone = "amber";
    priority = 0;
  } else if (stageStates.some((item) => item.state === "dikirim")) {
    nextActionLabel = "Ada surat yang menunggu konfirmasi";
    nextActionTone = "blue";
    priority = 1;
  } else {
    const firstMissingStage = stageStates.find((item) => item.state === "empty");
    if (firstMissingStage) {
      const stageLabel =
        stageColumns.find((item) => item.key === firstMissingStage.key)?.shortLabel || "tahap";
      nextActionLabel = `Siapkan surat ${stageLabel.toLowerCase()}`;
      priority = 2;
    } else {
      nextActionLabel = "Siklus surat sudah lengkap";
      nextActionTone = "emerald";
      priority = 4;
    }
  }

  return {
    totalLetters: stageColumns.reduce((total, stage) => total + stages[stage.key].length, 0),
    generatedStages,
    completedStages,
    progressPercent: Math.round((generatedStages / stageColumns.length) * 100),
    currentStageLabel: latestExistingStage
      ? `Tahap aktif: ${getTaskTypeLabel(latestExistingStage.key)}`
      : "Belum ada surat",
    nextActionLabel,
    nextActionTone,
    priority,
  };
}

const groupedTaskLetters = computed<MonitoringRow[]>(() => {
  const groups = new Map<string, MonitoringRow>();

  for (const item of filteredTaskLetters.value) {
    const key = item.batch_key;
    if (!groups.has(key)) {
      groups.set(key, {
        batchKey: item.batch_key,
        batchLabel: item.batch_label,
        perusahaanId: item.meta.perusahaan_id,
        perusahaanNama: item.meta.perusahaan_nama,
        alamat: item.meta.perusahaan_alamat || "",
        periodeMulai: item.batch_mulai,
        periodeSelesai: item.batch_selesai,
        siswaCount: item.participants.length,
        participants: item.participants,
        stages: createEmptyStages(),
        summary: {
          totalLetters: 0,
          generatedStages: 0,
          completedStages: 0,
          progressPercent: 0,
          currentStageLabel: "Belum ada surat",
          nextActionLabel: "Belum ada surat yang dibuat",
          nextActionTone: "slate",
          priority: 99,
        },
      });
    }

    groups.get(key)?.stages[item.meta.task_type].push(item);
  }

  return Array.from(groups.values())
    .map((row) => ({
      ...row,
      stages: {
        penerjunan: sortLettersByDate(row.stages.penerjunan),
        monitoring: sortLettersByDate(row.stages.monitoring),
        penarikan: sortLettersByDate(row.stages.penarikan),
      },
    }))
    .map((row) => ({
      ...row,
      summary: buildRowSummary(row.stages),
    }))
    .sort((left, right) => {
      if (left.summary.priority !== right.summary.priority) {
        return left.summary.priority - right.summary.priority;
      }
      const companyDiff = left.perusahaanNama.localeCompare(right.perusahaanNama);
      if (companyDiff !== 0) return companyDiff;
      return left.periodeMulai.localeCompare(right.periodeMulai);
    });
});

const monitoringStats = computed(() => ({
  totalBatch: groupedTaskLetters.value.length,
  totalVisibleLetters: filteredTaskLetters.value.length,
  needSending: filteredTaskLetters.value.filter((item) => item.surat.status === "draft").length,
  waitingConfirmation: filteredTaskLetters.value.filter((item) => item.surat.status === "dikirim")
    .length,
}));

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

function getStageItems(row: MonitoringRow, stage: TaskType) {
  return row.stages[stage];
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
    placementRows.value = (response.data.targets || []).map((item) => ({
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
    }));

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
        <div class="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 class="text-sm font-black uppercase tracking-[0.25em] text-slate-700">
                Data Pengajuan Penugasan
              </h2>
              <p class="mt-1 text-xs font-medium text-slate-500">
                Data ini dipisah per mitra dan periode. Satu stage hanya bisa punya satu surat untuk satu batch.
              </p>
            </div>

            <div class="flex items-center gap-3">
              <input
                v-model="industriSearch"
                type="text"
                placeholder="Cari mitra, batch, atau siswa..."
                class="w-full min-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <button
                class="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
                :disabled="loading"
                @click="loadData(true)"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1260px] border-collapse text-left">
            <thead>
              <tr class="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                <th class="px-6 py-5">Batch PKL</th>
                <th class="px-6 py-5">Industri / IDUKA</th>
                <th class="px-6 py-5">Peserta</th>
                <th class="px-6 py-5">Workflow Batch</th>
                <th class="px-6 py-5 text-center">Buat Surat Tugas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500">
                  Memuat data penempatan dan surat tugas guru...
                </td>
              </tr>
              <tr v-else-if="filteredPlacements.length === 0">
                <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500">
                  Belum ada batch penempatan yang bisa dijadikan target surat tugas guru.
                </td>
              </tr>
              <tr
                v-for="row in filteredPlacements"
                v-else
                :key="row.targetKey"
                class="align-top transition hover:bg-slate-50/60"
              >
                <td class="px-6 py-6">
                  <div class="space-y-2">
                    <div class="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      {{ row.batchLabel }}
                    </div>
                    <div class="text-xs font-medium text-slate-500">
                      {{ formatPeriod(row.periodeMulai, row.periodeSelesai) }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="max-w-[320px] space-y-2">
                    <div class="text-sm font-black leading-snug text-sky-700">
                      {{ row.perusahaanNama }}
                    </div>
                    <div class="text-xs font-medium leading-relaxed text-slate-500">
                      {{ row.alamat }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="space-y-3">
                    <div class="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      {{ row.siswaCount }} Siswa
                    </div>
                    <div class="max-w-[280px] text-xs font-medium leading-relaxed text-slate-500">
                      {{ row.siswaSummary.join(", ") }}
                    </div>
                    <button
                      class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-100"
                      @click="openTargetParticipants(row)"
                    >
                      Lihat Detail Siswa
                    </button>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="space-y-2">
                    <span class="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-700">
                      {{ row.latestStatus }}
                    </span>
                    <div class="grid gap-2">
                      <div
                        v-for="stage in stageColumns"
                        :key="`${row.targetKey}-status-${stage.key}`"
                        class="rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                            {{ stage.shortLabel }}
                          </span>
                          <span
                            class="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]"
                            :class="getStageStateClass(getTargetStageSummary(row, stage.key).state)"
                          >
                            {{ getStageStateLabel(getTargetStageSummary(row, stage.key).state) }}
                          </span>
                        </div>
                        <div class="mt-2 text-[11px] font-medium text-slate-500">
                          {{ getTargetStageHint(row, stage.key) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6">
                  <div class="grid gap-2">
                    <button
                      v-for="stage in stageColumns"
                      :key="`${row.targetKey}-action-${stage.key}`"
                      class="rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-100"
                      :class="getTargetStageActionClass(row, stage.key)"
                      :disabled="!canCreateStage(row, stage.key) && !canReviseStage(row, stage.key)"
                      @click="openConfigModal(stage.key, row)"
                    >
                      {{ getTargetStageActionLabel(row, stage.key) }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div class="flex flex-col gap-5">
            <div>
              <h2 class="text-sm font-black uppercase tracking-[0.25em] text-slate-700">
                Monitoring Progres Surat Tugas Guru
              </h2>
              <p class="mt-1 text-xs font-medium text-slate-500">
                Histori surat ditampilkan per batch. Jadi dua gelombang berbeda di mitra yang sama tetap terbaca terpisah.
              </p>
            </div>

            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div class="rounded-2xl border border-slate-200 bg-white p-4">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Batch Tampil</div>
                <div class="mt-2 text-2xl font-black text-slate-900">{{ monitoringStats.totalBatch }}</div>
              </div>
              <div class="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-violet-500">Surat Terlihat</div>
                <div class="mt-2 text-2xl font-black text-violet-700">{{ monitoringStats.totalVisibleLetters }}</div>
              </div>
              <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Butuh Dikirim</div>
                <div class="mt-2 text-2xl font-black text-amber-700">{{ monitoringStats.needSending }}</div>
              </div>
              <div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">Menunggu Konfirmasi</div>
                <div class="mt-2 text-2xl font-black text-blue-700">{{ monitoringStats.waitingConfirmation }}</div>
              </div>
            </div>

            <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div class="space-y-4">
                <div>
                  <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Filter Status</div>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      v-for="option in statusFilterOptions"
                      :key="option.value"
                      class="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition"
                      :class="statusFilter === option.value ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'"
                      @click="statusFilter = option.value"
                    >
                      {{ option.label }} ({{ option.count }})
                    </button>
                  </div>
                </div>

                <div>
                  <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Filter Tahap</div>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      v-for="option in stageFilterOptions"
                      :key="option.value"
                      class="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition"
                      :class="stageFilter === option.value ? 'bg-sky-700 text-white' : 'border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100'"
                      @click="stageFilter = option.value"
                    >
                      {{ option.label }} ({{ option.count }})
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex w-full flex-col gap-3 xl:max-w-xl xl:items-end">
                <input
                  v-model="suratSearch"
                  type="text"
                  placeholder="Cari nomor surat, batch, mitra, guru, atau siswa..."
                  class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
                <div class="flex flex-wrap items-center justify-end gap-2 text-[11px] font-medium text-slate-500">
                  <span>Menampilkan {{ groupedTaskLetters.length }} batch dan {{ filteredTaskLetters.length }} surat.</span>
                  <button
                    class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
                    @click="resetMonitoringFilters"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1420px] border-collapse text-left">
            <thead>
              <tr class="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                <th class="px-6 py-5">Batch & Ringkasan</th>
                <th v-for="stage in stageColumns" :key="stage.key" class="px-6 py-5 text-center">
                  {{ stage.orderLabel }}. {{ stage.shortLabel }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="4" class="px-6 py-10 text-center text-sm text-slate-500">
                  Memuat histori surat tugas guru...
                </td>
              </tr>
              <tr v-else-if="groupedTaskLetters.length === 0">
                <td colspan="4" class="px-6 py-10 text-center text-sm text-slate-500">
                  <div class="space-y-3">
                    <div>Tidak ada surat tugas guru yang cocok dengan filter saat ini.</div>
                    <button
                      class="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
                      @click="resetMonitoringFilters"
                    >
                      Tampilkan Semua Data
                    </button>
                  </div>
                </td>
              </tr>
              <tr
                v-for="row in groupedTaskLetters"
                v-else
                :key="row.batchKey"
                class="align-top transition hover:bg-slate-50/60"
              >
                <td class="px-6 py-6">
                  <div class="max-w-[360px] space-y-4">
                    <div>
                      <div class="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        {{ row.batchLabel }}
                      </div>
                      <div class="mt-3 text-sm font-black text-sky-700">
                        {{ row.perusahaanNama }}
                      </div>
                      <div class="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                        {{ row.alamat || "-" }}
                      </div>
                      <div class="mt-2 text-[11px] font-medium text-slate-500">
                        {{ formatPeriod(row.periodeMulai, row.periodeSelesai) }} • {{ row.siswaCount }} siswa
                      </div>
                    </div>

                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div class="flex items-center justify-between gap-3">
                        <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                          Progress Workflow
                        </div>
                        <div class="text-xs font-black text-slate-700">
                          {{ row.summary.generatedStages }}/{{ stageColumns.length }} tahap
                        </div>
                      </div>
                      <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div class="h-full rounded-full bg-sky-600 transition-all" :style="{ width: `${row.summary.progressPercent}%` }" />
                      </div>
                      <div class="mt-3 grid gap-2">
                        <div
                          v-for="stage in stageColumns"
                          :key="stage.key"
                          class="flex items-center justify-between rounded-xl bg-white px-3 py-2"
                        >
                          <div class="flex items-center gap-2">
                            <span class="h-2.5 w-2.5 rounded-full" :class="getStageDotClass(getStageState(getStageItems(row, stage.key)))" />
                            <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                              {{ stage.shortLabel }}
                            </span>
                          </div>
                          <span
                            class="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]"
                            :class="getStageStateClass(getStageState(getStageItems(row, stage.key)))"
                          >
                            {{ getStageStateLabel(getStageState(getStageItems(row, stage.key))) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <span
                        class="inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
                        :class="getSummaryToneClass(row.summary.nextActionTone)"
                      >
                        {{ row.summary.nextActionLabel }}
                      </span>
                      <span class="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                        {{ row.summary.currentStageLabel }}
                      </span>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <button
                        class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-100"
                        @click="openParticipantModal({
                          title: `Peserta Batch ${row.batchLabel}`,
                          subtitle: 'Daftar siswa batch ini terhubung ke surat tugas yang tampil di tabel monitoring.',
                          perusahaanNama: row.perusahaanNama,
                          batchLabel: row.batchLabel,
                          participants: row.participants,
                          sourceLabel: 'Monitoring batch',
                        })"
                      >
                        Lihat Detail Siswa
                      </button>
                      <span class="text-[11px] font-medium text-slate-500">
                        {{ row.summary.totalLetters }} surat tercatat untuk batch ini.
                      </span>
                    </div>
                  </div>
                </td>
                <td
                  v-for="stage in stageColumns"
                  :key="`${row.batchKey}-${stage.key}`"
                  class="px-6 py-6"
                >
                  <div class="space-y-3">
                    <div
                      v-for="item in getStageItems(row, stage.key)"
                      :key="item.surat.id"
                      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="space-y-2">
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em]" :class="getTaskBadgeClass(item.meta.task_type)">
                              {{ getTaskTypeLabel(item.meta.task_type) }}
                            </span>
                            <span class="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em]" :class="getStatusBadgeClass(item.surat.status)">
                              {{ item.surat.status }}
                            </span>
                          </div>
                          <div class="text-sm font-black text-slate-800">{{ item.meta.guru_pelaksana_nama }}</div>
                        </div>
                        <div class="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {{ formatDate(item.surat.tanggal_surat) }}
                        </div>
                      </div>

                      <div class="mt-3 space-y-1 text-[11px] font-medium text-slate-500">
                        <div>{{ item.surat.nomor_surat }}</div>
                        <div>{{ item.surat.perihal }}</div>
                        <div>Batch: {{ item.batch_label }}</div>
                        <div>Periode tugas: {{ formatPeriod(item.meta.tanggal_mulai, item.meta.tanggal_selesai) }}</div>
                      </div>

                      <div class="mt-4 flex flex-wrap gap-2">
                        <button
                          class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-100"
                          @click="openLetterParticipants(item)"
                        >
                          Lihat Siswa
                        </button>
                        <button
                          v-if="item.surat.status === 'draft' && getTargetByBatchKey(item.batch_key)"
                          class="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 transition hover:bg-amber-100"
                          @click="openConfigModal(item.meta.task_type, getTargetByBatchKey(item.batch_key)!)"
                        >
                          Revisi Draft
                        </button>
                        <button
                          class="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 transition hover:bg-blue-100"
                          @click="downloadFile(item.surat.file_surat_docx)"
                        >
                          Buka DOCX
                        </button>
                        <button
                          class="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
                          @click="downloadFile(item.surat.file_surat_pdf || item.surat.file_surat)"
                        >
                          Buka PDF
                        </button>
                        <button
                          v-if="item.surat.status === 'draft'"
                          class="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-200"
                          @click="updateLetterStatus(item, 'dikirim')"
                        >
                          Tandai Dikirim
                        </button>
                        <button
                          v-if="item.surat.status === 'dikirim'"
                          class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 transition hover:bg-emerald-100"
                          @click="updateLetterStatus(item, 'diterima')"
                        >
                          Tandai Diterima
                        </button>
                      </div>
                    </div>
                    <div
                      v-if="getStageItems(row, stage.key).length === 0"
                      class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center"
                    >
                      <div class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {{ stage.emptyLabel }}
                      </div>
                      <div class="mt-2 text-xs font-medium text-slate-400">
                        Surat tahap ini belum dibuat untuk batch ini.
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
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
