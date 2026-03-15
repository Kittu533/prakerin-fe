<template>
    <div v-if="isLoading"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
        <div
            class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 min-w-[200px] border border-slate-200 dark:border-slate-800">
            <div class="w-12 h-12 relative">
                <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                <div
                    class="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin">
                </div>
            </div>
            <div class="text-center">
                <h3 class="font-semibold text-slate-900 dark:text-white text-base">Memuat...</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Harap tunggu sebentar</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useGlobalLoading } from '~/composables/use-global-loading'

const { isLoading } = useGlobalLoading()
</script>
