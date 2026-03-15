<template>
    <div v-if="statistics" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
            v-for="(stat, key) in displayedStats"
            :key="key"
            class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
            :class="stat.highlight ? 'border-red-200 bg-red-50/40' : ''"
        >
            <div class="flex items-center justify-between mb-4">
                <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="stat.bgColor"
                >
                    <Icon :name="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
                </div>
                <span
                    v-if="stat.badge"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="stat.badgeClass"
                >
                    {{ stat.badge }}
                </span>
            </div>
            <p
                class="text-3xl font-extrabold tracking-tight"
                :class="stat.highlight ? 'text-red-700' : 'text-slate-900'"
            >
                {{ stat.value }}
            </p>
            <p class="text-sm text-slate-500 mt-1 leading-tight">{{ stat.label }}</p>

            <!-- Optional progress bar -->
            <div v-if="stat.progress !== undefined" class="mt-3">
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        class="h-full rounded-full transition-all"
                        :class="stat.progressColor || 'bg-sky-500'"
                        :style="{ width: `${Math.min(stat.progress, 100)}%` }"
                    ></div>
                </div>
                <p class="text-xs text-slate-400 mt-1">{{ stat.progressLabel }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    statistics: any;
    reportType: string;
}

const props = defineProps<Props>();

const displayedStats = computed(() => {
    if (!props.statistics) return {};

    switch (props.reportType) {
        case "placement":
            return {
                total: {
                    label: "Total Penempatan",
                    value: props.statistics.total_placements || 0,
                    icon: "lucide:users",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                active: {
                    label: "Aktif Berjalan",
                    value: props.statistics.active_placements || 0,
                    icon: "lucide:check-circle",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                    badge: "Berjalan",
                    badgeClass: "text-emerald-700 bg-emerald-100",
                },
                completed: {
                    label: "Selesai",
                    value: props.statistics.completed_placements || 0,
                    icon: "lucide:check-check",
                    bgColor: "bg-blue-50",
                    iconColor: "text-blue-600",
                },
                cancelled: {
                    label: "Dibatalkan",
                    value: props.statistics.cancelled_placements || 0,
                    icon: "lucide:x-circle",
                    bgColor: "bg-red-50",
                    iconColor: "text-red-600",
                    highlight: (props.statistics.cancelled_placements || 0) > 0,
                },
            };

        case "attendance":
            return {
                total: {
                    label: "Total Siswa",
                    value: props.statistics.total_students || 0,
                    icon: "lucide:users",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                avgRate: {
                    label: "Rata-rata Kehadiran",
                    value: `${props.statistics.average_attendance_rate?.toFixed(1) || 0}%`,
                    icon: "lucide:trending-up",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                    progress: props.statistics.average_attendance_rate || 0,
                    progressColor: (props.statistics.average_attendance_rate || 0) >= 80 ? "bg-emerald-500" : "bg-amber-400",
                    progressLabel: `${(props.statistics.average_attendance_rate || 0).toFixed(1)}% dari 100%`,
                },
                lowAttendance: {
                    label: "Kehadiran Rendah",
                    value: props.statistics.students_with_low_attendance || 0,
                    icon: "lucide:alert-triangle",
                    bgColor: "bg-amber-50",
                    iconColor: "text-amber-600",
                    badge: "< 80%",
                    badgeClass: "text-amber-700 bg-amber-100",
                    highlight: (props.statistics.students_with_low_attendance || 0) > 0,
                },
                present: {
                    label: "Total Hari Hadir",
                    value: props.statistics.total_present || 0,
                    icon: "lucide:calendar-check",
                    bgColor: "bg-blue-50",
                    iconColor: "text-blue-600",
                },
            };

        case "assessment":
            return {
                total: {
                    label: "Total Penilaian",
                    value: props.statistics.total_assessments || 0,
                    icon: "lucide:award",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                avgGrade: {
                    label: "Rata-rata Nilai Akhir",
                    value: props.statistics.average_final_grade?.toFixed(1) || 0,
                    icon: "lucide:trending-up",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                    progress: props.statistics.average_final_grade || 0,
                    progressColor: (props.statistics.average_final_grade || 0) >= 75 ? "bg-emerald-500" : "bg-amber-400",
                    progressLabel: `Dari skala 100`,
                },
                excellent: {
                    label: "Nilai A (90–100)",
                    value: props.statistics.grade_distribution?.range_90_100 || 0,
                    icon: "lucide:star",
                    bgColor: "bg-yellow-50",
                    iconColor: "text-yellow-500",
                    badge: "Terbaik",
                    badgeClass: "text-yellow-700 bg-yellow-100",
                },
                good: {
                    label: "Nilai B (80–89)",
                    value: props.statistics.grade_distribution?.range_80_89 || 0,
                    icon: "lucide:thumbs-up",
                    bgColor: "bg-blue-50",
                    iconColor: "text-blue-600",
                },
            };

        case "company":
            return {
                total: {
                    label: "Total Perusahaan",
                    value: props.statistics.total_companies || 0,
                    icon: "lucide:building-2",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                active: {
                    label: "Kerjasama Aktif",
                    value: props.statistics.active_partnerships || 0,
                    icon: "lucide:handshake",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                    badge: "Aktif",
                    badgeClass: "text-emerald-700 bg-emerald-100",
                },
                capacity: {
                    label: "Total Kapasitas",
                    value: props.statistics.total_capacity || 0,
                    icon: "lucide:users",
                    bgColor: "bg-violet-50",
                    iconColor: "text-violet-600",
                    progress: ((props.statistics.utilized_capacity || 0) / (props.statistics.total_capacity || 1)) * 100,
                    progressColor: "bg-violet-500",
                    progressLabel: `${props.statistics.utilized_capacity || 0} slot terisi`,
                },
                overCapacity: {
                    label: "Over Kapasitas",
                    value: props.statistics.over_capacity_companies || 0,
                    icon: "lucide:alert-triangle",
                    bgColor: (props.statistics.over_capacity_companies || 0) > 0 ? "bg-red-50" : "bg-orange-50",
                    iconColor: (props.statistics.over_capacity_companies || 0) > 0 ? "text-red-600" : "text-orange-500",
                    badge: (props.statistics.over_capacity_companies || 0) > 0 ? "Perhatian" : undefined,
                    badgeClass: "text-red-700 bg-red-100",
                    highlight: (props.statistics.over_capacity_companies || 0) > 0,
                },
            };

        case "monitoring":
            return {
                total: {
                    label: "Total Kunjungan",
                    value: props.statistics.total_visits || 0,
                    icon: "lucide:eye",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                withIssues: {
                    label: "Ada Kendala",
                    value: props.statistics.visits_with_issues || 0,
                    icon: "lucide:alert-circle",
                    bgColor: "bg-red-50",
                    iconColor: "text-red-600",
                    highlight: (props.statistics.visits_with_issues || 0) > 0,
                },
                unmonitored: {
                    label: "Belum Dikunjungi",
                    value: props.statistics.unmonitored_placements || 0,
                    icon: "lucide:alert-triangle",
                    bgColor: "bg-amber-50",
                    iconColor: "text-amber-600",
                    badge: "Perlu Perhatian",
                    badgeClass: "text-amber-700 bg-amber-100",
                },
                teachers: {
                    label: "Guru Aktif",
                    value: props.statistics.visits_by_teacher?.length || 0,
                    icon: "lucide:user-check",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                },
            };

        case "application":
            return {
                total: {
                    label: "Total Pengajuan",
                    value: props.statistics.total_applications || 0,
                    icon: "lucide:file-text",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                pending: {
                    label: "Menunggu",
                    value: props.statistics.pending_applications || 0,
                    icon: "lucide:clock",
                    bgColor: "bg-amber-50",
                    iconColor: "text-amber-600",
                    badge: "Pending",
                    badgeClass: "text-amber-700 bg-amber-100",
                },
                approved: {
                    label: "Disetujui",
                    value: props.statistics.approved_applications || 0,
                    icon: "lucide:check-circle",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                },
                approvalRate: {
                    label: "Tingkat Persetujuan",
                    value: `${props.statistics.approval_rate?.toFixed(1) || 0}%`,
                    icon: "lucide:trending-up",
                    bgColor: "bg-blue-50",
                    iconColor: "text-blue-600",
                    progress: props.statistics.approval_rate || 0,
                    progressColor: "bg-blue-500",
                    progressLabel: "Dari total pengajuan",
                },
            };

        case "logbook":
            return {
                total: {
                    label: "Total Entri",
                    value: props.statistics.total_entries || 0,
                    icon: "lucide:book-open",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                pending: {
                    label: "Menunggu Persetujuan",
                    value: props.statistics.pending_approvals || 0,
                    icon: "lucide:clock",
                    bgColor: "bg-amber-50",
                    iconColor: "text-amber-600",
                    badge: "Pending",
                    badgeClass: "text-amber-700 bg-amber-100",
                },
                approved: {
                    label: "Disetujui",
                    value: props.statistics.approved_entries || 0,
                    icon: "lucide:check-circle",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                },
                avgPerWeek: {
                    label: "Rata-rata per Minggu",
                    value: props.statistics.average_entries_per_week?.toFixed(1) || 0,
                    icon: "lucide:calendar",
                    bgColor: "bg-blue-50",
                    iconColor: "text-blue-600",
                },
            };

        case "teacher":
            return {
                total: {
                    label: "Total Guru",
                    value: props.statistics.total_teachers || 0,
                    icon: "lucide:user-check",
                    bgColor: "bg-sky-50",
                    iconColor: "text-sky-600",
                },
                avgStudents: {
                    label: "Rata-rata Siswa/Guru",
                    value: props.statistics.average_students_per_teacher?.toFixed(1) || 0,
                    icon: "lucide:users",
                    bgColor: "bg-blue-50",
                    iconColor: "text-blue-600",
                },
                totalVisits: {
                    label: "Total Kunjungan",
                    value: props.statistics.total_monitoring_visits || 0,
                    icon: "lucide:eye",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                },
                avgVisits: {
                    label: "Rata-rata Kunjungan/Guru",
                    value: props.statistics.average_visits_per_teacher?.toFixed(1) || 0,
                    icon: "lucide:trending-up",
                    bgColor: "bg-violet-50",
                    iconColor: "text-violet-600",
                },
            };

        default:
            return {};
    }
});
</script>
