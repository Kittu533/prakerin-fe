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
    function applyContainerLayering() {
        if (!import.meta.client) return;

        const container = Swal.getContainer();
        const popup = Swal.getPopup();

        if (container) {
            container.style.zIndex = '2147483647';
        }

        if (popup) {
            popup.style.zIndex = '2147483647';
        }
    }

    function getAlertBaseOptions() {
        return {
            target: import.meta.client ? document.body : undefined,
            returnFocus: false,
            heightAuto: false,
            backdrop: true,
            didOpen: () => {
                applyContainerLayering();
            },
            customClass: {
                container: 'swal-disposisi-layer',
                popup: 'rounded-lg',
                title: 'text-lg font-semibold',
                content: 'text-sm',
                confirmButton: 'px-4 py-2 rounded-lg font-medium',
                cancelButton: 'px-4 py-2 rounded-lg font-medium'
            }
        };
    }
    
    function showAlert(options: SweetAlertOptions) {
        return Swal.fire({
            ...getAlertBaseOptions(),
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
            allowEscapeKey: options.allowEscapeKey ?? true
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
            ...getAlertBaseOptions(),
            title,
            text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                applyContainerLayering();
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
            ...getAlertBaseOptions(),
            toast: true,
            position,
            icon,
            title,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                applyContainerLayering();
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
