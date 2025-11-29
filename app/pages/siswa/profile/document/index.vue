<template>
  <section class="min-h-screen bg-white px-4 py-6 rounded-xl">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-xs text-slate-500 md:text-sm" aria-label="Breadcrumb">
      <NuxtLink to="/siswa" class="transition-colors hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="ml-1">Home</span>
      </NuxtLink>
      <span class="text-slate-300">›</span>
      <NuxtLink to="/siswa/profile" class="transition-colors hover:text-blue-600">Profile</NuxtLink>
      <span class="text-slate-300">›</span>
      <span class="font-semibold text-blue-600">Dokumen PKL</span>
    </nav>
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 sm:text-3xl">Dokumen Prakerin</h1>
      <p class="mt-2 text-sm text-slate-600 sm:text-base">Kelola dokumen prakerin Anda dengan mudah</p>
    </div>

    <!-- Upload Section -->
    <div class="mb-8 overflow-hidden rounded-3xl border border-blue-200 bg-blue-50 shadow-lg">
      <div class="px-6 py-8 sm:px-10">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex-1">
            <div class="mb-3 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-800 sm:text-xl">Upload Dokumen Baru</h2>
                <p class="text-sm text-slate-600">Tambahkan dokumen prakerin Anda</p>
              </div>
            </div>
            <ul class="mt-4 space-y-2 text-sm text-slate-600">
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Format: PDF, DOC, DOCX, JPG, PNG</span>
              </li>
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Ukuran maksimal: 5 MB</span>
              </li>
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Dokumen akan direview oleh guru pembimbing</span>
              </li>
            </ul>
          </div>
          <div class="flex-shrink-0">
            <button
              @click="isUploadModalOpen = true"
              class="group flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Documents Grid -->
    <div class="mb-6">
      <h2 class="mb-5 text-lg font-bold text-slate-800 sm:text-xl">Daftar Dokumen</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Laporan Mingguan -->
        <div class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all hover:scale-105 hover:border-amber-300 hover:shadow-xl">
          <div class="bg-amber-50 p-6">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span :class="[
                'rounded-full px-4 py-1.5 text-xs font-bold shadow-sm',
                laporanMingguan.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                laporanMingguan.status === 'Perlu Review' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              ]">
                {{ laporanMingguan.status }}
              </span>
            </div>
            <h3 class="mb-2 text-xl font-bold text-slate-800">{{ laporanMingguan.name }}</h3>
            <p class="text-sm text-slate-600">{{ laporanMingguan.description }}</p>
          </div>
          
          <div class="space-y-3 bg-white px-6 py-5">
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ laporanMingguan.uploadDate }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ laporanMingguan.fileSize }}</span>
            </div>
            
            <div class="pt-3">
              <div class="grid grid-cols-2 gap-3">
                <button class="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Lihat</span>
                </button>
                <button class="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-700 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Laporan Akhir -->
        <div class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all hover:scale-105 hover:border-blue-300 hover:shadow-xl">
          <div class="bg-blue-50 p-6">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span :class="[
                'rounded-full px-4 py-1.5 text-xs font-bold shadow-sm',
                laporanAkhir.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                laporanAkhir.status === 'Perlu Review' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              ]">
                {{ laporanAkhir.status }}
              </span>
            </div>
            <h3 class="mb-2 text-xl font-bold text-slate-800">{{ laporanAkhir.name }}</h3>
            <p class="text-sm text-slate-600">{{ laporanAkhir.description }}</p>
          </div>
          
          <div class="space-y-3 bg-white px-6 py-5">
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ laporanAkhir.uploadDate }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ laporanAkhir.fileSize }}</span>
            </div>
            
            <div class="pt-3">
              <div class="grid grid-cols-2 gap-3">
                <button :disabled="laporanAkhir.status === 'Belum Upload'" class="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Lihat</span>
                </button>
                <button :disabled="laporanAkhir.status === 'Belum Upload'" class="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Dokumentasi -->
        <div class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all hover:scale-105 hover:border-purple-300 hover:shadow-xl">
          <div class="bg-purple-50 p-6">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span :class="[
                'rounded-full px-4 py-1.5 text-xs font-bold shadow-sm',
                dokumentasi.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                dokumentasi.status === 'Perlu Review' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              ]">
                {{ dokumentasi.status }}
              </span>
            </div>
            <h3 class="mb-2 text-xl font-bold text-slate-800">{{ dokumentasi.name }}</h3>
            <p class="text-sm text-slate-600">{{ dokumentasi.description }}</p>
          </div>
          
          <div class="space-y-3 bg-white px-6 py-5">
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ dokumentasi.uploadDate }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">{{ dokumentasi.fileSize }}</span>
            </div>
            
            <div class="pt-3">
              <div class="grid grid-cols-2 gap-3">
                <button class="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Lihat</span>
                </button>
                <button class="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-700 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isUploadModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          @click.self="isUploadModalOpen = false"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div
              v-if="isUploadModalOpen"
              class="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
              <!-- Modal Header -->
              <div class="bg-blue-600 px-8 py-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-white">Upload Dokumen PKL</h3>
                      <p class="text-sm text-blue-100">Lengkapi informasi dokumen Anda</p>
                    </div>
                  </div>
                  <button
                    @click="isUploadModalOpen = false"
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="space-y-6 px-8 py-8">
                <!-- Pilih Penempatan -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">
                    Pilih Penempatan Aktif <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="uploadForm.placementId"
                    class="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <option :value="null" disabled>Pilih penempatan...</option>
                    <option v-for="placement in placements" :key="placement.value" :value="placement.value">
                      {{ placement.label }}
                    </option>
                  </select>
                </div>

                <!-- Pilih Jenis Dokumen -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">
                    Pilih Jenis Dokumen <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="uploadForm.documentType"
                    class="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <option :value="null" disabled>Pilih jenis dokumen...</option>
                    <option v-for="docType in documentTypes" :key="docType.value" :value="docType.value">
                      {{ docType.label }}
                    </option>
                  </select>
                </div>

                <!-- Upload File -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">
                    File Dokumen <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="file"
                      @change="handleFileChange"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      class="w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-800 transition-all file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-400 hover:bg-blue-50 focus:outline-none"
                    />
                  </div>
                  <p class="mt-2 text-xs text-slate-500">
                    <span class="font-semibold">Format yang didukung:</span> PDF, DOC, DOCX, JPG, PNG
                    <br />
                    <span class="font-semibold">Ukuran maksimal:</span> 5 MB
                  </p>
                  <p v-if="uploadForm.file" class="mt-2 flex items-center gap-2 text-sm font-medium text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    File terpilih: {{ uploadForm.file.name }}
                  </p>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-8 py-6">
                <button
                  @click="isUploadModalOpen = false"
                  class="rounded-xl bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-100 active:scale-95"
                >
                  Batal
                </button>
                <button
                  @click="handleUpload"
                  :disabled="isUploading || !uploadForm.placementId || !uploadForm.documentType || !uploadForm.file"
                  class="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg v-if="isUploading" class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>{{ isUploading ? 'Mengupload...' : 'Upload Dokumen' }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'siswa',
  title: 'Dokumen PKL'
})

