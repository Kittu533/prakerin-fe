<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Left Pane - Login Form (3 bagian) -->
    <div class="w-full lg:w-3/5 flex items-center justify-center bg-white px-6 py-8">
      <div class="max-w-md w-full">
        <!-- Logo -->
        <div class="flex justify-start mb-8">
          <div class="flex items-center justify-center">
            <img
              src="~/assets/img/logo-skanda.png"
              alt="Logo SMK"
              class="w-20 h-20 object-contain"
            />
          </div>
        </div>

        <!-- Title -->
        <div class="text-left mb-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p class="text-sm text-gray-500">Akun Praktik Kerja Lapangan</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              v-model="form.username"
              placeholder="Masukkan username"
              class="w-full px-4 py-3 border text-black/50 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              placeholder="Masukkan password"
              class="w-full px-4 py-3 border text-black/50 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
          >
            sign in
          </button>
        </form>

        <!-- Footer Text -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">
            © 2025 SMK Negeri 2 Wonogiri. All rights reserved.
          </p>
        </div>
      </div>
    </div>

    <!-- Right Pane - Image Background (2 bagian) -->
    <div class="hidden lg:flex lg:w-2/5 relative overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <!-- Fallback gradient jika gambar tidak ada -->
        <!-- <div class="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-blue-800"></div>
         -->
        <!-- Uncomment ketika gambar tersedia -->
        <img
          src="../assets/img/asdf.png"
          alt="Praktik Kerja Lapangan"
          class="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

definePageMeta({
  layout: false
})

const form = reactive({
  username: '',
  password: ''
})

const handleSubmit = () => {
  console.log('Login attempt:', { username: form.username })
  // TODO: Implement actual login logic
  navigateTo('/siswa')
}
</script>

<style scoped>
/* Custom styles for skew effect */
.skew-x-\[-8deg\] {
  transform: skewX(-8deg);
}
</style>