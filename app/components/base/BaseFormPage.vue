<!--
  Base Form Page Component

  Reusable layout for create/edit pages with:
  - Header with title and back button
  - Form with dynamic fields
  - Loading and error states
  - Action buttons (save, cancel)

  Usage:
  <BaseFormPage
    title="Tambah Penempatan"
    :fields="formFields"
    :data="formData"
    :loading="loading"
    :submit-loading="submitLoading"
    @cancel="navigateBack"
    @submit="handleSubmit"
  />
-->
<script setup lang="ts">
import { reactive, watch, computed } from "vue";

export type FieldType =
    | "text"
    | "number"
    | "email"
    | "date"
    | "select"
    | "textarea"
    | "checkbox"
    | "hidden"
    | "readonly";

export interface FormField {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: { label: string; value: any }[];
    span?: 1 | 2;
    rows?: number;
    showWhen?: (data: any) => boolean;
    description?: string;
}

interface Props {
    title: string;
    subtitle?: string;
    fields: FormField[];
    data?: Record<string, any>;
    loading?: boolean;
    submitLoading?: boolean;
    submitText?: string;
    cancelText?: string;
    backUrl?: string;
    size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
    loading: false,
    submitLoading: false,
    submitText: "Simpan",
    cancelText: "Batal",
    size: "md",
});

const emit = defineEmits<{
    submit: [data: Record<string, any>];
    cancel: [];
}>();

// Local form data
const localData = reactive<Record<string, any>>({});

// Sync props.data to localData
watch(
    () => props.data,
    (newData) => {
        Object.assign(localData, newData);
    },
    { deep: true, immediate: true },
);

// Get max width based on size
const maxWidthClass = computed(() => {
    const sizes = {
        sm: "max-w-2xl",
        md: "max-w-3xl",
        lg: "max-w-5xl",
    };
    return sizes[props.size];
});

// Check if field should be visible
const isFieldVisible = (field: FormField) => {
    return field.showWhen ? field.showWhen(localData) : true;
};

// Get visible fields
const visibleFields = computed(() => {
    return props.fields.filter((f) => isFieldVisible(f));
});

// Handle form submission
const handleSubmit = () => {
    emit("submit", { ...localData });
};

// Handle cancel
const handleCancel = () => {
    emit("cancel");
};

// Validate required fields
const validateRequired = () => {
    const requiredFields = visibleFields.value.filter(
        (f) => f.required && f.type !== "hidden" && f.type !== "readonly",
    );
    for (const field of requiredFields) {
        if (!localData[field.key] || localData[field.key] === "") {
            return false;
        }
    }
    return true;
};

// Expose validation method
defineExpose({
    validateRequired,
    localData,
});
</script>

