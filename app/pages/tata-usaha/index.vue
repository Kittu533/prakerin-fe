<template>
    <div class="space-y-6">
        <!-- Welcome Card -->
        <div class="bg-emerald-500 rounded-2xl p-5 lg:p-6 text-white">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <p class="text-emerald-100 text-sm">Selamat datang,</p>
                    <h1 class="text-xl lg:text-2xl font-bold mt-1">
                        Tata Usaha 👋
                    </h1>
                    <p class="text-emerald-100 text-sm mt-1">
                        Panel Administrasi Surat
                    </p>
                </div>
            </div>
        </div>

        <!-- Stats -->
        <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
        </div>
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                v-for="stat in stats"
                :key="stat.label"
                class="bg-white rounded-xl border border-slate-200 p-5"
            >
                <div class="flex items-center justify-between mb-3">
                    <div
                        class="w-10 h-10 rounded-lg flex items-center justify-center"
                        :class="stat.bg"
                    >
                        <Icon
                            :name="stat.icon"
                            class="w-5 h-5"
                            :class="stat.color"
                        />
                    </div>
                </div>
                <p class="text-2xl font-bold text-slate-900">
                    {{ stat.value }}
                </p>
                <p class="text-sm text-slate-500">{{ stat.label }}</p>
            </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-4 lg:gap-6">
            <!-- Recent Surat Masuk -->
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 min-w-0 overflow-hidden"
            >
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">
                        Surat Masuk Terbaru
                    </h3>
                    <UButton
                        variant="ghost"
                        color="primary"
                        size="xs"
                        to="/tata-usaha/surat-masuk"
                    >
                        Lihat Semua
                    </UButton>
                </div>
                <div v-if="loading">
                    <USkeleton class="h-32 rounded-lg" />
                </div>
                <div v-else-if="recentSuratMasuk.length === 0" class="text-center py-8 text-slate-500">
                    <Icon name="lucide:mail-open" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p class="text-sm">Belum ada surat masuk</p>
                </div>
                <div v-else class="space-y-3">
                    <div
                        v-for="surat in recentSuratMasuk"
                        :key="surat.id"
                        class="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Icon name="lucide:mail" class="w-5 h-5 text-blue-600" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-slate-900 truncate">
                                {{ surat.nomor_surat }}
                            </p>
                            <p class="text-xs text-slate-500 truncate">
                                {{ surat.asal_surat }}
                            </p>
                            <p class="text-xs text-slate-400 mt-1">
                                {{ formatDate(surat.tanggal_surat) }}
                            </p>
                        </div>
                        <UBadge
                            :color="getStatusColor(surat.status)"
                            variant="subtle"
                            size="xs"
                        >
                            {{ surat.status }}
                        </UBadge>
                    </div>
                </div>
            </div>

            <!-- Upcoming Disposisi -->
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 min-w-0 overflow-hidden"
            >
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">
                        Disposisi Mendatang
                    </h3>
                    <UButton
                        variant="ghost"
                        color="primary"
                        size="xs"
                        to="/tata-usaha/disposisi"
                    >
                        Lihat Semua
                    </UButton>
                </div>
                <div v-if="loading">
                    <USkeleton class="h-32 rounded-lg" />
                </div>
                <div v-else-if="upcomingDisposisi.length === 0" class="text-center py-8 text-slate-500">
                    <Icon name="lucide:file-signature" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p class="text-sm">Tidak ada disposisi mendatang</p>
                </div>
                <div v-else class="space-y-3">
                    <div
                        v-for="disposisi in upcomingDisposisi"
                        :key="disposisi.id"
                        class="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Icon name="lucide:file-signature" class="w-5 h-5 text-amber-600" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-slate-900 truncate">
                                {{ disposisi.nomor_surat }}
                            </p>
                            <p class="text-xs text-slate-500 truncate">
                                {{ disposisi.perihal }}
                            </p>
                            <p class="text-xs text-slate-400 mt-1">
                                Batas: {{ formatDate(disposisi.batas_waktu) }}
                            </p>
                        </div>
                        <UBadge
                            :color="getPrioritasColor(disposisi.prioritas)"
                            variant="subtle"
                            size="xs"
                        >
                            {{ disposisi.prioritas }}
                        </UBadge>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
            <h3 class="font-semibold text-slate-900 mb-4">
                Aksi Cepat
            </h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <NuxtLink
                    to="/tata-usaha/surat-masuk"
                    class="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon name="lucide:mail-plus" class="w-6 h-6 text-blue-600" />
                    </div>
                    <span class="text-sm font-medium text-slate-700">Surat Masuk</span>
                </NuxtLink>
                <NuxtLink
                    to="/tata-usaha/surat-keluar"
                    class="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <Icon name="lucide:send" class="w-6 h-6 text-green-600" />
                    </div>
                    <span class="text-sm font-medium text-slate-700">Surat Keluar</span>
                </NuxtLink>
                <NuxtLink
                    to="/tata-usaha/disposisi"
                    class="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Icon name="lucide:file-signature" class="w-6 h-6 text-amber-600" />
                    </div>
                    <span class="text-sm font-medium text-slate-700">Disposisi</span>
                </NuxtLink>
                <NuxtLink
                    to="/tata-usaha/surat-kesiswaan"
                    class="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Icon name="lucide:graduation-cap" class="w-6 h-6 text-purple-600" />
                    </div>
                    <span class="text-sm font-medium text-slate-700">Surat Kesiswaan</span>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTUDashboard, type TUDashboardStats, type TUSuratMasukTerbaru, type TUDisposisiMendatang } from "~/composables/api/use-tu-dashboard";

