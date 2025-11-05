<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import * as z from "zod";
import { loginUser } from "~/composables/consume-api-auth/account/auth.login";
import { useRouter } from "#app";
import { useDataStore } from "~/stores/data-store";

const fields = ref<AuthFormField[]>([
  {
    name: "email",
    type: "text",
    label: "Email/NIS",
    placeholder: "Masukkan email atau NIS Anda",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "Masukkan kata sandi Anda",
    required: true,
  },
]);

const schema = z.object({
  email: z.email("Email tidak valid"),
  password: z
    .string("Kata sandi wajib diisi")
    .min(8, "Minimal 8 karakter"),
});

type Schema = z.output<typeof schema>;

const router = useRouter();
const loading = ref(false);
const error = ref<string | null>(null);
const dataStore = useDataStore();

function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true;
  error.value = null;
  
  const loginData = {
    email: payload.data.email,
    password: payload.data.password
  };

  loginUser(loginData)
    .then((response) => {
      if (response.data.success) {
        console.log("Berhasil login", response.data);
        
        // Store user data and tokens in the store
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Set user profile
        dataStore.setProfile(user);
        
        // Set tokens - the store expects signature as well, we'll use empty strings for now
        // if signatures are needed, they should be part of the response from the API
        dataStore.setToken(accessToken, '');
        if (refreshToken) {
          dataStore.setRefreshToken(refreshToken);
        }
        
        // Redirect to dashboard or home page
        router.push('/dashboard');
      } else {
        error.value = response.data.message || 'Login gagal';
      }
    })
    .catch((err) => {
      console.error("Login failed", err);
      error.value = err?.response?.data?.message || 'Terjadi kesalahan saat login';
    })
    .finally(() => {
      loading.value = false;
    });
}

definePageMeta({
  layout: "default",
});

useHead({
  title: "Login - SIM Prakerin",
});
</script>

<template>
  <div class="min-h-screen flex bg-white">
    <!-- Left Aside Panel -->
    <div class="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
      <div>
        <div class="flex items-center mb-12">
          <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">SIM Prakerin</h1>
        </div>
        
        <h2 class="text-3xl font-bold text-white mb-6">Selamat Datang Kembali</h2>
        <p class="text-blue-100 mb-8 max-w-md">
          Sistem Informasi Manajemen Praktik Kerja Industri untuk memudahkan pengelolaan kegiatan prakerin bagi siswa, guru pembimbing, dan instansi mitra.
        </p>
        
        <div class="mt-12 grid grid-cols-3 gap-4">
          <div class="bg-blue-500 bg-opacity-30 p-4 rounded-lg text-center">
            <div class="text-white text-2xl font-bold">150+</div>
            <div class="text-blue-100 text-sm">Siswa</div>
          </div>
          <div class="bg-blue-500 bg-opacity-30 p-4 rounded-lg text-center">
            <div class="text-white text-2xl font-bold">25+</div>
            <div class="text-blue-100 text-sm">Instansi</div>
          </div>
          <div class="bg-blue-500 bg-opacity-30 p-4 rounded-lg text-center">
            <div class="text-white text-2xl font-bold">15+</div>
            <div class="text-blue-100 text-sm">Guru</div>
          </div>
        </div>
      </div>
      
      <div class="relative">
        <img 
          src="~/assets/img/logo-skanda.png" 
          alt="SIM Prakerin Logo" 
          class="w-48 h-48 object-contain opacity-20"
        >
        <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-800 to-transparent"></div>
      </div>
    </div>
    
    <!-- Login Form Panel -->
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-8">
      <div class="w-full max-w-md">
        <div class="text-center mb-10 md:hidden">
          <h1 class="text-2xl font-bold text-gray-800">SIM Prakerin</h1>
          <p class="text-gray-600 mt-2">Masuk ke akun Anda</p>
        </div>
        
        <UPageCard class="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <UAuthForm
            :schema="schema"
            title="Masuk ke Akun"
            description="Silakan masukkan kredensial Anda untuk melanjutkan"
            icon="i-lucide-user"
            :fields="fields"
            :loading="loading"
            @submit="onSubmit"
          >
            <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {{ error }}
            </div>
            <template #footer>
              <div class="text-center mt-6">
                <p class="text-gray-500 text-xs mt-4">
                  © 2025 SIM Prakerin. Hak Cipta Dilindungi.
                </p>
              </div>
            </template>
          </UAuthForm>
        </UPageCard>
      </div>
    </div>
  </div>
</template>
