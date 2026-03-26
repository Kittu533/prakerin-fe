<template>
  <div class="min-h-screen w-full flex overflow-hidden bg-slate-50 dark:bg-slate-900">
    <!-- Left Pane - Form -->
    <div class="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-between p-8 lg:p-12 xl:p-16 bg-white dark:bg-slate-900 z-10 shadow-2xl">
      <!-- Top Branding -->
      <div class="flex items-center space-x-3 mb-12">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <img
            src="~/assets/img/logo-skanda.png"
            alt="Logo"
            class="w-7 h-7 object-contain"
          />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white leading-none">SIM Prakerin</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SMK Negeri 2 Wonogiri</p>
        </div>
      </div>

      <!-- Main Form Area -->
      <div class="max-w-md w-full mx-auto">
        <div class="mb-10 text-left">
          <h1 class="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Selamat Datang</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Silakan masuk untuk melanjutkan akses ke sistem manajemen prakerin.</p>
        </div>

        <!-- Error Alert -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl flex items-center space-x-3">
            <div class="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center">
              <Icon name="lucide:alert-circle" class="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <p class="text-sm font-semibold text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>
        </transition>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Identifier Field -->
          <div class="space-y-2">
            <label for="identifier" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
              Email / NIS / NIP
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Icon name="lucide:user" class="w-5 h-5" />
              </div>
              <input
                id="identifier"
                v-model="form.identifier"
                type="text"
                placeholder="Masukkan identitas anda"
                class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                required
                :disabled="isLoading"
                autocomplete="username"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <div class="flex justify-between items-center px-1">
              <label for="password" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Icon name="lucide:lock" class="w-5 h-5" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                required
                :disabled="isLoading"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                :disabled="isLoading"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Options -->
          <div class="flex items-center px-1">
            <label class="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <span class="text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-700 transition-colors">Ingat saya di perangkat ini</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            <div v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div v-else class="flex items-center justify-center space-x-2">
              <span>Masuk ke Akun</span>
              <Icon name="lucide:arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </form>
      </div>

      <!-- Footer Branding -->
      <div class="text-center lg:text-left mt-8">
        <p class="text-xs text-slate-400 font-medium">
          &copy; 2025 SIM Prakerin. Dikelola oleh Tim IT SMK Negeri 2 Wonogiri.
        </p>
      </div>
    </div>

    <!-- Right Pane - Visual Area -->
    <div class="hidden lg:flex lg:w-[55%] xl:w-[60%] relative bg-slate-950 overflow-hidden">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 transition-transform duration-[30000ms] ease-in-out hover:scale-110">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
          alt="Professional Workspace"
          class="w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <!-- Advanced Multi-layer Gradients -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-blue-900/30"></div>
        <div class="absolute inset-0 bg-slate-950/20 backdrop-brightness-75"></div>
      </div>

      <!-- Content Overlay -->
      <div class="relative w-full h-full flex flex-col justify-end p-16 xl:p-24 z-10">
        <div class="max-w-2xl">
          <div class="flex items-center space-x-4 mb-6">
            <span class="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
              Professional Excellence
            </span>
          </div>
          <h2 class="text-4xl xl:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
            Gerbang Utama Menuju <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              Karier Impianmu
            </span>
          </h2>
          <p class="text-lg xl:text-xl text-slate-300 font-medium leading-relaxed max-w-lg opacity-90">
            Kelola data prakerin, laporan harian, hingga penilaian industri dalam satu platform terpadu yang dirancang untuk kesuksesan masa depanmu.
          </p>
          
          <!-- Stats/Mini Info (Decorative) -->
          <div class="flex space-x-12 mt-12 border-t border-white/10 pt-8">
            <div>
              <div class="text-2xl font-black text-white">100%</div>
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Terintegrasi</div>
            </div>
            <div>
              <div class="text-2xl font-black text-white">24/7</div>
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Akses Sistem</div>
            </div>
            <div>
              <div class="text-2xl font-black text-white">REALTIME</div>
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Abstract Glows -->
      <div class="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div class="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px]"></div>
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
  title: 'Masuk | SIM Prakerin - SMK Negeri 2 Wonogiri',
  meta: [
    { name: 'password-manager', content: 'false' },
    { name: 'save-password', content: 'false' },
    { name: 'description', content: 'Masuk ke sistem manajemen prakerin SMK Negeri 2 Wonogiri' }
  ]
});

const { login, getDashboardRoute } = useAuth();
const { showSuccess, showError } = useSweetAlert();

// Form state
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
        'Selamat datang kembali! Anda akan diarahkan ke dashboard.',
        { timer: 2000 }
      );
      
      // Redirect to role-specific dashboard
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
    await showError(
      'Terjadi Kesalahan',
      'Terjadi kesalahan sistem. Silakan coba lagi nanti.'
    );
    console.error('[Login] Error:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Custom transition for error alert */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
