<template>
  <aside 
    class="h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col"
    :class="isMinimized ? 'w-[72px]' : 'w-64'"
  >
    <!-- Header -->
    <div class="h-16 flex items-center px-4 border-b border-slate-100 shrink-0">
      <div class="flex items-center gap-3" :class="isMinimized ? 'justify-center w-full' : ''">
        <img src="~/assets/img/logo-skanda.png" alt="Logo" class="w-10 h-10 object-contain shrink-0" />
        <Transition name="fade">
          <div v-show="!isMinimized" class="min-w-0">
            <h2 class="font-bold text-slate-900 text-sm leading-tight">SIM Prakerin</h2>
            <p class="text-xs text-slate-500">Guru Pembimbing</p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <!-- Main -->
      <div class="space-y-1">
        <NavItem 
          to="/guru" 
          icon="lucide:layout-dashboard" 
          label="Dashboard" 
          :active="$route.path === '/guru'" 
          :minimized="isMinimized" 
        />
      </div>

      <!-- Monitoring Section -->
      <div class="mt-6">
        <p v-show="!isMinimized" class="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Monitoring
        </p>
        <div v-show="isMinimized" class="h-px bg-slate-200 mx-3 mb-3" />
        <div class="space-y-1">
          <NavItem 
            to="/guru/siswa-bimbingan" 
            icon="lucide:users" 
            label="Siswa Bimbingan" 
            :active="$route.path.startsWith('/guru/siswa-bimbingan')" 
            :minimized="isMinimized"
            :badge="24"
          />
          <NavItem 
            to="/guru/penempatan" 
            icon="lucide:building-2" 
            label="Penempatan" 
            :active="$route.path.startsWith('/guru/penempatan')" 
            :minimized="isMinimized" 
          />
          <NavItem 
            to="/guru/kunjungan" 
            icon="lucide:map-pin" 
            label="Kunjungan" 
            :active="$route.path.startsWith('/guru/kunjungan')" 
            :minimized="isMinimized" 
          />
        </div>
      </div>

      <!-- Verifikasi Section -->
      <div class="mt-6">
        <p v-show="!isMinimized" class="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Verifikasi
        </p>
        <div v-show="isMinimized" class="h-px bg-slate-200 mx-3 mb-3" />
        <div class="space-y-1">
          <NavItem 
            to="/guru/absensi" 
            icon="lucide:calendar-check" 
            label="Absensi" 
            :active="$route.path.startsWith('/guru/absensi')" 
            :minimized="isMinimized"
            :badge="5"
            badge-color="error"
          />
          <NavItem 
            to="/guru/verifikasi-logbook" 
            icon="lucide:book-open" 
            label="Logbook" 
            :active="$route.path.startsWith('/guru/verifikasi-logbook')" 
            :minimized="isMinimized"
            :badge="12"
            badge-color="warning"
          />
        </div>
      </div>

      <!-- Penilaian Section -->
      <div class="mt-6">
        <p v-show="!isMinimized" class="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Penilaian
        </p>
        <div v-show="isMinimized" class="h-px bg-slate-200 mx-3 mb-3" />
        <div class="space-y-1">
          <NavItem 
            to="/guru/penilaian-nilai" 
            icon="lucide:award" 
            label="Nilai PKL" 
            :active="$route.path.startsWith('/guru/penilaian-nilai')" 
            :minimized="isMinimized" 
          />
          <NavItem 
            to="/guru/laporan-akhir" 
            icon="lucide:file-text" 
            label="Laporan Akhir" 
            :active="$route.path.startsWith('/guru/laporan-akhir')" 
            :minimized="isMinimized" 
          />
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-slate-100 p-3 space-y-2 shrink-0">
      <!-- Collapse Button -->
      <button
        @click="toggleSidebar"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
        :class="isMinimized ? 'justify-center' : ''"
        :title="isMinimized ? 'Expand' : 'Collapse'"
      >
        <Icon :name="isMinimized ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" class="w-5 h-5" />
        <span v-show="!isMinimized" class="text-xs">Collapse Menu</span>
      </button>

      <!-- User Card -->
      <div 
        class="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" 
        :class="isMinimized ? 'justify-center' : ''"
        :title="isMinimized ? 'Budi Santoso, S.Pd' : ''"
      >
        <div class="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm">
          BS
        </div>
        <Transition name="fade">
          <div v-show="!isMinimized" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">Budi Santoso, S.Pd</p>
            <p class="text-xs text-slate-500">Guru Pembimbing</p>
          </div>
        </Transition>
        <Icon v-show="!isMinimized" name="lucide:chevron-right" class="w-4 h-4 text-slate-400" />
      </div>

      <!-- Logout -->
      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        :class="isMinimized ? 'justify-center' : ''"
        title="Keluar"
      >
        <Icon name="lucide:log-out" class="w-5 h-5" />
        <span v-show="!isMinimized">Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { isDesktopSidebarMinimized, toggleDesktopSidebar } = useSidebar()

const isMinimized = isDesktopSidebarMinimized
const toggleSidebar = () => toggleDesktopSidebar()
const logout = () => navigateTo('/login')

// NavItem Component
const NavItem = defineComponent({
  props: {
    to: { type: String, required: true },
    icon: { type: String, required: true },
    label: { type: String, required: true },
    active: { type: Boolean, default: false },
    minimized: { type: Boolean, default: false },
    badge: { type: Number, default: 0 },
    badgeColor: { type: String, default: 'primary' }
  },
  setup(props) {
    const badgeClass = computed(() => {
      const colors: Record<string, string> = {
        sky: 'bg-sky-500 text-white',
        red: 'bg-red-500 text-white',
        amber: 'bg-amber-500 text-white',
        green: 'bg-green-500 text-white'
      }
      return colors[props.badgeColor] || colors.sky
    })

    return () => h(
      resolveComponent('NuxtLink'),
      {
        to: props.to,
        class: [
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          props.active 
            ? 'bg-sky-50 text-sky-600' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
          props.minimized ? 'justify-center' : ''
        ],
        title: props.minimized ? props.label : ''
      },
      () => [
        h(resolveComponent('Icon'), { 
          name: props.icon, 
          class: ['w-5 h-5 shrink-0 transition-transform', props.active ? '' : 'group-hover:scale-110']
        }),
        !props.minimized && h('span', { class: 'flex-1' }, props.label),
        !props.minimized && props.badge > 0 && h('span', { 
          class: ['text-xs px-1.5 py-0.5 rounded-full font-medium', badgeClass.value]
        }, props.badge),
        props.minimized && props.badge > 0 && h('span', {
          class: 'absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full flex items-center justify-center ' + badgeClass.value
        }, props.badge > 9 ? '9+' : props.badge)
      ]
    )
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
