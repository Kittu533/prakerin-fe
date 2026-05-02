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
                            <p class="text-xs text-slate-500">Admin Humas</p>
                        </div>
                    </div>

                    <!-- Nav -->
                    <nav class="flex-1 overflow-y-auto py-4 px-3">
                        <div class="space-y-1">
                            <template v-for="item in menuItems" :key="item.to || item.label">
                                <AdminSidebarMenuItem :item="item" :active-path="route.path" />
                            </template>
                        </div>
                    </nav>

                    <!-- User -->
                    <div class="p-3 border-t border-slate-100">
                        <div class="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                            <div
                                class="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm">
                                AH
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-slate-900 truncate">
                                    Admin Humas
                                </p>
                                <p class="text-xs text-slate-500">
                                    Hubungan Masyarakat
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
                                    class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm">
                                    AH
                                </div>
                                <div class="text-left">
                                    <p class="text-sm font-medium text-slate-900">
                                        Admin Humas
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
                        <NuxtLink v-for="item in bottomNavItems.filter(i => i.to)" :key="item.to" :to="item.to"
                            class="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
                            :class="isActiveRoute(item.to!)
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

const pageTitle = computed(() => {
    const titles: Record<string, string> = {
        "/admin": "Dashboard",
        "/admin/periode-pkl": "Periode PKL",
        "/admin/placement": "Penempatan Siswa",
        "/admin/monitoring": "Monitoring PKL",
        "/admin/master/companies": "Master Perusahaan",
        "/admin/users": "Kelola Akun",
        "/admin/reporting/placement": "Master Penempatan",
        "/admin/reporting/attendance": "Rekap Absensi",
        "/admin/reporting/assessment": "Rekap Nilai & Kelulusan",
        "/admin/reporting/company": "Ketersediaan Kuota",
        "/admin/placement/smart-draft": "Smart Placement Draft",
        "/admin/placement/overview": "Overview Siswa PKL",
        "/admin/archive": "Arsip Penempatan",
    };

    if (titles[route.path]) return titles[route.path];

    for (const [path, title] of Object.entries(titles)) {
        if (route.path.startsWith(path) && path !== "/admin") return title;
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
    { to: "/admin", icon: "lucide:layout-dashboard", label: "Dashboard" },
    {
        to: "/admin/periode-pkl",
        icon: "lucide:calendar-clock",
        label: "Periode PKL",
    },
    { to: "/admin/placement", icon: "lucide:map-pin", label: "Penempatan" },
    { to: "/admin/monitoring", icon: "lucide:activity", label: "Monitoring" },
    { to: "/admin/archive", icon: "lucide:archive", label: "Arsip" },
    { to: "/admin/users", icon: "lucide:users", label: "Kelola Akun" },
    {
        icon: "lucide:briefcase",
        label: "SIAP PKL",
        children: [
            { to: "/admin/siap-pkl/jurnal/iduka", icon: "lucide:file-text", label: "SURAT KE IDUKA" },
            { to: "/admin/siap-pkl/jurnal/guru", icon: "lucide:file-text", label: "SURAT TUGAS GURU" },
            { to: "/admin/siap-pkl/jurnal/murid", icon: "lucide:file-text", label: "SURAT TUGAS PKL MURID" },
            { to: "/admin/siap-pkl/kelola-tempat", icon: "lucide:user-plus", label: "PLOTTING SISWA PKL" },
        ],
    },
    {
        icon: "lucide:briefcase",
        label: "Data Mitra",
        children: [
            {
                to: "/admin/master/companies",
                icon: "lucide:database",
                label: "Data DUDI / Perusahaan",
            },
            {
                to: "/admin/mitra/mou",
                icon: "lucide:file-signature",
                label: "Data MOU",
            },
            {
                to: "/admin/siap-pkl/maps",
                icon: "lucide:map",
                label: "Peta Mitra",
            },
        ],
    },
    {
        icon: "lucide:bar-chart-3",
        label: "Laporan",
        children: [
            {
                to: "/admin/siap-pkl/statistik",
                icon: "lucide:bar-chart-3",
                label: "Statistik PKL",
            },
            {
                to: "/admin/reporting/company",
                icon: "lucide:building-2",
                label: "Ketersediaan Kuota",
            },
            {
                to: "/admin/reporting/attendance",
                icon: "lucide:calendar-check",
                label: "Rekap Absensi",
            },
            {
                to: "/admin/reporting/assessment",
                icon: "lucide:award",
                label: "Rekap Nilai",
            },
        ],
    },
];

const bottomNavItems: MenuItem[] = [
    { to: "/admin", icon: "lucide:home", label: "Home" },
    { to: "/admin/placement", icon: "lucide:map-pin", label: "Penempatan" },
    { to: "/admin/users", icon: "lucide:users", label: "Akun" },
    { to: "/admin/monitoring", icon: "lucide:activity", label: "Monitoring" },
];

const isActiveRoute = (path: string) => {
    if (path === "/admin") return route.path === "/admin";
    return route.path.startsWith(path);
};

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
