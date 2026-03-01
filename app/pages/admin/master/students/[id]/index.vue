<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useSiswaApi, type Siswa } from "~/composables/api/use-academic";
import {
    usePenempatanApi,
    type Penempatan,
} from "~/composables/api/use-internship";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const siswaApi = useSiswaApi();
const penempatanApi = usePenempatanApi();

const id = computed(() => route.params.id as string);
const loading = ref(true);
const penempatanLoading = ref(true);
const siswaData = ref<Siswa | null>(null);
const penempatanData = ref<Penempatan | null>(null);

const jenisKelaminLabel = computed(() => {
    if (!siswaData.value?.jenis_kelamin) return "-";
    return siswaData.value.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan";
});

const jenisKelaminColor = computed(() => {
    if (!siswaData.value?.jenis_kelamin) return "neutral";
    return siswaData.value.jenis_kelamin === "L" ? "sky" : "pink";
});

async function fetchSiswa() {
    loading.value = true;
    try {
        const response = await siswaApi.getById(id.value);
        if (response.success && response.data) {
            siswaData.value = response.data;
        } else {
            toast.add({
                title: "Data tidak ditemukan",
                color: "error",
            });
            router.push("/admin/master/students");
        }
    } catch (error) {
        console.error("Failed to fetch siswa:", error);
        toast.add({ title: "Gagal memuat data", color: "error" });
        router.push("/admin/master/students");
    } finally {
        loading.value = false;
    }
}

async function fetchPenempatan() {
    penempatanLoading.value = true;
    try {
        // Get penempatan by siswa_id
        const response = await penempatanApi.getAll({
            siswa_id: id.value,
            limit: 1,
        });
        if (response.success && response.data && response.data.length > 0) {
            penempatanData.value = response.data[0];
        }
    } catch (error) {
        console.error("Failed to fetch penempatan:", error);
    } finally {
        penempatanLoading.value = false;
    }
}

function navigateToEdit() {
    router.push(`/admin/master/students/${id.value}/edit`);
}

function handleBack() {
    router.push("/admin/master/students");
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
    fetchSiswa();
    fetchPenempatan();
});

