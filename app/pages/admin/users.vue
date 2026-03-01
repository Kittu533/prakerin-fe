<script setup lang="ts">
import { useUserApi, type User } from "~/composables/api/use-identity";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const toast = useToast();
const userApi = useUserApi();

const loading = ref(true);
const search = ref("");
const filterRole = ref("Semua");
const modalOpen = ref(false);
const resetModalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);
const resetUser = ref<User | null>(null);
const newPassword = ref("");

const form = reactive({
    id: null as number | null,
    identifier: "",
    password: "",
    role: "" as string,
    is_active: true,
});

const roleItems = ["admin", "guru", "mentor", "siswa"];
const data = ref<User[]>([]);

const getInitials = (identifier: string) => {
    return identifier.slice(0, 2).toUpperCase();
};

const columns: ColumnDef<User, any>[] = [
    {
        id: "identifier",
        header: "Pengguna",
        cell: ({ row }) => {
            const role = row.original.role;
            const colorClass = roleColor(role).bg;
            const nama = row.original.nama || row.original.identifier;
            const additionalInfo = row.original.additionalInfo;

            return h("div", { class: "flex items-center gap-3" }, [
                h(
                    "div",
                    {
                        class: `w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${colorClass} flex-shrink-0`,
                    },
                    getInitials(nama),
                ),
                h("div", { class: "min-w-0 flex-1" }, [
                    h(
                        "p",
                        {
                            class: "text-sm font-semibold text-slate-900 truncate",
                        },
                        nama,
                    ),
                    additionalInfo
                        ? h(
                              "p",
                              { class: "text-xs text-slate-500 truncate" },
                              additionalInfo,
                          )
                        : h(
                              "p",
                              { class: "text-xs text-slate-400" },
                              row.original.identifier,
                          ),
                ]),
            ]);
        },
    },
    {
        id: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.original.role;
            const color = roleColor(role).color;
            const roleLabel =
                {
                    admin: "Admin",
                    guru: "Guru",
                    siswa: "Siswa",
                    mentor: "Mentor",
                }[role] || role.toUpperCase();

            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "span",
                    {
                        class: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${color}-50 text-${color}-700`,
                    },
                    roleLabel,
                ),
            ]);
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.is_active;
            return h(
                "span",
                {
                    class: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`,
                },
                [
                    h("span", {
                        class: `w-1.5 h-1.5 rounded-full ${isActive ? "bg-success-500" : "bg-neutral-400"}`,
                    }),
                    isActive ? "Aktif" : "Nonaktif",
                ],
            );
        },
    },
    {
        id: "aksi",
        header: "",
        cell: ({ row }) => {
            return h("div", { class: "flex gap-1" }, [
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-amber-50 text-amber-600",
                        onClick: () => resetPassword(row.original),
                        title: "Reset Password",
                    },
                    h(
                        "svg",
                        {
                            class: "w-4 h-4",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": 2,
                        },
                        [
                            h("path", { d: "M21 2v6h-6" }),
                            h("path", { d: "M3 12a9 9 0 0 1 15-6.7L21 8" }),
                            h("path", { d: "M3 22v-6h6" }),
                            h("path", { d: "M21 12a9 9 0 0 1-15 6.7L3 16" }),
                        ],
                    ),
                ),
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-slate-100 text-slate-600",
                        onClick: () => openModal(row.original),
                        title: "Edit",
                    },
                    h(
                        "svg",
                        {
                            class: "w-4 h-4",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": 2,
                        },
                        [
                            h("path", {
                                d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
                            }),
                        ],
                    ),
                ),
            ]);
        },
    },
];

