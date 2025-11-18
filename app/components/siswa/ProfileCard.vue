<!-- components/siswa/ProfileCard.vue -->
<template>
  <section
    class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden"
  >
    <!-- Title card -->
    <div class="border-b border-slate-200 px-6 py-4">
      <h2 class="text-base font-semibold text-slate-800">
        Kelengkapan Data Diri
      </h2>
    </div>

    <div class="px-6 py-5 space-y-8">
      <!-- Data Diri -->
      <section>
        <h3 class="text-sm font-semibold text-slate-700 mb-3">
          Data Diri
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

          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">Jenis Kelamin</dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.jenisKelamin }}
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">Tempat, Tanggal Lahir</dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.tempatTanggalLahir }}
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">No. KTP</dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.noKtp }}
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">Alamat Domisili</dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.alamatDomisili }}
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">No. Telp / No. HP</dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.noHp }}
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">Alamat Email Aktif</dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.email }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Informasi Akademik -->
      <section>
        <h3 class="text-sm font-semibold text-slate-700 mb-3">
          Informasi Akademik
        </h3>

        <dl class="divide-y divide-slate-100 text-sm">
          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">IPK</dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.ipk }}
            </dd>
          </div>

          <div class="flex flex-col sm:flex-row py-2">
            <dt class="sm:w-1/3 text-slate-500">
              Jumlah SKS Total yang sudah ditempuh
            </dt>
            <dd class="sm:flex-1 sm:pl-6 text-slate-800">
              {{ profile.totalSks }}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Profile {
  namaLengkap: string
  nim: string
  fakultas: string
  prodi: string
  jenisKelamin: string
  tempatTanggalLahir: string
  noKtp: string
  alamatDomisili: string
  noHp: string
  email: string
  ipk: string
  totalSks: string
}

const props = defineProps<{
  profile: Profile
}>()
</script>
