<template>
    <div class="min-h-screen bg-slate-50">
        <div class="flex">
            <!-- Sidebar - Desktop (sticky) -->
            <div class="hidden lg:block sticky top-0 h-screen shrink-0">
                <aside class="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
                    <!-- Logo -->
                    <div class="h-16 flex items-center px-5 border-b border-slate-100">
                        <img src="~/assets/img/logo-skanda.png" alt="Logo" class="w-9 h-9 object-contain mr-3" />
                        <div>
                            <h1 class="font-bold text-slate-900 text-sm">
                                SIM Prakerin
                            </h1>
                            <p class="text-xs text-slate-500">Tata Usaha</p>
                        </div>
                    </div>

                    <!-- Nav -->
                    <nav class="flex-1 overflow-y-auto py-4 px-3">
                        <div class="space-y-1">
                            <template v-for="item in menuItems" :key="item.to || item.label">
                                <!-- Regular menu item -->
                                <NuxtLink v-if="!item.children" :to="item.to"
                                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                    :class="isActive(item.to!)
                                            ? 'bg-sky-50 text-sky-600'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        ">
                                    <Icon :name="item.icon" class="w-5 h-5" />
                                    <span>{{ item.label }}</span>
                                    <UBadge v-if="item.badge" :color="item.badgeColor || 'primary'" variant="subtle"
                                        size="xs" class="ml-auto">{{ item.badge }}</UBadge>
                                </NuxtLink>

                                <!-- Menu item with children (expandable) -->
                                <div v-else>
                                    <button @click="toggleSubmenu(item.label)"
                                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                        :class="isSubmenuActive(item.children)
                                                ? 'bg-sky-50 text-sky-600'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            ">
                                        <Icon :name="item.icon" class="w-5 h-5" />
                                        <span>{{ item.label }}</span>
                                        <Icon
                                            :name="expandedMenus.includes(item.label) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                                            class="w-4 h-4 ml-auto transition-transform" />
                                    </button>

                                    <!-- Submenu items -->
                                    <div v-show="expandedMenus.includes(item.label)" class="ml-8 mt-1 space-y-1">
                                        <NuxtLink v-for="child in item.children" :key="child.to" :to="child.to"
                                            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                                            :class="isActive(child.to!)
                                                    ? 'bg-sky-50 text-sky-600 font-medium'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                ">
                                            <Icon :name="child.icon" class="w-4 h-4" />
                                            <span>{{ child.label }}</span>
                                        </NuxtLink>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div class="mt-6 pt-6 border-t border-slate-100">
                            <p class="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase">
                                Master Data
                            </p>
                            <div class="space-y-1">
                                <template v-for="item in masterItems" :key="item.to || item.label">
                                    <!-- Regular menu item -->
                                    <NuxtLink v-if="!item.children" :to="item.to"
                                        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                                        :class="isActive(item.to!)
                                                ? 'bg-sky-50 text-sky-600 font-medium'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            ">
                                        <Icon :name="item.icon" class="w-4 h-4" />
                                        <span>{{ item.label }}</span>
                                    </NuxtLink>

                                    <!-- Menu item with children (expandable) -->
                                    <div v-else>
                                        <button @click="toggleSubmenu(item.label)"
                                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                                            :class="isSubmenuActive(item.children)
                                                    ? 'bg-sky-50 text-sky-600'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                ">
                                            <Icon :name="item.icon" class="w-4 h-4" />
                                            <span>{{ item.label }}</span>
                                            <Icon
                                                :name="expandedMenus.includes(item.label) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                                                class="w-4 h-4 ml-auto transition-transform" />
                                        </button>

                                        <!-- Submenu items -->
                                        <div v-show="expandedMenus.includes(item.label)" class="ml-8 mt-1 space-y-1">
                                            <NuxtLink v-for="child in item.children" :key="child.to" :to="child.to"
                                                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                                                :class="isActive(child.to!)
                                                        ? 'bg-sky-50 text-sky-600 font-medium'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                    ">
                                                <Icon :name="child.icon" class="w-4 h-4" />
                                                <span>{{ child.label }}</span>
                                            </NuxtLink>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </nav>

                    <!-- User -->
                    <div class="p-3 border-t border-slate-100">
                        <div class="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                            <div
                                class="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                                TU
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-slate-900 truncate">
                                    Tata Usaha
                                </p>
                                <p class="text-xs text-slate-500">
                                    Staff Administrasi
                                </p>
                            </div>
                            <UButton variant="ghost" color="neutral" size="xs" @click="handleLogout">
                                <Icon name="lucide:log-out" class="w-4 h-4" />
                            </UButton>
                        </div>
                    </div>
                </aside>
            </div>

            <!-- Main Area -->
            <div class="flex-1 min-w-0 flex flex-col min-h-screen">
                <!-- Header -->
                <header
                    class="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 lg:h-16 flex items-center px-4 lg:px-6 shrink-0">
                    <div class="flex items-center justify-between w-full">
                        <!-- Left -->
                        <div class="flex items-center gap-3">
                            <!-- Mobile Logo -->
                            <div class="flex items-center gap-2 lg:hidden">
                                <img src="~/assets/img/logo-skanda.png" alt="Logo" class="w-8 h-8 object-contain" />
                                <span class="font-semibold text-slate-900 text-sm">Prakerin</span>
                            </div>

                            <!-- Page Title (Desktop) -->
                            <div class="hidden lg:block">
                                <h1 class="text-lg font-semibold text-slate-900">
                                    {{ pageTitle }}
                                </h1>
                            </div>
                        </div>

                        <!-- Right -->
                        <div class="flex items-center gap-2">
                            <!-- Notifications -->
                            <button
                                class="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors">
                                <Icon name="lucide:bell" class="w-5 h-5 text-slate-600" />
                                <span v-if="hasNotification"
                                    class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                            </button>

                            <!-- User (Desktop) -->
                            <div
                                class="hidden sm:flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                <div
                                    class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                                    TU
                                </div>
                                <div class="text-left">
                                    <p class="text-sm font-medium text-slate-900">
                                        Tata Usaha
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Content -->
                <main class="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
                    <slot />
                </main>

                <!-- Bottom Navigation (Mobile/Tablet Only) -->
                <nav
                    class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-bottom">
                    <div class="flex items-center justify-around h-16">
                        <NuxtLink v-for="item in bottomNavItems" :key="item.to" :to="item.to"
                            class="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
                            :class="isActiveRoute(item.to)
                                    ? 'text-sky-600'
                                    : 'text-slate-500'
                                ">
                            <div class="relative">
                                <Icon :name="item.icon" class="w-5 h-5" />
                                <span v-if="item.badge"
                                    class="absolute -top-1 -right-2 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                                    {{ item.badge > 9 ? "9+" : item.badge }}
                                </span>
                            </div>
                            <span class="text-[10px] font-medium">{{
                                item.label
                                }}</span>
                        </NuxtLink>
                    </div>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSweetAlert } from '~/composables/use-sweet-alert';