// Computed for filtering
const allFilteredData = computed(() =>
    data.value.filter((d) => {
        const matchSearch =
            !search.value ||
            d.identifier.toLowerCase().includes(search.value.toLowerCase()) ||
            (d.nama &&
                d.nama.toLowerCase().includes(search.value.toLowerCase())) ||
            (d.additionalInfo &&
                d.additionalInfo
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
        const matchRole =
            filterRole.value === "Semua" ||
            d.role.toLowerCase() === filterRole.value.toLowerCase();
        return matchSearch && matchRole;
    }),
);

const roleColor = (role: string): { color: string; bg: string } =>
    ({
        admin: { color: "red", bg: "bg-red-100 text-red-600" },
        guru: { color: "sky", bg: "bg-sky-100 text-sky-600" },
        mentor: { color: "amber", bg: "bg-amber-100 text-amber-600" },
        siswa: { color: "green", bg: "bg-green-100 text-green-600" },
    })[role.toLowerCase()] || {
        color: "slate",
        bg: "bg-slate-100 text-slate-600",
    };

const openModal = (user?: User) => {
    editing.value = !!user;
    if (user) {
        Object.assign(form, {
            id: user.id,
            identifier: user.identifier,
            password: "",
            role: user.role,
            is_active: user.is_active,
        });
    } else {
        Object.assign(form, {
            id: null,
            identifier: "",
            password: "",
            role: "",
            is_active: true,
        });
    }
    modalOpen.value = true;
};

const saveUser = async () => {
    if (!form.identifier || !form.role) {
        toast.add({ title: "Lengkapi semua field", color: "error" });
        return;
    }
    if (!editing.value && !form.password) {
        toast.add({ title: "Password wajib diisi", color: "error" });
        return;
    }

    processing.value = true;
    try {
        if (editing.value && form.id) {
            const response = await userApi.update(form.id, {
                role: form.role,
                is_active: form.is_active,
            });
            if (response.success) {
                toast.add({ title: "Akun diperbarui", color: "success" });
                await fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal memperbarui",
                    color: "error",
                });
            }
        } else {
            const response = await userApi.create({
                identifier: form.identifier,
                password: form.password,
                role: form.role,
                entity_id: 1,
                entity_type: form.role,
            });
            if (response.success) {
                toast.add({ title: "Akun ditambahkan", color: "success" });
                await fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal menambahkan",
                    color: "error",
                });
            }
        }
        modalOpen.value = false;
    } catch (error) {
        toast.add({ title: "Terjadi kesalahan", color: "error" });
    } finally {
        processing.value = false;
    }
};

const resetPassword = async (user: User) => {
    try {
        const response = await userApi.resetPassword(user.id);
        if (response.success && response.data?.generated_password) {
            resetUser.value = user;
            newPassword.value = response.data.generated_password;
            resetModalOpen.value = true;
        } else {
            toast.add({
                title: response.message || "Gagal reset password",
                color: "error",
            });
        }
    } catch (error) {
        toast.add({ title: "Terjadi kesalahan", color: "error" });
    }
};

const copyPassword = () => {
    navigator.clipboard.writeText(newPassword.value);
    toast.add({ title: "Password disalin", color: "success" });
};

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await userApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch users:", error);
        // Fallback to empty array
        data.value = [];
    } finally {
        loading.value = false;
    }
};

// Watch for filter changes to sync with CommonAppDataTable search
watch([filterRole], () => {
    // When role filter changes, we need to filter the data
    // This is handled by allFilteredData computed
});

onMounted(fetchData);

