<template>
  <header class="sticky top-0 z-40 w-full bg-white/95 border-b border-gray-200 backdrop-blur-sm">
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
      <div class="flex items-center gap-4">
        <!-- Hamburger Menu - Now visible on all screen sizes -->
        <button
          @click="toggleSidebar"
          class="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 lg:hover:bg-gray-50"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <UIcon name="i-heroicons-bars-3" class="w-6 h-6 text-gray-700" />
        </button>

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm"
            :class="
              role === 'mentor' ? 'from-blue-400 to-blue-600' : 
              role === 'guru' ? 'from-purple-400 to-purple-600' :
              'from-emerald-400 to-emerald-600'
            "
          >
            <span class="text-white font-bold text-lg">
              {{ 
                role === 'mentor' ? 'M' : 
                role === 'guru' ? 'G' : 
                'S' 
              }}
            </span>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-sm font-semibold text-gray-900">
              {{ 
                role === 'mentor' ? 'MENTOR PKL' : 
                role === 'guru' ? 'GURU PKL' : 
                'SIMPRAKERIN' 
              }}
            </h1>
            <p class="text-xs text-gray-500">{{ schoolName || 'SMK N 2 Wonogiri' }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton icon="i-heroicons-bell" color="gray" variant="ghost" size="lg" class="hidden sm:flex" />

        <div class="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
          <div class="hidden md:block text-right">
            <p class="text-sm font-medium text-gray-900">
              {{ 
                userName || 
                (role === 'mentor' ? 'Mentor PKL' : 
                 role === 'guru' ? 'Guru PKL' : 
                 'Ryobi Surya Atmaja') 
              }}
            </p>
            <p class="text-xs text-gray-500">
              {{ 
                role === 'mentor' ? 'mentor@school.edu' : 
                role === 'guru' ? 'guru@school.edu' :
                'XII TM A' 
              }}
            </p>
          </div>
          <UAvatar
            :text="
              role === 'mentor' ? 'MP' : 
              role === 'guru' ? 'GP' :
              'RS'
            "
            size="md"
            :ui="{ 
              background: 
                role === 'mentor' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : role === 'guru'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
            }"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  role?: string
  userName?: string
  schoolName?: string
}

const props = withDefaults(defineProps<Props>(), {
  role: 'siswa',
  userName: '',
  schoolName: ''
})

const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>