// TypeScript Interfaces
interface DocumentData {
  name: string
  description: string
  status: 'Disetujui' | 'Perlu Review' | 'Belum Upload'
  uploadDate: string
  fileSize: string
}

interface Placement {
  value: number
  label: string
}

interface DocumentType {
  value: string
  label: string
}

interface UploadForm {
  placementId: number | null
  documentType: string | null
  file: File | null
}

// State
const isUploadModalOpen = ref<boolean>(false)
const isUploading = ref<boolean>(false)

const uploadForm = ref<UploadForm>({
  placementId: null,
  documentType: null,
  file: null
})

// Data - Hanya 3 dokumen utama
const laporanMingguan = ref<DocumentData>({
  name: 'Laporan Mingguan',
  description: 'Laporan kegiatan mingguan prakerin',
  status: 'Perlu Review',
  uploadDate: '22 November 2024',
  fileSize: '1.2 MB'
})

const laporanAkhir = ref<DocumentData>({
  name: 'Laporan Akhir',
  description: 'Laporan akhir kegiatan prakerin',
  status: 'Belum Upload',
  uploadDate: '-',
  fileSize: '-'
})

const dokumentasi = ref<DocumentData>({
  name: 'Dokumentasi',
  description: 'Foto dan video kegiatan prakerin',
  status: 'Disetujui',
  uploadDate: '25 November 2024',
  fileSize: '3.8 MB'
})

// Dropdown options
const placements = ref<Placement[]>([
  { value: 1, label: 'PT. Telkom Indonesia - Web Developer' },
  { value: 2, label: 'PT. Gojek Indonesia - Mobile Developer' },
  { value: 3, label: 'PT. Tokopedia - UI/UX Designer' }
])

const documentTypes = ref<DocumentType[]>([
  { value: 'laporan_mingguan', label: 'Laporan Mingguan' },
  { value: 'laporan_akhir', label: 'Laporan Akhir' },
  { value: 'dokumentasi', label: 'Dokumentasi Kegiatan' }
])

// Methods
const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ Ukuran file maksimal 5MB')
      target.value = ''
      return
    }
    
    // Validasi tipe file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert('⚠️ Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG')
      target.value = ''
      return
    }
    
    uploadForm.value.file = file
    console.log('✅ File terpilih:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)
  }
}

const handleUpload = async (): Promise<void> => {
  // Validasi form
  if (!uploadForm.value.placementId || !uploadForm.value.documentType || !uploadForm.value.file) {
    alert('⚠️ Mohon lengkapi semua field yang diperlukan')
    return
  }

  isUploading.value = true

  try {
    // Simulasi upload API
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('📤 Uploading document:', {
      placement: uploadForm.value.placementId,
      type: uploadForm.value.documentType,
      file: uploadForm.value.file?.name
    })

    alert('✅ Dokumen berhasil diupload!\n\nDokumen Anda akan segera direview oleh guru pembimbing.')
    
    // Reset form
    isUploadModalOpen.value = false
    uploadForm.value = {
      placementId: null,
      documentType: null,
      file: null
    }
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    
  } catch (error) {
    console.error('❌ Upload error:', error)
    alert('❌ Gagal upload dokumen. Silakan coba lagi.')
  } finally {
    isUploading.value = false
  }
}

// Lifecycle
onMounted(() => {
  console.log('✅ Halaman Dokumen PKL berhasil dimuat!')
  console.log('📍 Current Route:', useRoute().path)
})

// SEO
useHead({
  title: 'Dokumen PKL | SIM Prakerin',
  meta: [
    { name: 'description', content: 'Kelola dokumen prakerin - laporan mingguan, laporan akhir, dan dokumentasi kegiatan' }
  ]
})
</script>
