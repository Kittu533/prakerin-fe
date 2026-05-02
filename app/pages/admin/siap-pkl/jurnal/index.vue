<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const primaryActions = [
  {
    to: '/admin/siap-pkl/jurnal/iduka',
    title: 'Surat ke IDUKA',
    description: 'Kelola dokumen untuk kebutuhan komunikasi dan administrasi ke industri.',
    icon: 'lucide:building-2',
    tone: 'emerald',
    metric: '4 surat',
    status: '3 aktif'
  }
]

const supportActions = [
  {
    to: '/admin/siap-pkl/jurnal/guru',
    title: 'Surat Tugas Guru',
    description: 'Atur surat tugas pembimbing untuk penerjunan, monitoring, dan penarikan.',
    icon: 'lucide:user-check',
    tone: 'violet',
    metric: '5 guru',
    status: '4 aktif'
  },
  {
    to: '/admin/siap-pkl/jurnal/murid',
    title: 'Surat Tugas Murid',
    description: 'Siapkan administrasi surat tugas siswa untuk kegiatan PKL.',
    icon: 'lucide:graduation-cap',
    tone: 'amber',
    metric: '12 siswa',
    status: 'siap proses'
  }
]

const quickStats = [
  { label: 'Surat IDUKA', value: '4', icon: 'lucide:building-2', tone: 'emerald' },
  { label: 'Surat Guru', value: '5', icon: 'lucide:user-check', tone: 'violet' },
  { label: 'Surat Murid', value: '12', icon: 'lucide:graduation-cap', tone: 'amber' },
  { label: 'Dokumen Aktif', value: '21', icon: 'lucide:files', tone: 'blue' }
]

