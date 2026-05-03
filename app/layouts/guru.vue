<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex">
      <div class="hidden h-screen shrink-0 lg:sticky lg:top-0 lg:block">
        <GuruSidebar />
      </div>

      <div class="flex min-h-screen min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white px-4 shrink-0 lg:h-16 lg:px-6">
          <div class="flex w-full items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 lg:hidden">
                <img src="~/assets/img/logo-skanda.png" alt="Logo" class="h-8 w-8 object-contain" />
                <span class="text-sm font-semibold text-slate-900">SIM Prakerin</span>
              </div>
              <div class="hidden lg:block">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Area Guru</p>
                <h1 class="truncate text-lg font-semibold text-slate-900">{{ pageTitle }}</h1>
              </div>
            </div>

            <UDropdownMenu :items="userMenuItems">
              <UButton variant="ghost" color="neutral" class="rounded-lg p-1 hover:bg-slate-50">
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-semibold text-white">
                    {{ guruInitials }}
                  </div>
                  <div class="hidden text-left sm:block">
                    <p class="text-xs font-semibold leading-tight text-slate-900">{{ guruName }}</p>
                    <p class="text-[10px] font-medium leading-tight text-slate-500">Guru Pembimbing</p>
                  </div>
                  <Icon name="lucide:chevron-down" class="hidden h-4 w-4 text-slate-400 sm:block" />
                </div>
              </UButton>
            </UDropdownMenu>
          </div>
        </header>

        <main class="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">
          <slot />
        </main>

        <footer class="hidden border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-500 shrink-0 lg:block lg:px-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 SIM Prakerin - SMK N 2 Wonogiri</p>
            <p class="text-xs">Workspace guru yang disederhanakan untuk flow monitoring terbaru</p>
          </div>
        </footer>

        <nav class="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white lg:hidden safe-area-bottom">
          <div class="flex h-16 items-center justify-around">
            <NuxtLink
              v-for="item in bottomNavItems"
              :key="item.to"
              :to="item.to"
              class="flex h-full w-full flex-col items-center justify-center gap-1 transition-colors"
              :class="isActiveRoute(item.to) ? 'text-sky-600' : 'text-slate-500'"
            >
              <Icon :name="item.icon" class="h-5 w-5" />
              <span class="text-[10px] font-medium">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/auth/use-auth";
import { useGuruApi } from "~/composables/api/use-academic";

const route = useRoute();
const { user, logout: authLogout } = useAuth();
const { getMe } = useGuruApi();

const guru = ref<any>(null);

async function fetchGuruData() {
  try {
    const res = await getMe();
    if (res?.data) {
      guru.value = res.data;
    }
  } catch (error) {
    console.warn("Failed to fetch guru data:", error);
  }
}

const guruName = computed(() => guru.value?.nama_guru || user.value?.nama || "Guru");
const guruInitials = computed(() => {
  const name = guruName.value.trim();
  if (!name) {
    return "GU";
  }

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
});

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    "/guru": "Dashboard Guru",
    "/guru/siswa-bimbingan": "Siswa Bimbingan",
    "/guru/penempatan": "Penempatan PKL",
    "/guru/kunjungan": "Monitoring Kunjungan",
  };

  if (titles[route.path]) {
    return titles[route.path];
  }

  for (const [path, title] of Object.entries(titles)) {
    if (path !== "/guru" && route.path.startsWith(path)) {
      return title;
    }
  }

  return "Dashboard Guru";
});

const bottomNavItems = [
  { to: "/guru", icon: "lucide:home", label: "Home" },
  { to: "/guru/siswa-bimbingan", icon: "lucide:users", label: "Siswa" },
  { to: "/guru/penempatan", icon: "lucide:building-2", label: "Tempat" },
  { to: "/guru/kunjungan", icon: "lucide:map-pin", label: "Kunjungan" },
];

const isActiveRoute = (path: string) => {
  if (path === "/guru") {
    return route.path === path;
  }

  return route.path.startsWith(path);
};

const userMenuItems = [
  [
    {
      label: "Profil Saya",
      icon: "i-lucide-user",
      click: () => {},
    },
  ],
  [
    {
      label: "Keluar",
      icon: "i-lucide-log-out",
      click: async () => {
        try {
          await authLogout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          await navigateTo("/login");
        }
      },
    },
  ],
];

onMounted(() => {
  fetchGuruData();
});
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
