<template>
  <div class="space-y-6 max-w-[1400px] mx-auto pb-10 px-4">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Icon name="lucide:signature" class="w-8 h-8 text-sky-600" />
          Master Data TTD Digital
        </h1>
        <p class="text-slate-500 font-medium">
          Aktifkan penandatangan guru lalu generate QR verifikasi untuk tanda tangan digital.
        </p>
      </div>

      <div class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto xl:flex-nowrap xl:justify-end">
        <UInput
          v-model="filters.search"
          placeholder="Cari nama guru atau NIP"
          icon="lucide:search"
          class="w-full sm:flex-1 xl:w-[260px] xl:flex-none"
          @keyup.enter="fetchData"
        />
        <UButton
          :color="showOnlyInvalid ? 'error' : 'neutral'"
          variant="soft"
          class="w-full justify-center font-bold sm:w-auto"
          @click="toggleInvalidFilter"
        >
          <Icon name="lucide:filter" class="w-4 h-4 mr-2" />
          {{ showOnlyInvalid ? `Hanya Tidak Valid (${invalidOnPageCount})` : "Tampilkan Tidak Valid" }}
        </UButton>
        <UButton
          color="primary"
          class="w-full justify-center font-bold sm:w-auto"
          :loading="loading"
          @click="fetchData"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Muat Ulang
        </UButton>
        <UButton
          color="warning"
          variant="soft"
          class="w-full justify-center font-bold sm:w-auto"
          :loading="verifyingAll"
          @click="verifyAllSignatures"
        >
          <Icon name="lucide:shield-check" class="w-4 h-4 mr-2" />
          Verifikasi Massal
        </UButton>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-black uppercase tracking-wider text-slate-700">Daftar Guru</h2>
        <UBadge color="primary" variant="soft" class="font-bold">{{ pagination.total }} Guru</UBadge>
      </div>

      <div v-if="loading" class="space-y-2">
        <USkeleton v-for="i in 6" :key="i" class="h-14 w-full rounded-xl" />
      </div>

      <div v-else-if="displayedGuruList.length === 0" class="text-center py-12 text-slate-500">
        <Icon name="lucide:users" class="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p class="text-sm">
          {{ showOnlyInvalid ? "Tidak ada guru berstatus verifikasi Tidak Valid pada halaman ini." : "Data guru tidak ditemukan." }}
        </p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="guru in displayedGuruList"
          :key="guru.id_guru"
          class="border border-slate-100 rounded-xl p-4 space-y-4"
        >
          <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_160px_minmax(0,auto)] xl:items-center">
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800 truncate">{{ guru.nama_guru }}</p>
              <p class="text-xs text-slate-500">NIP: {{ guru.nip }}</p>
              <p class="text-xs text-slate-400">ID Guru: {{ guru.id_guru }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ guru.jabatan || "-" }}</p>
            </div>

            <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div class="flex items-center justify-between gap-2 xl:block">
                <p class="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Preview TTD
                </p>
                <div
                  class="mt-0 grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white xl:mt-2 xl:h-28 xl:w-28"
                >
                  <img
                    v-if="qrPreviewMap[guru.id_guru]"
                    :src="qrPreviewMap[guru.id_guru]"
                    :alt="`QR TTD ${guru.nama_guru}`"
                    class="h-full w-full object-contain p-1"
                  />
                  <Icon
                    v-else
                    name="lucide:qr-code"
                    class="h-8 w-8 text-slate-300"
                  />
                </div>
              </div>
              <p
                class="mt-2 hidden truncate text-[11px] font-semibold xl:block"
                :class="signatureStateMap[guru.id_guru]?.exists ? 'text-sky-700' : 'text-slate-400'"
              >
                {{ signatureStateMap[guru.id_guru]?.exists ? "QR aktif" : "Belum dibuat" }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                :color="guru.is_penandatangan ? 'success' : 'neutral'"
                variant="soft"
                class="font-bold"
              >
                {{ guru.is_penandatangan ? "Penandatangan Aktif" : "Bukan Penandatangan" }}
              </UBadge>

              <UBadge
                :color="signatureStatusColor(guru.id_guru)"
                variant="soft"
                class="font-bold"
              >
                {{ signatureStatusLabel(guru.id_guru) }}
              </UBadge>

              <UBadge
                v-if="verificationMap[guru.id_guru]"
                :color="verificationMap[guru.id_guru].isValid ? 'success' : 'error'"
                variant="outline"
                class="font-bold"
              >
                {{ verificationMap[guru.id_guru].isValid ? "Valid" : "Tidak Valid" }}
              </UBadge>

              <UButton
                :color="guru.is_penandatangan ? 'neutral' : 'primary'"
                variant="soft"
                size="sm"
                class="font-bold"
                :loading="savingId === guru.id_guru"
                @click="toggleSigner(guru)"
              >
                <Icon
                  :name="guru.is_penandatangan ? 'lucide:user-x' : 'lucide:user-check'"
                  class="w-4 h-4 mr-1"
                />
                {{ guru.is_penandatangan ? "Nonaktifkan" : "Jadikan Penandatangan" }}
              </UButton>

              <UButton
                color="info"
                variant="soft"
                size="sm"
                class="font-bold"
                :loading="loadingSignatureId === guru.id_guru"
                @click="openSignatureEditor(guru.id_guru)"
              >
                <Icon name="lucide:pen-square" class="w-4 h-4 mr-1" />
                {{ editingGuruId === guru.id_guru ? "Tutup Editor" : "Kelola TTD" }}
              </UButton>
            </div>
          </div>

          <div
            v-if="editingGuruId === guru.id_guru"
            class="rounded-xl border border-sky-100 bg-sky-50/40 p-4 space-y-3"
          >
            <div class="rounded-xl border border-sky-100 bg-white p-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-800">Mode QR Verifikasi</p>
                  <p class="mt-1 text-sm text-slate-500">
                    QR akan membuka halaman publik verifikasi TTD. Tidak perlu upload gambar tanda tangan.
                  </p>
                  <p
                    v-if="signatureDraftMap[guru.id_guru]"
                    class="mt-2 truncate text-xs font-semibold text-sky-700"
                  >
                    {{ signatureDraftMap[guru.id_guru] }}
                  </p>
                </div>
                <div class="grid h-24 w-24 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    v-if="qrPreviewMap[guru.id_guru]"
                    :src="qrPreviewMap[guru.id_guru]"
                    :alt="`QR TTD ${guru.nama_guru}`"
                    class="h-full w-full object-contain p-1"
                  />
                  <Icon v-else name="lucide:qr-code" class="h-12 w-12 text-sky-600" />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <UButton
                color="primary"
                class="w-full justify-center font-bold sm:w-auto"
                :loading="savingSignatureId === guru.id_guru"
                @click="saveSignature(guru)"
              >
                <Icon name="lucide:save" class="w-4 h-4 mr-1" />
                Generate QR TTD
              </UButton>
              <UButton
                color="error"
                variant="soft"
                class="w-full justify-center font-bold sm:w-auto"
                :loading="resettingSignatureId === guru.id_guru"
                @click="resetSignature(guru)"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4 mr-1" />
                Reset QR
              </UButton>
              <span
                v-if="signatureStateMap[guru.id_guru]?.timestamp"
                class="text-xs text-slate-500 sm:ml-auto"
              >
                Update terakhir: {{ formatTimestamp(signatureStateMap[guru.id_guru]?.timestamp) }}
              </span>
            </div>

            <p
              v-if="verificationMap[guru.id_guru]"
              class="text-xs"
              :class="verificationMap[guru.id_guru].isValid ? 'text-emerald-700' : 'text-rose-700'"
            >
              Hasil verifikasi: {{ verificationMap[guru.id_guru].message }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <p class="text-xs text-slate-500">
          Halaman {{ pagination.page }} dari {{ totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <UButton
            variant="soft"
            color="neutral"
            size="sm"
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            Sebelumnya
          </UButton>
          <UButton
            variant="soft"
            color="neutral"
            size="sm"
            :disabled="pagination.page >= totalPages"
            @click="changePage(pagination.page + 1)"
          >
            Berikutnya
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from "qrcode";
import { useGuruApi, type Guru } from "~/composables/api/use-academic";
import { useSignatureApi } from "~/composables/api/use-signature";
import { useSweetAlert } from "~/composables/use-sweet-alert";

definePageMeta({ layout: "tata-usaha" });

const { getAll, update } = useGuruApi();
const {
  saveGuruMasterSignature,
  getLatestGuruMasterSignature,
  resetGuruMasterSignature,
  verifyGuruMasterSignatureBatch,
} = useSignatureApi();
const { showError, showSuccess, showConfirmation, showInfo } = useSweetAlert();

const loading = ref(false);
const savingId = ref<string | null>(null);
const savingSignatureId = ref<string | null>(null);
const resettingSignatureId = ref<string | null>(null);
const loadingSignatureId = ref<string | null>(null);
const editingGuruId = ref<string | null>(null);
const verifyingAll = ref(false);
const showOnlyInvalid = ref(false);

const guruList = ref<Guru[]>([]);
const pagination = ref({ page: 1, limit: 10, total: 0 });
const filters = ref({ search: "" });
const signatureDraftMap = ref<Record<string, string>>({});
const qrPreviewMap = ref<Record<string, string>>({});
const verificationMap = ref<
  Record<
    string,
    {
      isValid: boolean;
      message: string;
      payloadType: string;
      updatedAt?: string;
    }
  >
>({});
const signatureStateMap = ref<
  Record<
    string,
    {
      exists: boolean;
      hasImagePayload: boolean;
      signatureData?: string;
      timestamp?: string;
    }
  >
>({});

const totalPages = computed(() => {
  if (!pagination.value.total || !pagination.value.limit) return 1;
  return Math.max(1, Math.ceil(pagination.value.total / pagination.value.limit));
});

const displayedGuruList = computed(() => {
  if (!showOnlyInvalid.value) {
    return guruList.value;
  }

  return guruList.value.filter((guru) => {
    const verification = verificationMap.value[guru.id_guru];
    return verification?.isValid === false;
  });
});

const invalidOnPageCount = computed(() => {
  return guruList.value.filter((guru) => {
    const verification = verificationMap.value[guru.id_guru];
    return verification?.isValid === false;
  }).length;
});

function toggleInvalidFilter() {
  showOnlyInvalid.value = !showOnlyInvalid.value;
}

async function fetchData() {
  loading.value = true;
  try {
    const result = await getAll({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: filters.value.search || undefined,
    });

    if (!result.success) {
      await showError("Gagal", result.message || "Gagal mengambil data guru.");
      return;
    }

    guruList.value = result.data || [];
    const meta = result.meta || result.pagination;
    pagination.value.total = meta?.total || 0;

    await refreshSignatureStates();
  } catch (error: any) {
    console.error("[TTD Master] fetch error:", error);
  } finally {
    loading.value = false;
  }
}

async function refreshSignatureStates() {
  if (!guruList.value.length) {
    signatureStateMap.value = {};
    qrPreviewMap.value = {};
    return;
  }

  const entries = await Promise.all(
    guruList.value.map(async (guru) => {
      try {
        const result = await getLatestGuruMasterSignature(guru.id_guru);
        const latest = result.success ? result.data : null;
        return [
          guru.id_guru,
          {
            exists: Boolean(latest),
            hasImagePayload: Boolean(latest?.hasImagePayload),
            signatureData: latest?.signatureData,
            timestamp: latest?.timestamp,
          },
        ] as const;
      } catch {
        return [
          guru.id_guru,
          {
            exists: false,
            hasImagePayload: false,
          },
        ] as const;
      }
    }),
  );

  signatureStateMap.value = entries.reduce(
    (acc, [guruId, state]) => {
      acc[guruId] = state;
      return acc;
    },
    {} as Record<string, { exists: boolean; hasImagePayload: boolean; signatureData?: string; timestamp?: string }>,
  );

  await refreshQrPreviews();
}

async function verifyAllSignatures() {
  verifyingAll.value = true;
  try {
    const result = await verifyGuruMasterSignatureBatch();
    if (!result.success || !result.data) {
      await showError("Gagal", result.message || "Gagal menjalankan verifikasi massal.");
      return;
    }

    verificationMap.value = result.data.items.reduce(
      (acc, item) => {
        acc[item.guruId] = {
          isValid: item.isValid,
          message: item.message,
          payloadType: item.payloadType,
          updatedAt: item.updatedAt,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          isValid: boolean;
          message: string;
          payloadType: string;
          updatedAt?: string;
        }
      >,
    );

    const invalidCount = result.data.invalidCount;
    await showInfo(
      "Verifikasi Selesai",
      `Total ${result.data.total} guru diperiksa. Valid: ${result.data.validCount}. Tidak valid: ${invalidCount}.`,
      { showCancelButton: false },
    );
  } catch (error) {
    console.error("[TTD Master] verify all signatures error:", error);
    await showError("Gagal", "Terjadi kesalahan saat verifikasi massal.");
  } finally {
    verifyingAll.value = false;
  }
}

function signatureStatusColor(guruId: string) {
  const state = signatureStateMap.value[guruId];
  if (!state?.exists) return "warning";
  return state.hasImagePayload ? "success" : "info";
}

function signatureStatusLabel(guruId: string) {
  const state = signatureStateMap.value[guruId];
  if (!state?.exists) return "TTD Belum Disimpan";
  return "QR TTD Tersimpan";
}

async function buildQrPreview(payload?: string) {
  const value = String(payload || "").trim();
  if (!value) return "";

  try {
    return await QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });
  } catch (error) {
    console.error("[TTD Master] QR preview error:", error);
    return "";
  }
}

async function refreshQrPreviews() {
  const previews = await Promise.all(
    guruList.value.map(async (guru) => {
      const payload = signatureStateMap.value[guru.id_guru]?.signatureData;
      return [guru.id_guru, await buildQrPreview(payload)] as const;
    }),
  );

  qrPreviewMap.value = previews.reduce(
    (acc, [guruId, preview]) => {
      if (preview) acc[guruId] = preview;
      return acc;
    },
    {} as Record<string, string>,
  );
}

function formatTimestamp(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID");
}

async function openSignatureEditor(guruId: string) {
  if (editingGuruId.value === guruId) {
    editingGuruId.value = null;
    return;
  }

  editingGuruId.value = guruId;
  loadingSignatureId.value = guruId;
  try {
    const result = await getLatestGuruMasterSignature(guruId);
    if (result.success && result.data?.signatureData) {
      signatureDraftMap.value[guruId] = result.data.signatureData;
      signatureStateMap.value[guruId] = {
        exists: true,
        hasImagePayload: Boolean(result.data.hasImagePayload),
        signatureData: result.data.signatureData,
        timestamp: result.data.timestamp,
      };
      qrPreviewMap.value[guruId] = await buildQrPreview(result.data.signatureData);
      return;
    }

    if (!signatureDraftMap.value[guruId]) {
      signatureDraftMap.value[guruId] = "";
    }
  } catch (error) {
    console.error("[TTD Master] get latest signature error:", error);
  } finally {
    loadingSignatureId.value = null;
  }
}

async function saveSignature(guru: Guru) {
  const signatureData = `QR_TTD_GURU:${guru.id_guru}`;

  savingSignatureId.value = guru.id_guru;
  try {
    const result = await saveGuruMasterSignature(guru.id_guru, {
      signatureData,
      metadata: {
        guruName: guru.nama_guru,
      },
    });

    if (!result.success) {
      await showError("Gagal", result.message || "Gagal menyimpan TTD digital guru.");
      return;
    }

    signatureStateMap.value[guru.id_guru] = {
      exists: true,
      hasImagePayload: false,
      signatureData: result.data?.signatureData,
      timestamp: new Date().toISOString(),
    };

    if (result.data?.signatureData) {
      signatureDraftMap.value[guru.id_guru] = result.data.signatureData;
      qrPreviewMap.value[guru.id_guru] = await buildQrPreview(result.data.signatureData);
    }

    await showSuccess("Berhasil", `QR TTD digital untuk ${guru.nama_guru} berhasil disimpan.`);
  } catch (error) {
    console.error("[TTD Master] save signature error:", error);
    await showError("Gagal", "Terjadi kesalahan saat menyimpan TTD digital.");
  } finally {
    savingSignatureId.value = null;
  }
}

async function resetSignature(guru: Guru) {
  const confirm = await showConfirmation(
    "Reset Signature",
    `Master TTD untuk ${guru.nama_guru} akan dihapus. Lanjutkan?`,
  );

  if (!confirm.isConfirmed) return;

  resettingSignatureId.value = guru.id_guru;
  try {
    const result = await resetGuruMasterSignature(guru.id_guru);
    if (!result.success) {
      await showError("Gagal", result.message || "Gagal mereset signature guru.");
      return;
    }

    signatureDraftMap.value[guru.id_guru] = "";
    signatureStateMap.value[guru.id_guru] = {
      exists: false,
      hasImagePayload: false,
    };
    delete qrPreviewMap.value[guru.id_guru];
    verificationMap.value[guru.id_guru] = {
      isValid: false,
      message: "Belum memiliki master signature aktif",
      payloadType: "empty",
    };

    await showSuccess("Berhasil", `Master TTD ${guru.nama_guru} berhasil direset.`);
  } catch (error) {
    console.error("[TTD Master] reset signature error:", error);
    await showError("Gagal", "Terjadi kesalahan saat mereset signature guru.");
  } finally {
    resettingSignatureId.value = null;
  }
}

async function toggleSigner(guru: Guru) {
  savingId.value = guru.id_guru;
  try {
    const result = await update(guru.id_guru, {
      is_penandatangan: !guru.is_penandatangan,
    });

    if (!result.success) {
      await showError("Gagal", result.message || "Gagal mengubah status penandatangan.");
      return;
    }

    await showSuccess(
      "Berhasil",
      !guru.is_penandatangan
        ? `${guru.nama_guru} ditetapkan sebagai penandatangan.`
        : `${guru.nama_guru} dihapus dari penandatangan.`,
    );

    await fetchData();
  } catch (error: any) {
    console.error("[TTD Master] toggle signer error:", error);
  } finally {
    savingId.value = null;
  }
}

function changePage(page: number) {
  pagination.value.page = page;
  void fetchData();
}

onMounted(() => {
  void fetchData();
});

useHead({ title: "Master TTD Digital | Tata Usaha" });
</script>
