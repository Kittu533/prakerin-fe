<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Profil Saya</h1>
      <p class="text-sm text-slate-500 mt-1">Informasi data diri</p>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-32 w-full rounded-xl" />
      <USkeleton class="h-48 w-full rounded-xl" />
    </div>

    <template v-else>
      <!-- Profile Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl bg-sky-500 flex items-center justify-center text-white text-xl font-bold">
            {{ initials }}
          </div>
          <div>
            <p class="font-semibold text-slate-900 text-lg">{{ profile.name }}</p>
            <p class="text-sm text-slate-500">{{ profile.nisn }}</p>
            <UBadge color="primary" variant="subtle" class="mt-1">{{ profile.class }}</UBadge>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Informasi PKL</h2>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="item in info" :key="item.label" class="px-5 py-3 flex justify-between">
            <p class="text-sm text-slate-500">{{ item.label }}</p>
            <p class="text-sm font-medium text-slate-900">{{ item.value }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <UButton color="primary" variant="outline" class="flex-1">
          <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
          Edit Profil
        </UButton>
        <UButton color="error" variant="ghost">
          <Icon name="lucide:log-out" class="w-4 h-4" />
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'siswa' })

const loading = ref(true)
const profile = reactive({ name: '', nisn: '', class: '' })
const info = ref([])

const initials = computed(() => {
  return profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  Object.assign(profile, { name: 'Ryobi Surya Atmaja', nisn: '0012345678', class: 'XII RPL 1' })
  info.value = [
    { label: 'Tempat PKL', value: 'PT. Teknologi Nusantara' },
    { label: 'Periode', value: '1 Nov 2024 - 31 Jan 2025' },
    { label: 'Guru Pembimbing', value: 'Budi Santoso, S.Pd' },
    { label: 'Pembimbing Industri', value: 'Ahmad Wijaya' }
  ]
  loading.value = false
})

useHead({ title: 'Profil | Siswa PKL' })
</script>
