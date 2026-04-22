<script setup lang="ts">
interface SelectOption {
  value: string;
  label: string;
}

defineProps<{
  filters: {
    search: string;
    status: string;
    prioritas: string;
  };
  statusFilterOptions: SelectOption[];
  prioritasFilterOptions: SelectOption[];
}>();

const emit = defineEmits<{
  apply: [];
}>();
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
      <div class="w-full xl:min-w-[320px] xl:flex-[2_1_0%]">
        <UFormField label="Cari disposisi">
          <UInput
            v-model="filters.search"
            class="w-full"
            placeholder="Nomor surat, asal surat, atau perihal..."
            icon="lucide:search"
            size="lg"
            @keyup.enter="emit('apply')"
          />
        </UFormField>
      </div>

      <div class="w-full sm:flex-1 xl:min-w-[220px] xl:flex-[1_1_0%]">
        <UFormField label="Filter status">
          <USelectMenu
            v-model="filters.status"
            class="w-full"
            :items="statusFilterOptions"
            value-key="value"
            size="lg"
            placeholder="Semua Status"
          />
        </UFormField>
      </div>

      <div class="w-full sm:flex-1 xl:min-w-[220px] xl:flex-[1_1_0%]">
        <UFormField label="Filter prioritas">
          <USelectMenu
            v-model="filters.prioritas"
            class="w-full"
            :items="prioritasFilterOptions"
            value-key="value"
            size="lg"
            placeholder="Semua Prioritas"
          />
        </UFormField>
      </div>

      <div class="flex w-full items-end xl:w-auto xl:min-w-[180px] xl:flex-[0_0_200px]">
        <UButton
          color="primary"
          class="h-11 flex-1 justify-center rounded-xl bg-slate-900 font-semibold hover:bg-slate-800"
          @click="emit('apply')"
        >
          Terapkan
        </UButton>
      </div>
    </div>
  </div>
</template>
