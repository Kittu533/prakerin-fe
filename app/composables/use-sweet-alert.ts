import Swal from 'sweetalert2';

export interface SweetAlertOptions {
    title?: string;
    text?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    timer?: number;
    timerProgressBar?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
}

export function useSweetAlert() {
    
    function showAlert(options: SweetAlertOptions) {
        return Swal.fire({
            title: options.title,
            text: options.text,
            icon: options.icon,
            confirmButtonText: options.confirmButtonText || 'OK',
            cancelButtonText: options.cancelButtonText || 'Batal',
            showCancelButton: options.showCancelButton || false,
            confirmButtonColor: options.confirmButtonColor || '#3085d6',
            cancelButtonColor: options.cancelButtonColor || '#d33',
            timer: options.timer,
            timerProgressBar: options.timerProgressBar || false,
            allowOutsideClick: options.allowOutsideClick ?? true,
            allowEscapeKey: options.allowEscapeKey ?? true,
            customClass: {
                popup: 'rounded-lg',
                title: 'text-lg font-semibold',
                content: 'text-sm',
                confirmButton: 'px-4 py-2 rounded-lg font-medium',
                cancelButton: 'px-4 py-2 rounded-lg font-medium'
            }
        });
    }

    function showSuccess(title: string, text?: string, options?: Partial<SweetAlertOptions>) {
        return showAlert({
            title,
            text,
            icon: 'success',
            confirmButtonColor: '#10b981',
            timer: 3000,
            timerProgressBar: true,
            ...options
        });
    }

    function showError(title: string, text?: string, options?: Partial<SweetAlertOptions>) {
        return showAlert({
            title,
            text,
            icon: 'error',
            confirmButtonColor: '#ef4444',
            ...options
        });
    }

    function showWarning(title: string, text?: string, options?: Partial<SweetAlertOptions>) {
        return showAlert({
            title,
            text,
            icon: 'warning',
            confirmButtonColor: '#f59e0b',
            ...options
        });
    }

    function showInfo(title: string, text?: string, options?: Partial<SweetAlertOptions>) {
        return showAlert({
            title,
            text,
            icon: 'info',
            confirmButtonColor: '#3b82f6',
            ...options
        });
    }

    function showConfirmation(
        title: string, 
        text?: string, 
        options?: Partial<SweetAlertOptions>
    ) {
        return showAlert({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            ...options
        });
    }

    function showLoading(title: string = 'Memproses...', text?: string) {
        return Swal.fire({
            title,
            text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    function closeLoading() {
        Swal.close();
    }

    function showToast(
        title: string,
        icon: 'success' | 'error' | 'warning' | 'info' = 'success',
        position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end'
    ) {
        return Swal.fire({
            toast: true,
            position,
            icon,
            title,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    }

    return {
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirmation,
        showLoading,
        closeLoading,
        showToast
    };
}