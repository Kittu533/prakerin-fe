export interface NotificationModalOptions {
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    icon?: string;
    confirmText?: string;
    showCancelButton?: boolean;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export function useNotificationModal() {
    const isOpen = ref(false);
    const modalOptions = ref<NotificationModalOptions>({
        message: '',
        type: 'info',
    });

    function showModal(options: NotificationModalOptions) {
        modalOptions.value = {
            ...options,
            icon: options.icon || getDefaultIcon(options.type || 'info'),
        };
        isOpen.value = true;
    }

    function showSuccess(message: string, options?: Partial<NotificationModalOptions>) {
        showModal({
            message,
            type: 'success',
            title: 'Berhasil',
            ...options,
        });
    }

    function showError(message: string, options?: Partial<NotificationModalOptions>) {
        showModal({
            message,
            type: 'error',
            title: 'Gagal',
            ...options,
        });
    }

    function showWarning(message: string, options?: Partial<NotificationModalOptions>) {
        showModal({
            message,
            type: 'warning',
            title: 'Peringatan',
            ...options,
        });
    }

    function showInfo(message: string, options?: Partial<NotificationModalOptions>) {
        showModal({
            message,
            type: 'info',
            title: 'Informasi',
            ...options,
        });
    }

    function showConfirmation(
        message: string,
        onConfirm: () => void,
        options?: Partial<NotificationModalOptions>
    ) {
        showModal({
            message,
            type: 'warning',
            title: 'Konfirmasi',
            showCancelButton: true,
            confirmText: 'Ya',
            cancelText: 'Tidak',
            onConfirm,
            ...options,
        });
    }

    function closeModal() {
        isOpen.value = false;
    }

    function handleConfirm() {
        if (modalOptions.value.onConfirm) {
            modalOptions.value.onConfirm();
        }
    }

    function handleCancel() {
        if (modalOptions.value.onCancel) {
            modalOptions.value.onCancel();
        }
    }

    function getDefaultIcon(type: string): string {
        switch (type) {
            case 'success':
                return 'lucide:check-circle';
            case 'error':
                return 'lucide:x-circle';
            case 'warning':
                return 'lucide:alert-triangle';
            case 'info':
                return 'lucide:info';
            default:
                return 'lucide:info';
        }
    }

    return {
        isOpen: readonly(isOpen),
        modalOptions: readonly(modalOptions),
        showModal,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirmation,
        closeModal,
        handleConfirm,
        handleCancel,
    };
}