useHead({ title: "Kelola Akun | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Kelola Akun
                </h1>
                <p class="text-sm text-slate-500">
                    Manajemen akun pengguna sistem
                </p>
            </div>
            <UButton color="primary" @click="openModal()">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah Akun
            </UButton>
        </div>

        <CommonAppDataTable
            :data="allFilteredData"
            :columns="columns"
            :loading="loading"
            title="Daftar Pengguna"
            description="Manajemen akun pengguna sistem"
            searchable
            search-placeholder="Cari pengguna..."
        >
            <template #toolbar-right>
                <USelectMenu
                    v-model="filterRole"
                    :items="['Semua', 'Admin', 'Guru', 'Mentor', 'Siswa']"
                    class="w-32"
                />
            </template>
        </CommonAppDataTable>

        <!-- Form Modal -->
        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard class="w-full max-w-md">
                    <template #header>
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-xl flex items-center justify-center"
                                :class="editing ? 'bg-amber-100' : 'bg-sky-100'"
                            >
                                <Icon
                                    :name="
                                        editing
                                            ? 'lucide:user-cog'
                                            : 'lucide:user-plus'
                                    "
                                    class="w-5 h-5"
                                    :class="
                                        editing
                                            ? 'text-amber-600'
                                            : 'text-sky-600'
                                    "
                                />
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-900">
                                    {{
                                        editing
                                            ? "Edit Akun"
                                            : "Tambah Akun Baru"
                                    }}
                                </h3>
                                <p class="text-xs text-slate-500">
                                    {{
                                        editing
                                            ? "Perbarui informasi akun pengguna"
                                            : "Buat akun baru untuk pengguna"
                                    }}
                                </p>
                            </div>
                        </div>
                    </template>

                    <div class="space-y-5">
                        <div class="space-y-4">
                            <p
                                class="text-xs font-semibold text-slate-400 uppercase tracking-wide"
                            >
                                Informasi Akun
                            </p>

                            <UFormField label="Email/Username" required>
                                <UInput
                                    v-model="form.identifier"
                                    placeholder="contoh@email.com"
                                    class="w-full"
                                    :disabled="editing"
                                >
                                    <template #leading>
                                        <Icon
                                            name="lucide:mail"
                                            class="w-4 h-4 text-slate-400"
                                        />
                                    </template>
                                </UInput>
                            </UFormField>

                            <UFormField
                                v-if="!editing"
                                label="Password"
                                required
                            >
                                <UInput
                                    v-model="form.password"
                                    type="password"
                                    placeholder="Minimal 8 karakter"
                                    class="w-full"
                                >
                                    <template #leading>
                                        <Icon
                                            name="lucide:lock"
                                            class="w-4 h-4 text-slate-400"
                                        />
                                    </template>
                                </UInput>
                            </UFormField>
                        </div>

                        <div class="space-y-4 pt-2 border-t border-slate-100">
                            <p
                                class="text-xs font-semibold text-slate-400 uppercase tracking-wide"
                            >
                                Hak Akses
                            </p>

                            <UFormField label="Role Pengguna" required>
                                <USelectMenu
                                    v-model="form.role"
                                    :items="roleItems"
                                    placeholder="Pilih role"
                                    class="w-full"
                                >
                                    <template #leading>
                                        <Icon
                                            name="lucide:shield"
                                            class="w-4 h-4 text-slate-400"
                                        />
                                    </template>
                                </USelectMenu>
                            </UFormField>

                            <div
                                class="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                            >
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"
                                    >
                                        <Icon
                                            name="lucide:power"
                                            class="w-4 h-4 text-green-600"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="text-sm font-medium text-slate-900"
                                        >
                                            Status Akun
                                        </p>
                                        <p class="text-xs text-slate-500">
                                            {{
                                                form.is_active
                                                    ? "Akun aktif dan dapat login"
                                                    : "Akun dinonaktifkan"
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <USwitch v-model="form.is_active" />
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div
                            class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end"
                        >
                            <UButton
                                variant="outline"
                                color="neutral"
                                @click="modalOpen = false"
                                class="sm:w-auto w-full"
                            >
                                <Icon
                                    name="lucide:x"
                                    class="w-4 h-4 mr-2"
                                />Batal
                            </UButton>
                            <UButton
                                color="primary"
                                :loading="processing"
                                @click="saveUser"
                                class="sm:w-auto w-full"
                            >
                                <Icon
                                    :name="
                                        editing
                                            ? 'lucide:save'
                                            : 'lucide:user-plus'
                                    "
                                    class="w-4 h-4 mr-2"
                                />
                                {{ editing ? "Simpan Perubahan" : "Buat Akun" }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <!-- Reset Password Modal -->
        <UModal v-model:open="resetModalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            Password Baru
                        </h3>
                    </template>
                    <div class="text-center py-4">
                        <p class="text-sm text-slate-500 mb-3">
                            Password baru untuk {{ resetUser?.identifier }}:
                        </p>
                        <div
                            class="flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg"
                        >
                            <code
                                class="text-lg font-mono font-bold text-slate-900"
                                >{{ newPassword }}</code
                            >
                            <UButton
                                size="xs"
                                color="primary"
                                variant="ghost"
                                @click="copyPassword"
                            >
                                <Icon name="lucide:copy" class="w-4 h-4" />
                            </UButton>
                        </div>
                    </div>
                    <template #footer>
                        <UButton
                            color="primary"
                            block
                            @click="resetModalOpen = false"
                            >Tutup</UButton
                        >
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
