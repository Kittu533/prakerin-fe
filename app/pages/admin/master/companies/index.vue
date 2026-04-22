<script setup lang="ts">
import { useMasterCompaniesPage } from "../../../../composables/pages/admin/use-master-companies-page";

definePageMeta({ layout: "admin" });

const {
  loading,
  refreshing,
  data,
  columns,
  filters,
  pageTitle,
  pageDescription,
  summaryCards,
  archiveToggleLabel,
  emptyTitle,
  emptyDescription,
  navigateToCreate,
  toggleArchiveMode,
  refreshData,
} = useMasterCompaniesPage();
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900">
          {{ pageTitle }}
        </h1>
        <p class="max-w-3xl text-sm text-slate-500">
          {{ pageDescription }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="toggleArchiveMode"
        >
          <Icon
            :name="filters.arsip ? 'lucide:folder-open' : 'lucide:archive'"
            class="mr-2 h-4 w-4"
          />
          {{ archiveToggleLabel }}
        </button>
        <button
          class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="refreshing"
          @click="refreshData"
        >
          <Icon
            name="lucide:refresh-cw"
            class="mr-2 h-4 w-4"
            :class="{ 'animate-spin': refreshing }"
          />
          Muat Ulang
        </button>
        <button
          v-if="!filters.arsip"
          class="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          @click="navigateToCreate"
        >
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          Tambah Perusahaan
        </button>
      </div>
    </div>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-2xl p-5 shadow-sm"
        :class="card.tone"
      >
        <p class="text-xs font-black uppercase tracking-[0.2em] opacity-80">
          {{ card.label }}
        </p>
        <p class="mt-3 text-4xl font-black">
          {{ card.value }}
        </p>
        <p class="mt-2 text-sm opacity-80">
          {{ card.caption }}
        </p>
      </article>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <div class="space-y-2">
          <label class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Cari Perusahaan
          </label>
          <div class="relative">
            <Icon
              name="lucide:search"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nama, bidang, alamat, kota, provinsi..."
              class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Status Kerja Sama
          </label>
          <select
            v-model="filters.statusKerjasama"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Status MoU
          </label>
          <select
            v-model="filters.mouAktif"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="semua">Semua MoU</option>
            <option value="aktif">MoU Aktif</option>
            <option value="tanpa-mou">Tanpa MoU Aktif</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Mode Data
          </label>
          <div class="flex rounded-xl bg-slate-100 p-1">
            <button
              class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition"
              :class="
                !filters.arsip ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              "
              @click="filters.arsip = false"
            >
              Aktif
            </button>
            <button
              class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition"
              :class="
                filters.arsip ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              "
              @click="filters.arsip = true"
            >
              Arsip
            </button>
          </div>
        </div>
      </div>
    </section>

    <CommonAppDataTable
      :data="data"
      :columns="columns"
      :loading="loading"
      :searchable="false"
      :with-time="true"
      :title="filters.arsip ? 'Daftar Arsip Perusahaan' : 'Daftar Perusahaan'"
      :description="
        filters.arsip
          ? 'Restore data perusahaan yang pernah dinonaktifkan.'
          : 'Lihat, edit, dan nonaktifkan data perusahaan mitra dari satu halaman.'
      "
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      empty-icon="lucide:building-2"
    />
  </div>
</template>
