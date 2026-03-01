<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Ubah Password</h1>
      <p class="text-sm text-slate-500 mt-1">Ganti password akun kamu untuk keamanan</p>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-5 lg:p-6 max-w-lg">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Current Password -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Password Lama</label>
          <div class="relative">
            <input
              v-model="form.currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              placeholder="Masukkan password lama"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all pr-10"
              :class="{ 'border-red-400 focus:ring-red-500 focus:border-red-500': errors.currentPassword }"
            />
            <button
              type="button"
              @click="showCurrent = !showCurrent"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <Icon :name="showCurrent ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
            </button>
          </div>
          <p v-if="errors.currentPassword" class="text-xs text-red-500 mt-1">{{ errors.currentPassword }}</p>
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="Minimal 6 karakter"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all pr-10"
              :class="{ 'border-red-400 focus:ring-red-500 focus:border-red-500': errors.newPassword }"
            />
            <button
              type="button"
              @click="showNew = !showNew"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <Icon :name="showNew ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
            </button>
          </div>
          <p v-if="errors.newPassword" class="text-xs text-red-500 mt-1">{{ errors.newPassword }}</p>

          <!-- Password Strength Indicator -->
          <div v-if="form.newPassword" class="mt-2">
            <div class="flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-all"
                :class="i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'"
              />
            </div>
            <p class="text-xs mt-1" :class="passwordStrength.textColor">{{ passwordStrength.label }}</p>
          </div>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Ulangi password baru"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all pr-10"
              :class="{ 'border-red-400 focus:ring-red-500 focus:border-red-500': errors.confirmPassword }"
            />
            <button
              type="button"
              @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <Icon :name="showConfirm ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1">{{ errors.confirmPassword }}</p>
          <p v-if="form.confirmPassword && form.newPassword && form.confirmPassword === form.newPassword && !errors.confirmPassword" class="text-xs text-green-600 mt-1 flex items-center gap-1">
            <Icon name="lucide:check-circle" class="w-3 h-3" /> Password cocok
          </p>
        </div>

        <!-- Submit -->
        <div class="pt-2">
          <UButton
            type="submit"
            color="primary"
            :loading="submitting"
            :disabled="submitting"
            block
            size="lg"
          >
            <Icon name="lucide:lock" class="w-4 h-4 mr-2" />
            Ubah Password
          </UButton>
        </div>
      </form>
    </div>

    <!-- Security Tips -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 max-w-lg">
      <div class="flex gap-3">
        <Icon name="lucide:shield-alert" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 class="text-sm font-semibold text-amber-800">Tips Keamanan Password</h3>
          <ul class="text-xs text-amber-700 mt-2 space-y-1 list-disc list-inside">
            <li>Gunakan minimal 6 karakter</li>
            <li>Kombinasikan huruf besar, huruf kecil, dan angka</li>
            <li>Jangan gunakan password yang sama dengan akun lain</li>
            <li>Jangan bagikan password ke orang lain</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/auth/use-auth'

definePageMeta({ layout: 'siswa' })

const toast = useToast()
const { changePassword } = useAuth()

// Form state
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const submitting = ref(false)
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// Password strength calculation
const passwordStrength = computed(() => {
  const pw = form.newPassword
  if (!pw) return { level: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400' }

  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { level: 1, label: 'Lemah', color: 'bg-red-500', textColor: 'text-red-500' }
  if (score <= 2) return { level: 2, label: 'Cukup', color: 'bg-amber-500', textColor: 'text-amber-500' }
  if (score <= 3) return { level: 3, label: 'Baik', color: 'bg-sky-500', textColor: 'text-sky-500' }
  return { level: 4, label: 'Kuat', color: 'bg-green-500', textColor: 'text-green-500' }
})

function validate(): boolean {
  let valid = true
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''

  if (!form.currentPassword) {
    errors.currentPassword = 'Password lama wajib diisi'
    valid = false
  }

  if (!form.newPassword) {
    errors.newPassword = 'Password baru wajib diisi'
    valid = false
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'Password minimal 6 karakter'
    valid = false
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'Password baru tidak boleh sama dengan password lama'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi'
    valid = false
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    const result = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    })

    if (result.success) {
      toast.add({ title: 'Password berhasil diubah', color: 'success' })
      // Reset form
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    } else {
      // Map specific backend error
      if (result.message.toLowerCase().includes('password lama')) {
        errors.currentPassword = result.message
      } else {
        toast.add({ title: result.message, color: 'error' })
      }
    }
  } catch (err) {
    console.error('Change password error:', err)
    toast.add({ title: 'Gagal mengubah password', color: 'error' })
  } finally {
    submitting.value = false
  }
}

useHead({ title: 'Ubah Password | Siswa PKL' })
</script>
