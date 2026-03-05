<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                Penilaian Siswa
            </h1>
            <p class="text-sm text-slate-500">
                Berikan penilaian untuk siswa PKL di perusahaan Anda
            </p>
        </div>

        <!-- Error State -->
        <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-xl p-4 text-center"
        >
            <Icon
                name="lucide:alert-circle"
                class="w-8 h-8 text-red-400 mx-auto mb-2"
            />
            <p class="text-red-600">{{ error }}</p>
            <UButton
                color="primary"
                variant="soft"
                size="sm"
                class="mt-2"
                @click="fetchData"
                >Coba Lagi</UButton
            >
        </div>

        <!-- Stats -->
        <div v-else class="grid grid-cols-4 gap-4">
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-slate-600">
                    {{ stats.total }}
                </p>
                <p class="text-sm text-slate-500">Total Siswa</p>
            </div>
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-success-600">
                    {{ stats.graded }}
                </p>
                <p class="text-sm text-slate-500">Sudah Dinilai</p>
            </div>
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-warning-600">
                    {{ stats.pending }}
                </p>
                <p class="text-sm text-slate-500">Belum Dinilai</p>
            </div>
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-primary-600">
                    {{ stats.average }}
                </p>
                <p class="text-sm text-slate-500">Rata-rata</p>
            </div>
        </div>

        <!-- Data Table -->
        <CommonAppDataTable
            v-if="!error"
            :data="data"
            :columns="columns"
            :loading="loading"
            :searchable="true"
            search-placeholder="Cari nama siswa..."
            empty-title="Tidak ada siswa bimbingan"
            empty-description="Belum ada siswa PKL yang sedang menjalankan magang di perusahaan Anda"
            empty-icon="lucide:users"
            page-size="10"
        >
            <template #toolbar-right>
                <UButton
                    icon="i-lucide-refresh-cw"
                    size="sm"
                    color="neutral"
                    variant="outline"
                    :loading="loading"
                    @click="fetchData"
                >
                    Refresh
                </UButton>
            </template>
        </CommonAppDataTable>

        <!-- Penilaian Modal -->
        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard class="max-h-[85vh] overflow-y-auto">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="font-semibold text-slate-900">
                                Penilaian Siswa
                            </h3>
                            <UButton
                                variant="ghost"
                                color="neutral"
                                size="xs"
                                @click="modalOpen = false"
                            >
                                <Icon name="lucide:x" class="w-4 h-4" />
                            </UButton>
                        </div>
                    </template>

                    <div v-if="selected" class="space-y-4">
                        <!-- Siswa Info -->
                        <div
                            class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                            <div
                                class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-semibold"
                            >
                                {{ getInitials(selected.siswa) }}
                            </div>
                            <div>
                                <p class="font-medium text-slate-900">
                                    {{ selected.siswa?.nama_siswa }}
                                </p>
                                <p class="text-xs text-slate-500">
                                    {{ selected.siswa?.kelas?.nama_kelas }}
                                </p>
                            </div>
                        </div>

                        <!-- Score Inputs -->
                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Sikap (20%)" required>
                                <UInput
                                    v-model.number="form.sikap"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                />
                            </UFormField>

                            <UFormField label="Keterampilan (20%)" required>
                                <UInput
                                    v-model.number="form.keterampilan"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                />
                            </UFormField>

                            <UFormField label="Kedisiplinan (20%)" required>
                                <UInput
                                    v-model.number="form.kedisiplinan"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                />
                            </UFormField>
                        </div>

                        <!-- Catatan -->
                        <UFormField label="Catatan Penilaian">
                            <UTextarea
                                v-model="form.catatan_penilaian"
                                placeholder="Catatan tambahan tentang siswa..."
                                :rows="3"
                            />
                        </UFormField>

                        <!-- Average Score Display -->
                        <div
                            class="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200"
                        >
                            <div>
                                <p class="text-sm text-primary-600">
                                    Nilai Rata-rata
                                </p>
                                <p class="text-xs text-primary-500">
                                    Dari 3 aspek penilaian
                                </p>
                            </div>
                            <p class="text-3xl font-bold text-primary-700">
                                {{ averageScore }}
                            </p>
                        </div>

                        <!-- Grade Badge -->
                        <div class="flex justify-center">
                            <span :class="getGradeBadgeClass(averageScore)">
                                {{ getGradeLabel(averageScore) }}
                            </span>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex gap-3">
                            <UButton
                                variant="outline"
                                color="neutral"
                                class="flex-1"
                                @click="modalOpen = false"
                                >Batal</UButton
                            >
                            <UButton
                                color="primary"
                                class="flex-1"
                                :loading="processing"
                                @click="saveNilai"
                                >Simpan Penilaian</UButton
                            >
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";
import { apiFetch } from "~/composables/api-fetch";

