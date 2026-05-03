<template>
  <div class="space-y-6">
    <section class="overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 text-white shadow-sm">
      <div class="grid gap-6 p-6 lg:grid-cols-[minmax(0,2fr)_280px] lg:p-8">
        <div>
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span class="h-2 w-2 rounded-full bg-emerald-300" />
            Dashboard Guru Aktif
          </div>
          <h1 v-if="!loading" class="text-2xl font-bold leading-tight lg:text-3xl">
            Selamat {{ greeting }}, {{ guru.nama }}
          </h1>
          <USkeleton v-else class="mb-2 h-9 w-72" :ui="{ background: 'bg-white/20' }" />
          <p class="mt-2 max-w-2xl text-sm text-sky-100 lg:text-base">
            Pantau siswa bimbingan, cek logbook, dan tindak lanjuti absensi dari satu dashboard yang lebih ringkas.
          </p>
          <p class="mt-4 text-sm text-sky-100">{{ currentDate }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3 self-start">
          <div class="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-sky-100">Total Siswa</p>
            <p class="mt-2 text-2xl font-bold">{{ stats.totalSiswa }}</p>
          </div>
          <div class="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-sky-100">Penempatan Aktif</p>
            <p class="mt-2 text-2xl font-bold">{{ stats.penempatanAktif }}</p>
          </div>
          <div class="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-sky-100">Kunjungan</p>
            <p class="mt-2 text-2xl font-bold">{{ activity.kunjungan }}</p>
          </div>
          <div class="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-sky-100">Logbook Disetujui</p>
            <p class="mt-2 text-2xl font-bold">{{ activity.logbook }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <div class="rounded-xl bg-sky-100 p-2 text-sky-600">
            <Icon name="lucide:users" class="h-5 w-5" />
          </div>
          <span class="text-xs font-medium text-slate-400">Bimbingan</span>
        </div>
        <p class="text-2xl font-bold text-slate-900">{{ stats.totalSiswa }}</p>
        <p class="mt-1 text-sm text-slate-500">Siswa aktif dalam pengawasan</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <div class="rounded-xl bg-emerald-100 p-2 text-emerald-600">
            <Icon name="lucide:activity" class="h-5 w-5" />
          </div>
          <UBadge color="success" variant="subtle" size="xs">{{ stats.kehadiran }}%</UBadge>
        </div>
        <p class="text-2xl font-bold text-slate-900">{{ stats.kehadiran }}%</p>
        <p class="mt-1 text-sm text-slate-500">Rata-rata kehadiran siswa</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <div class="rounded-xl bg-amber-100 p-2 text-amber-600">
            <Icon name="lucide:book-open-check" class="h-5 w-5" />
          </div>
          <span class="text-xs font-medium text-slate-400">Perlu cek</span>
        </div>
        <p class="text-2xl font-bold text-slate-900">{{ stats.logbookPending }}</p>
        <p class="mt-1 text-sm text-slate-500">Logbook menunggu verifikasi</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <div class="rounded-xl bg-rose-100 p-2 text-rose-600">
            <Icon name="lucide:triangle-alert" class="h-5 w-5" />
          </div>
          <span class="text-xs font-medium text-slate-400">Hari ini</span>
        </div>
        <p class="text-2xl font-bold text-slate-900">{{ absensiPending }}</p>
        <p class="mt-1 text-sm text-slate-500">Siswa belum absen hari ini</p>
      </article>
    </section>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-4">
            <h2 class="font-semibold text-slate-900">Akses Cepat</h2>
            <p class="text-sm text-slate-500">Menu utama yang masih dipakai di workflow terbaru.</p>
          </div>
          <div class="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="group rounded-2xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="rounded-xl p-3" :class="action.iconClass">
                  <Icon :name="action.icon" class="h-5 w-5" />
                </div>
                <Icon name="lucide:arrow-up-right" class="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
              </div>
              <h3 class="mt-4 font-semibold text-slate-900">{{ action.label }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ action.description }}</p>
            </NuxtLink>
          </div>
        </section>

        <section class="grid gap-6 lg:grid-cols-2">
          <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="font-semibold text-slate-900">Kehadiran Mingguan</h2>
                <p class="text-sm text-slate-500">Distribusi absensi siswa yang sedang dibimbing.</p>
              </div>
            </div>
            <div v-if="loading">
              <USkeleton class="h-64 rounded-xl" />
            </div>
            <ClientOnly v-else>
              <apexchart type="bar" height="250" :options="attendanceChartOptions" :series="attendanceChartSeries" />
            </ClientOnly>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="font-semibold text-slate-900">Status Logbook</h2>
                <p class="text-sm text-slate-500">Ringkasan logbook yang sudah diproses dan yang masih menunggu.</p>
              </div>
            </div>
            <div v-if="loading">
              <USkeleton class="h-64 rounded-xl" />
            </div>
            <ClientOnly v-else>
              <apexchart type="donut" height="250" :options="logbookChartOptions" :series="logbookChartSeries" />
            </ClientOnly>
          </article>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 class="font-semibold text-slate-900">Siswa Bimbingan</h2>
              <p class="text-sm text-slate-500">Daftar siswa yang perlu dipantau pada batch aktif.</p>
            </div>
            <UButton to="/guru/siswa-bimbingan" variant="ghost" color="primary" size="sm" trailing-icon="i-lucide-arrow-right">
              Lihat Semua
            </UButton>
          </div>

          <div v-if="loading" class="space-y-3 p-4">
            <div v-for="item in 5" :key="item" class="flex items-center gap-4 rounded-xl px-2 py-3">
              <USkeleton class="h-10 w-10 rounded-xl" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-28" />
              </div>
              <USkeleton class="h-6 w-20 rounded-full" />
            </div>
          </div>

          <div v-else-if="students.length" class="divide-y divide-slate-100">
            <button
              v-for="siswa in students"
              :key="siswa.id"
              type="button"
              class="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              @click="navigateTo(`/guru/siswa-bimbingan/${siswa.id}`)"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold"
                :class="siswa.status === 'Aktif' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ siswa.inisial }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-slate-900">{{ siswa.nama }}</p>
                <p class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.industri }}</p>
              </div>
              <div class="hidden items-center gap-2 sm:flex">
                <div class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full"
                    :class="siswa.kehadiran >= 80 ? 'bg-emerald-500' : 'bg-rose-500'"
                    :style="{ width: `${siswa.kehadiran}%` }"
                  />
                </div>
                <span
                  class="text-xs font-medium"
                  :class="siswa.kehadiran >= 80 ? 'text-emerald-600' : 'text-rose-600'"
                >
                  {{ siswa.kehadiran }}%
                </span>
              </div>
              <UBadge :color="siswa.status === 'Aktif' ? 'success' : 'neutral'" variant="subtle" size="xs">
                {{ siswa.status }}
              </UBadge>
            </button>
          </div>

          <div v-else class="px-6 py-12 text-center">
            <Icon name="lucide:users" class="mx-auto h-10 w-10 text-slate-300" />
            <p class="mt-3 text-sm text-slate-500">Belum ada siswa bimbingan yang dapat ditampilkan.</p>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4">
            <h2 class="font-semibold text-slate-900">Fokus Hari Ini</h2>
            <p class="text-sm text-slate-500">Ringkasan kerja yang paling perlu ditindaklanjuti.</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <div class="rounded-xl bg-amber-100 p-2 text-amber-600">
                <Icon name="lucide:book-open-check" class="h-4 w-4" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ stats.logbookPending }} logbook belum diverifikasi</p>
                <p class="text-xs text-slate-500">Prioritaskan approval dan revisi logbook siswa aktif.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <div class="rounded-xl bg-rose-100 p-2 text-rose-600">
                <Icon name="lucide:calendar-check-2" class="h-4 w-4" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ absensiPending }} siswa belum absen hari ini</p>
                <p class="text-xs text-slate-500">Pantau absensi sebelum hari kerja berakhir.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
              <div class="rounded-xl bg-sky-100 p-2 text-sky-600">
                <Icon name="lucide:activity" class="h-4 w-4" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ lowAttendanceCount }} siswa dengan kehadiran di bawah 80%</p>
                <p class="text-xs text-slate-500">Gunakan data ini untuk prioritas pembinaan dan kunjungan.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4">
            <h2 class="font-semibold text-slate-900">Ringkasan Monitoring</h2>
            <p class="text-sm text-slate-500">Progress pembimbingan dari data penempatan saat ini.</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <span class="h-2 w-2 rounded-full bg-sky-500" />
                Kunjungan tercatat
              </div>
              <span class="font-semibold text-slate-900">{{ activity.kunjungan }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                Logbook disetujui
              </div>
              <span class="font-semibold text-slate-900">{{ activity.logbook }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <span class="h-2 w-2 rounded-full bg-indigo-500" />
                Siswa selesai PKL
              </div>
              <span class="font-semibold text-slate-900">{{ activity.selesai }}</span>
            </div>
          </div>
        </section>

        <section class="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
          <div class="flex items-center gap-2">
            <Icon name="lucide:calendar-range" class="h-5 w-5 text-cyan-300" />
            <h2 class="font-semibold">Jadwal Kunjungan</h2>
          </div>
          <div class="mt-4" v-if="nextVisit">
            <p class="text-sm text-slate-300">Agenda terdekat</p>
            <p class="mt-1 text-lg font-semibold">{{ nextVisit.industri }}</p>
            <p class="mt-1 text-sm text-slate-300">{{ nextVisit.tanggal }}</p>
          </div>
          <div v-else class="mt-4 text-sm text-slate-300">
            Belum ada jadwal kunjungan yang tercatat.
          </div>
          <UButton to="/guru/kunjungan/create" color="white" variant="soft" size="sm" class="mt-5 w-full justify-center">
            <Icon name="lucide:plus" class="mr-1 h-4 w-4" />
            Tambah Jadwal Kunjungan
          </UButton>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from "~/composables/api/use-guru";

definePageMeta({ layout: "guru" });

type DashboardStudent = {
  id: string;
  nama: string;
  inisial: string;
  kelas: string;
  industri: string;
  kehadiran: number;
  status: "Aktif" | "Selesai";
};

type QuickAction = {
  to: string;
  icon: string;
  label: string;
  description: string;
  iconClass: string;
};

const { getSiswaBimbingan } = useGuruApi();

const loading = ref(true);
const guru = reactive({ nama: "", inisial: "" });
const stats = reactive({
  totalSiswa: 0,
  kehadiran: 0,
  logbookPending: 0,
  penempatanAktif: 0,
});
const activity = reactive({
  kunjungan: 0,
  logbook: 0,
  selesai: 0,
});
const students = ref<DashboardStudent[]>([]);
const nextVisit = ref<{ industri: string; tanggal: string } | null>(null);
const absensiPending = ref(0);
const lowAttendanceCount = ref(0);
const allPenempatan = ref<any[]>([]);

const authUser = useCookie("auth_user");

const quickActions: QuickAction[] = [
  {
    to: "/guru/siswa-bimbingan",
    icon: "lucide:users",
    label: "Siswa Bimbingan",
    description: "Lihat daftar siswa dan detail bimbingan per penempatan.",
    iconClass: "bg-sky-100 text-sky-600",
  },
  {
    to: "/guru/penempatan",
    icon: "lucide:building-2",
    label: "Penempatan",
    description: "Cek industri, mentor, dan distribusi siswa per lokasi PKL.",
    iconClass: "bg-indigo-100 text-indigo-600",
  },
  {
    to: "/guru/kunjungan",
    icon: "lucide:map-pinned",
    label: "Monitoring Kunjungan",
    description: "Pantau histori monitoring dan kunjungan lapangan.",
    iconClass: "bg-cyan-100 text-cyan-600",
  },
  {
    to: "/guru/kunjungan/create",
    icon: "lucide:plus-circle",
    label: "Tambah Kunjungan",
    description: "Buat agenda kunjungan baru untuk siswa atau mitra aktif.",
    iconClass: "bg-rose-100 text-rose-600",
  },
  {
    to: "/guru/siswa-bimbingan",
    icon: "lucide:clipboard-check",
    label: "Verifikasi Harian",
    description: "Validasi absensi dan verifikasi logbook dari detail siswa bimbingan.",
    iconClass: "bg-emerald-100 text-emerald-600",
  },
];

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Pagi";
  if (hour < 15) return "Siang";
  if (hour < 18) return "Sore";
  return "Malam";
});

