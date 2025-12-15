<template>
  <header class="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
    <div class="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14 sm:h-16">
      <!-- Left Section -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Hamburger Menu -->
        <button
          @click="$emit('toggle-sidebar')"
          class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Icon name="lucide:menu" class="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
        </button>

        <!-- Logo (mobile only) -->
        <div class="flex items-center gap-2 lg:hidden">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="roleBg">
            <span class="text-white font-bold text-sm">{{ roleInitial }}</span>
          </div>
          <span class="font-semibold text-slate-900 text-sm hidden sm:block">{{ roleTitle }}</span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Notification -->
        <button class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-slate-100 transition-colors relative">
          <Icon name="lucide:bell" class="w-5 h-5 text-slate-600" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <!-- User Profile -->
        <div class="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div class="hidden sm:block text-right">
            <p class="text-sm font-medium text-slate-900 truncate max-w-[120px] lg:max-w-[180px]">{{ displayName }}</p>
            <p class="text-xs text-slate-500">{{ displayRole }}</p>
          </div>
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm" :class="roleBg">
            {{ userInitial }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  role?: 'siswa' | 'mentor' | 'guru'
  userName?: string
  schoolName?: string
}

const props = withDefaults(defineProps<Props>(), {
  role: 'siswa',
  userName: '',
  schoolName: 'SMK N 2 Wonogiri'
})

defineEmits(['toggle-sidebar'])

const roleBg = computed(() => {
  const colors = { siswa: 'bg-blue-600', mentor: 'bg-indigo-600', guru: 'bg-sky-500' }
  return colors[props.role] || colors.siswa
})

const roleInitial = computed(() => {
  const initials = { siswa: 'SP', mentor: 'M', guru: 'G' }
  return initials[props.role] || 'SP'
})

const roleTitle = computed(() => {
  const titles = { siswa: 'SIMPRAKERIN', mentor: 'MENTOR PKL', guru: 'GURU PKL' }
  return titles[props.role] || 'SIMPRAKERIN'
})

const displayName = computed(() => {
  if (props.userName) return props.userName
  const defaults = { siswa: 'Ryobi Surya A.', mentor: 'Mentor PKL', guru: 'Guru PKL' }
  return defaults[props.role] || 'User'
})

const displayRole = computed(() => {
  const roles = { siswa: 'XII RPL 1', mentor: 'Pembimbing', guru: 'Pembimbing' }
  return roles[props.role] || ''
})

const userInitial = computed(() => {
  if (props.userName) {
    return props.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }
  const defaults = { siswa: 'RS', mentor: 'MP', guru: 'GP' }
  return defaults[props.role] || 'U'
})
</script>
