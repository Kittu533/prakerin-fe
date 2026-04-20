<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Public Storage Monitor</p>
          <h1 class="text-2xl font-bold text-slate-900 mt-1">R2 Storage Health Check</h1>
          <p class="text-sm text-slate-600 mt-2">
            Halaman ini mengecek endpoint backend
            <span class="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">GET /api/health/storage</span>.
          </p>
        </div>

        <span
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          :class="badgeClass"
        >
          <span class="w-2 h-2 rounded-full" :class="dotClass" />
          {{ badgeText }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="rounded-xl border border-slate-200 p-4 bg-slate-50">
          <p class="text-xs text-slate-500">Storage Driver</p>
          <p class="text-sm font-semibold text-slate-900 mt-1">{{ health.storageDriver || '-' }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-4 bg-slate-50">
          <p class="text-xs text-slate-500">Latency</p>
          <p class="text-sm font-semibold text-slate-900 mt-1">{{ latencyText }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-4 bg-slate-50">
          <p class="text-xs text-slate-500">Bucket</p>
          <p class="text-sm font-semibold text-slate-900 mt-1 break-all">{{ health.bucket || '-' }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-4 bg-slate-50">
          <p class="text-xs text-slate-500">Checked At</p>
          <p class="text-sm font-semibold text-slate-900 mt-1">{{ checkedAtText }}</p>
        </div>
      </div>

      <div class="rounded-xl border p-4" :class="health.ok ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'">
        <p class="text-xs font-semibold uppercase tracking-wide" :class="health.ok ? 'text-emerald-700' : 'text-rose-700'">
          Message
        </p>
        <p class="text-sm mt-1" :class="health.ok ? 'text-emerald-900' : 'text-rose-900'">
          {{ health.message || '-' }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60"
          :disabled="loading"
          @click="fetchHealth"
        >
          <span v-if="loading">Checking...</span>
          <span v-else>Refresh</span>
        </button>

        <a
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          :href="apiUrlForDisplay"
          target="_blank"
          rel="noreferrer"
        >
          Open Raw JSON
        </a>
      </div>

      <p v-if="errorText" class="text-sm text-rose-600">{{ errorText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useHead, useRuntimeConfig } from 'nuxt/app'

interface StorageHealthResponse {
  status?: string;
  service?: string;
  timestamp?: string;
  ok?: boolean;
  storageDriver?: string;
  bucket?: string;
  endpoint?: string;
  latencyMs?: number;
  message?: string;
  errorName?: string;
}

useHead({
  title: 'Storage Health Check | SIM Prakerin',
})

const config = useRuntimeConfig()
const loading = ref(false)
const errorText = ref('')
const checkedAt = ref<string>('')

const health = reactive<StorageHealthResponse>({
  ok: false,
  storageDriver: '-',
  bucket: '-',
  latencyMs: 0,
  message: 'Belum ada pengecekan',
})

const apiBase = computed(() => String(config.public.apiUrl || '').replace(/\/$/, ''))
const apiUrlForDisplay = computed(() => `${apiBase.value}/health/storage`)

const badgeText = computed(() => {
  if (loading.value) return 'Checking'
  return health.ok ? 'Healthy' : 'Unhealthy'
})

const badgeClass = computed(() => {
  if (loading.value) return 'bg-amber-100 text-amber-700'
  return health.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
})

const dotClass = computed(() => {
  if (loading.value) return 'bg-amber-500'
  return health.ok ? 'bg-emerald-500' : 'bg-rose-500'
})

const latencyText = computed(() => {
  if (typeof health.latencyMs !== 'number') return '-'
  return `${health.latencyMs} ms`
})

const checkedAtText = computed(() => {
  if (!checkedAt.value) return '-'
  return new Date(checkedAt.value).toLocaleString('id-ID')
})

async function fetchHealth() {
  loading.value = true
  errorText.value = ''

  try {
    const response = await $fetch<StorageHealthResponse>(apiUrlForDisplay.value, {
      method: 'GET',
      credentials: 'include',
    })

    Object.assign(health, response)
    checkedAt.value = new Date().toISOString()
  } catch (error: any) {
    health.ok = false
    health.message = 'Gagal menghubungi endpoint health storage'
    errorText.value = error?.data?.message || error?.message || 'Network error'
    checkedAt.value = new Date().toISOString()
  } finally {
    loading.value = false
  }
}

onMounted(fetchHealth)
</script>
