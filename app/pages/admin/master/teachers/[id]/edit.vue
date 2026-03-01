<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useGuruApi, type Guru } from "~/composables/api/use-academic";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const guruApi = useGuruApi();

const id = computed(() => route.params.id as string);
const loading = ref(true);
const submitting = ref(false);
const guruData = ref<Guru | null>(null);

const form = reactive({
    nama_guru: "",
    email: "",
    no_hp: "",
    jenis_kelamin: "" as "L" | "P" | "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat: "",
    foto: "",
});

const jenisKelaminOptions = [
    { label: "Laki-laki", value: "L" },
    { label: "Perempuan", value: "P" },
];

async function fetchGuru() {
    loading.value = true;
    try {
        const response = await guruApi.getById(id.value);
        if (response.success && response.data) {
            guruData.value = response.data;
            form.nama_guru = response.data.nama_guru || "";
            form.email = response.data.email || "";
            form.no_hp = response.data.no_hp || "";
            form.jenis_kelamin = response.data.jenis_kelamin || "";
            form.tempat_lahir = response.data.tempat_lahir || "";
            form.tanggal_lahir =
                response.data.tanggal_lahir?.split("T")[0] || "";
            form.alamat = response.data.alamat || "";
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

async function handleSubmit() {
    // Validasi
    if (!form.nama_guru) {
        toast.add({ title: "Nama Guru wajib diisi", color: "error" });
        return;
    }

    if (form.email && form.email !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            toast.add({ title: "Format email tidak valid", color: "error" });
            return;
        }
    }

    submitting.value = true;
    try {
        const response = await guruApi.update(id.value, {
            nama_guru: form.nama_guru,
            email: form.email || undefined,
            no_hp: form.no_hp || undefined,
            jenis_kelamin: form.jenis_kelamin || undefined,
            tempat_lahir: form.tempat_lahir || undefined,
            tanggal_lahir: form.tanggal_lahir || undefined,
            alamat: form.alamat || undefined,
        });

        if (response.success) {
            toast.add({
                title: "Data guru berhasil diperbarui",
                color: "success",
            });
            router.push("/admin/master/teachers");
        } else {
            toast.add({
                title: "Gagal memperbarui guru",
                description: response.message || "Terjadi kesalahan",
                color: "error",
            });
        }
    } catch (error: any) {
        toast.add({
            title: "Terjadi kesalahan",
            description: error.message || "Silakan coba lagi",
            color: "error",
        });
    } finally {
        submitting.value = false;
    }
}

function handleCancel() {
    router.push("/admin/master/teachers");
}

onMounted(() => {
    fetchGuru();
});

useHead({ title: "Edit Guru | Admin" });
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
                @click="handleCancel"
            >
                Kembali
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Edit Guru
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Perbarui data guru pembimbing
                </p>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <UIcon
                name="lucide:loader-2"
                class="w-8 h-8 animate-spin text-slate-400"
            />
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2">
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

                    <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
                        <!-- NIP (Readonly) -->
                        <div class="w-full">
                            <label
                                class="block text-sm font-medium text-slate-700 mb-2"
                            >
                                NIP
                            </label>
                            <UInput
                                :value="guruData?.nip"
                                disabled
                                size="lg"
                                class="w-full"
                            />
                            <p class="mt-1 text-xs text-slate-500">
                                NIP tidak dapat diubah
                            </p>
                        </div>

                        <!-- Nama -->
                        <div class="w-full">
                            <label
                                class="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Nama Lengkap <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="form.nama_guru"
                                placeholder="Nama lengkap guru dengan gelar"
                                size="lg"
                                class="w-full"
                                required
                            />
                        </div>

                        <!-- Jenis Kelamin -->
                        <div class="w-full">
                            <label
                                class="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Jenis Kelamin
                            </label>
                            <USelectMenu
                                v-model="form.jenis_kelamin"
                                :items="jenisKelaminOptions"
                                value-key="value"
                                placeholder="Pilih jenis kelamin"
                                size="lg"
                                class="w-full"
                            />
                        </div>

                        <!-- Tempat & Tanggal Lahir -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Tempat Lahir
                                </label>
                                <UInput
                                    v-model="form.tempat_lahir"
                                    placeholder="Kota kelahiran"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Tanggal Lahir
                                </label>
                                <UInput
                                    v-model="form.tanggal_lahir"
                                    type="date"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Email & No HP -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email
                                </label>
                                <UInput
                                    v-model="form.email"
                                    type="email"
                                    placeholder="email@sekolah.sch.id"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    No HP
                                </label>
                                <UInput
                                    v-model="form.no_hp"
                                    type="tel"
                                    placeholder="08xxxxxxxxxx"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Alamat -->
                        <div class="w-full">
                            <label
                                class="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Alamat Lengkap
                            </label>
                            <UTextarea
                                v-model="form.alamat"
                                placeholder="Alamat lengkap guru"
                                :rows="3"
                                class="w-full"
                            />
                        </div>
                    </form>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="lg:col-span-1">
                <div
                    class="bg-amber-50 border border-amber-200 rounded-xl p-4 sticky top-6"
                >
                    <div class="flex gap-3">
                        <Icon
                            name="lucide:alert-triangle"
                            class="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                        />
                        <div class="text-sm text-amber-900">
                            <p class="font-semibold mb-2">Perhatian:</p>
                            <ul class="space-y-1.5">
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:check"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span>NIP tidak dapat diubah</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:check"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Perubahan data akan mempengaruhi
                                        seluruh sistem</span
                                    >
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div
            class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200"
        >
            <UButton
                variant="outline"
                color="neutral"
                size="lg"
                @click="handleCancel"
            >
                Batal
            </UButton>
            <UButton
                color="primary"
                size="lg"
                :loading="submitting"
                @click="handleSubmit"
            >
                <Icon name="lucide:check" class="w-4 h-4" />
                Simpan Perubahan
            </UButton>
        </div>
    </div>
</template>
