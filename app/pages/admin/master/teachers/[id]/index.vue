<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useGuruApi, type Guru } from "~/composables/api/use-academic";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const guruApi = useGuruApi();

const id = computed(() => route.params.id as string);
const loading = ref(true);
const guruData = ref<Guru | null>(null);

const jenisKelaminLabel = computed(() => {
    if (!guruData.value?.jenis_kelamin) return "-";
    return guruData.value.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan";
});

const jenisKelaminColor = computed(() => {
    if (!guruData.value?.jenis_kelamin) return "neutral";
    return guruData.value.jenis_kelamin === "L" ? "sky" : "pink";
});

async function fetchGuru() {
    loading.value = true;
    try {
        const response = await guruApi.getById(id.value);
        if (response.success && response.data) {
            guruData.value = response.data;
        } else {
            toast.add({
                title: "Data tidak ditemukan",
                color: "error",
            });
            router.push("/admin/master/teachers");
        }
    } catch (error) {
        console.error("Failed to fetch guru:", error);
        toast.add({ title: "Gagal memuat data", color: "error" });
        router.push("/admin/master/teachers");
    } finally {
        loading.value = false;
    }
}

function navigateToEdit() {
    router.push(`/admin/master/teachers/${id.value}/edit`);
}

function handleBack() {
    router.push("/admin/master/teachers");
}

function formatDate(dateString?: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

onMounted(() => {
    fetchGuru();
});

useHead({ title: "Detail Guru | Admin" });
</script>

<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
            <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="lucide:arrow-left"
                class="shrink-0"
                @click="handleBack"
            >
                Kembali
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Detail Guru
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Informasi lengkap guru pembimbing
                </p>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <UIcon
                name="lucide:loader-2"
                class="w-8 h-8 animate-spin text-slate-400"
            />
        </div>

        <div v-else-if="guruData" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Informasi Pribadi -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Informasi Pribadi
                        </h3>
                    </div>
                    <div class="p-5">
                        <div class="flex items-center gap-4 mb-6">
                            <div
                                class="w-16 h-16 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-xl font-bold"
                            >
                                {{
                                    guruData.nama_guru
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                }}
                            </div>
                            <div>
                                <h2 class="text-lg font-bold text-slate-900">
                                    {{ guruData.nama_guru }}
                                </h2>
                                <p class="text-sm text-slate-500">
                                    NIP: {{ guruData.nip }}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-slate-500">Email</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ guruData.email || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">No HP</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ guruData.no_hp || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Jenis Kelamin
                                </p>
                                <UBadge
                                    :color="jenisKelaminColor"
                                    variant="subtle"
                                >
                                    {{ jenisKelaminLabel }}
                                </UBadge>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">Status</p>
                                <UBadge
                                    :color="
                                        guruData.status_aktif
                                            ? 'success'
                                            : 'neutral'
                                    "
                                    variant="subtle"
                                >
                                    {{
                                        guruData.status_aktif
                                            ? "Aktif"
                                            : "Nonaktif"
                                    }}
                                </UBadge>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Tempat Lahir
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ guruData.tempat_lahir || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Tanggal Lahir
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ formatDate(guruData.tanggal_lahir) }}
                                </p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-sm text-slate-500">Alamat</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ guruData.alamat || "-" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Kelas yang Diajar -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Kelas sebagai Wali Kelas
                        </h3>
                    </div>
                    <div class="p-5 text-center text-slate-500">
                        <Icon
                            name="lucide:users"
                            class="w-12 h-12 mx-auto mb-3 text-slate-300"
                        />
                        <p>
                            Data kelas akan ditampilkan setelah fitur tersedia
                        </p>
                    </div>
                </div>
            </div>

            <!-- Sidebar Actions -->
            <div class="lg:col-span-1">
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-6"
                >
                    <div class="p-4 border-b border-slate-100">
                        <h3 class="font-semibold text-slate-900">Aksi</h3>
                    </div>
                    <div class="p-2 space-y-1">
                        <UButton
                            color="primary"
                            variant="ghost"
                            icon="lucide:edit"
                            class="w-full justify-start"
                            @click="navigateToEdit"
                        >
                            Edit Data Guru
                        </UButton>
                        <UButton
                            color="neutral"
                            variant="ghost"
                            icon="lucide:key"
                            class="w-full justify-start"
                        >
                            Reset Password
                        </UButton>
                        <UButton
                            :color="guruData.status_aktif ? 'error' : 'success'"
                            variant="ghost"
                            :icon="
                                guruData.status_aktif
                                    ? 'lucide:user-x'
                                    : 'lucide:user-check'
                            "
                            class="w-full justify-start"
                        >
                            {{
                                guruData.status_aktif
                                    ? "Nonaktifkan"
                                    : "Aktifkan"
                            }}
                            Akun
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
