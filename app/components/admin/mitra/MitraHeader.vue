<script setup lang="ts">
import logoSkanda from '~/assets/img/logo-skanda.png'

interface Props {
  title: string
  role: string
  school?: string
  logo?: string
  showAdd?: boolean
  showLogout?: boolean
}

withDefaults(defineProps<Props>(), {
  school: 'SMK GITA LARAS',
  logo: logoSkanda,
  showAdd: true,
  showLogout: true
})

defineEmits(['add', 'logout'])
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border border-blue-100 flex-shrink-0">
        <img :src="logo" alt="Logo" class="w-12 h-12 object-contain" />
      </div>
      <div>
        <h1 class="text-xl md:text-2xl font-extrabold text-blue-700 tracking-tight uppercase leading-tight">{{ title }}</h1>
        <div class="flex flex-wrap gap-2 mt-1">
          <span class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{{ role }}</span>
          <span class="bg-amber-400 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{{ school }}</span>
        </div>
      </div>
    </div>
    <div class="flex gap-3 w-full md:w-auto">
      <button 
        v-if="showAdd"
        @click="$emit('add')"
        class="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
      >
        <Icon name="lucide:circle-plus" class="w-5 h-5" />
        TAMBAH
      </button>
      <button 
        v-if="showLogout"
        @click="$emit('logout')"
        class="flex-1 md:flex-none border border-red-200 text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
      >
        <Icon name="lucide:log-out" class="w-5 h-5" />
        LOGOUT
      </button>
    </div>
  </div>
</template>
