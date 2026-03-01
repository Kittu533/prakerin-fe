<script setup lang="ts">
import { ref, reactive } from "vue";
import { useGuruApi } from "~/composables/api/use-academic";

definePageMeta({ layout: "admin" });

const router = useRouter();
const toast = useToast();
const guruApi = useGuruApi();

const submitting = ref(false);
const showPasswordModal = ref(false);
const generatedPassword = ref("");

const form = reactive({
    nip: "",
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

async function handleSubmit() {
    // Validasi
    if (!form.nip || !form.nama_guru || !form.email) {
        toast.add({
            title: "NIP, Nama, dan Email wajib diisi",
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
        const response = await guruApi.create({
            nip: form.nip,
            nama_guru: form.nama_guru,
            email: form.email || undefined,
            no_hp: form.no_hp || undefined,
            jenis_kelamin: form.jenis_kelamin || undefined,
            tempat_lahir: form.tempat_lahir || undefined,
            tanggal_lahir: form.tanggal_lahir || undefined,
            alamat: form.alamat || undefined,
        });

        if (response.success) {
            // Tampilkan password yang di-generate
            if (response.data.generated_password) {
                generatedPassword.value = response.data.generated_password;
                showPasswordModal.value = true;
            }

            toast.add({
                title: "Guru berhasil ditambahkan",
                color: "success",
            });
            router.push("/admin/master/teachers");
        } else {
            toast.add({
                title: "Gagal menambahkan guru",
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

useHead({ title: "Tambah Guru | Admin" });
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
                    Tambah Guru
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Tambah data guru pembimbing baru
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
                        <!-- NIP & Nama -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    NIP <span class="text-red-500">*</span>
                                </label>
                                <UInput
                                    v-model="form.nip"
                                    placeholder="198501012010011001"
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
                                    v-model="form.nama_guru"
                                    placeholder="Nama lengkap guru dengan gelar"
                                    size="lg"
                                    class="w-full"
                                    required
                                />
                            </div>
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
                                    Email <span class="text-red-500">*</span>
                                </label>
                                <UInput
                                    v-model="form.email"
                                    type="email"
                                    placeholder="email@sekolah.sch.id"
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
                                    <span>NIP harus unik</span>
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
                                        >Guru login menggunakan NIP dan
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
                Simpan Guru
            </UButton>
        </div>

        <!-- Password Success Modal -->
        <UModal v-model:open="showPasswordModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            Guru Berhasil Ditambahkan
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
                                Login dengan NIP:
                            </p>
                            <p class="text-sm text-slate-700 mb-1">
                                NIP:
                                <span class="font-mono font-bold">{{
                                    form.nip
                                }}</span>
                            </p>
                            <p class="text-xs text-slate-500 mt-2">Password:</p>
                            <p class="font-mono font-bold text-lg">
                                {{ generatedPassword }}
                            </p>
                        </div>
                        <p class="text-xs text-amber-600">
                            Simpan password ini. Guru dapat mengubah password
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
