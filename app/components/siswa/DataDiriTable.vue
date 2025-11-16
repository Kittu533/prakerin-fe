<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[500px]">
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(item, index) in data"
            :key="index"
            class="group hover:bg-blue-50/50 transition-colors duration-150"
          >
            <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 w-2/5 sm:w-1/3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500 hidden sm:block"></span>
                <span class="text-xs sm:text-sm font-medium text-slate-600">
                  {{ item.label }}
                </span>
              </div>
            </td>
            <td class="px-2 py-3 sm:py-4 w-8 text-center">
              <span class="text-slate-400 text-sm">:</span>
            </td>
            <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <span 
                :class="[
                  'text-xs sm:text-sm',
                  index === 0 
                    ? 'font-bold text-slate-900 uppercase tracking-wide' 
                    : 'text-slate-700 font-medium'
                ]"
              >
                {{ item.value }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// ----- DATA -----
const data = ref([
  {
    label: 'Nama Lengkap',
    separator: ':',
    value: 'RYOBI SURYA ATMAJA',
  },
  {
    label: 'NIM',
    separator: ':',
    value: '5220311063',
  },
  {
    label: 'Fakultas',
    separator: ':',
    value: 'Sains & Teknologi',
  },
  {
    label: 'Program Studi',
    separator: ':',
    value: 'Sistem Informasi Sarjana',
  },
  {
    label: 'Jenis Kelamin',
    separator: ':',
    value: 'Laki-Laki',
  },
  {
    label: 'Tempat, Tanggal Lahir',
    separator: ':',
    value: 'Wonogiri, 05/03/2003',
  },
])
</script>
