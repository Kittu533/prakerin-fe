<script setup lang="ts">
import { useMasterCompaniesPage } from "../../../../composables/pages/admin/use-master-companies-page";

definePageMeta({ layout: "admin" });

const { loading, data, columns, navigateToCreate } = useMasterCompaniesPage();
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Perusahaan Mitra
                </h1>
                <p class="text-sm text-slate-500">
                    Kelola data perusahaan mitra PKL
                </p>
            </div>
            <UButton
                color="primary"
                icon="lucide:plus"
                @click="navigateToCreate"
            >
                Tambah Perusahaan
            </UButton>
        </div>

        <CommonAppDataTable
            :data="data"
            :columns="columns"
            :loading="loading"
            title="Daftar Perusahaan"
            description="Kelola data perusahaan mitra PKL"
            searchable
            search-placeholder="Cari perusahaan..."
            with-time
        >
            <template #toolbar-right>
                <!-- Additional toolbar actions can go here -->
            </template>
        </CommonAppDataTable>

        <!-- Empty State -->
        <div
            v-if="!loading && data.length === 0"
            class="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200"
        >
            <Icon
                name="lucide:building-2"
                class="w-12 h-12 mx-auto mb-3 text-slate-300"
            />
            <p>Belum ada data perusahaan</p>
            <p class="text-sm mt-2">
                Klik "Tambah Perusahaan" untuk menambah data baru
            </p>
        </div>
    </div>
</template>