const route = useRoute();
const { showConfirmation, showSuccess } = useSweetAlert();

const hasNotification = ref(true);
const expandedMenus = ref<string[]>([]);

const pageTitle = computed(() => {
    const titles: Record<string, string> = {
        "/tata-usaha": "Dashboard",
        "/tata-usaha/users": "Kelola Akun",
        "/tata-usaha/surat-masuk": "Surat Masuk",
        "/tata-usaha/surat-keluar": "Surat Keluar",
        "/tata-usaha/disposisi": "Disposisi",
        "/tata-usaha/surat-kesiswaan": "Surat Kesiswaan",
        "/tata-usaha/ttd-digital": "TTD Digital",
        "/tata-usaha/master/siswa": "Data Siswa",
        "/tata-usaha/master/guru": "Data Guru",
        "/tata-usaha/settings": "Pengaturan",
    };

    if (titles[route.path]) return titles[route.path];

    for (const [path, title] of Object.entries(titles)) {
        if (route.path.startsWith(path) && path !== "/tata-usaha") return title;
    }

    return "Dashboard";
});

interface MenuItem {
    to?: string;
    icon: string;
    label: string;
    badge?: number;
    badgeColor?: "primary" | "warning" | "success" | "error" | "neutral" | "secondary" | "info";
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    { to: "/tata-usaha", icon: "lucide:layout-dashboard", label: "Dashboard" },
    { to: "/tata-usaha/users", icon: "lucide:user-cog", label: "Kelola Akun" },
    {
        icon: "lucide:mail",
        label: "Admin Surat",
        children: [
            {
                to: "/tata-usaha/surat-masuk",
                icon: "lucide:mail-open",
                label: "Surat Masuk",
            },
            {
                to: "/tata-usaha/surat-keluar",
                icon: "lucide:send",
                label: "Surat Keluar",
            },
        ],
    },
    { to: "/tata-usaha/disposisi", icon: "lucide:file-signature", label: "Disposisi" },
    { to: "/tata-usaha/surat-kesiswaan", icon: "lucide:graduation-cap", label: "Surat Kesiswaan" },
];

