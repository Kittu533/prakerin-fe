<template>
  <div class="relative">
    <!-- tombol utama -->
    <button
      type="button"
      @click="toggle"
      class="flex w-full items-center justify-between rounded-full px-3 py-2
             hover:bg-slate-50 transition"
    >
      <div class="flex items-center gap-3">
        <!-- avatar -->
        <div
          v-if="avatarUrl"
          class="h-10 w-10 overflow-hidden rounded-full border border-blue-100"
        >
          <img
            :src="avatarUrl"
            alt="Foto profil"
            class="h-full w-full object-cover"
          />
        </div>
        <div
          v-else
          class="flex h-10 w-10 items-center justify-center rounded-full
                 bg-blue-500 text-sm font-semibold text-white"
        >
          {{ initials }}
        </div>

        <!-- nama -->
        <div class="leading-tight text-left">
          <p class="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
            {{ name }}
          </p>
          <p class="text-[11px] text-slate-500">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <span
        class="ml-1 text-[10px] text-slate-400 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      >
        ▼
      </span>
    </button>

    <!-- dropdown -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-12 right-0 z-20 w-44 rounded-2xl border border-slate-100
               bg-white py-2 shadow-lg"
      >
        <button
          type="button"
          @click="goProfile"
          class="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700
                 hover:bg-slate-50"
        >
          <span class="text-[14px]">👤</span>
          <span>Profil Saya</span>
        </button>

        <div class="my-1 h-px bg-slate-100" />

        <button
          type="button"
          @click="onLogout"
          class="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500
                 hover:bg-red-50"
        >
          <span class="text-[14px]">⏏</span>
          <span>Logout</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  subtitle?: string
  avatarUrl?: string
  profileRoute?: string
}>()

const emit = defineEmits<{
  logout: []
}>()

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const initials = computed(() => {
  if (!props.name) return 'US'
  return props.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
})

const goProfile = () => {
  const route = props.profileRoute || '/profile/data-diri'
  navigateTo(route)
  isOpen.value = false
}

const onLogout = () => {
  emit('logout')
  isOpen.value = false
}
</script>
