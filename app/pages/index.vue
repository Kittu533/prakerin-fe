<template>
    <div
        class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden"
    >
        <!-- Subtle Background Pattern -->
        <div
            class="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        >
            <svg
                class="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
            >
                <defs>
                    <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        <!-- Main Content -->
        <div
            class="flex flex-col items-center relative z-10 transition-all duration-1000 transform"
        >
            <!-- Logo Container -->
            <div class="relative mb-10">
                <div
                    class="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20 relative z-10 border border-slate-100 dark:border-slate-700"
                >
                    <img
                        src="~/assets/img/logo-skanda.png"
                        alt="Logo SKANDA"
                        class="w-20 h-20 object-contain p-1"
                    />
                </div>

                <!-- Animated Rings -->
                <div
                    class="absolute inset-0 -m-6 border border-blue-100 dark:border-blue-900/30 rounded-[3rem] animate-[spin_15s_linear_infinite]"
                ></div>
                <div
                    class="absolute inset-0 -m-6 border-t-2 border-transparent border-t-blue-500 rounded-[3rem] animate-[spin_4s_cubic-bezier(0.5,0.1,0.4,0.9)_infinite]"
                ></div>
            </div>

            <!-- App Identity -->
            <div class="text-center mb-16">
                <h1
                    class="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-2"
                >
                    SIM <span class="text-blue-600">Prakerin</span>
                </h1>
                <div class="flex items-center justify-center space-x-2">
                    <span
                        class="h-px w-6 bg-slate-300 dark:bg-slate-600"
                    ></span>
                    <p
                        class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]"
                    >
                        SMK Negeri 2 Wonogiri
                    </p>
                    <span
                        class="h-px w-6 bg-slate-300 dark:bg-slate-600"
                    ></span>
                </div>
            </div>

            <!-- Loading State -->
            <div class="flex flex-col items-center">
                <div class="flex space-x-3 mb-6">
                    <div
                        class="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"
                    ></div>
                    <div
                        class="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"
                    ></div>
                    <div
                        class="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"
                    ></div>
                </div>
                <div
                    class="px-6 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <span
                        class="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase animate-pulse"
                    >
                        Menyelaraskan Sesi...
                    </span>
                </div>
            </div>
        </div>
        <!-- Footer -->
        <div class="absolute bottom-6 text-center z-10">
            <p
                class="text-[10px] text-slate-400 dark:text-slate-600 font-medium"
            >
                &copy; 2025 SIM Prakerin Team. All rights reserved.
            </p>
        </div>
    </div>
</template>

<script setup>
import { useAuth } from "~/composables/auth/use-auth";

const { checkAuth, getDashboardRoute } = useAuth();
const isDev = process.dev;

// Redirect logic
onMounted(() => {
    const isAuthenticated = checkAuth();

    // Artificial delay for smooth transition if everything is fast
    setTimeout(() => {
        if (isAuthenticated) {
            navigateTo(getDashboardRoute());
        } else {
            navigateTo("/login");
        }
    }, 1000);
});

useHead({
    title: "SIM Prakerin - SMK Negeri 2 Wonogiri",
    meta: [
        {
            name: "description",
            content:
                "Sistem Informasi Manajemen Praktik Kerja Industri - SMK Negeri 2 Wonogiri",
        },
    ],
});
</script>

<style scoped>
/* Custom animations if needed beyond Tailwind */
@keyframes spin-slow {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
