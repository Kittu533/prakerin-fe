<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const jurnalRoutes = [
  {
    to: '/admin/siap-pkl/jurnal/iduka',
    title: 'Jurnal IDUKA',
    description: 'Kelola dan pantau jurnal harian siswa di industri (IDUKA)',
    icon: 'lucide:building-2',
    color: 'blue',
    stats: { total: 4, aktif: 3 }
  },
  {
    to: '/admin/siap-pkl/jurnal/monitoring',
    title: 'Monitoring Jurnal',
    description: 'Monitoring dan feedback jurnal siswa oleh pembimbing',
    icon: 'lucide:eye',
    color: 'green',
    stats: { total: 8, belum: 2 }
  },
  {
    to: '/admin/siap-pkl/jurnal/guru',
    title: 'Jurnal Guru',
    description: 'Kelola surat tugas dan penugasan guru pembimbing',
    icon: 'lucide:user-check',
    color: 'purple',
    stats: { total: 5, aktif: 4 }
  }
]
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon name="lucide:book-open" class="w-7 h-7 text-white" />
          </div>
          <div class="text-white">
            <h1 class="text-2xl font-black tracking-tight uppercase">Sistem Jurnal PKL</h1>
            <p class="text-blue-100 text-sm font-medium">Kelola jurnal dan dokumentasi kegiatan PKL</p>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-bold">
          SMK GITA LARAS
        </div>
      </div>
    </div>

    <!-- Menu Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink 
        v-for="route in jurnalRoutes" 
        :key="route.to"
        :to="route.to"
        class="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all"
      >
        <div class="p-6 space-y-4">
          <div 
            class="w-14 h-14 rounded-xl flex items-center justify-center"
            :class="{
              'bg-blue-100 text-blue-600': route.color === 'blue',
              'bg-green-100 text-green-600': route.color === 'green',
              'bg-purple-100 text-purple-600': route.color === 'purple'
            }"
          >
            <Icon :name="route.icon" class="w-7 h-7" />
          </div>
          
          <div>
            <h3 class="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              {{ route.title }}
            </h3>
            <p class="text-sm text-slate-500 mt-1">{{ route.description }}</p>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1.5">
                <Icon name="lucide:file-text" class="w-4 h-4 text-slate-400" />
                <span class="font-bold text-slate-700">{{ route.stats.total }}</span>
                <span class="text-slate-400">total</span>
              </div>
              <div 
                class="flex items-center gap-1.5"
                :class="{
                  'text-blue-600': route.color === 'blue',
                  'text-green-600': route.color === 'green',
                  'text-purple-600': route.color === 'purple'
                }"
              >
                <Icon name="lucide:check-circle" class="w-4 h-4" />
                <span class="font-bold">{{ route.stats.aktif || route.stats.belum || 0 }}</span>
                <span>{{ route.stats.aktif ? 'aktif' : 'belum' }}</span>
              </div>
            </div>
            <Icon name="lucide:arrow-right" class="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Quick Stats -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div class="flex items-center gap-2 mb-6">
        <Icon name="lucide:bar-chart-3" class="w-5 h-5 text-blue-600" />
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-widest">Ringkasan Cepat</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 rounded-xl p-4 text-center">
          <div class="text-3xl font-black text-blue-600">17</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Jurnal</div>
        </div>
        <div class="bg-green-50 rounded-xl p-4 text-center">
          <div class="text-3xl font-black text-green-600">13</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sudah Feedback</div>
        </div>
        <div class="bg-amber-50 rounded-xl p-4 text-center">
          <div class="text-3xl font-black text-amber-600">4</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Belum Feedback</div>
        </div>
        <div class="bg-purple-50 rounded-xl p-4 text-center">
          <div class="text-3xl font-black text-purple-600">3</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Guru Aktif</div>
        </div>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="bg-blue-50 border border-blue-100 rounded-2xl p-6">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="lucide:info" class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="font-bold text-blue-800 mb-1">Panduan Penggunaan</h3>
          <ul class="text-sm text-blue-700 space-y-1">
            <li><strong>Jurnal IDUKA:</strong> Digunakan oleh admin untuk mengelola jurnal siswa di industri</li>
            <li><strong>Monitoring Jurnal:</strong> Digunakan oleh guru pembimbing untuk memberikan feedback</li>
            <li><strong>Jurnal Guru:</strong> Digunakan oleh admin untuk mengelola surat tugas guru</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM PKL &copy; 2026 | SMK GITA LARAS</p>
    </div>
  </div>
</template>