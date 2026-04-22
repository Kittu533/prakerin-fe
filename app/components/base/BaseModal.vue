<!--
  Base Modal Component - Dynamic Form Modal

  Usage:
  <BaseModal
    v-model:open="modalOpen"
    :title="modalTitle"
    :fields="formFields"
    :data="formData"
    :loading="processing"
    @submit="handleSubmit"
  />

  Field Types:
  - text: UInput
  - number: UInput type="number"
  - email: UInput type="email"
  - date: UInput type="date"
  - select: USelectMenu
  - textarea: UTextarea
  - checkbox: UCheckbox
-->
<script setup lang="ts">
import { computed, watch } from 'vue'

export type FieldType =
    | "text"
    | "number"
    | "email"
    | "date"
    | "select"
    | "textarea"
    | "checkbox"
    | "hidden";

export interface FormField {
    key: string; // Property key in data object
    label: string; // Display label
    type: FieldType; // Input type
    placeholder?: string; // Placeholder text
    required?: boolean; // Required validation
    disabled?: boolean; // Disabled state
    options?: { label: string; value: any }[]; // For select type
    span?: 1 | 2; // Grid span (1 or 2 columns)
    rows?: number; // For textarea
    showWhen?: (data: any) => boolean; // Conditional visibility
}

export interface ModalProps {
    open: boolean;
    title: string;
    description?: string;
    fields: FormField[];
    data?: Record<string, any>;
    loading?: boolean;
    submitText?: string;
    cancelText?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const props = withDefaults(defineProps<ModalProps>(), {
    data: () => ({}),
    loading: false,
    submitText: "Simpan",
    cancelText: "Batal",
    size: "md",
});

const emit = defineEmits<{
    "update:open": [value: boolean];
    submit: [data: Record<string, any>];
}>();

// Local form data
const formData = computed(() => props.data || {})

// Size classes
const sizeClasses = computed(() => {
    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };
    return sizes[props.size];
});

const modalDescription = computed(
  () =>
    props.description ||
    `Form ${props.title.toLowerCase()} untuk menambah atau memperbarui data.`,
)

// Check if field should be visible
const isFieldVisible = (field: FormField) => {
  return field.showWhen ? field.showWhen(formData.value) : true
}

// Get visible fields
const visibleFields = computed(() => {
    return props.fields.filter((f) => isFieldVisible(f));
});

// Handle form submission
const handleSubmit = () => {
  emit('submit', formData.value)
}

// Handle modal close
const handleClose = () => {
  emit('update:open', false)
}

// Render input based on field type
const renderField = (field: FormField) => {
  return field
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

      <div class="space-y-4">
        <!-- Hidden fields -->
        <template v-for="field in fields.filter(f => f.type === 'hidden')" :key="field.key">
          <input type="hidden" :name="field.key" :value="formData[field.key]" />
        </template>

        <!-- Regular form fields -->
        <div class="grid grid-cols-1 gap-4" :class="{ 'sm:grid-cols-2': fields.some(f => f.span === 2) }">
          <!-- Text Input -->
          <UFormField
            v-for="field in visibleFields.filter(f => f.type === 'text' || f.type === 'email' || f.type === 'number')"
            :key="field.key"
            :label="field.label"
            :required="field.required"
          >
            <UInput
              :model-value="formData[field.key]"
              :type="field.type"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              @update:model-value="(val) => formData[field.key] = val"
            />
          </UFormField>

          <!-- Date Input -->
          <UFormField
            v-for="field in visibleFields.filter(f => f.type === 'date')"
            :key="field.key"
            :label="field.label"
            :required="field.required"
          >
            <UInput
              :model-value="formData[field.key]"
              type="date"
              :disabled="field.disabled"
              @update:model-value="(val) => formData[field.key] = val"
            />
          </UFormField>

          <!-- Select Dropdown -->
          <UFormField
            v-for="field in visibleFields.filter(f => f.type === 'select')"
            :key="field.key"
            :label="field.label"
            :required="field.required"
          >
            <USelectMenu
              :model-value="formData[field.key]"
              :items="field.options || []"
              value-key="value"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              @update:model-value="(val) => formData[field.key] = val"
            />
          </UFormField>

          <!-- Textarea -->
          <UFormField
            v-for="field in visibleFields.filter(f => f.type === 'textarea')"
            :key="field.key"
            :label="field.label"
            :required="field.required"
            :class="{ 'sm:col-span-2': field.span === 2 }"
          >
            <UTextarea
              :model-value="formData[field.key]"
              :placeholder="field.placeholder"
              :rows="field.rows || 3"
              :disabled="field.disabled"
              @update:model-value="(val) => formData[field.key] = val"
            />
          </UFormField>

          <!-- Checkbox -->
          <UFormField
            v-for="field in visibleFields.filter(f => f.type === 'checkbox')"
            :key="field.key"
            class="sm:col-span-2"
          >
            <UCheckbox
              :model-value="formData[field.key]"
              :label="field.label"
              :disabled="field.disabled"
              @update:model-value="(val) => formData[field.key] = val"
            />
          </UFormField>
        </div>
      </div>

            <template #footer>
                <div class="flex gap-3 justify-end">
                    <UButton
                        variant="outline"
                        color="neutral"
                        @click="handleClose"
                    >
                        {{ cancelText }}
                    </UButton>
                    <UButton
                        color="primary"
                        :loading="loading"
                        @click="handleSubmit"
                    >
                        {{ submitText }}
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>
