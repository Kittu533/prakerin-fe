<template>
    <div class="space-y-6">
        <!-- Back -->
        <UButton
            to="/guru/siswa-bimbingan"
            variant="ghost"
            color="neutral"
            size="sm"
        >
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Kembali
        </UButton>

        <!-- Error State -->
        <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
            <Icon
                name="lucide:alert-circle"
                class="w-10 h-10 mx-auto mb-2 text-red-400"
            />
            <p class="text-red-600 font-medium">{{ error }}</p>
            <UButton
                @click="loadData"
                variant="outline"
                color="error"
                size="sm"
                class="mt-4"
            >
                Coba Lagi
            </UButton>
        </div>

        <template v-else>
            <!-- Profile Card -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
                <div v-if="loading" class="flex flex-col sm:flex-row gap-6">
                    <USkeleton class="w-20 h-20 rounded-2xl" />
                    <div class="flex-1 space-y-3">
                        <USkeleton class="h-6 w-48" />
                        <USkeleton class="h-4 w-32" />
                        <div class="flex gap-2">
                            <USkeleton class="h-6 w-20 rounded-full" />
                            <USkeleton class="h-6 w-24 rounded-full" />
                        </div>
                    </div>
                </div>
                <div v-else class="flex flex-col sm:flex-row gap-6">
                    <div
                        class="w-20 h-20 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold shrink-0"
                    >
                        {{ siswaInisial }}
                    </div>
                    <div class="flex-1">
                        <h1 class="text-xl font-bold text-slate-900">
                            {{ siswaData?.nama_siswa || "-" }}
                        </h1>
                        <p class="text-slate-500">
                            {{ siswaData?.nis || "-" }} •
                            {{ siswaData?.kelas?.nama_kelas || "-" }}
                        </p>
                        <div class="flex flex-wrap gap-2 mt-3">
                            <UBadge :color="statusColor" variant="subtle">{{
                                statusLabel
                            }}</UBadge>
                            <UBadge color="primary" variant="subtle">
                                <Icon
                                    name="lucide:building-2"
                                    class="w-3 h-3 mr-1"
                                />
                                {{ perusahaanData?.nama_perusahaan || "-" }}
                            </UBadge>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <UButton variant="outline" color="neutral" size="sm">
                            <Icon
                                name="lucide:message-square"
                                class="w-4 h-4"
                            />
                        </UButton>
                        <UButton variant="outline" color="neutral" size="sm">
                            <Icon name="lucide:phone" class="w-4 h-4" />
                        </UButton>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <template v-if="loading">
                    <div
                        v-for="i in 4"
                        :key="i"
                        class="bg-white rounded-xl border border-slate-200 p-4"
                    >
                        <USkeleton class="h-4 w-20 mb-2" />
                        <USkeleton class="h-6 w-12" />
                    </div>
                </template>
                <template v-else>
                    <div
                        class="bg-white rounded-xl border border-slate-200 p-4"
                    >
                        <p class="text-sm text-slate-500 mb-1">Kehadiran</p>
                        <p
                            class="text-xl font-bold"
                            :class="
                                stats.kehadiran >= 80
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            "
                        >
                            {{ stats.kehadiran }}%
                        </p>
                    </div>
                    <div
                        class="bg-white rounded-xl border border-slate-200 p-4"
                    >
                        <p class="text-sm text-slate-500 mb-1">Total Logbook</p>
                        <p class="text-xl font-bold text-slate-900">
                            {{ stats.totalLogbook }}
                        </p>
                    </div>
                    <div
                        class="bg-white rounded-xl border border-slate-200 p-4"
                    >
                        <p class="text-sm text-slate-500 mb-1">Hari PKL</p>
                        <p class="text-xl font-bold text-slate-900">
                            {{ stats.hariPkl }}
                        </p>
                    </div>
                    <div
                        class="bg-white rounded-xl border border-slate-200 p-4"
                    >
                        <p class="text-sm text-slate-500 mb-1">
                            Logbook Pending
                        </p>
                        <p class="text-xl font-bold text-sky-600">
                            {{ stats.logbookPending }}
                        </p>
                    </div>
                </template>
            </div>

            <!-- Tabs Content -->
            <div class="bg-white rounded-xl border border-slate-200">
                <div class="border-b border-slate-200">
                    <nav class="flex gap-4 px-6">
                        <button
                            v-for="item in tabItems"
                            :key="item.key"
                            @click="activeTab = item.key"
                            class="py-4 text-sm font-medium border-b-2 transition-colors"
                            :class="
                                activeTab === item.key
                                    ? 'border-sky-500 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            "
                        >
                            {{ item.label }}
                            <span
                                v-if="item.count !== undefined"
                                class="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded-full"
                                >{{ item.count }}</span
                            >
                        </button>
                    </nav>
                </div>

                <div class="p-6">
                    <!-- Info Tab -->
                    <div v-if="activeTab === 'info'" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-slate-500">Jurusan</p>
                                <p class="font-medium text-slate-900">
                                    {{
                                        siswaData?.kelas?.jurusan
                                            ?.nama_jurusan || "-"
                                    }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Alamat Perusahaan
                                </p>
                                <p class="font-medium text-slate-900">
                                    {{ perusahaanData?.alamat || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Guru Pembimbing
                                </p>
                                <p class="font-medium text-slate-900">
                                    {{ guruData?.nama_guru || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Periode PKL
                                </p>
                                <p class="font-medium text-slate-900">
                                    {{ formatPeriode }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Tanggal Mulai
                                </p>
                                <p class="font-medium text-slate-900">
                                    {{ formatDate(penempatan?.tanggal_mulai) }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Tanggal Selesai
                                </p>
                                <p class="font-medium text-slate-900">
                                    {{
                                        formatDate(penempatan?.tanggal_selesai)
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Riwayat Harian Tab -->
                    <div v-if="activeTab === 'riwayat'" class="space-y-5">
                        <div
                            class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
                        >
                            <div>
                                <h2 class="text-base font-bold text-slate-900">
                                    Riwayat Harian PKL
                                </h2>
                                <p class="mt-1 text-sm text-slate-500">
                                    Gabungan absensi, jam hadir, logbook, status verifikasi, dan bukti foto siswa.
                                </p>
                            </div>
                            <UButton
                                color="primary"
                                variant="soft"
                                size="sm"
                                :loading="loadingRiwayat"
                                @click="loadRiwayatHarian"
                            >
                                <Icon name="lucide:refresh-cw" class="mr-1.5 h-4 w-4" />
                                Refresh
                            </UButton>
                        </div>

                        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p class="text-xs font-medium text-slate-500">Total Hari</p>
                                <p class="mt-1 text-xl font-bold text-slate-900">{{ riwayatSummary.total }}</p>
                            </div>
                            <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                <p class="text-xs font-medium text-emerald-700">Hadir</p>
                                <p class="mt-1 text-xl font-bold text-emerald-700">{{ riwayatSummary.hadir }}</p>
                            </div>
                            <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                <p class="text-xs font-medium text-emerald-700">Logbook</p>
                                <p class="mt-1 text-xl font-bold text-emerald-700">{{ riwayatSummary.logbook }}</p>
                            </div>
                            <div class="rounded-lg border border-amber-100 bg-amber-50 p-3">
                                <p class="text-xs font-medium text-amber-700">Perlu Cek</p>
                                <p class="mt-1 text-xl font-bold text-amber-700">{{ riwayatSummary.perluCek }}</p>
                            </div>
                        </div>

                        <div class="grid gap-3 lg:grid-cols-[1fr_180px]">
                            <div class="relative">
                                <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    v-model="riwayatSearch"
                                    type="search"
                                    class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    placeholder="Cari tanggal, absensi, atau isi logbook..."
                                />
                            </div>
                            <select
                                v-model="riwayatStatusFilter"
                                class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                            >
                                <option value="">Semua status</option>
                                <option value="lengkap">Lengkap</option>
                                <option value="belum_absen">Belum absen</option>
                                <option value="belum_logbook">Belum logbook</option>
                                <option value="menunggu">Menunggu</option>
                                <option value="disetujui">Disetujui</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>

                        <div v-if="loadingRiwayat" class="space-y-3">
                            <USkeleton
                                v-for="i in 3"
                                :key="i"
                                class="h-20 w-full rounded-lg"
                            />
                        </div>
                        <div
                            v-else-if="riwayatHarian.length === 0"
                            class="text-center py-8 text-slate-500"
                        >
                            <Icon
                                name="lucide:calendar-clock"
                                class="w-10 h-10 mx-auto mb-2 text-slate-300"
                            />
                            <p>Belum ada data absensi atau logbook</p>
                        </div>
                        <div
                            v-else-if="filteredRiwayatHarian.length === 0"
                            class="rounded-lg border border-dashed border-slate-200 py-8 text-center text-slate-500"
                        >
                            <Icon name="lucide:search-x" class="mx-auto mb-2 h-9 w-9 text-slate-300" />
                            <p class="font-medium text-slate-700">Riwayat tidak ditemukan</p>
                            <p class="mt-1 text-sm">Coba ubah kata kunci atau filter.</p>
                        </div>
                        <div v-else class="overflow-hidden rounded-lg border border-slate-200">
                            <div class="overflow-x-auto">
                                <table class="w-full min-w-[1080px] table-fixed text-left text-sm">
                                    <colgroup>
                                        <col class="w-[170px]" />
                                        <col class="w-[170px]" />
                                        <col class="w-[170px]" />
                                        <col />
                                        <col class="w-[180px]" />
                                        <col class="w-[150px]" />
                                    </colgroup>
                                    <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th class="px-4 py-3">Tanggal</th>
                                            <th class="px-4 py-3">Absensi</th>
                                            <th class="px-4 py-3">Jam</th>
                                            <th class="px-4 py-3">Logbook</th>
                                            <th class="px-4 py-3">Status</th>
                                            <th class="px-4 py-3">Bukti</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        <tr
                                            v-for="row in filteredRiwayatHarian"
                                            :key="row.dateKey"
                                            class="align-top transition hover:bg-slate-50"
                                        >
                                            <td class="px-4 py-4">
                                                <p class="font-semibold text-slate-900">
                                                    {{ formatDate(row.dateKey) }}
                                                </p>
                                                <p class="mt-1 text-xs text-slate-500">
                                                    {{ row.dateKey }}
                                                </p>
                                            </td>
                                            <td class="px-4 py-4">
                                                <div class="flex items-start gap-2">
                                                    <div
                                                        class="mt-0.5 rounded-lg p-1.5"
                                                        :class="getAbsensiIconClass(row.absensi?.status_absensi)"
                                                    >
                                                        <Icon
                                                            :name="getAbsensiIcon(row.absensi?.status_absensi)"
                                                            class="h-4 w-4"
                                                        />
                                                    </div>
                                                    <div class="min-w-0">
                                                        <UBadge
                                                            :color="getAbsensiColor(row.absensi?.status_absensi)"
                                                            variant="subtle"
                                                            size="xs"
                                                        >
                                                            {{ row.absensi ? getAbsensiLabel(row.absensi.status_absensi) : "Belum absen" }}
                                                        </UBadge>
                                                        <p
                                                            v-if="row.absensi?.keterangan"
                                                            class="mt-2 line-clamp-2 break-words text-xs text-slate-500 [overflow-wrap:anywhere]"
                                                        >
                                                            {{ row.absensi.keterangan }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-4 py-4 text-slate-600">
                                                <p>Masuk: {{ formatTime(row.absensi?.waktu_masuk) }}</p>
                                                <p class="mt-1">Keluar: {{ formatTime(row.absensi?.waktu_keluar) }}</p>
                                            </td>
                                            <td class="px-4 py-4">
                                                <template v-if="row.logbook">
                                                    <p class="line-clamp-2 break-words font-semibold text-slate-900 [overflow-wrap:anywhere]">
                                                        {{ getLogbookTitle(row.logbook) }}
                                                    </p>
                                                    <p class="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                                                        {{ getLogbookContent(row.logbook) }}
                                                    </p>
                                                </template>
                                                <p v-else class="text-sm text-slate-400">
                                                    Belum ada logbook
                                                </p>
                                            </td>
                                            <td class="px-4 py-4">
                                                <div class="flex flex-col items-start gap-2">
                                                    <UBadge
                                                        v-if="row.logbook"
                                                        :color="getLogStatusColor(row.logbook.status_persetujuan)"
                                                        variant="subtle"
                                                        size="xs"
                                                    >
                                                        {{ getLogStatusLabel(row.logbook.status_persetujuan) }}
                                                    </UBadge>
                                                    <UBadge
                                                        :color="getRiwayatCompletion(row).color"
                                                        variant="subtle"
                                                        size="xs"
                                                    >
                                                        {{ getRiwayatCompletion(row).label }}
                                                    </UBadge>
                                                    <UBadge
                                                        v-if="row.absensi?.validasi_guru"
                                                        color="success"
                                                        variant="soft"
                                                        size="xs"
                                                    >
                                                        Absensi tervalidasi
                                                    </UBadge>
                                                </div>
                                            </td>
                                            <td class="px-4 py-4">
                                                <div class="flex flex-col items-start gap-2">
                                                    <button
                                                        v-if="row.absensi?.foto_absensi && selfieUrls[row.absensi.id_absensi]"
                                                        type="button"
                                                        class="group w-28 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-sky-300 hover:shadow"
                                                        @click="openSelfie(row.absensi)"
                                                    >
                                                        <img
                                                            :src="selfieUrls[row.absensi.id_absensi]"
                                                            alt="Bukti selfie absensi"
                                                            class="h-24 w-28 object-cover transition group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                        <span class="block truncate px-2 py-1 text-[11px] font-medium text-slate-600">
                                                            Selfie
                                                        </span>
                                                    </button>
                                                    <div
                                                        v-else-if="row.absensi?.foto_absensi"
                                                        class="flex h-28 w-28 items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
                                                    >
                                                        <Icon
                                                            name="lucide:loader-2"
                                                            class="h-4 w-4 animate-spin text-slate-400"
                                                        />
                                                    </div>
                                                    <span v-else class="text-xs text-slate-400">Tanpa selfie</span>
                                                    <UButton
                                                        v-if="row.logbook"
                                                        size="xs"
                                                        color="primary"
                                                        variant="soft"
                                                        @click="openLogbookDetail(row.logbook)"
                                                    >
                                                        <Icon name="lucide:eye" class="mr-1 h-3 w-3" />
                                                        Detail
                                                    </UButton>
                                                    <UButton
                                                        v-if="row.absensi && !row.absensi.validasi_guru"
                                                        size="xs"
                                                        color="success"
                                                        variant="soft"
                                                        :loading="actionLoading === `absensi:${row.absensi.id_absensi}`"
                                                        @click="validateAbsensi(row.absensi)"
                                                    >
                                                        <Icon name="lucide:badge-check" class="mr-1 h-3 w-3" />
                                                        Validasi
                                                    </UButton>
                                                    <div
                                                        v-if="row.logbook?.status_persetujuan === 'menunggu'"
                                                        class="flex flex-col items-stretch gap-2"
                                                    >
                                                        <UButton
                                                            size="xs"
                                                            color="success"
                                                            variant="soft"
                                                            :loading="actionLoading === `logbook-approve:${row.logbook.id_logbook}`"
                                                            @click="approveLogbook(row.logbook)"
                                                        >
                                                            <Icon name="lucide:check" class="mr-1 h-3 w-3" />
                                                            Setujui
                                                        </UButton>
                                                        <UButton
                                                            size="xs"
                                                            color="warning"
                                                            variant="soft"
                                                            @click="openRevisionModal(row.logbook)"
                                                        >
                                                            <Icon name="lucide:edit-3" class="mr-1 h-3 w-3" />
                                                            Revisi
                                                        </UButton>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <UModal v-model="selfieModalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold text-slate-900">
                                Foto Selfie Absensi
                            </h3>
                            <UButton
                                variant="ghost"
                                color="neutral"
                                size="xs"
                                @click="selfieModalOpen = false"
                            >
                                <Icon name="lucide:x" class="w-4 h-4" />
                            </UButton>
                        </div>
                    </template>

                    <div
                        class="w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-slate-200"
                    >
                        <img
                            v-if="selectedSelfieUrl"
                            :src="selectedSelfieUrl"
                            alt="Selfie siswa"
                            class="w-full aspect-9/16 object-cover"
                        />
                    </div>
                </UCard>
            </template>
        </UModal>

        <UModal v-model="logbookModalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-start justify-between gap-4">
                            <div class="min-w-0">
                                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Detail Logbook
                                </p>
                                <h3 class="mt-1 line-clamp-2 break-words text-base font-bold text-slate-900 [overflow-wrap:anywhere]">
                                    {{ selectedLogbook ? getLogbookTitle(selectedLogbook) : "-" }}
                                </h3>
                            </div>
                            <UButton
                                variant="ghost"
                                color="neutral"
                                size="xs"
                                @click="logbookModalOpen = false"
                            >
                                <Icon name="lucide:x" class="h-4 w-4" />
                            </UButton>
                        </div>
                    </template>

                    <div v-if="selectedLogbook" class="space-y-4">
                        <div class="flex flex-wrap gap-2">
                            <UBadge color="neutral" variant="subtle">
                                <Icon name="lucide:calendar-days" class="mr-1 h-3.5 w-3.5" />
                                {{ formatDate(selectedLogbook.tanggal) }}
                            </UBadge>
                            <UBadge
                                :color="getLogStatusColor(selectedLogbook.status_persetujuan)"
                                variant="subtle"
                            >
                                {{ getLogStatusLabel(selectedLogbook.status_persetujuan) }}
                            </UBadge>
                        </div>

                        <div>
                            <p class="text-sm font-semibold text-slate-900">Isi kegiatan</p>
                            <p class="mt-2 whitespace-pre-line break-words rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
                                {{ getLogbookContent(selectedLogbook) }}
                            </p>
                        </div>

                        <div v-if="selectedLogbook.catatan_pembimbing">
                            <p class="text-sm font-semibold text-slate-900">Catatan pembimbing</p>
                            <p class="mt-2 whitespace-pre-line break-words rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm leading-7 text-amber-800 [overflow-wrap:anywhere]">
                                {{ selectedLogbook.catatan_pembimbing }}
                            </p>
                        </div>
                    </div>
                </UCard>
            </template>
        </UModal>

        <UModal v-model="revisionModalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <h3 class="text-base font-semibold text-slate-900">
                                    Minta Revisi Logbook
                                </h3>
                                <p class="mt-1 text-sm text-slate-500">
                                    Berikan catatan agar siswa tahu bagian yang perlu diperbaiki.
                                </p>
                            </div>
                            <UButton
                                variant="ghost"
                                color="neutral"
                                size="xs"
                                @click="revisionModalOpen = false"
                            >
                                <Icon name="lucide:x" class="h-4 w-4" />
                            </UButton>
                        </div>
                    </template>

                    <div class="space-y-4">
                        <div
                            v-if="revisionTargetLogbook"
                            class="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                            <p class="line-clamp-2 break-words text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">
                                {{ getLogbookTitle(revisionTargetLogbook) }}
                            </p>
                            <p class="mt-1 text-xs text-slate-500">
                                {{ formatDate(revisionTargetLogbook.tanggal) }}
                            </p>
                        </div>
                        <UTextarea
                            v-model="revisionNote"
                            :rows="4"
                            placeholder="Contoh: Lengkapi detail pekerjaan, alat yang digunakan, dan hasil kegiatan hari ini."
                        />
                    </div>

                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton
                                color="neutral"
                                variant="ghost"
                                @click="revisionModalOpen = false"
                            >
                                Batal
                            </UButton>
                            <UButton
                                color="warning"
                                :loading="actionLoading === `logbook-revision:${revisionTargetLogbook?.id_logbook}`"
                                @click="submitLogbookRevision"
                            >
                                Kirim Revisi
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useGuruApi } from "~/composables/api/use-guru";
import { useDataStore } from "~/stores/data-store";

definePageMeta({ layout: "guru" });

const route = useRoute();
const toast = useToast();
const guruApi = useGuruApi();
const dataStore = useDataStore();

const loading = ref(true);
const loadingLogbook = ref(false);
const loadingAbsensi = ref(false);
const error = ref<string | null>(null);
const activeTab = ref("info");
const selfieModalOpen = ref(false);
const selectedSelfieUrl = ref("");
const logbookModalOpen = ref(false);
const selectedLogbook = ref<any>(null);
const riwayatSearch = ref("");
const riwayatStatusFilter = ref("");
const selfieUrls = ref<Record<string, string>>({});
const selfieObjectUrls = new Set<string>();
const actionLoading = ref("");
const revisionModalOpen = ref(false);
const revisionTargetLogbook = ref<any>(null);
const revisionNote = ref("");

// Penempatan data from backend - already includes nested siswa, perusahaan, guru
const penempatan = ref<any>(null);

const logbooks = ref<any[]>([]);
const absensiList = ref<any[]>([]);
const stats = ref({
    kehadiran: 0,
    totalLogbook: 0,
    hariPkl: 0,
    logbookPending: 0,
});

// Get penempatan ID from route params — UUID is passed as-is in the URL
const idPenempatan = computed(() => {
    const param = route.params.id;
    return typeof param === "string" && param ? param : null;
});

const tabItems = computed(() => [
    { key: "info", label: "Informasi" },
    { key: "riwayat", label: "Riwayat Harian", count: riwayatHarian.value.length },
]);

// Computed properties - accessing nested data from penempatan
const siswaInisial = computed(() => {
    const nama = penempatan.value?.siswa?.nama_siswa || "";
    return nama
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
});

const siswaData = computed(() => penempatan.value?.siswa);
const perusahaanData = computed(() => penempatan.value?.perusahaan);
const guruData = computed(() => penempatan.value?.guru);

const loadingRiwayat = computed(
    () => loadingLogbook.value || loadingAbsensi.value,
);

const riwayatHarian = computed(() => {
    const rows = new Map<
        string,
        { dateKey: string; absensi: any | null; logbook: any | null }
    >();

    for (const absensi of absensiList.value) {
        const dateKey = getDateKey(absensi?.tanggal);
        if (!dateKey) continue;

        rows.set(dateKey, {
            dateKey,
            absensi,
            logbook: rows.get(dateKey)?.logbook || null,
        });
    }

    for (const logbook of logbooks.value) {
        const dateKey = getDateKey(logbook?.tanggal);
        if (!dateKey) continue;

        rows.set(dateKey, {
            dateKey,
            absensi: rows.get(dateKey)?.absensi || null,
            logbook,
        });
    }

    return Array.from(rows.values()).sort((a, b) =>
        b.dateKey.localeCompare(a.dateKey),
    );
});

const riwayatSummary = computed(() => ({
    total: riwayatHarian.value.length,
    hadir: riwayatHarian.value.filter(
        (row) => row.absensi?.status_absensi === "hadir",
    ).length,
    logbook: riwayatHarian.value.filter((row) => row.logbook).length,
    perluCek: riwayatHarian.value.filter(
        (row) =>
            !row.absensi ||
            !row.logbook ||
            row.logbook?.status_persetujuan === "menunggu",
    ).length,
}));

const filteredRiwayatHarian = computed(() => {
    const keyword = riwayatSearch.value.trim().toLowerCase();
    const status = riwayatStatusFilter.value;

    return riwayatHarian.value.filter((row) => {
        const text = [
            row.dateKey,
            formatDate(row.dateKey),
            row.absensi?.status_absensi,
            row.absensi?.keterangan,
            getLogbookTitle(row.logbook),
            getLogbookContent(row.logbook),
            row.logbook?.status_persetujuan,
            row.logbook?.catatan_pembimbing,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const completion = getRiwayatCompletion(row).key;
        const matchSearch = !keyword || text.includes(keyword);
        const matchStatus =
            !status ||
            completion === status ||
            row.logbook?.status_persetujuan === status;

        return matchSearch && matchStatus;
    });
});

const statusColor = computed(() => {
    const status = penempatan.value?.status_penempatan;
    if (status === "aktif") return "success";
    if (status === "selesai") return "info";
    return "neutral";
});

const statusLabel = computed(() => {
    const status = penempatan.value?.status_penempatan;
    if (status === "aktif") return "Aktif";
    if (status === "selesai") return "Selesai";
    if (status === "dibatalkan") return "Dibatalkan";
    return "-";
});

const formatPeriode = computed(() => {
    if (!penempatan.value?.tanggal_mulai || !penempatan.value?.tanggal_selesai)
        return "-";
    return `${formatDate(penempatan.value.tanggal_mulai)} - ${formatDate(penempatan.value.tanggal_selesai)}`;
});

async function openSelfie(absensi: { id_absensi: string; foto_absensi?: string }) {
    if (!absensi?.id_absensi) return;
    const cachedUrl = selfieUrls.value[absensi.id_absensi];
    if (cachedUrl) {
        selectedSelfieUrl.value = cachedUrl;
        selfieModalOpen.value = true;
        return;
    }

    try {
        const objectUrl = await loadSelfieObjectUrl(absensi.id_absensi);
        if (!objectUrl) {
            toast.add({
                title: "Selfie tidak tersedia",
                color: "warning",
            });
            return;
        }

        selfieUrls.value = {
            ...selfieUrls.value,
            [absensi.id_absensi]: objectUrl,
        };
        selectedSelfieUrl.value = objectUrl;
        selfieModalOpen.value = true;
    } catch (error: any) {
        toast.add({
            title: "Gagal membuka selfie",
            description: error?.message || "Tidak dapat mengambil foto selfie",
            color: "error",
        });
    }
}

function openLogbookDetail(logbook: any) {
    selectedLogbook.value = logbook;
    logbookModalOpen.value = true;
}

async function validateAbsensi(absensi: any) {
    if (!absensi?.id_absensi) return;

    actionLoading.value = `absensi:${absensi.id_absensi}`;
    try {
        await guruApi.validateAbsensi(absensi.id_absensi);
        toast.add({
            title: "Absensi tervalidasi",
            color: "success",
        });
        await loadAbsensi();
    } catch (error: any) {
        toast.add({
            title: "Gagal validasi absensi",
            description: error?.message || "Absensi tidak berhasil divalidasi",
            color: "error",
        });
    } finally {
        actionLoading.value = "";
    }
}

async function approveLogbook(logbook: any) {
    if (!logbook?.id_logbook) return;

    actionLoading.value = `logbook-approve:${logbook.id_logbook}`;
    try {
        await guruApi.reviewLogbook(logbook.id_logbook, {
            status_persetujuan: "disetujui",
        });
        toast.add({
            title: "Logbook disetujui",
            color: "success",
        });
        await loadLogbook();
    } catch (error: any) {
        toast.add({
            title: "Gagal menyetujui logbook",
            description: error?.message || "Logbook tidak berhasil disetujui",
            color: "error",
        });
    } finally {
        actionLoading.value = "";
    }
}

function openRevisionModal(logbook: any) {
    revisionTargetLogbook.value = logbook;
    revisionNote.value = logbook?.catatan_pembimbing || "";
    revisionModalOpen.value = true;
}

async function submitLogbookRevision() {
    const logbook = revisionTargetLogbook.value;
    if (!logbook?.id_logbook) return;

    const note = revisionNote.value.trim();
    if (!note) {
        toast.add({
            title: "Catatan revisi wajib diisi",
            color: "warning",
        });
        return;
    }

    actionLoading.value = `logbook-revision:${logbook.id_logbook}`;
    try {
        await guruApi.reviewLogbook(logbook.id_logbook, {
            status_persetujuan: "ditolak",
            catatan_pembimbing: note,
        });
        toast.add({
            title: "Revisi logbook dikirim",
            color: "success",
        });
        revisionModalOpen.value = false;
        revisionTargetLogbook.value = null;
        revisionNote.value = "";
        await loadLogbook();
    } catch (error: any) {
        toast.add({
            title: "Gagal mengirim revisi",
            description: error?.message || "Catatan revisi tidak berhasil dikirim",
            color: "error",
        });
    } finally {
        actionLoading.value = "";
    }
}

// Helper functions
function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getDateKey(dateStr?: string | Date) {
    if (!dateStr) return "";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function revokeSelfieObjectUrls() {
    if (!import.meta.client) return;
    for (const url of selfieObjectUrls) {
        URL.revokeObjectURL(url);
    }
    selfieObjectUrls.clear();
}

async function loadSelfieObjectUrl(idAbsensi: string) {
    const token = dataStore.token || useCookie<string | null>("token").value;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`/api/absensi/${idAbsensi}/selfie-file`, {
        cache: "no-store",
        headers,
    });

    if (!response.ok) {
        throw new Error(`Foto selfie gagal dimuat (${response.status})`);
    }

    const objectUrl = URL.createObjectURL(await response.blob());
    selfieObjectUrls.add(objectUrl);
    return objectUrl;
}

async function preloadSelfieUrls() {
    if (!import.meta.client) return;

    revokeSelfieObjectUrls();
    selfieUrls.value = {};

    const absensiWithPhoto = absensiList.value.filter(
        (absensi) => absensi?.id_absensi && absensi?.foto_absensi,
    );

    const results = await Promise.allSettled(
        absensiWithPhoto.map(async (absensi) => {
            const objectUrl = await loadSelfieObjectUrl(absensi.id_absensi);
            return [absensi.id_absensi, objectUrl] as const;
        }),
    );

    const nextUrls: Record<string, string> = {};
    for (const result of results) {
        if (result.status === "fulfilled") {
            nextUrls[result.value[0]] = result.value[1];
        }
    }

    selfieUrls.value = nextUrls;
}

function formatTime(dateStr?: string | Date) {
    if (!dateStr) return "-";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
    });
}

function getLogStatusColor(
    status?: string,
): "success" | "warning" | "error" | "neutral" {
    // Backend uses: menunggu, disetujui, ditolak
    const colors: Record<string, "success" | "warning" | "error" | "neutral"> =
        {
            disetujui: "success",
            menunggu: "warning",
            ditolak: "error",
        };
    return colors[status || ""] || "neutral";
}

function getLogStatusLabel(status?: string) {
    const labels: Record<string, string> = {
        disetujui: "Disetujui",
        menunggu: "Menunggu",
        ditolak: "Ditolak",
    };
    return labels[status || ""] || status || "-";
}

function getLogbookTitle(log: any) {
    return log?.judul_kegiatan || log?.kegiatan || "Tanpa judul";
}

function getLogbookContent(log: any) {
    return log?.isi_kegiatan || log?.deskripsi || log?.keterangan || "-";
}

function getAbsensiColor(
    status?: string,
): "success" | "warning" | "info" | "error" | "neutral" {
    const colors: Record<
        string,
        "success" | "warning" | "info" | "error" | "neutral"
    > = {
        hadir: "success",
        izin: "warning",
        sakit: "info",
        alpha: "error",
    };
    return colors[status || ""] || "neutral";
}

function getAbsensiLabel(status?: string) {
    const labels: Record<string, string> = {
        hadir: "Hadir",
        izin: "Izin",
        sakit: "Sakit",
        alpha: "Alpha",
    };
    return labels[status || ""] || status || "Belum absen";
}

function getAbsensiIcon(status?: string) {
    const icons: Record<string, string> = {
        hadir: "lucide:check-circle",
        izin: "lucide:clock",
        sakit: "lucide:heart-pulse",
        alpha: "lucide:x-circle",
    };
    return icons[status || ""] || "lucide:circle";
}

function getAbsensiIconClass(status?: string) {
    const classes: Record<string, string> = {
        hadir: "bg-green-100 text-green-600",
        izin: "bg-yellow-100 text-yellow-600",
        sakit: "bg-blue-100 text-blue-600",
        alpha: "bg-red-100 text-red-600",
    };
    return classes[status || ""] || "bg-slate-100 text-slate-600";
}

function getRiwayatCompletion(row: {
    absensi: any | null;
    logbook: any | null;
}): { key: string; label: string; color: "success" | "warning" | "error" | "neutral" } {
    if (!row.absensi) {
        return { key: "belum_absen", label: "Belum absen", color: "warning" };
    }

    if (!row.logbook) {
        return {
            key: "belum_logbook",
            label: "Belum logbook",
            color: "warning",
        };
    }

    if (row.logbook.status_persetujuan === "ditolak") {
        return { key: "ditolak", label: "Perlu revisi", color: "error" };
    }

    if (row.logbook.status_persetujuan === "menunggu") {
        return {
            key: "menunggu",
            label: "Menunggu verifikasi",
            color: "warning",
        };
    }

    return { key: "lengkap", label: "Lengkap", color: "success" };
}

// Load data functions
async function loadData() {
    if (!idPenempatan.value) {
        error.value = "ID Penempatan tidak valid";
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        // Load penempatan detail - backend returns nested siswa, perusahaan, guru, absensi, logbook
        const result = await guruApi.getDetailSiswaBimbingan(
            idPenempatan.value,
        );
        penempatan.value = result.data;
        absensiList.value = penempatan.value?.absensi || [];
        logbooks.value = penempatan.value?.logbook || [];

        // Calculate stats from embedded absensi/logbook
        stats.value.kehadiran = 0;
        stats.value.hariPkl = absensiList.value.length;
        stats.value.totalLogbook = logbooks.value.length;
        stats.value.logbookPending = logbooks.value.filter(
            (l: any) => l.status_persetujuan === "menunggu",
        ).length;

        if (absensiList.value.length) {
            const hadirCount = absensiList.value.filter(
                (a: any) => a.status_absensi === "hadir",
            ).length;
            stats.value.kehadiran = Math.round(
                (hadirCount / absensiList.value.length) * 100,
            );
        }
        await preloadSelfieUrls();
    } catch (err: any) {
        console.error("Error loading penempatan:", err);
        error.value = err?.message || "Gagal memuat data siswa";
        toast.add({
            title: "Gagal memuat data",
            description: error.value,
            color: "error",
        });
    } finally {
        loading.value = false;
    }
}

async function loadLogbook() {
    if (!idPenempatan.value) return;

    loadingLogbook.value = true;
    try {
        const result = await guruApi.getLogbookByPenempatan(idPenempatan.value);
        logbooks.value = result.data || [];
        stats.value.totalLogbook =
            result.pagination?.total || logbooks.value.length;
        stats.value.logbookPending = logbooks.value.filter(
            (l: any) => l.status_persetujuan === "menunggu",
        ).length;
    } catch (err) {
        console.error("Error loading logbook:", err);
        // Use embedded data as fallback
        if (penempatan.value?.logbook) {
            logbooks.value = penempatan.value.logbook;
        }
    } finally {
        loadingLogbook.value = false;
    }
}

async function loadAbsensi() {
    if (!idPenempatan.value) return;

    loadingAbsensi.value = true;
    try {
        const result = await guruApi.getAbsensiByPenempatan(idPenempatan.value);
        absensiList.value = result.data || [];

        // Recalculate kehadiran
        if (absensiList.value.length > 0) {
            const hadirCount = absensiList.value.filter(
                (a: any) => a.status_absensi === "hadir",
            ).length;
            stats.value.kehadiran = Math.round(
                (hadirCount / absensiList.value.length) * 100,
            );
            stats.value.hariPkl = absensiList.value.length;
        }
        await preloadSelfieUrls();
    } catch (err) {
        console.error("Error loading absensi:", err);
        // Use embedded data as fallback
        if (penempatan.value?.absensi) {
            absensiList.value = penempatan.value.absensi;
            await preloadSelfieUrls();
        }
    } finally {
        loadingAbsensi.value = false;
    }
}

async function loadRiwayatHarian() {
    await Promise.all([loadLogbook(), loadAbsensi()]);
}

// Watch tab changes to load data lazily
watch(activeTab, async (newTab) => {
    if (
        newTab === "riwayat" &&
        logbooks.value.length === 0 &&
        absensiList.value.length === 0
    ) {
        await loadRiwayatHarian();
    }
});

// Initial load
onMounted(async () => {
    await loadData();
});

onBeforeUnmount(revokeSelfieObjectUrls);

useHead({ title: "Detail Siswa | Guru PKL" });
</script>