const workflowSteps = [
  'Siapkan surat ke IDUKA untuk kebutuhan administrasi industri',
  'Buat surat tugas guru pembimbing sesuai kegiatan PKL',
  'Buat surat tugas murid untuk kelengkapan administrasi siswa',
  'Arsipkan dokumen agar mudah dilacak saat monitoring'
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 md:p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
          <div class="relative overflow-hidden bg-slate-950 p-6 text-white md:p-8">
            <div class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.42),transparent_42%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.26),transparent_38%)]" />
            <div class="relative max-w-3xl space-y-5">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-blue-100">
                <Icon name="lucide:folder-kanban" class="h-4 w-4" />
                Administrasi PKL
              </div>
              <div class="space-y-3">
                <h1 class="text-3xl font-black uppercase tracking-tight md:text-4xl">
                  Pusat administrasi surat PKL
                </h1>
                <p class="max-w-2xl text-sm font-medium leading-6 text-slate-300 md:text-base">
                  Kelola surat ke IDUKA, surat tugas guru, dan surat tugas murid dari satu halaman kerja admin.
                </p>
              </div>
              <div class="flex flex-wrap gap-3">
                <NuxtLink
                  to="/admin/siap-pkl/jurnal/guru"
                  class="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400"
                >
                  <Icon name="lucide:file-plus-2" class="h-4 w-4" />
                  Buat Surat Tugas
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 bg-white p-6 lg:border-l lg:border-t-0">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">Ringkasan</p>
                <h2 class="text-lg font-black text-slate-800">Status Cepat</h2>
              </div>
              <div class="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Icon name="lucide:activity" class="h-6 w-6" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="item in quickStats"
                :key="item.label"
                class="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div
                  class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                  :class="{
                    'bg-blue-100 text-blue-600': item.tone === 'blue',
                    'bg-emerald-100 text-emerald-600': item.tone === 'emerald',
                    'bg-amber-100 text-amber-600': item.tone === 'amber',
                    'bg-violet-100 text-violet-600': item.tone === 'violet'
                  }"
                >
                  <Icon :name="item.icon" class="h-5 w-5" />
                </div>
                <p class="text-2xl font-black text-slate-900">{{ item.value }}</p>
                <p class="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{{ item.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <div>
            <div class="mb-3 flex items-center gap-2">
              <Icon name="lucide:star" class="h-5 w-5 text-blue-600" />
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Aksi Utama</h2>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <NuxtLink
                v-for="action in primaryActions"
                :key="action.to"
                :to="action.to"
                class="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div class="flex items-start justify-between gap-4">
                  <div
                    class="flex h-14 w-14 items-center justify-center rounded-2xl"
                    :class="{
                      'bg-sky-100 text-sky-600': action.tone === 'sky',
                      'bg-blue-100 text-blue-600': action.tone === 'blue',
                      'bg-emerald-100 text-emerald-600': action.tone === 'emerald'
                    }"
                  >
                    <Icon :name="action.icon" class="h-7 w-7" />
                  </div>
                  <Icon name="lucide:arrow-up-right" class="h-5 w-5 text-slate-300 transition group-hover:text-blue-600" />
                </div>

                <div class="mt-5 space-y-2">
                  <h3 class="text-xl font-black text-slate-900">{{ action.title }}</h3>
                  <p class="text-sm font-medium leading-6 text-slate-500">{{ action.description }}</p>
                </div>

                <div class="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">{{ action.metric }}</span>
                  <span
                    class="rounded-lg px-3 py-1.5 text-xs font-black"
                    :class="{
                      'bg-sky-50 text-sky-700': action.tone === 'sky',
                      'bg-blue-50 text-blue-700': action.tone === 'blue',
                      'bg-emerald-50 text-emerald-700': action.tone === 'emerald'
                    }"
                  >
                    {{ action.status }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div>
            <div class="mb-3 flex items-center gap-2">
              <Icon name="lucide:folder-kanban" class="h-5 w-5 text-slate-600" />
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Administrasi Pendukung</h2>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <NuxtLink
                v-for="action in supportActions"
                :key="action.to"
                :to="action.to"
                class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div class="flex gap-4">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    :class="{
                      'bg-violet-100 text-violet-600': action.tone === 'violet',
                      'bg-amber-100 text-amber-600': action.tone === 'amber'
                    }"
                  >
                    <Icon :name="action.icon" class="h-6 w-6" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="font-black text-slate-900">{{ action.title }}</h3>
                      <Icon name="lucide:chevron-right" class="mt-0.5 h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                    </div>
                    <p class="mt-1 text-sm font-medium leading-6 text-slate-500">{{ action.description }}</p>
                    <div class="mt-4 flex flex-wrap gap-2 text-xs font-black">
                      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">{{ action.metric }}</span>
                      <span class="rounded-lg bg-slate-50 px-3 py-1.5 text-slate-500">{{ action.status }}</span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-5 flex items-center gap-2">
              <Icon name="lucide:route" class="h-5 w-5 text-emerald-600" />
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Alur Kerja</h2>
            </div>

            <ol class="space-y-4">
              <li
                v-for="(step, index) in workflowSteps"
                :key="step"
                class="flex gap-3"
              >
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                  {{ index + 1 }}
                </div>
                <p class="pt-1 text-sm font-bold leading-6 text-slate-600">{{ step }}</p>
              </li>
            </ol>
          </div>

          <div class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div class="mb-3 flex items-center gap-2 text-blue-700">
              <Icon name="lucide:info" class="h-5 w-5" />
              <h2 class="text-sm font-black uppercase tracking-widest">Catatan Modul</h2>
            </div>
            <p class="text-sm font-semibold leading-6 text-blue-800">
              Menu jurnal dan monitoring siswa tidak ditampilkan di admin karena proses tersebut dikelola oleh siswa dan guru pembimbing. Area ini hanya berfokus pada administrasi surat PKL.
            </p>
          </div>
        </aside>
      </section>

      <footer class="py-4 text-center">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">TIM PKL &copy; 2026 | SMK GITA LARAS</p>
      </footer>
    </div>
  </div>
</template>
