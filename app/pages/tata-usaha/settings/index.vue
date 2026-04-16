<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h2 class="text-lg font-semibold text-slate-900">Pengaturan</h2>
            <p class="text-sm text-slate-500">Kelola pengaturan akun Tata Usaha</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
            <!-- Profile Settings -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <h3 class="font-semibold text-slate-900 mb-4">Profil</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                        <UInput v-model="profile.name" placeholder="Nama lengkap" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <UInput v-model="profile.email" type="email" placeholder="Email" />
                    </div>
                    <UButton color="primary" :loading="savingProfile" @click="saveProfile">
                        Simpan Perubahan
                    </UButton>
                </div>
            </div>

            <!-- Password Change -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <h3 class="font-semibold text-slate-900 mb-4">Ubah Password</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
                        <UInput v-model="password.current" type="password" placeholder="Password lama" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                        <UInput v-model="password.new" type="password" placeholder="Password baru" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
                        <UInput v-model="password.confirm" type="password" placeholder="Konfirmasi password baru" />
                    </div>
                    <UButton color="primary" :loading="savingPassword" @click="changePassword">
                        Ubah Password
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Activity Log -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
            <h3 class="font-semibold text-slate-900 mb-4">Aktivitas Terbaru</h3>
            <div v-if="loadingActivity" class="space-y-3">
                <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
            </div>
            <div v-else-if="activities.length === 0" class="text-center py-8 text-slate-500">
                <Icon name="lucide:activity" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p class="text-sm">Belum ada aktivitas</p>
            </div>
            <div v-else class="space-y-3">
                <div
                    v-for="activity in activities"
                    :key="activity.id"
                    class="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                >
                    <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                        <Icon name="lucide:user" class="w-4 h-4 text-sky-600" />
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-900">{{ activity.description }}</p>
                        <p class="text-xs text-slate-500">{{ activity.timestamp }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/auth/use-auth";
import { useSweetAlert } from "~/composables/use-sweet-alert";

definePageMeta({ layout: "tata-usaha" });

const { user, changePassword: authChangePassword } = useAuth();
const { showSuccess, showError } = useSweetAlert();

const savingProfile = ref(false);
const savingPassword = ref(false);
const loadingActivity = ref(false);

const profile = ref({
    name: "",
    email: "",
});

const password = ref({
    current: "",
    new: "",
    confirm: "",
});

const activities = ref<{ id: number; description: string; timestamp: string }[]>([]);

onMounted(() => {
    if (user.value) {
        profile.value.name = (user.value as any).name || "";
        profile.value.email = (user.value as any).email || "";
    }
    fetchActivities();
});

async function fetchActivities() {
    loadingActivity.value = true;
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        activities.value = [
            { id: 1, description: "Login ke sistem", timestamp: new Date().toLocaleString("id-ID") },
            { id: 2, description: "Mengubah profil", timestamp: new Date(Date.now() - 86400000).toLocaleString("id-ID") },
        ];
    } finally {
        loadingActivity.value = false;
    }
}

async function saveProfile() {
    savingProfile.value = true;
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        await showSuccess("Berhasil", "Profil berhasil diperbarui");
    } catch (err) {
        console.error("[Settings] Error saving profile:", err);
    } finally {
        savingProfile.value = false;
    }
}

async function changePassword() {
    if (password.value.new !== password.value.confirm) {
        await showError("Gagal", "Password baru dan konfirmasi tidak cocok");
        return;
    }

    if (password.value.new.length < 6) {
        await showError("Gagal", "Password minimal 6 karakter");
        return;
    }

    savingPassword.value = true;
    try {
        const result = await authChangePassword({
            currentPassword: password.value.current,
            newPassword: password.value.new,
            confirmPassword: password.value.confirm,
        });

        if (result.success) {
            await showSuccess("Berhasil", "Password berhasil diubah");
            password.value = { current: "", new: "", confirm: "" };
        } else {
            await showError("Gagal", result.message);
        }
    } catch (err) {
        console.error("[Settings] Error changing password:", err);
        await showError("Gagal", "Terjadi kesalahan saat mengubah password");
    } finally {
        savingPassword.value = false;
    }
}

useHead({ title: "Pengaturan | Tata Usaha" });
</script>
