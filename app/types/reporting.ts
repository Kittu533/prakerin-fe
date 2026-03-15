/**
 * Reporting Types
 * Type definitions for admin reporting feature
 */

// Report Types
export type ReportType =
    | "placement"
    | "attendance"
    | "logbook"
    | "assessment"
    | "monitoring"
    | "application"
    | "company"
    | "teacher";

export type ExportFormat = "pdf" | "excel";

// Filter Types
export interface ReportFilters {
    tahun_ajaran_id: string | null;
    id_periode_pkl: string | null;
    id_jurusan: string | null;
    id_perusahaan: string | null;
    status: string | null;
    tanggal_mulai: string | null;
    tanggal_selesai: string | null;
}

// Pagination Types
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Column Types
export interface ReportColumn {
    accessorKey: string;
    header: string;
}

// Statistics Types
export interface PlacementStatistics {
    total_placements: number;
    active_placements: number;
    completed_placements: number;
    cancelled_placements: number;
    placements_by_company: Array<{ company: string; count: number }>;
    placements_by_major: Array<{ major: string; count: number }>;
}

export interface AttendanceStatistics {
    total_students: number;
    average_attendance_rate: number;
    students_with_low_attendance: number;
    total_present: number;
    total_absent: number;
    total_leave: number;
    total_sick: number;
}

export interface LogbookStatistics {
    total_entries: number;
    pending_approvals: number;
    approved_entries: number;
    rejected_entries: number;
    average_entries_per_week: number;
}

export interface AssessmentStatistics {
    total_assessments: number;
    average_final_grade: number;
    average_by_major: Array<{ major: string; average: number }>;
    average_by_company: Array<{ company: string; average: number }>;
    grade_distribution: {
        range_90_100: number;
        range_80_89: number;
        range_70_79: number;
        range_60_69: number;
        below_60: number;
    };
}

export interface MonitoringStatistics {
    total_visits: number;
    visits_by_teacher: Array<{ teacher: string; count: number }>;
    visits_by_company: Array<{ company: string; count: number }>;
    visits_with_issues: number;
    unmonitored_placements: number;
}

export interface ApplicationStatistics {
    total_applications: number;
    pending_applications: number;
    approved_applications: number;
    rejected_applications: number;
    approval_rate: number;
    applications_by_company: Array<{ company: string; count: number }>;
    applications_by_month: Array<{ month: string; count: number }>;
}

export interface CompanyStatistics {
    total_companies: number;
    active_partnerships: number;
    total_capacity: number;
    utilized_capacity: number;
    average_placements_per_company: number;
    over_capacity_companies: number;
}

export interface TeacherStatistics {
    total_teachers: number;
    average_students_per_teacher: number;
    total_monitoring_visits: number;
    average_visits_per_teacher: number;
}

// Union type for all statistics
export type ReportStatistics =
    | PlacementStatistics
    | AttendanceStatistics
    | LogbookStatistics
    | AssessmentStatistics
    | MonitoringStatistics
    | ApplicationStatistics
    | CompanyStatistics
    | TeacherStatistics;

// API Response Types
export interface ReportResponse<T = any, S = ReportStatistics> {
    success: boolean;
    message?: string;
    data: T[];
    statistics: S;
    pagination: PaginationMeta;
}

// Report Type Config
export interface ReportTypeConfig {
    value: ReportType;
    label: string;
    description: string;
    icon: string;
}

// Filter Option Types
export interface FilterOption {
    label: string;
    value: string;
}

// Stat Card Types
export interface StatCard {
    label: string;
    value: number | string;
    icon: string;
    bgColor: string;
    iconColor: string;
    badge?: string;
    badgeColor?: "success" | "warning" | "error" | "primary" | "neutral";
}

// Export Types
export interface ExportParams extends Partial<ReportFilters> {
    format: ExportFormat;
}
