<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useSiswaApi, useKelasApi } from "~/composables/api/use-academic";

definePageMeta({ layout: "admin" });

const router = useRouter();
const toast = useToast();
const siswaApi = useSiswaApi();
const kelasApi = useKelasApi();

const loading = ref(false);
const submitting = ref(false);
const showPasswordModal = ref(false);
const generatedPassword = ref("");
const allKelas = ref<any[]>([]);

const form = reactive({
    nis: "",
    nama_siswa: "",
    jenis_kelamin: "" as "L" | "P" | "",
    tanggal_lahir: "",
    alamat: "",
    no_hp: "",
    email: "",
    foto: "",
    id_kelas: undefined as number | undefined,
});

const jenisKelaminOptions = [
    { label: "Laki-laki", value: "L" },
    { label: "Perempuan", value: "P" },
];

async function handleSubmit() {
    // Validasi
    if (!form.nis || !form.nama_siswa || !form.id_kelas || !form.email) {
        toast.add({
            title: "NIS, Nama, Kelas, dan Email wajib diisi",
            color: "error",
        });
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
        const response = await siswaApi.create({
            nis: form.nis,
            nama_siswa: form.nama_siswa,
            jenis_kelamin: form.jenis_kelamin || undefined,
            tanggal_lahir: form.tanggal_lahir || undefined,
            alamat: form.alamat || undefined,
            no_hp: form.no_hp || undefined,
            email: form.email || undefined,
            foto: form.foto || undefined,
            id_kelas: form.id_kelas,
        });

        if (response.success) {
            // Tampilkan password yang di-generate
            if (response.data.generated_password) {
                generatedPassword.value = response.data.generated_password;
                showPasswordModal.value = true;
            }

            toast.add({
                title: "Siswa berhasil ditambahkan",
                color: "success",
            });
            router.push("/admin/master/students");
        } else {
            toast.add({
                title: "Gagal menambahkan siswa",
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

async function fetchKelas() {
    try {
        const response = await kelasApi.getAll({ limit: 100 });
        if (response.success) {
            allKelas.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch kelas:", error);
    }
}

function handleCancel() {
    router.push("/admin/master/students");
}

onMounted(() => {
    fetchKelas();
});

useHead({ title: "Tambah Siswa | Admin" });
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
                    Tambah Siswa
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Tambah data siswa baru
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <!-- NIS & Nama -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    NIS <span class="text-red-500">*</span>
                                </label>
                                <UInput
                                    v-model="form.nis"
                                    placeholder="Nomor Induk Siswa"
                                    size="lg"
                                    class="w-full"
                                    required
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Nama Lengkap
                                    <span class="text-red-500">*</span>
                                </label>
                                <UInput
                                    v-model="form.nama_siswa"
                                    placeholder="Nama lengkap siswa"
                                    size="lg"
                                    class="w-full"
                                    required
                                />
                            </div>
                        </div>

                        <!-- Jenis Kelamin & Kelas -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Jenis Kelamin
                                    <span class="text-red-500">*</span>
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
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kelas <span class="text-red-500">*</span>
                                </label>
                                <USelectMenu
                                    v-model="form.id_kelas"
                                    :items="allKelas"
                                    value-key="id_kelas"
                                    placeholder="Pilih kelas"
                                    size="lg"
                                    class="w-full"
                                >
                                    <template #label>
                                        {{
                                            allKelas.find(
                                                (k) =>
                                                    k.id_kelas ===
                                                    form.id_kelas,
                                            )?.nama_kelas || "Pilih Kelas"
                                        }}
                                    </template>
                                    <template #item="{ item }">
                                        {{ item.nama_kelas }}
                                    </template>
                                </USelectMenu>
                            </div>
                        </div>

                        <!-- Tanggal Lahir -->
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

                        <!-- Email & No HP -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email <span class="text-red-500">*</span>
                                </label>
                                <UInput
                                    v-model="form.email"
                                    type="email"
                                    placeholder="email@siswa.sch.id"
                                    size="lg"
                                    class="w-full"
                                    required
                                />
                                <p class="text-xs text-slate-500 mt-1">
                                    Digunakan untuk login
                                </p>
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
                                placeholder="Alamat lengkap siswa"
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
                    class="bg-blue-50 border border-blue-200 rounded-xl p-4 sticky top-6"
                >
                    <div class="flex gap-3">
                        <Icon
                            name="lucide:info"
                            class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                        />
                        <div class="text-sm text-blue-900">
                            <p class="font-semibold mb-2">Informasi:</p>
                            <ul class="space-y-1.5">
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:check"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span>NIS harus unik</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:check"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Password akan digenerate otomatis</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:check"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Siswa login menggunakan NIS dan
                                        password</span
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
                Simpan Siswa
            </UButton>
        </div>

        <!-- Password Success Modal -->
        <UModal v-model:open="showPasswordModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            Siswa Berhasil Ditambahkan
                        </h3>
                    </template>
                    <div class="text-center py-4">
                        <div
                            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <Icon
                                name="lucide:check"
                                class="w-8 h-8 text-green-600"
                            />
                        </div>
                        <p class="text-sm text-slate-600 mb-3">
                            Password default untuk login:
                        </p>
                        <div class="bg-slate-100 rounded-lg p-3 mb-3">
                            <p class="text-xs text-slate-500 mb-1">
                                Login dengan NIS:
                            </p>
                            <p class="text-sm text-slate-700 mb-1">
                                NIS:
                                <span class="font-mono font-bold">{{
                                    form.nis
                                }}</span>
                            </p>
                            <p class="text-xs text-slate-500 mt-2">Password:</p>
                            <p class="font-mono font-bold text-lg">
                                {{ generatedPassword }}
                            </p>
                        </div>
                        <p class="text-xs text-amber-600">
                            Simpan password ini. Siswa dapat mengubah password
                            setelah login.
                        </p>
                    </div>
                    <template #footer>
                        <UButton
                            color="primary"
                            block
                            @click="showPasswordModal = false"
                        >
                            Mengerti
                        </UButton>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
