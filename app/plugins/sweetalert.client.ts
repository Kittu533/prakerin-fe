import Swal from 'sweetalert2';

export default defineNuxtPlugin(() => {
    // Configure SweetAlert2 defaults
    Swal.mixin({
        customClass: {
            popup: 'rounded-lg shadow-xl',
            title: 'text-lg font-semibold text-gray-900',
            content: 'text-sm text-gray-700',
            confirmButton: 'px-4 py-2 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all',
            cancelButton: 'px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all',
            actions: 'gap-3'
        },
        buttonsStyling: false,
        reverseButtons: true
    });

    return {
        provide: {
            swal: Swal
        }
    };
});