<template>
  <div class="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
    <!-- Login Container -->
    <div class="w-full max-w-[420px]">
      <!-- Logo & Title -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl mb-5 shadow-lg shadow-sky-500/20">
          <img
            src="~/assets/img/logo-skanda.png"
            alt="Logo"
            class="w-10 h-10 object-contain"
          />
        </div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">SIM Prakerin</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">SMK Negeri 2 Wonogiri</p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <!-- Card Header -->
        <div class="px-8 py-7 border-b border-slate-100 dark:border-slate-800">
          <h2 class="text-xl font-semibold text-slate-800 dark:text-white">Sign in</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your credentials to access the system</p>
        </div>

        <!-- Error Alert -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="errorMessage" class="mx-8 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl">
            <div class="flex items-center gap-3">
              <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-500 flex-shrink-0" />
              <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>
          </div>
        </transition>

        <!-- Form -->
        <div class="px-8 py-7">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Identifier -->
            <div class="space-y-2">
              <label for="identifier" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email / NIS / NIP
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Icon name="lucide:user" class="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="identifier"
                  v-model="form.identifier"
                  type="text"
                  placeholder="Enter your identity"
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm"
                  required
                  :disabled="isLoading"
                  autocomplete="username"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Icon name="lucide:lock" class="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm"
                  required
                  :disabled="isLoading"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  :disabled="isLoading"
                >
                  <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Remember & Forgot -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer" />
                <span class="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <a href="#" class="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors">Forgot password?</a>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Signing in...</span>
              <span v-else>Sign in</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <p class="text-xs text-center text-slate-500 dark:text-slate-400">
            &copy; 2025 SIM Prakerin SMK Negeri 2 Wonogiri
          </p>
        </div>
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

useHead({
  title: 'Sign In | SIM Prakerin - SMK Negeri 2 Wonogiri',
  meta: [
    { name: 'password-manager', content: 'false' },
    { name: 'save-password', content: 'false' },
  ]
});

const { login, getDashboardRoute } = useAuth();
const { showSuccess, showError } = useSweetAlert();

const form = reactive({
  identifier: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);
let isUnmounted = false;

onUnmounted(() => {
  isUnmounted = true;
});

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

async function handleSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const result = await login({
      identifier: form.identifier,
      password: form.password,
    });

    if (result.success) {
      await showSuccess(
        'Login Berhasil!', 
        'Selamat datang kembali! Anda akan diarahkan ke dashboard.',
        { timer: 2000 }
      );
      
      const dashboardRoute = getDashboardRoute();
      await navigateTo(dashboardRoute);
    } else {
      const isDeactivated = result.message?.toLowerCase().includes('nonaktif') || 
                          result.message?.toLowerCase().includes('deactivated') ||
                          result.message?.toLowerCase().includes('aktif');

      if (isDeactivated) {
        await showError(
          'Akun Dinonaktifkan',
          result.message || 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.'
        );
      } else {
        errorMessage.value = result.message || 'Identitas atau password salah.';
        await showError(
          'Login Gagal',
          errorMessage.value
        );
      }
    }
  } catch (error: any) {
    if (!isUnmounted) {
      await showError(
        'Terjadi Kesalahan',
        'Terjadi kesalahan sistem. Silakan coba lagi nanti.'
      );
    }
    console.error('[Login] Error:', error);
  } finally {
    if (!isUnmounted) {
      isLoading.value = false;
    }
  }
}
</script>