const currentDate = computed(() =>
  new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
);

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function readAuthUserCookie() {
  const cookieValue = authUser.value;

  if (!cookieValue) {
    return null;
  }

  if (typeof cookieValue !== "string") {
    return cookieValue;
  }

  try {
    return JSON.parse(cookieValue);
  } catch (error) {
    console.warn("Ignoring invalid auth_user cookie payload:", error);
    return null;
  }
}

const attendanceChartOptions = {
  chart: { type: "bar" as const, toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 6, columnWidth: "58%" } },
  colors: ["#0ea5e9", "#f97316"],
  xaxis: { categories: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] },
  yaxis: { labels: { formatter: (value: number) => Math.round(value).toString() } },
  legend: { position: "top" as const },
  dataLabels: { enabled: false },
  grid: { borderColor: "#e2e8f0" },
};

const attendanceChartSeries = ref([
  { name: "Hadir", data: [0, 0, 0, 0, 0, 0] },
  { name: "Tidak Hadir", data: [0, 0, 0, 0, 0, 0] },
]);

const logbookChartOptions = {
  chart: { type: "donut" as const },
  labels: ["Disetujui", "Menunggu", "Ditolak"],
  colors: ["#22c55e", "#f59e0b", "#ef4444"],
  legend: { position: "bottom" as const },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: { show: true, label: "Total", fontSize: "14px" },
        },
      },
    },
  },
};

