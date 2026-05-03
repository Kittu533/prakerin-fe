<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-3">
            <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                @click="navigateTo('/siswa/logbook')"
            >
                <Icon name="lucide:arrow-left" class="w-5 h-5" />
            </UButton>
            <div>
                <h1 class="text-xl font-bold text-slate-900">Tulis Logbook</h1>
                <p class="text-sm text-slate-500">
                    Catat kegiatan PKL harianmu
                </p>
            </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 lg:p-6">
            <form @submit.prevent="submitForm" class="space-y-5">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <UFormField label="Tanggal" required>
                        <UInput
                            v-model="form.tanggal"
                            type="date"
                            :min="getLocalDateKey()"
                            :max="getLocalDateKey()"
                            disabled
                            class="w-full"
                        />
                    </UFormField>
                    <UFormField label="Jam Mulai" required>
                        <UInput
                            v-model="form.jamMulai"
                            type="time"
                            class="w-full"
                        />
                    </UFormField>
                    <UFormField label="Jam Selesai" required>
                        <UInput
                            v-model="form.jamSelesai"
                            type="time"
                            class="w-full"
                        />
                    </UFormField>
                </div>

                <UFormField label="Judul Kegiatan" required>
                    <UTextarea
                        v-model="form.judul"
                        :rows="1"
                        placeholder="Contoh: Membuat UI Dashboard"
                        class="w-full"
                    />
                    <template #hint>
                        <span class="text-xs text-slate-400"
                            >Minimal 5 karakter</span
                        >
                    </template>
                </UFormField>

                <UFormField label="Deskripsi Kegiatan" required>
                    <UTextarea
                        v-model="form.deskripsi"
                        placeholder="Jelaskan detail kegiatan yang kamu lakukan hari ini..."
                        :rows="5"
                        autoresize
                        class="w-full"
                    />
                    <template #hint>
                        <span class="text-xs text-slate-400"
                            >Minimal 20 karakter</span
                        >
                    </template>
                </UFormField>

                <UFormField label="Foto Kegiatan (Opsional)">
                    <div
                        class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all"
                        @click="($refs.fileInput as HTMLInputElement).click()"
                        @dragover.prevent
                        @drop.prevent="handleDrop"
                    >
                        <input
                            ref="fileInput"
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="handleFileChange"
                        />
                        <div v-if="form.fotoPreview">
                            <img
                                :src="form.fotoPreview"
                                class="w-32 h-32 mx-auto rounded-xl object-cover mb-3"
                            />
                            <p class="text-sm text-slate-600">
                                Klik untuk ganti foto
                            </p>
                            <UButton
                                type="button"
                                variant="ghost"
                                color="error"
                                size="xs"
                                class="mt-2"
                                @click.stop="removePhoto"
                            >
                                <Icon
                                    name="lucide:trash-2"
                                    class="w-4 h-4 mr-1"
                                />
                                Hapus Foto
                            </UButton>
                        </div>
                        <div v-else>
                            <div
                                class="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"
                            >
                                <Icon
                                    name="lucide:image-plus"
                                    class="w-8 h-8 text-slate-400"
                                />
                            </div>
                            <p class="text-sm text-slate-600">
                                Drag & drop atau klik untuk upload
                            </p>
                            <p class="text-xs text-slate-400 mt-1">
                                Format: JPG, PNG (Max 2MB)
                            </p>
                        </div>
                    </div>
                </UFormField>

                <div class="flex gap-3 pt-4">
                    <UButton
                        type="button"
                        variant="outline"
                        color="neutral"
                        class="flex-1"
                        @click="navigateTo('/siswa/logbook')"
                    >
                        Batal
                    </UButton>
                    <UButton
                        type="submit"
                        color="primary"
                        class="flex-1"
                        :loading="submitting"
                    >
                        <Icon name="lucide:save" class="w-4 h-4 mr-2" />
                        Simpan Logbook
                    </UButton>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    useSiswaLogbookApi,
    useSiswaPenempatanApi,
} from "~/composables/api/use-siswa";

definePageMeta({ layout: "siswa" });

const toast = useToast();
const submitting = ref(false);
const loading = ref(true);
const penempatan = ref<{ id: string } | null>(null);

const logbookApi = useSiswaLogbookApi();
const penempatanApi = useSiswaPenempatanApi();

const form = reactive({
    tanggal: getLocalDateKey(),
    jamMulai: "08:00",
    jamSelesai: "16:00",
    judul: "",
    deskripsi: "",
    foto: null as File | null,
    fotoPreview: "",
});

// Load penempatan data to get id_penempatan
onMounted(async () => {
    try {
        const response = await penempatanApi.getMyPenempatan();
        if (response.success && response.data) {
            penempatan.value = { id: response.data.id_penempatan };
        } else {
            toast.add({
                title: "Anda belum memiliki penempatan PKL",
                color: "warning",
            });
            navigateTo("/siswa/internship/status");
        }
    } catch (error) {
        console.error("Failed to load penempatan:", error);
        toast.add({ title: "Gagal memuat data penempatan", color: "error" });
    } finally {
        loading.value = false;
    }
});

function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) processFile(file);
}

function handleDrop(e: DragEvent) {
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
}

function processFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
        toast.add({ title: "File terlalu besar (max 2MB)", color: "error" });
        return;
    }
    if (!file.type.startsWith("image/")) {
        toast.add({ title: "Format file harus gambar", color: "error" });
        return;
    }
    form.foto = file;
    form.fotoPreview = URL.createObjectURL(file);
}

function removePhoto() {
    form.foto = null;
    form.fotoPreview = "";
}

async function submitForm() {
    if (
        !form.tanggal ||
        !form.jamMulai ||
        !form.jamSelesai ||
        !form.judul ||
        !form.deskripsi
    ) {
        toast.add({ title: "Lengkapi semua field yang wajib", color: "error" });
        return;
    }
    if (form.judul.length < 5) {
        toast.add({ title: "Judul minimal 5 karakter", color: "error" });
        return;
    }
    if (form.deskripsi.length < 20) {
        toast.add({ title: "Deskripsi minimal 20 karakter", color: "error" });
        return;
    }
    if (form.jamMulai >= form.jamSelesai) {
        toast.add({
            title: "Jam mulai harus sebelum jam selesai",
            color: "error",
        });
        return;
    }
    if (!penempatan.value) {
        toast.add({ title: "Data penempatan tidak ditemukan", color: "error" });
        return;
    }

    submitting.value = true;
    try {
        const payload = {
            id_penempatan: penempatan.value.id,
            tanggal: form.tanggal,
            judul_kegiatan: form.judul,
            isi_kegiatan: form.deskripsi,
            foto_kegiatan: form.foto ? form.foto.name : undefined,
        };

        const response = await logbookApi.create(payload);

        if (response?.success) {
            toast.add({
                title: "Logbook berhasil disimpan!",
                color: "success",
            });
            navigateTo("/siswa/logbook");
        } else {
            toast.add({
                title: (response as any)?.message || "Gagal menyimpan logbook",
                color: "error",
            });
        }
    } catch (error: any) {
        console.error("Failed to create logbook:", error);
        toast.add({
            title: error.message || "Gagal menyimpan logbook",
            color: "error",
        });
    } finally {
        submitting.value = false;
    }
}

useHead({ title: "Tulis Logbook | Siswa PKL" });
</script>
