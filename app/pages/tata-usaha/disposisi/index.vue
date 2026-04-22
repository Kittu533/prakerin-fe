<template>
    <div class="space-y-6 max-w-[1600px] mx-auto pb-10">
        <DisposisiHeroSection
            :status-summary="statusSummary"
            @reset-filters="resetFilters"
            @create="openCreateModal"
        />

        <DisposisiFilterCard
            :filters="filters"
            :status-filter-options="statusFilterOptions"
            :prioritas-filter-options="prioritasFilterOptions"
            @apply="applyFilters"
        />

        <DisposisiTableCard
            :loading="loading"
            :disposisi-list="disposisiList"
            :pagination="pagination"
            :columns="columns"
            :format-date="formatDate"
            :get-status-color="getStatusColor"
            :get-prioritas-color="getPrioritasColor"
            @update:limit="pagination.limit = $event"
            @create="openCreateModal"
            @detail="viewDetail"
            @edit="editDisposisi"
            @status="setStatus"
            @delete="confirmDelete"
            @page="changePage"
        />

        <DisposisiFormModal
            v-model:open="showCreateModal"
            :is-editing="isEditing"
            :saving="saving"
            :form="form"
            :form-meta="formMeta"
            :surat-masuk-select-options="suratMasukSelectOptions"
            :management-list="managementList"
            :selected-recipient-names="selectedRecipientNames"
            @toggle-recipient="toggleRecipient"
            @toggle-instruksi="toggleInstruksi"
            @save="saveDisposisi"
        />

        <DisposisiDetailModal
            v-model:open="showDetailModal"
            :disposisi="selectedDisposisi"
            :format-date="formatDate"
            :get-status-color="getStatusColor"
            :get-prioritas-color="getPrioritasColor"
            @set-status="setStatus"
        />
    </div>
</template>

<script setup lang="ts">
import { useDisposisiPage } from "~/composables/tata-usaha/use-disposisi-page";
import DisposisiDetailModal from "~/components/tata-usaha/disposisi/DisposisiDetailModal.vue";
import DisposisiFilterCard from "~/components/tata-usaha/disposisi/DisposisiFilterCard.vue";
import DisposisiFormModal from "~/components/tata-usaha/disposisi/DisposisiFormModal.vue";
import DisposisiHeroSection from "~/components/tata-usaha/disposisi/DisposisiHeroSection.vue";
import DisposisiTableCard from "~/components/tata-usaha/disposisi/DisposisiTableCard.vue";

definePageMeta({ layout: "tata-usaha" });

const {
    loading,
    saving,
    showCreateModal,
    showDetailModal,
    isEditing,
    selectedDisposisi,
    managementList,
    disposisiList,
    pagination,
    filters,
    form,
    formMeta,
    columns,
    statusFilterOptions,
    prioritasFilterOptions,
    suratMasukSelectOptions,
    selectedRecipientNames,
    statusSummary,
    formatDate,
    getStatusColor,
    getPrioritasColor,
    openCreateModal,
    toggleRecipient,
    toggleInstruksi,
    applyFilters,
    resetFilters,
    viewDetail,
    editDisposisi,
    saveDisposisi,
    setStatus,
    confirmDelete,
    changePage,
} = useDisposisiPage();

useHead({ title: "Disposisi | Tata Usaha" });
</script>
