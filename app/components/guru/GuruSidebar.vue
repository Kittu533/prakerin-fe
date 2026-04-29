<template>
  <aside
    class="flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300"
    :class="isMinimized ? 'w-[72px]' : 'w-64'"
  >
    <div class="flex h-16 items-center border-b border-slate-100 px-4 shrink-0">
      <div class="flex items-center gap-3" :class="isMinimized ? 'w-full justify-center' : ''">
        <img src="~/assets/img/logo-skanda.png" alt="Logo" class="h-10 w-10 shrink-0 object-contain" />
        <Transition name="fade">
          <div v-show="!isMinimized" class="min-w-0">
            <h2 class="text-sm font-bold leading-tight text-slate-900">SIM Prakerin</h2>
            <p class="text-xs text-slate-500">Guru Pembimbing</p>
          </div>
        </Transition>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <div class="space-y-1">
        <NavItem
          to="/guru"
          icon="lucide:layout-dashboard"
          label="Dashboard"
          :active="isActiveRoute('/guru')"
          :minimized="isMinimized"
        />
      </div>

      <section v-for="section in menuSections" :key="section.label" class="mt-6">
        <p
          v-show="!isMinimized"
          class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
        >
          {{ section.label }}
        </p>
        <div v-show="isMinimized" class="mx-3 mb-3 h-px bg-slate-200" />
        <div class="space-y-1">
          <NavItem
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            :label="item.label"
            :active="isActiveRoute(item.to)"
            :minimized="isMinimized"
          />
        </div>
      </section>
    </nav>

    <div class="space-y-2 border-t border-slate-100 p-3 shrink-0">
      <button
        type="button"
        @click="toggleSidebar"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
        :class="isMinimized ? 'justify-center' : ''"
        :title="isMinimized ? 'Expand' : 'Collapse'"
      >
        <Icon :name="isMinimized ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" class="h-5 w-5" />
        <span v-show="!isMinimized" class="text-xs">Collapse Menu</span>
      </button>

      <button
        type="button"
        @click="logout"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        :class="isMinimized ? 'justify-center' : ''"
        title="Keluar"
      >
        <Icon name="lucide:log-out" class="h-5 w-5" />
        <span v-show="!isMinimized">Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/auth/use-auth";

type MenuItem = {
  to: string;
  icon: string;
  label: string;
};

type MenuSection = {
  label: string;
  items: MenuItem[];
};

const route = useRoute();
const { logout: authLogout } = useAuth();
const { isDesktopSidebarMinimized, toggleDesktopSidebar } = useSidebar();

const isMinimized = isDesktopSidebarMinimized;
const toggleSidebar = () => toggleDesktopSidebar();

const menuSections: MenuSection[] = [
  {
    label: "Monitoring",
    items: [
      { to: "/guru/siswa-bimbingan", icon: "lucide:users", label: "Siswa Bimbingan" },
      { to: "/guru/penempatan", icon: "lucide:building-2", label: "Penempatan" },
      { to: "/guru/kunjungan", icon: "lucide:map-pin", label: "Kunjungan" },
    ],
  },
  {
    label: "Verifikasi",
    items: [
      { to: "/guru/absensi", icon: "lucide:calendar-check", label: "Absensi" },
      { to: "/guru/verifikasi-logbook", icon: "lucide:book-open", label: "Logbook" },
    ],
  },
];

const isActiveRoute = (path: string) => {
  if (path === "/guru") {
    return route.path === path;
  }

  return route.path.startsWith(path);
};

const logout = async () => {
  try {
    await authLogout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    await navigateTo("/login");
  }
};

const NavItem = defineComponent({
  props: {
    to: { type: String, required: true },
    icon: { type: String, required: true },
    label: { type: String, required: true },
    active: { type: Boolean, default: false },
    minimized: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h(
        resolveComponent("NuxtLink"),
        {
          to: props.to,
          class: [
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            props.active ? "bg-sky-50 text-sky-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            props.minimized ? "justify-center" : "",
          ],
          title: props.minimized ? props.label : "",
        },
        () => [
          h(resolveComponent("Icon"), {
            name: props.icon,
            class: ["h-5 w-5 shrink-0 transition-transform", props.active ? "" : "group-hover:scale-110"],
          }),
          !props.minimized && h("span", { class: "flex-1" }, props.label),
        ],
      );
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
