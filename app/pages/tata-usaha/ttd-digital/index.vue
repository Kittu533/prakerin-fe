<template>
  <div class="space-y-6 max-w-[1400px] mx-auto pb-10 px-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Icon name="lucide:signature" class="w-8 h-8 text-sky-600" />
          Master Data TTD Digital
        </h1>
        <p class="text-slate-500 font-medium">
          Aktifkan penandatangan guru lalu simpan payload TTD digital (image/QR) per id guru.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UInput
          v-model="filters.search"
          placeholder="Cari nama guru atau NIP"
          icon="lucide:search"
          class="w-[260px]"
          @keyup.enter="fetchData"
        />
        <UButton
          :color="showOnlyInvalid ? 'error' : 'neutral'"
          variant="soft"
          class="font-bold"
          @click="toggleInvalidFilter"
        >
          <Icon name="lucide:filter" class="w-4 h-4 mr-2" />
          {{ showOnlyInvalid ? `Hanya Tidak Valid (${invalidOnPageCount})` : "Tampilkan Tidak Valid" }}
        </UButton>
        <UButton color="primary" class="font-bold" :loading="loading" @click="fetchData">
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Muat Ulang
        </UButton>
        <UButton
          color="warning"
          variant="soft"
          class="font-bold"
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
          <div class="flex flex-col md:flex-row md:items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800 truncate">{{ guru.nama_guru }}</p>
              <p class="text-xs text-slate-500">NIP: {{ guru.nip }}</p>
              <p class="text-xs text-slate-400">ID Guru: {{ guru.id_guru }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ guru.jabatan || "-" }}</p>
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
            <div class="flex flex-col lg:flex-row gap-3">
              <div class="flex-1">
                <label class="text-xs font-semibold text-slate-600 block mb-1">
                  Payload TTD (Data URL image / teks QR)
                </label>
                <UTextarea
                  v-model="signatureDraftMap[guru.id_guru]"
                  :rows="6"
                  :placeholder="`Contoh: data:image/png;base64,... atau teks payload QR untuk ${guru.nama_guru}`"
                />
              </div>

              <div class="lg:w-[300px] space-y-2">
                <label class="text-xs font-semibold text-slate-600 block">Upload Gambar TTD</label>
                <input
                  type="file"
                  accept="image/*"
                  class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-sky-100 file:text-sky-700"
                  @change="onPickSignatureImage($event, guru.id_guru)"
                />
                <p class="text-[11px] text-slate-500">
                  Jika upload gambar, payload otomatis diisi data URL. Jika teks biasa, backend akan render sebagai QR.
                </p>
              </div>
            </div>

            <div
              v-if="isImagePayload(signatureDraftMap[guru.id_guru])"
              class="rounded-lg border border-slate-200 bg-white p-2 inline-block"
            >
              <img
                :src="signatureDraftMap[guru.id_guru]"
                alt="Preview TTD"
                class="max-h-28 object-contain"
              />
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                color="primary"
                class="font-bold"
                :loading="savingSignatureId === guru.id_guru"
                @click="saveSignature(guru)"
              >
                <Icon name="lucide:save" class="w-4 h-4 mr-1" />
                Simpan Signature Guru
              </UButton>
              <UButton
                color="error"
                variant="soft"
                class="font-bold"
                :loading="resettingSignatureId === guru.id_guru"
                @click="resetSignature(guru)"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4 mr-1" />
                Reset Signature
              </UButton>
              <span
                v-if="signatureStateMap[guru.id_guru]?.timestamp"
                class="text-xs text-slate-500"
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
    {} as Record<string, { exists: boolean; hasImagePayload: boolean; timestamp?: string }>,
  );
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
  if (state.hasImagePayload) return "TTD Image Tersimpan";
  return "TTD QR/Teks Tersimpan";
}

function isImagePayload(value?: string) {
  return String(value || "").trim().toLowerCase().startsWith("data:image/");
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
        timestamp: result.data.timestamp,
      };
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

async function onPickSignatureImage(event: Event, guruId: string) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    signatureDraftMap.value[guruId] = String(reader.result || "");
  };
  reader.onerror = () => {
    showError("Gagal", "Gagal membaca file gambar TTD.");
  };
  reader.readAsDataURL(file);
}

async function saveSignature(guru: Guru) {
  const signatureData = String(signatureDraftMap.value[guru.id_guru] || "").trim();
  if (!signatureData) {
    await showError("Validasi", "Payload TTD tidak boleh kosong.");
    return;
  }

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
      hasImagePayload: isImagePayload(signatureData),
      timestamp: new Date().toISOString(),
    };

    await showSuccess("Berhasil", `TTD digital untuk ${guru.nama_guru} berhasil disimpan.`);
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