const logbookChartSeries = ref([0, 0, 0]);

function computeWeeklyAttendance(penempatanList: any[]) {
  const hadirPerDay = [0, 0, 0, 0, 0, 0];
  const tidakHadirPerDay = [0, 0, 0, 0, 0, 0];

  for (const penempatan of penempatanList) {
    for (const absensi of penempatan.absensi || []) {
      const date = new Date(absensi.tanggal);
      const dayOfWeek = date.getDay() - 1;
      if (dayOfWeek < 0 || dayOfWeek > 5) {
        continue;
      }

      if (absensi.status_absensi === "hadir") {
        hadirPerDay[dayOfWeek]++;
      } else {
        tidakHadirPerDay[dayOfWeek]++;
      }
    }
  }

  return { hadirPerDay, tidakHadirPerDay };
}

async function fetchDashboardData() {
  try {
    const user = readAuthUserCookie();

    if (user) {
      guru.nama = user.nama || user.identifier || "Guru";
      guru.inisial = getInitials(guru.nama);
    }

    const response = await getSiswaBimbingan({ limit: 100 });
    allPenempatan.value = response?.data || [];

    students.value = allPenempatan.value.slice(0, 8).map((penempatan: any) => ({
      id: penempatan.id_penempatan,
      nama: penempatan.siswa?.nama_siswa || "Unknown",
      inisial: getInitials(penempatan.siswa?.nama_siswa || "U"),
      kelas: penempatan.siswa?.kelas?.nama_kelas || "-",
      industri: penempatan.perusahaan?.nama_perusahaan || "-",
      kehadiran: penempatan.stats?.kehadiran ?? 0,
      status: penempatan.status_penempatan === "aktif" ? "Aktif" : "Selesai",
    }));

    stats.totalSiswa = allPenempatan.value.length;
    stats.penempatanAktif = allPenempatan.value.filter((item: any) => item.status_penempatan === "aktif").length;

    const kehadiranValues = allPenempatan.value
      .map((item: any) => item.stats?.kehadiran ?? 0)
      .filter((value: number) => value > 0);

    stats.kehadiran =
      kehadiranValues.length > 0
        ? Math.round(kehadiranValues.reduce((total: number, value: number) => total + value, 0) / kehadiranValues.length)
        : 0;

    let logbookDisetujui = 0;
    let logbookMenunggu = 0;
    let logbookDitolak = 0;

    for (const penempatan of allPenempatan.value) {
      for (const logbook of penempatan.logbook || []) {
        if (logbook.status_persetujuan === "disetujui") {
          logbookDisetujui++;
        } else if (logbook.status_persetujuan === "menunggu") {
          logbookMenunggu++;
        } else if (logbook.status_persetujuan === "ditolak") {
          logbookDitolak++;
        }
      }
    }

    stats.logbookPending = logbookMenunggu;
    logbookChartSeries.value = [logbookDisetujui, logbookMenunggu, logbookDitolak];

    const today = new Date().toISOString().split("T")[0];
    absensiPending.value = allPenempatan.value.reduce((total: number, penempatan: any) => {
      if (penempatan.status_penempatan !== "aktif") {
        return total;
      }

      const hasAbsensiToday = (penempatan.absensi || []).some((absensi: any) => {
        const tanggal = new Date(absensi.tanggal).toISOString().split("T")[0];
        return tanggal === today;
      });

      return hasAbsensiToday ? total : total + 1;
    }, 0);

    const { hadirPerDay, tidakHadirPerDay } = computeWeeklyAttendance(allPenempatan.value);
    attendanceChartSeries.value = [
      { name: "Hadir", data: hadirPerDay },
      { name: "Tidak Hadir", data: tidakHadirPerDay },
    ];

    activity.logbook = logbookDisetujui;
    activity.kunjungan = allPenempatan.value.reduce(
      (total: number, penempatan: any) => total + (penempatan.monitoring?.length || 0),
      0,
    );
    activity.selesai = allPenempatan.value.filter((item: any) => item.status_penempatan === "selesai").length;

    lowAttendanceCount.value = allPenempatan.value.filter(
      (item: any) => (item.stats?.kehadiran ?? 0) < 80 && item.status_penempatan === "aktif",
    ).length;

    const allMonitoring = allPenempatan.value.flatMap((penempatan: any) =>
      (penempatan.monitoring || []).map((monitoring: any) => ({
        ...monitoring,
        perusahaan: penempatan.perusahaan?.nama_perusahaan || "-",
      })),
    );

    allMonitoring.sort(
      (left: any, right: any) =>
        new Date(right.tanggal_monitoring).getTime() - new Date(left.tanggal_monitoring).getTime(),
    );

    if (allMonitoring.length > 0) {
      const latestMonitoring = allMonitoring[0];
      nextVisit.value = {
        industri: latestMonitoring.perusahaan,
        tanggal: new Date(latestMonitoring.tanggal_monitoring).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };
    } else {
      nextVisit.value = null;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    loading.value = false;
  }
}

await useAsyncData(
  "guru-dashboard",
  async () => {
    await fetchDashboardData();
    return true;
  },
  {
    server: false,
  },
);

useHead({ title: "Dashboard | Guru PKL" });
</script>
