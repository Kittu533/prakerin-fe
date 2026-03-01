<!--
  Base Detail Page Component

  Reusable layout for detail/view pages with:
  - Header with title, back button, and actions
  - Information display in grid layout
  - Related data sections
  - Loading and empty states

  Usage:
  <BaseDetailPage
    title="Detail Penempatan"
    :sections="detailSections"
    :data="itemData"
    :loading="loading"
    @edit="navigateToEdit"
    @delete="handleDelete"
    @back="navigateBack"
  >
    <template #actions>
      <UButton @click="doSomething">Action</UButton>
    </template>
  </BaseDetailPage>
-->
<script setup lang="ts">
export type DetailFieldType =
    | "text"
    | "date"
    | "status"
    | "badge"
    | "boolean"
    | "array"
    | "link"
    | "readonly";

export interface DetailField {
    key: string;
    label: string;
    type?: DetailFieldType;
    format?: (value: any) => string;
    options?: { label: string; value: any; color?: string }[];
    span?: 1 | 2;
    showWhen?: (data: any) => boolean;
}

export interface DetailSection {
    title: string;
    fields: DetailField[];
    columns?: 1 | 2;
}

interface ActionButton {
    label: string;
    icon: string;
    color?: "primary" | "success" | "warning" | "error" | "neutral";
    action: () => void;
    disabled?: boolean;
}

interface Props {
    title: string;
    subtitle?: string;
    sections: DetailSection[];
    data?: Record<string, any>;
    loading?: boolean;
    backUrl?: string;
    actions?: ActionButton[];
    showEdit?: boolean;
    showDelete?: boolean;
    editUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
    loading: false,
    showEdit: true,
    showDelete: false,
});

const emit = defineEmits<{
    edit: [];
    delete: [];
    back: [];
}>();

// Format value based on field type
const formatValue = (field: DetailField) => {
    const value = props.data?.[field.key];

    if (value === undefined || value === null || value === "") {
        return "-";
    }

    // Use custom formatter if provided
    if (field.format) {
        return field.format(value);
    }

    // Type-based formatting
    switch (field.type) {
        case "date":
            return new Date(value).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

        case "boolean":
            return value ? "Ya" : "Tidak";

        case "array":
            return Array.isArray(value) ? value.join(", ") : String(value);

        case "status":
        case "badge":
            const option = field.options?.find((o) => o.value === value);
            return option?.label || String(value);

        default:
            return String(value);
    }
};

// Get badge color for status/badge type
const getBadgeColor = (field: DetailField) => {
    const value = props.data?.[field.key];
    const option = field.options?.find((o) => o.value === value);
    return option?.color || "neutral";
};

// Check if field should be visible
const isFieldVisible = (field: DetailField) => {
    return field.showWhen ? field.showWhen(props.data || {}) : true;
};

// Handle back navigation
const handleBack = () => {
    emit("back");
};

// Handle edit action
const handleEdit = () => {
    emit("edit");
};

// Handle delete action
const handleDelete = () => {
    emit("delete");
};

// Render value based on type
const renderValue = (field: DetailField) => {
    const value = formatValue(field);

    switch (field.type) {
        case "status":
        case "badge":
            return h(
                UBadge,
                {
                    color: getBadgeColor(field),
                    variant: "subtle",
                    size: "md",
                },
                () => value,
            );

        case "boolean":
            return h(
                "span",
                {
                    class:
                        value === "Ya"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium",
                },
                value,
            );

        case "link":
            return h(
                "a",
                {
                    href: value,
                    target: "_blank",
                    class: "text-sky-600 hover:text-sky-700 underline",
                },
                value,
            );

        default:
            return h("span", { class: "text-slate-900 font-medium" }, value);
    }
};
</script>

<template>
    <div class="w-full space-y-6">
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
            <div class="flex items-center gap-3">
                <UButton
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    icon="lucide:arrow-left"
                    class="shrink-0"
                    @click="handleBack"
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

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-2">
                <slot name="actions">
                    <UButton
                        v-if="showEdit"
                        color="primary"
                        size="sm"
                        icon="lucide:edit"
                        @click="handleEdit"
                    >
                        Edit
                    </UButton>
                    <UButton
                        v-if="showDelete"
                        color="error"
                        size="sm"
                        icon="lucide:trash-2"
                        variant="outline"
                        @click="handleDelete"
                    >
                        Hapus
                    </UButton>
                    <UButton
                        v-for="action in actions"
                        :key="action.label"
                        :color="action.color || 'neutral'"
                        size="sm"
                        :icon="action.icon"
                        :disabled="action.disabled"
                        @click="action.action"
                    >
                        {{ action.label }}
                    </UButton>
                </slot>
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading"
            class="bg-white rounded-xl border border-slate-200 p-8 space-y-6"
        >
            <USkeleton v-for="i in 6" :key="i" class="h-16 rounded-lg" />
        </div>

        <!-- Detail Sections -->
        <template v-else>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-6">
                    <div
                        v-for="(section, sIdx) in sections"
                        :key="sIdx"
                        class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                        <!-- Section Header -->
                        <div
                            class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                        >
                            <h3
                                class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                            >
                                {{ section.title }}
                            </h3>
                        </div>

                        <!-- Section Content -->
                        <div class="divide-y divide-slate-100">
                            <div
                                v-for="field in section.fields.filter((f) =>
                                    isFieldVisible(f),
                                )"
                                :key="field.key"
                                class="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 px-5"
                                :class="{ 'sm:flex-row': field.span === 1 }"
                            >
                                <span
                                    class="text-sm text-slate-500 sm:w-40 shrink-0"
                                    >{{ field.label }}</span
                                >
                                <div class="flex-1 min-w-0">
                                    <component :is="() => renderValue(field)" />
                                </div>
                            </div>

                            <!-- Empty state for section with no visible fields -->
                            <div
                                v-if="
                                    section.fields.filter((f) =>
                                        isFieldVisible(f),
                                    ).length === 0
                                "
                                class="py-8 text-center text-slate-500"
                            >
                                Tidak ada data untuk ditampilkan
                            </div>
                        </div>
                    </div>

                    <!-- Empty State (when no data at all) -->
                    <div
                        v-if="!data || Object.keys(data).length === 0"
                        class="bg-white rounded-xl border border-slate-200 p-16 text-center"
                    >
                        <Icon
                            name="lucide:file-question"
                            class="w-16 h-16 text-slate-300 mx-auto mb-4"
                        />
                        <p class="text-slate-500">Data tidak ditemukan</p>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="lg:col-span-1">
                    <div
                        class="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-6"
                    >
                        <!-- Custom Sections Slot -->
                        <slot name="sections" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