definePageMeta({ layout: "tata-usaha" });

const { getStats } = useTUDashboard();

const loading = ref(true);
const statsData = ref<TUDashboardStats | null>(null);

const stats = computed(() => {
    if (!statsData.value?.statistik) {
        return [
            { label: "Surat Masuk Hari Ini", value: 0, icon: "lucide:mail-open", bg: "bg-blue-100", color: "text-blue-600" },
            { label: "Surat Keluar Hari Ini", value: 0, icon: "lucide:send", bg: "bg-green-100", color: "text-green-600" },
            { label: "Disposition Pending", value: 0, icon: "lucide:file-clock", bg: "bg-amber-100", color: "text-amber-600" },
            { label: "Surat Kesiswaan Bulan Ini", value: 0, icon: "lucide:graduation-cap", bg: "bg-purple-100", color: "text-purple-600" },
        ];
    }

    const s = statsData.value.statistik;
    return [
        { label: "Surat Masuk Hari Ini", value: s.surat_masuk_hari_ini, icon: "lucide:mail-open", bg: "bg-blue-100", color: "text-blue-600" },
        { label: "Surat Keluar Hari Ini", value: s.surat_keluar_hari_ini, icon: "lucide:send", bg: "bg-green-100", color: "text-green-600" },
        { label: "Disposition Pending", value: s.disposisi_belum_selesai, icon: "lucide:file-clock", bg: "bg-amber-100", color: "text-amber-600" },
        { label: "Surat Kesiswaan Bulan Ini", value: s.surat_kesiswaan_bulan_ini, icon: "lucide:graduation-cap", bg: "bg-purple-100", color: "text-purple-600" },
    ];
});

const recentSuratMasuk = computed(() => statsData.value?.surat_masuk_terbaru || []);
const upcomingDisposisi = computed(() => statsData.value?.disposisi_mendatang || []);

function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusColor(status: string): string {
    switch (status) {
        case "terkonfirmasi":
        case "disposisi":
            return "success";
        case "sedang_diproses":
            return "warning";
        case "ditolak":
            return "error";
        default:
            return "neutral";
    }
}

function getPrioritasColor(prioritas: string): string {
    switch (prioritas) {
        case "urgent":
            return "error";
        case "tinggi":
            return "warning";
        case "sedang":
            return "info";
        default:
            return "neutral";
    }
}

async function fetchDashboardData() {
    loading.value = true;

    try {
        const result = await getStats();
        if (result.success && result.data) {
            statsData.value = result.data;
        }
    } catch (err) {
        console.error("[TUDashboard] Error fetching data:", err);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchDashboardData();
});

useHead({ title: "Dashboard | Tata Usaha" });
</script>
