<!--
  Base Detail Modal Component - Read-only view

  Usage:
  <BaseDetailModal
    v-model:open="open"
    :title="`${data.nama} - Detail`"
    :fields="detailFields"
    :data="selectedData"
  />
-->
<script setup lang="ts">
export interface DetailField {
  key: string                    // Property key in data object
  label: string                  // Display label
  type?: 'text' | 'date' | 'status' | 'badge' | 'link' | 'boolean' | 'array'
  format?: (value: any) => string  // Custom formatter
  options?: { label: string; value: any; color?: string }[]  // For status/badge type
  span?: 1 | 2                   // Grid span
  showWhen?: (data: any) => boolean  // Conditional visibility
}

export interface DetailModalProps {
  open: boolean
  title: string
  description?: string
  fields: DetailField[]
  data?: Record<string, any>
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<DetailModalProps>(), {
  data: () => ({}),
  size: 'md'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  return sizes[props.size]
})

const modalDescription = computed(
  () =>
    props.description ||
    `Informasi detail untuk ${props.title.toLowerCase()}.`,
)

// Format value based on field type
const formatValue = (field: DetailField) => {
  const value = props.data?.[field.key]

  if (value === undefined || value === null || value === '') {
    return '-'
  }

  // Use custom formatter if provided
  if (field.format) {
    return field.format(value)
  }

  // Type-based formatting
  switch (field.type) {
    case 'date':
      return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

    case 'boolean':
      return value ? 'Ya' : 'Tidak'

    case 'array':
      return Array.isArray(value) ? value.join(', ') : String(value)

    case 'status':
    case 'badge':
      const option = field.options?.find(o => o.value === value)
      return option?.label || String(value)

    default:
      return String(value)
  }
}

// Get badge color for status/badge type
const getBadgeColor = (field: DetailField) => {
  const value = props.data?.[field.key]
  const option = field.options?.find(o => o.value === value)
  return option?.color || 'neutral'
}

// Check if field should be visible
const isFieldVisible = (field: DetailField) => {
  return field.showWhen ? field.showWhen(props.data || {}) : true
}

// Get visible fields
const visibleFields = computed(() => {
  return props.fields.filter(f => isFieldVisible(f))
})

// Render field value based on type
const renderFieldValue = (field: DetailField) => {
  const value = formatValue(field)

  switch (field.type) {
    case 'status':
    case 'badge':
      return h(UBadge, {
        color: getBadgeColor(field),
        variant: 'subtle'
      }, () => value)

    case 'boolean':
      return h('span', {
        class: value === 'Ya' ? 'text-green-600' : 'text-red-600'
      }, value)

    default:
      return h('span', { class: 'text-slate-900 font-medium' }, value)
  }
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <UModal
    :open="open"
    :description="modalDescription"
    @update:open="handleClose"
    :ui="{ content: sizeClasses }"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-slate-900 text-lg">{{ title }}</h3>
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            @click="handleClose"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </UButton>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="field in visibleFields"
          :key="field.key"
          :class="{ 'col-span-2': field.span === 2 }"
          class="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b border-slate-100 last:border-0"
        >
          <span class="text-sm text-slate-500 sm:w-1/3 shrink-0">{{ field.label }}</span>
          <component :is="() => renderFieldValue(field)" class="sm:w-2/3" />
        </div>
      </div>

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </UCard>
  </UModal>
</template>
