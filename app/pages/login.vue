<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Left Pane - Login Form -->
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
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Masuk</h1>
          <p class="text-sm text-gray-500">Akun Praktik Kerja Lapangan</p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Username/Email/NIS/NIP -->
          <div>
            <label for="identifier" class="block text-sm font-medium text-gray-700 mb-2">
              Email / NIS / NIP
            </label>
            <input
              type="text"
              id="identifier"
              v-model="form.identifier"
              placeholder="Masukkan email, NIS, atau NIP"
              class="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              :disabled="isLoading"
              autocomplete="username"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                placeholder="Masukkan password"
                class="w-full px-4 py-3 pr-12 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                :disabled="isLoading"
                autocomplete="new-password"
                data-lpignore="true"
                data-form-type="other"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                :disabled="isLoading"
              >
                <Icon 
                  :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" 
                  class="w-5 h-5" 
                />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Memproses...
            </span>
            <span v-else>Masuk</span>
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

    <!-- Right Pane - Image Background -->
    <div class="hidden lg:flex lg:w-2/5 relative overflow-hidden">
      <div class="absolute inset-0">
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
import { reactive, ref } from 'vue';
import { useAuth } from '~/composables/auth/use-auth';
import { useSweetAlert } from '~/composables/use-sweet-alert';

definePageMeta({
  layout: false,
});

// Disable password manager suggestions
useHead({
  meta: [
    { name: 'password-manager', content: 'false' },
    { name: 'save-password', content: 'false' }
  ]
});

const { login, getDashboardRoute } = useAuth();
const { showSuccess, showError } = useSweetAlert();

// Form state - simplified, no role selection
const form = reactive({
  identifier: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

// Toggle password visibility
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

// Handle form submit
async function handleSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const result = await login({
      identifier: form.identifier,
      password: form.password,
    });

    if (result.success) {
      // Show success alert
      await showSuccess(
        'Login Berhasil!', 
        'Anda akan diarahkan ke dashboard.',
        { timer: 2000 }
      );
      
      // Redirect to role-specific dashboard
      const dashboardRoute = getDashboardRoute();
      await navigateTo(dashboardRoute);
    } else {
      // Check for account deactivation (is_active: false usually returns specific message from BE)
      const isDeactivated = result.message?.toLowerCase().includes('nonaktif') || 
                          result.message?.toLowerCase().includes('deactivated') ||
                          result.message?.toLowerCase().includes('aktif');

      if (isDeactivated) {
        await showError(
          'Akun Dinonaktifkan',
          result.message || 'Akun Anda telah dinonaktifkan. Silakan hubungi admin untuk informasi lebih lanjut.'
        );
      } else {
        // Show error alert
        await showError(
          'Login Gagal',
          result.message || 'Silakan periksa kembali email/NIS/NIP dan password Anda.'
        );
      }
    }
  } catch (error: any) {
    // Show error alert
    await showError(
      'Terjadi Kesalahan',
      'Terjadi kesalahan sistem. Silakan coba lagi dalam beberapa saat.'
    );
    console.error('[Login] Error:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>