<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
            <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="lucide:arrow-left"
                class="shrink-0"
                @click="handleCancel"
            >
                Kembali
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    {{ title }}
                </h1>
                <p v-if="subtitle" class="text-sm text-slate-500 mt-0.5">
                    {{ subtitle }}
                </p>
            </div>
        </div>

        <!-- Form Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div :class="maxWidthClass" class="lg:col-span-2">
                <div
                    class="bg-white rounded-xl border border-slate-200 shadow-sm"
                >
                    <!-- Loading State -->
                    <div v-if="loading" class="p-8 space-y-6">
                        <USkeleton
                            v-for="i in 5"
                            :key="i"
                            class="h-20 rounded-lg"
                        />
                    </div>

                    <!-- Form -->
                    <form
                        v-else
                        @submit.prevent="handleSubmit"
                        class="p-6 lg:p-8"
                    >
                        <!-- Hidden fields -->
                        <template
                            v-for="field in fields.filter(
                                (f) => f.type === 'hidden',
                            )"
                            :key="field.key"
                        >
                            <input
                                type="hidden"
                                :name="field.key"
                                :value="localData[field.key]"
                            />
                        </template>

                        <!-- Form Fields -->
                        <div class="space-y-6">
                            <!-- Readonly Field -->
                            <div
                                v-for="field in visibleFields.filter(
                                    (f) => f.type === 'readonly',
                                )"
                                :key="field.key"
                            >
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    {{ field.label }}
                                </label>
                                <div
                                    class="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900"
                                >
                                    {{ localData[field.key] || "-" }}
                                </div>
                                <p
                                    v-if="field.description"
                                    class="mt-1 text-xs text-slate-500"
                                >
                                    {{ field.description }}
                                </p>
                            </div>

                            <!-- Text/Number/Email Input -->
                            <div
                                v-for="field in visibleFields.filter((f) =>
                                    ['text', 'email', 'number'].includes(
                                        f.type,
                                    ),
                                )"
                                :key="field.key"
                            >
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    {{ field.label }}
                                    <span
                                        v-if="field.required"
                                        class="text-red-500 ml-1"
                                        >*</span
                                    >
                                </label>
                                <UInput
                                    :model-value="localData[field.key]"
                                    :type="field.type"
                                    :placeholder="field.placeholder"
                                    :disabled="field.disabled"
                                    size="lg"
                                    class="w-full"
                                    @update:model-value="
                                        (val) => (localData[field.key] = val)
                                    "
                                />
                                <p
                                    v-if="field.description"
                                    class="mt-1 text-xs text-slate-500"
                                >
                                    {{ field.description }}
                                </p>
                            </div>

                            <!-- Date Input -->
                            <div
                                v-for="field in visibleFields.filter(
                                    (f) => f.type === 'date',
                                )"
                                :key="field.key"
                            >
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    {{ field.label }}
                                    <span
                                        v-if="field.required"
                                        class="text-red-500 ml-1"
                                        >*</span
                                    >
                                </label>
                                <UInput
                                    :model-value="localData[field.key]"
                                    type="date"
                                    :disabled="field.disabled"
                                    size="lg"
                                    class="w-full"
                                    @update:model-value="
                                        (val) => (localData[field.key] = val)
                                    "
                                />
                                <p
                                    v-if="field.description"
                                    class="mt-1 text-xs text-slate-500"
                                >
                                    {{ field.description }}
                                </p>
                            </div>

                            <!-- Select Dropdown -->
                            <div
                                v-for="field in visibleFields.filter(
                                    (f) => f.type === 'select',
                                )"
                                :key="field.key"
                            >
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    {{ field.label }}
                                    <span
                                        v-if="field.required"
                                        class="text-red-500 ml-1"
                                        >*</span
                                    >
                                </label>
                                <USelectMenu
                                    :model-value="localData[field.key]"
                                    :items="field.options || []"
                                    value-key="value"
                                    :placeholder="field.placeholder"
                                    :disabled="field.disabled"
                                    size="lg"
                                    class="w-full"
                                    @update:model-value="
                                        (val) => (localData[field.key] = val)
                                    "
                                />
                                <p
                                    v-if="field.description"
                                    class="mt-1 text-xs text-slate-500"
                                >
                                    {{ field.description }}
                                </p>
                            </div>

                            <!-- Textarea -->
                            <div
                                v-for="field in visibleFields.filter(
                                    (f) => f.type === 'textarea',
                                )"
                                :key="field.key"
                            >
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    {{ field.label }}
                                    <span
                                        v-if="field.required"
                                        class="text-red-500 ml-1"
                                        >*</span
                                    >
                                </label>
                                <UTextarea
                                    :model-value="localData[field.key]"
                                    :placeholder="field.placeholder"
                                    :rows="field.rows || 4"
                                    :disabled="field.disabled"
                                    class="w-full"
                                    @update:model-value="
                                        (val) => (localData[field.key] = val)
                                    "
                                />
                                <p
                                    v-if="field.description"
                                    class="mt-1 text-xs text-slate-500"
                                >
                                    {{ field.description }}
                                </p>
                            </div>

                            <!-- Checkbox -->
                            <div
                                v-for="field in visibleFields.filter(
                                    (f) => f.type === 'checkbox',
                                )"
                                :key="field.key"
                            >
                                <UCheckbox
                                    :model-value="localData[field.key]"
                                    :label="field.label"
                                    :disabled="field.disabled"
                                    @update:model-value="
                                        (val) => (localData[field.key] = val)
                                    "
                                />
                                <p
                                    v-if="field.description"
                                    class="mt-1 text-xs text-slate-500 ml-6"
                                >
                                    {{ field.description }}
                                </p>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div
                            class="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200"
                        >
                            <UButton
                                variant="outline"
                                color="neutral"
                                type="button"
                                @click="handleCancel"
                            >
                                {{ cancelText }}
                            </UButton>
                            <UButton
                                color="primary"
                                type="submit"
                                :loading="submitLoading"
                            >
                                {{ submitText }}
                            </UButton>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="lg:col-span-1">
                <div
                    v-if="$slots.info"
                    class="bg-blue-50 border border-blue-200 rounded-xl p-4 sticky top-6"
                >
                    <div class="flex gap-3">
                        <Icon
                            name="lucide:info"
                            class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                        />
                        <div class="text-sm text-blue-900">
                            <slot name="info" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
