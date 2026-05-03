<template>
  <main class="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
    <section class="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-center">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50">
              <Icon name="lucide:qr-code" class="h-7 w-7 text-sky-600" />
            </div>
            <p class="text-sm font-black uppercase tracking-wider text-slate-500">
              Verifikasi TTD Digital
            </p>
            <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {{ statusTitle }}
            </h1>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ statusDescription }}
            </p>
          </div>

          <UBadge :color="statusBadge.color" variant="soft" class="w-fit px-3 py-1 font-black">
            {{ statusBadge.label }}
          </UBadge>
        </div>

        <div v-if="pending" class="mt-8 space-y-3">
          <USkeleton class="h-20 w-full rounded-xl" />
          <USkeleton class="h-28 w-full rounded-xl" />
          <USkeleton class="h-16 w-full rounded-xl" />
        </div>

        <div v-else class="mt-8 space-y-5">
          <div
            class="rounded-xl border p-4"
            :class="isVerified ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'"
          >
            <div class="flex gap-3">
              <Icon
                :name="isVerified ? 'lucide:shield-check' : 'lucide:shield-alert'"
                class="mt-0.5 h-5 w-5 shrink-0"
                :class="isVerified ? 'text-emerald-700' : 'text-rose-700'"
              />
              <div>
                <p
                  class="text-sm font-black"
                  :class="isVerified ? 'text-emerald-900' : 'text-rose-900'"
                >
                  {{ apiMessage }}
                </p>
                <p
                  class="mt-1 text-sm leading-6"
                  :class="isVerified ? 'text-emerald-700' : 'text-rose-700'"
                >
                  {{ integrityMessage }}
                </p>
              </div>
            </div>
          </div>

          <dl class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Dokumen</dt>
              <dd class="mt-1 font-black text-slate-900">{{ documentTypeLabel }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">ID Dokumen</dt>
              <dd class="mt-1 break-all font-mono text-sm font-bold text-slate-800">{{ documentId }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Surat</dt>
              <dd class="mt-1 font-black text-slate-900">{{ nomorSurat }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Waktu TTD</dt>
              <dd class="mt-1 font-black text-slate-900">{{ signedAt }}</dd>
            </div>
          </dl>

          <div class="rounded-xl border border-slate-200 p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Icon name="lucide:user-check" class="h-6 w-6 text-slate-700" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-base font-black text-slate-950">{{ signerName }}</p>
                <p class="text-sm font-semibold text-slate-500">{{ signerRole }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs leading-5 text-slate-500">
              Halaman ini membaca data langsung dari server SIM Prakerin. Jika status tidak valid, minta pihak sekolah menerbitkan ulang dokumen.
            </p>
            <UButton color="neutral" variant="soft" class="justify-center font-bold" @click="refresh">
              <Icon name="lucide:refresh-cw" class="mr-2 h-4 w-4" />
              Cek Ulang
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

type VerifiedSignature = {
  documentId: string;
  documentType: string;
  signerName: string;
  signerRole: string;
  timestamp: string;
  hashValid: boolean;
  isValid: boolean;
  metadata?: Record<string, unknown> | null;
};

type VerifyResponse = {
  success: boolean;
  message?: string;
  data?: VerifiedSignature[];
};

const route = useRoute();
const config = useRuntimeConfig();

const documentType = computed(() => String(route.params.documentType || ""));
const documentId = computed(() => String(route.params.documentId || ""));

const endpoint = computed(() => {
  return `${config.public.apiUrl}/signature/verify/${encodeURIComponent(documentId.value)}/${encodeURIComponent(documentType.value)}`;
});

const { data, pending, refresh } = await useAsyncData(
  () => `verify-ttd-${documentType.value}-${documentId.value}`,
  async () => {
    try {
      return await $fetch<VerifyResponse>(endpoint.value);
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || "Tanda tangan tidak ditemukan",
        data: [],
      };
    }
  },
  { watch: [endpoint] },
);

const signatures = computed(() => data.value?.data || []);
const latestSignature = computed(() => signatures.value[0] || null);
const isVerified = computed(() => {
  return Boolean(data.value?.success && signatures.value.some((item) => item.isValid && item.hashValid));
});

const statusBadge = computed(() => {
  if (pending.value) return { label: "Memeriksa", color: "neutral" as const };
  if (isVerified.value) return { label: "Valid", color: "success" as const };
  return { label: "Tidak Valid", color: "error" as const };
});

const statusTitle = computed(() => {
  if (pending.value) return "Memeriksa dokumen";
  return isVerified.value ? "Dokumen terverifikasi" : "Dokumen tidak valid";
});

const statusDescription = computed(() => {
  if (pending.value) return "Sistem sedang mencocokkan QR dengan data tanda tangan digital.";
  if (isVerified.value) return "QR ini cocok dengan data tanda tangan digital yang tersimpan di server.";
  return "QR tidak cocok, tanda tangan dicabut, atau data tanda tangan tidak ditemukan.";
});

const apiMessage = computed(() => data.value?.message || "Status verifikasi belum tersedia");
const integrityMessage = computed(() => {
  if (!latestSignature.value) return "Tidak ada data penandatangan aktif untuk dokumen ini.";
  return latestSignature.value.hashValid
    ? "Hash tanda tangan cocok dengan data dokumen."
    : "Hash tanda tangan tidak cocok dengan data dokumen.";
});

const documentTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    surat_keluar: "Surat Keluar",
    surat_kesiswaan: "Surat Kesiswaan",
    guru_master_signature: "Master TTD Guru",
    pengajuan: "Pengajuan",
    logbook: "Logbook",
  };
  return labels[documentType.value] || documentType.value || "-";
});

const nomorSurat = computed(() => {
  const metadata = latestSignature.value?.metadata || {};
  return String(metadata.nomor_surat || metadata.surat_id || "-");
});

const signerName = computed(() => latestSignature.value?.signerName || "-");
const signerRole = computed(() => {
  const value = latestSignature.value?.signerRole || "-";
  return value === "guru" ? "Guru Penandatangan" : value;
});

const signedAt = computed(() => {
  const value = latestSignature.value?.timestamp;
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
});

useHead({
  title: "Verifikasi TTD Digital | SIM Prakerin",
});
</script>