const masterItems: MenuItem[] = [
    {
        icon: "lucide:graduation-cap",
        label: "Siswa",
        children: [
            {
                to: "/tata-usaha/master/siswa",
                icon: "lucide:users",
                label: "Siswa - TU",
            },
            {
                to: "/tata-usaha/master/siswa-pkl",
                icon: "lucide:graduation-cap",
                label: "Siswa - PKL",
            },
        ],
    },
    {
        to: "/tata-usaha/master/guru",
        icon: "lucide:user-check",
        label: "Guru",
    },
    {
        to: "/tata-usaha/ttd-digital",
        icon: "lucide:signature",
        label: "Master TTD Digital",
    },
];

const bottomNavItems = [
    { to: "/tata-usaha", icon: "lucide:home", label: "Home" },
    { to: "/tata-usaha/surat-masuk", icon: "lucide:mail-open", label: "Masuk" },
    { to: "/tata-usaha/surat-keluar", icon: "lucide:send", label: "Keluar" },
    { to: "/tata-usaha/disposisi", icon: "lucide:file-signature", label: "Disposisi" },
    { to: "/tata-usaha/ttd-digital", icon: "lucide:signature", label: "TTD" },
];

const isActive = (path: string) => {
    if (path === "/tata-usaha") return route.path === "/tata-usaha";
    return route.path.startsWith(path);
};

const isSubmenuActive = (children: any[]) => {
    return children.some((child) => route.path.startsWith(child.to));
};

const toggleSubmenu = (label: string) => {
    const index = expandedMenus.value.indexOf(label);
    if (index > -1) {
        expandedMenus.value.splice(index, 1);
    } else {
        expandedMenus.value.push(label);
    }
};

watch(
    () => route.path,
    () => {
        [...menuItems, ...masterItems].forEach((item) => {
            if (item.children && isSubmenuActive(item.children)) {
                if (!expandedMenus.value.includes(item.label)) {
                    expandedMenus.value.push(item.label);
                }
            }
        });
    },
    { immediate: true }
);

const isActiveRoute = (path: string) => {
    if (path === "/tata-usaha") return route.path === "/tata-usaha";
    return route.path.startsWith(path);
};

const logout = () => navigateTo("/login");

async function handleLogout() {
    const result = await showConfirmation(
        'Konfirmasi Logout',
        'Apakah Anda yakin ingin keluar dari sistem?',
        {
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
        }
    );

    if (result.isConfirmed) {
        await showSuccess(
            'Logout Berhasil',
            'Anda telah berhasil keluar dari sistem.',
            { timer: 2000 }
        );
        
        setTimeout(() => {
            navigateTo("/login");
        }, 2000);
    }
}
</script>

<style scoped>
.safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
