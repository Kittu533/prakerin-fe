<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface MenuItem {
  to?: string
  icon: string
  label: string
  badge?: number
  badgeColor?: 'primary' | 'warning' | 'success' | 'error' | 'neutral' | 'secondary' | 'info'
  children?: MenuItem[]
}

const props = defineProps<{
  item: MenuItem
  activePath: string
  depth?: number
}>()

const isExpanded = ref(false)

const isActive = (path?: string) => {
  if (!path) return false
  if (path === '/admin') return props.activePath === '/admin'
  return props.activePath.startsWith(path)
}

const hasActiveChild = computed(() => {
  if (!props.item.children) return false
  return props.item.children.some(child => {
    if (child.to) return isActive(child.to)
    if (child.children) return checkDeepActive(child.children)
    return false
  })
})

const checkDeepActive = (children: MenuItem[]): boolean => {
  return children.some(child => {
    if (child.to) return isActive(child.to)
    if (child.children) return checkDeepActive(child.children)
    return false
  })
}

const toggle = () => {
  isExpanded.value = !isExpanded.value
}

// Auto expand if has active child
watch(() => props.activePath, () => {
  if (hasActiveChild.value) {
    isExpanded.value = true
  }
}, { immediate: true })

const currentDepth = computed(() => props.depth || 0)
</script>

<template>
  <div class="w-full">
    <!-- Regular Link -->
    <NuxtLink
      v-if="!item.children"
      :to="item.to"
      class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
      :class="isActive(item.to)
        ? 'bg-sky-50 text-sky-600'
        : 'text-slate-600 hover:bg-slate-50'
      "
      :style="{ paddingLeft: `${(currentDepth * 1) + 0.75}rem` }"
    >
      <Icon :name="item.icon" class="w-5 h-5 shrink-0" />
      <span class="truncate">{{ item.label }}</span>
      <UBadge
        v-if="item.badge"
        :color="item.badgeColor || 'primary'"
        variant="subtle"
        size="xs"
        class="ml-auto"
      >
        {{ item.badge }}
      </UBadge>
    </NuxtLink>

    <!-- Expandable Menu -->
    <div v-else>
      <button
        @click="toggle"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
        :class="hasActiveChild
          ? 'bg-sky-50 text-sky-600'
          : 'text-slate-600 hover:bg-slate-50'
        "
        :style="{ paddingLeft: `${(currentDepth * 1) + 0.75}rem` }"
      >
        <Icon :name="item.icon" class="w-5 h-5 shrink-0" />
        <span class="truncate flex-1 text-left">{{ item.label }}</span>
        <Icon
          :name="isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          class="w-4 h-4 ml-auto transition-transform"
        />
      </button>

      <!-- Children (Recursive) -->
      <div v-show="isExpanded" class="mt-1 space-y-1">
        <AdminSidebarMenuItem
          v-for="child in item.children"
          :key="child.label"
          :item="child"
          :active-path="activePath"
          :depth="currentDepth + 1"
        />
      </div>
    </div>
  </div>
</template>
