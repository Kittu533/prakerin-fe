<!--
  Reusable Stats Card Component
  Displays a statistic with label, value, and optional styling
-->
<script setup lang="ts">
export interface StatsItem {
    label: string;
    value: number;
    color?: "green" | "blue" | "red" | "amber" | "sky" | "neutral";
    icon?: string;
}

const props = defineProps<{
    items: StatsItem[];
    columns?: 2 | 3 | 4;
}>();

const colorClasses: Record<
    string,
    { text: string; bg: string; border: string }
> = {
    green: {
        text: "text-green-600",
        bg: "bg-green-50/50",
        border: "border-green-200",
    },
    blue: {
        text: "text-blue-600",
        bg: "bg-blue-50/50",
        border: "border-blue-200",
    },
    red: { text: "text-red-600", bg: "bg-red-50/50", border: "border-red-200" },
    amber: {
        text: "text-amber-600",
        bg: "bg-amber-50/50",
        border: "border-amber-200",
    },
    sky: { text: "text-sky-600", bg: "bg-sky-50/50", border: "border-sky-200" },
    neutral: {
        text: "text-slate-600",
        bg: "bg-slate-50/50",
        border: "border-slate-200",
    },
};
</script>

<template>
    <div class="grid gap-4" :class="`grid-cols-1 sm:grid-cols-${columns || 3}`">
        <div
            v-for="item in items"
            :key="item.label"
            class="bg-white rounded-xl border p-4 text-center transition-shadow hover:shadow-sm"
            :class="colorClasses[item.color || 'neutral'].border"
        >
            <div v-if="item.icon" class="flex items-center justify-center mb-2">
                <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center mx-auto"
                    :class="colorClasses[item.color || 'neutral'].bg"
                >
                    <Icon
                        :name="item.icon"
                        class="w-5 h-5"
                        :class="colorClasses[item.color || 'neutral'].text"
                    />
                </div>
            </div>
            <p
                class="text-2xl font-bold"
                :class="colorClasses[item.color || 'neutral'].text"
            >
                {{ item.value }}
            </p>
            <p class="text-sm text-slate-500">{{ item.label }}</p>
        </div>
    </div>
</template>
