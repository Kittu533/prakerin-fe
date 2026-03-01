<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useMentorApi, usePerusahaanApi } from "~/composables/api/use-partner";

definePageMeta({ layout: "admin" });

const router = useRouter();
const toast = useToast();
const mentorApi = useMentorApi();
const perusahaanApi = usePerusahaanApi();

const loading = ref(false);
const submitting = ref(false);
const showPasswordModal = ref(false);
const generatedPassword = ref("");
const allPerusahaan = ref<any[]>([]);

const form = reactive({
    nama_mentor: "",
    jabatan: "",
    email: "",
    no_hp: "",
    id_perusahaan: undefined as number | undefined,
});

async function handleSubmit() {
    // Validasi
    if (!form.nama_mentor || !form.email || !form.id_perusahaan) {
        toast.add({
            title: "Nama, Email, dan Perusahaan wajib diisi",
            color: "error",
        });
        return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
        toast.add({ title: "Format email tidak valid", color: "error" });
        return;
    }

    submitting.value = true;
    try {
        const response = await mentorApi.create({
            nama_mentor: form.nama_mentor,
            jabatan: form.jabatan || undefined,
            email: form.email,
            no_hp: form.no_hp || undefined,
            id_perusahaan: form.id_perusahaan,
        });

        if (response.success) {
            // Tampilkan password yang di-generate
            if (response.data.generated_password) {
                generatedPassword.value = response.data.generated_password;
                showPasswordModal.value = true;
            }

            toast.add({
                title: "Mentor berhasil ditambahkan",
                color: "success",
            });
            router.push("/admin/master/mentors");
        } else {
            toast.add({
                title: "Gagal menambahkan mentor",
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

async function fetchPerusahaan() {
    try {
        const response = await perusahaanApi.getAll({ limit: 100 });
        if (response.success) {
            allPerusahaan.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch perusahaan:", error);
    }
}

function handleCancel() {
    router.push("/admin/master/mentors");
}

onMounted(() => {
    fetchPerusahaan();
});

useHead({ title: "Tambah Mentor | Admin" });
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
                    Tambah Mentor
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Tambah data mentor industri baru
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-4">
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

                    <div class="p-5 space-y-4">
                        <!-- Nama & Perusahaan -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Nama Lengkap
                                    <span class="text-red-500">*</span>
                                </label>
                                <UInput
                                    v-model="form.nama_mentor"
                                    placeholder="Nama lengkap mentor"
                                    size="lg"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Perusahaan
                                    <span class="text-red-500">*</span>
                                </label>
                                <USelectMenu
                                    v-model="form.id_perusahaan"
                                    :items="allPerusahaan"
                                    value-key="id_perusahaan"
                                    placeholder="Pilih perusahaan"
                                    size="lg"
                                >
                                    <template #label>
                                        {{
                                            allPerusahaan.find(
                                                (p) =>
                                                    p.id_perusahaan ===
                                                    form.id_perusahaan,
                                            )?.nama_perusahaan ||
                                            "Pilih Perusahaan"
                                        }}
                                    </template>
                                    <template #item="{ item }">
                                        {{ item.nama_perusahaan }}
                                    </template>
                                </USelectMenu>
                            </div>
                        </div>

                        <!-- Jabatan & No HP -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Jabatan
                                </label>
                                <UInput
                                    v-model="form.jabatan"
                                    placeholder="Manager / Supervisor"
                                    size="lg"
                                />
                            </div>
                            <div>
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
                                />
                            </div>
                        </div>

                        <!-- Email -->
                        <div>
                            <label
                                class="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Email <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="form.email"
                                type="email"
                                placeholder="email@company.com"
                                size="lg"
                                required
                            />
                            <p class="text-xs text-slate-500 mt-1">
                                Digunakan untuk login
                            </p>
                        </div>
                    </div>
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
                                    <span>Email harus unik</span>
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
                                        >Mentor login menggunakan Email dan
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
                Simpan Mentor
            </UButton>
        </div>

        <!-- Password Success Modal -->
        <UModal v-model:open="showPasswordModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            Mentor Berhasil Ditambahkan
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
                                Login dengan Email:
                            </p>
                            <p class="text-sm text-slate-700 mb-1">
                                Email:
                                <span class="font-mono font-bold">{{
                                    form.email
                                }}</span>
                            </p>
                            <p class="text-xs text-slate-500 mt-2">Password:</p>
                            <p class="font-mono font-bold text-lg">
                                {{ generatedPassword }}
                            </p>
                        </div>
                        <p class="text-xs text-amber-600">
                            Simpan password ini. Mentor dapat mengubah password
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
