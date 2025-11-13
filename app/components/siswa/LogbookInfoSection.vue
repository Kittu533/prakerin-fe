<!-- components/siswa/LogbookInfoSection.vue -->
<template>
  <section>
    <h3 class="text-sm font-semibold text-slate-700 mb-3">
      Informasi Diri
    </h3>

    <dl class="divide-y divide-slate-100 text-sm">
      <div class="flex flex-col sm:flex-row py-2">
        <dt class="sm:w-1/3 text-slate-500">Nama Lengkap</dt>
        <dd class="sm:flex-1 sm:pl-6 text-slate-800">
          {{ profile.namaLengkap }}
        </dd>
      </div>

      <div class="flex flex-col sm:flex-row py-2">
        <dt class="sm:w-1/3 text-slate-500">NIM</dt>
        <dd class="sm:flex-1 sm:pl-6 font-medium text-slate-900">
          {{ profile.nim }}
        </dd>
      </div>

      <div class="flex flex-col sm:flex-row py-2">
        <dt class="sm:w-1/3 text-slate-500">Fakultas</dt>
        <dd class="sm:flex-1 sm:pl-6 text-slate-800">
          {{ profile.fakultas }}
        </dd>
      </div>

      <div class="flex flex-col sm:flex-row py-2">
        <dt class="sm:w-1/3 text-slate-500">Program Studi</dt>
        <dd class="sm:flex-1 sm:pl-6 text-slate-800">
          {{ profile.prodi }}
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
interface Profile {
  namaLengkap: string
  nim: string
  fakultas: string
  prodi: string
}

defineProps<{
  profile: Profile
}>()
</script>
