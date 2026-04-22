<script setup lang="ts">
defineProps<{
  statusSummary: {
    total: number;
    aktif: number;
    deadline: number;
    selesai: number;
  };
}>();

const emit = defineEmits<{
  resetFilters: [];
  create: [];
}>();
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-sky-50 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="space-y-2">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700"
        >
          <Icon name="lucide:file-signature" class="h-4 w-4" />
          Manajemen Disposisi
        </div>
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">
            Disposisi surat yang lebih rapi dan terstruktur
          </h2>
          <p class="mt-1 max-w-3xl text-sm text-slate-600">
            Pantau surat masuk yang sudah didisposisikan, kelola penerima multi-pihak, atur instruksi, dan percepat tindak lanjut dari satu halaman kerja.
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <UButton
          color="neutral"
          variant="soft"
          class="justify-center rounded-xl px-5 py-3 font-semibold"
          @click="emit('resetFilters')"
        >
          <Icon name="lucide:rotate-ccw" class="mr-2 h-4 w-4" />
          Reset Filter
        </UButton>
        <UButton
          color="primary"
          class="justify-center rounded-xl bg-sky-600 px-5 py-3 font-semibold hover:bg-sky-700"
          @click="emit('create')"
        >
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          Buat Disposisi
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Total Data
        </p>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-3xl font-bold text-slate-900">
            {{ statusSummary.total }}
          </p>
          <Icon name="lucide:folders" class="h-8 w-8 text-slate-300" />
        </div>
        <p class="mt-2 text-sm text-slate-500">
          Total disposisi dari hasil filter saat ini.
        </p>
      </div>

      <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Disposisi Aktif
        </p>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-3xl font-bold text-amber-900">
            {{ statusSummary.aktif }}
          </p>
          <Icon name="lucide:hourglass" class="h-8 w-8 text-amber-300" />
        </div>
        <p class="mt-2 text-sm text-amber-700/80">
          Status baru atau sedang diproses.
        </p>
      </div>

      <div class="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
          Deadline Dekat
        </p>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-3xl font-bold text-rose-900">
            {{ statusSummary.deadline }}
          </p>
          <Icon name="lucide:alarm-clock-check" class="h-8 w-8 text-rose-300" />
        </div>
        <p class="mt-2 text-sm text-rose-700/80">
          Tenggat aktif dalam 3 hari ke depan.
        </p>
      </div>

      <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Tuntas
        </p>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-3xl font-bold text-emerald-900">
            {{ statusSummary.selesai }}
          </p>
          <Icon name="lucide:badge-check" class="h-8 w-8 text-emerald-300" />
        </div>
        <p class="mt-2 text-sm text-emerald-700/80">
          Disposisi yang sudah diselesaikan.
        </p>
      </div>
    </div>
  </div>
</template>
