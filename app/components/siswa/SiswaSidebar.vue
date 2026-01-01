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
            <p class="text-xs text-slate-500">Siswa PKL</p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <!-- Main -->
      <div class="space-y-1">
        <NavItem to="/siswa" icon="lucide:home" label="Dashboard" :active="$route.path === '/siswa'" :minimized="isMinimized" />
      </div>

      <!-- Pengajuan Section -->
      <div class="mt-6">
        <p v-show="!isMinimized" class="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Pengajuan
        </p>
        <div v-show="isMinimized" class="h-px bg-slate-200 mx-3 mb-3" />
        <div class="space-y-1">
          <NavItem 
            to="/siswa/internship/status" 
            icon="lucide:briefcase" 
            label="Status PKL" 
            :active="$route.path.startsWith('/siswa/internship')" 
            :minimized="isMinimized"
          />
        </div>
      </div>

      <!-- PKL Section -->
      <div class="mt-6">
        <p v-show="!isMinimized" class="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Aktivitas PKL
        </p>
        <div v-show="isMinimized" class="h-px bg-slate-200 mx-3 mb-3" />
        <div class="space-y-1">
          <NavItem 
            to="/siswa/logbook" 
            icon="lucide:book-open" 
            label="Logbook Harian" 
            :active="$route.path.startsWith('/siswa/logbook')" 
            :minimized="isMinimized"
            :badge="pendingLogbook"
            badge-color="warning"
          />
          <NavItem 
            to="/siswa/absensi" 
            icon="lucide:map-pin" 
            label="Absensi" 
            :active="$route.path.startsWith('/siswa/absensi')" 
            :minimized="isMinimized"
            :show-dot="!todayCheckedIn"
            dot-color="error"
          />
        </div>
      </div>

      <!-- Dokumen Section -->
      <div class="mt-6">
        <p v-show="!isMinimized" class="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Dokumen
        </p>
        <div v-show="isMinimized" class="h-px bg-slate-200 mx-3 mb-3" />
        <div class="space-y-1">
          <NavItem 
            to="/siswa/dokumen" 
            icon="lucide:folder" 
            label="Dokumen PKL" 
            :active="$route.path.startsWith('/siswa/dokumen')" 
            :minimized="isMinimized" 
          />
          <NavItem 
            to="/siswa/laporan" 
            icon="lucide:file-text" 
            label="Laporan Akhir" 
            :active="$route.path.startsWith('/siswa/laporan')" 
            :minimized="isMinimized" 
          />
        </div>
      </div>

      <!-- Info Section -->
      <div class="mt-6">
        <p v-show="!isMinimized" class="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Informasi
        </p>
        <div v-show="isMinimized" class="h-px bg-slate-200 mx-3 mb-3" />
        <div class="space-y-1">
          <NavItem 
            to="/siswa/nilai" 
            icon="lucide:award" 
            label="Nilai PKL" 
            :active="$route.path.startsWith('/siswa/nilai')" 
            :minimized="isMinimized" 
          />
          <NavItem 
            to="/siswa/profil" 
            icon="lucide:user" 
            label="Profil Saya" 
            :active="$route.path.startsWith('/siswa/profil')" 
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
      <NuxtLink 
        to="/siswa/profil"
        class="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors" 
        :class="isMinimized ? 'justify-center' : ''"
        :title="isMinimized ? 'Ryobi Surya Atmaja' : ''"
      >
        <div class="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm">
          RS
        </div>
        <Transition name="fade">
          <div v-show="!isMinimized" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">Ryobi Surya A.</p>
            <p class="text-xs text-slate-500">XII RPL 1</p>
          </div>
        </Transition>
        <Icon v-show="!isMinimized" name="lucide:chevron-right" class="w-4 h-4 text-slate-400" />
      </NuxtLink>

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

// Mock data - replace with actual store
const pendingLogbook = ref(2)
const todayCheckedIn = ref(false)

// NavItem Component
const NavItem = defineComponent({
  props: {
    to: { type: String, required: true },
    icon: { type: String, required: true },
    label: { type: String, required: true },
    active: { type: Boolean, default: false },
    minimized: { type: Boolean, default: false },
    badge: { type: Number, default: 0 },
    badgeColor: { type: String, default: 'primary' },
    showDot: { type: Boolean, default: false },
    dotColor: { type: String, default: 'error' }
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

    const dotClass = computed(() => {
      const colors: Record<string, string> = {
        red: 'bg-red-500',
        amber: 'bg-amber-500',
        green: 'bg-green-500'
      }
      return colors[props.dotColor] || colors.red
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
        h('div', { class: 'relative' }, [
          h(resolveComponent('Icon'), { 
            name: props.icon, 
            class: ['w-5 h-5 shrink-0 transition-transform', props.active ? '' : 'group-hover:scale-110']
          }),
          props.showDot && h('span', {
            class: ['absolute -top-1 -right-1 w-2 h-2 rounded-full', dotClass.value]
          })
        ]),
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
