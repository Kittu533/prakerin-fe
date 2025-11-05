<script setup lang="ts">
import { useDataStore } from '~/stores/data-store'
import { navigateTo } from '#app'



const dataStore = useDataStore()

function handleLogout() {
  dataStore.clearToken()
  dataStore.clearRefreshToken()
  dataStore.clearProfile()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <div class="bg-white shadow p-6 rounded-lg w-[400px] text-center">
      <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
      <p class="text-gray-700 mb-4">Selamat datang, {{ dataStore.profile?.email }}</p>
      <button
        @click="handleLogout"
        class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  </div>
</template>
