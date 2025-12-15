<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
    :class="[
      active ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      minimized ? 'justify-center' : ''
    ]"
    :title="minimized ? label : ''"
  >
    <Icon :name="icon" class="w-5 h-5 shrink-0" />
    <span v-show="!minimized">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  icon: string
  label: string
  active?: boolean
  minimized?: boolean
}>()
</script>