definePageMeta({ layout: "mentor" });

const toast = useToast();

const loading = ref(true);
const error = ref<string | null>(null);
const data = ref<any[]>([]);
const modalOpen = ref(false);
const processing = ref(false);
const selected = ref<any>(null);

const stats = reactive({ total: 0, graded: 0, pending: 0, average: 0 });

const form = reactive({
    sikap: 0,
    keterampilan: 0,
    kedisiplinan: 0,
    catatan_penilaian: "",
});

const columnHelper = createColumnHelper<any>();

// Helper functions
function getInitials(siswa: any) {
    if (!siswa) return "XX";
    const name = siswa.nama_siswa || "XX";
    return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function getGradeLabel(score: number) {
    if (score >= 90) return "A (Sangat Baik)";
    if (score >= 80) return "B (Baik)";
    if (score >= 70) return "C (Cukup)";
    if (score >= 60) return "D (Kurang)";
    return "E (Buruk)";
}

function getGradeBadgeClass(score: number) {
    if (score >= 90)
        return "px-4 py-2 rounded-lg text-sm font-bold bg-green-100 text-green-700";
    if (score >= 80)
        return "px-4 py-2 rounded-lg text-sm font-bold bg-blue-100 text-blue-700";
    if (score >= 70)
        return "px-4 py-2 rounded-lg text-sm font-bold bg-yellow-100 text-yellow-700";
    if (score >= 60)
        return "px-4 py-2 rounded-lg text-sm font-bold bg-orange-100 text-orange-700";
    return "px-4 py-2 rounded-lg text-sm font-bold bg-red-100 text-red-700";
}

const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("siswa.nama_siswa", {
        id: "siswa",
        header: "Siswa",
        cell: (info) => {
            const siswa = info.row.original.siswa;
            const namaSiswa = siswa?.nama_siswa || "-";
            const kelas = siswa?.kelas?.nama_kelas || "-";
            const initials = getInitials(siswa);

            return h("div", { class: "flex items-center gap-3" }, [
                h(
                    "div",
                    {
                        class: "w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold",
                    },
                    initials,
                ),
                h("div", { class: "min-w-0" }, [
                    h(
                        "p",
                        {
                            class: "text-sm font-medium text-slate-900 truncate",
                        },
                        namaSiswa,
                    ),
                    h("p", { class: "text-xs text-slate-500 truncate" }, kelas),
                ]),
            ]);
        },
    }),
    columnHelper.display({
        id: "nilai",
        header: "Nilai",
        cell: (info) => {
            const nilai = info.row.original.nilai;
            if (!nilai) {
                return h(
                    "span",
                    { class: "text-sm text-slate-400" },
                    "Belum dinilai",
                );
            }
            const scoreClass =
                nilai >= 80
                    ? "text-success-600"
                    : nilai >= 70
                      ? "text-warning-600"
                      : "text-error-600";
            return h(
                "span",
                { class: `text-sm font-bold ${scoreClass}` },
                nilai,
            );
        },
    }),
    columnHelper.display({
        id: "status",
        header: "Status",
        cell: (info) => {
            const status = info.row.original.status;
            const isGraded = status === "Dinilai";
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        isGraded
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`,
                },
                status,
            );
        },
    }),
    columnHelper.display({
        id: "aksi",
        header: "",
        cell: (info) => {
            const row = info.row.original;
            return h(
                "button",
                {
                    onClick: () => openModal(row),
                    class: "px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors",
                },
                row.nilai ? "Edit" : "Nilai",
            );
        },
    }),
];

// Computed average score (nilai_pembimbing_perusahaan = avg of 3 criteria)
const averageScore = computed(() => {
    const total = form.sikap + form.keterampilan + form.kedisiplinan;
    return Math.round(total / 3) || 0;
});

// Fetch data
async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
        const response = await apiFetch<any>(
            "PlacementService",
            "/penilaian/mentor/me",
        );

        if (response.data.success) {
            data.value = response.data.data || [];
            updateStats();
        } else {
            error.value =
                response.data.message || "Gagal memuat data penilaian";
        }
    } catch (e: any) {
        console.error("Error fetching penilaian:", e);
        error.value =
            e.response?.data?.message || "Gagal memuat data penilaian";
        toast.add({
            title: "Error",
            description: error.value,
            color: "red",
        });
    } finally {
        loading.value = false;
    }
}

// Update stats
function updateStats() {
    const graded = data.value.filter((d) => d.nilai !== null);
    const total = data.value.length;
    const sum = graded.reduce(
        (acc: number, curr: any) => acc + (parseFloat(curr.nilai) || 0),
        0,
    );

    stats.total = total;
    stats.graded = graded.length;
    stats.pending = total - graded.length;
    stats.average = graded.length > 0 ? Math.round(sum / graded.length) : 0;
}

// Open modal
function openModal(item: any) {
    selected.value = item;
    const detail = item.detail;

    if (detail) {
        form.sikap = detail.nilai_sikap || 0;
        form.keterampilan = detail.nilai_keterampilan || 0;
        form.kedisiplinan = detail.nilai_kedisiplinan || 0;
        form.catatan_penilaian = detail.catatan_penilaian || "";
    } else {
        form.sikap = 0;
        form.keterampilan = 0;
        form.kedisiplinan = 0;
        form.catatan_penilaian = "";
    }
    modalOpen.value = true;
}

// Save nilai
async function saveNilai() {
    if (
        form.sikap < 0 ||
        form.keterampilan < 0 ||
        form.kedisiplinan < 0
    ) {
        toast.add({
            title: "Error",
            description: "Nilai tidak boleh negatif",
            color: "error",
        });
        return;
    }

    processing.value = true;

    try {
        const response = await apiFetch<any>(
            "PlacementService",
            `/penilaian/penempatan/${selected.value.id_penempatan}`,
            {
                method: "POST",
                data: {
                    nilai_sikap: form.sikap,
                    nilai_keterampilan: form.keterampilan,
                    nilai_kedisiplinan: form.kedisiplinan,
                    nilai_pembimbing_perusahaan: averageScore.value,
                    catatan_penilaian: form.catatan_penilaian,
                },
            },
        );

        if (response.data.success) {
            // Update local data with actual nilai_akhir from BE
            const savedPenilaian = response.data.data;
            selected.value.nilai = parseFloat(savedPenilaian.nilai_akhir) || averageScore.value;
            selected.value.status = "Dinilai";
            selected.value.detail = savedPenilaian;
            updateStats();
            modalOpen.value = false;
            toast.add({
                title: "Berhasil",
                description: "Penilaian berhasil disimpan",
                color: "success",
            });
        }
    } catch (e: any) {
        toast.add({
            title: "Error",
            description:
                e.response?.data?.message || "Gagal menyimpan penilaian",
            color: "red",
        });
    } finally {
        processing.value = false;
    }
}

onMounted(() => {
    fetchData();
});

useHead({ title: "Penilaian | Mentor" });
</script>