useHead({ title: "Detail Siswa | Admin" });
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
                    Detail Siswa
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Informasi lengkap siswa
                </p>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <UIcon
                name="lucide:loader-2"
                class="w-8 h-8 animate-spin text-slate-400"
            />
        </div>

        <div
            v-else-if="siswaData"
            class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
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
                                    siswaData.nama_siswa
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                }}
                            </div>
                            <div>
                                <h2 class="text-lg font-bold text-slate-900">
                                    {{ siswaData.nama_siswa }}
                                </h2>
                                <p class="text-sm text-slate-500">
                                    NIS: {{ siswaData.nis }}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-slate-500">Kelas</p>
                                <UBadge color="primary" variant="subtle">
                                    {{ siswaData.kelas?.nama_kelas || "-" }}
                                </UBadge>
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
                                <p class="text-sm text-slate-500">
                                    Tanggal Lahir
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ formatDate(siswaData.tanggal_lahir) }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">Email</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ siswaData.email || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">No HP</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ siswaData.no_hp || "-" }}
                                </p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-sm text-slate-500">Alamat</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ siswaData.alamat || "-" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Penempatan PKL -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Penempatan PKL
                        </h3>
                    </div>
                    <div
                        v-if="penempatanLoading"
                        class="p-5 flex justify-center"
                    >
                        <UIcon
                            name="lucide:loader-2"
                            class="w-6 h-6 animate-spin text-slate-400"
                        />
                    </div>
                    <div v-else-if="penempatanData" class="p-5">
                        <!-- Status Badge -->
                        <div class="mb-4">
                            <UBadge
                                :color="
                                    penempatanData.status_penempatan === 'aktif'
                                        ? 'success'
                                        : penempatanData.status_penempatan ===
                                            'selesai'
                                          ? 'neutral'
                                          : 'error'
                                "
                                variant="subtle"
                                class="capitalize"
                            >
                                {{
                                    penempatanData.status_penempatan === "aktif"
                                        ? "Aktif"
                                        : penempatanData.status_penempatan ===
                                            "selesai"
                                          ? "Selesai"
                                          : "Dibatalkan"
                                }}
                            </UBadge>
                        </div>

                        <!-- Perusahaan -->
                        <div class="mb-4">
                            <p class="text-sm text-slate-500 mb-1">
                                Perusahaan
                            </p>
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"
                                >
                                    <UIcon
                                        name="lucide:building"
                                        class="w-4 h-4 text-amber-600"
                                    />
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900">
                                        {{
                                            penempatanData.perusahaan
                                                ?.nama_perusahaan || "-"
                                        }}
                                    </p>
                                    <p
                                        v-if="
                                            penempatanData.perusahaan
                                                ?.bidang_usaha
                                        "
                                        class="text-xs text-slate-500"
                                    >
                                        {{
                                            penempatanData.perusahaan
                                                .bidang_usaha
                                        }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Periode PKL -->
                        <div
                            class="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg"
                        >
                            <div>
                                <p class="text-xs text-slate-500">
                                    Tanggal Mulai
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{
                                        formatDate(penempatanData.tanggal_mulai)
                                    }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">
                                    Tanggal Selesai
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{
                                        formatDate(
                                            penempatanData.tanggal_selesai,
                                        )
                                    }}
                                </p>
                            </div>
                        </div>

                        <!-- Guru Pembimbing -->
                        <div class="mb-4 p-3 bg-sky-50 rounded-lg">
                            <p class="text-xs text-sky-600 mb-1">
                                Guru Pembimbing Sekolah
                            </p>
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center"
                                >
                                    <UIcon
                                        name="lucide:graduation-cap"
                                        class="w-4 h-4 text-sky-700"
                                    />
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900">
                                        {{
                                            penempatanData.guru?.nama_guru ||
                                            "-"
                                        }}
                                    </p>
                                    <p class="text-xs text-slate-500">
                                        NIP:
                                        {{ penempatanData.guru?.nip || "-" }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Mentor Perusahaan -->
                        <div
                            v-if="
                                penempatanData.perusahaan?.mentor &&
                                penempatanData.perusahaan.mentor.length > 0
                            "
                            class="p-3 bg-amber-50 rounded-lg"
                        >
                            <p class="text-xs text-amber-600 mb-2">
                                Mentor Perusahaan
                            </p>
                            <div class="space-y-2">
                                <div
                                    v-for="mentor in penempatanData.perusahaan.mentor.slice(
                                        0,
                                        2,
                                    )"
                                    :key="mentor.id_mentor"
                                    class="flex items-center gap-2"
                                >
                                    <div
                                        class="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center"
                                    >
                                        <UIcon
                                            name="lucide:briefcase"
                                            class="w-4 h-4 text-amber-700"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="font-medium text-slate-900 text-sm"
                                        >
                                            {{ mentor.nama_mentor || "-" }}
                                        </p>
                                        <p class="text-xs text-slate-500">
                                            {{ mentor.jabatan || "Mentor" }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Detail Button -->
                        <UButton
                            color="primary"
                            variant="ghost"
                            size="sm"
                            class="mt-4 w-full"
                            icon="lucide:eye"
                            @click="
                                router.push(
                                    `/admin/placement/${penempatanData.id_penempatan}`,
                                )
                            "
                        >
                            Lihat Detail Penempatan
                        </UButton>
                    </div>
                    <div v-else class="p-5 text-center text-slate-500">
                        <Icon
                            name="lucide:briefcase"
                            class="w-12 h-12 mx-auto mb-3 text-slate-300"
                        />
                        <p>Siswa ini belum memiliki penempatan PKL</p>
                        <UButton
                            color="primary"
                            variant="ghost"
                            class="mt-4"
                            icon="lucide:plus"
                            @click="router.push('/admin/placement/create')"
                        >
                            Buat Penempatan
                        </UButton>
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
                            Edit Data Siswa
                        </UButton>
                        <UButton
                            color="neutral"
                            variant="ghost"
                            icon="lucide:key"
                            class="w-full justify-start"
                        >
                            Reset Password
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
