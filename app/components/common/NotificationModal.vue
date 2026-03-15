<template>
    <div
        v-if="modelValue"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="handleBackdropClick"
    >
        <div
            class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
            @click.stop
        >
            <!-- Header -->
            <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <slot name="header">
                        <h3 class="text-lg font-semibold text-gray-900">
                            {{ title }}
                        </h3>
                    </slot>
                    <button
                        v-if="showCloseButton"
                        @click="close"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Icon name="lucide:x" class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-4">
                <slot name="body">
                    <div v-if="icon" class="flex items-center mb-4">
                        <div
                            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3"
                            :class="iconBgClass"
                        >
                            <Icon :name="icon" class="w-5 h-5" :class="iconClass" />
                        </div>
                        <div>
                            <p v-if="message" class="text-sm text-gray-700">
                                {{ message }}
                            </p>
                        </div>
                    </div>
                    <p v-else-if="message" class="text-sm text-gray-700">
                        {{ message }}
                    </p>
                </slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer || showDefaultButtons" class="px-6 py-4 border-t border-gray-200">
                <slot name="footer">
                    <div class="flex justify-end space-x-3">
                        <button
                            v-if="showCancelButton"
                            @click="cancel"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {{ cancelText }}
                        </button>
                        <button
                            v-if="showConfirmButton"
                            @click="confirm"
                            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                            :class="confirmButtonClass"
                        >
                            {{ confirmText }}
                        </button>
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: boolean;
    title?: string;
    message?: string;
    icon?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    showCloseButton?: boolean;
    showDefaultButtons?: boolean;
    showCancelButton?: boolean;
    showConfirmButton?: boolean;
    cancelText?: string;
    confirmText?: string;
    closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showCloseButton: true,
    showDefaultButtons: true,
    showCancelButton: false,
    showConfirmButton: true,
    cancelText: 'Batal',
    confirmText: 'OK',
    closeOnBackdrop: true,
});

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'confirm': [];
    'cancel': [];
    'close': [];
}>();

const iconBgClass = computed(() => {
    switch (props.type) {
        case 'success':
            return 'bg-green-100';
        case 'error':
            return 'bg-red-100';
        case 'warning':
            return 'bg-yellow-100';
        case 'info':
            return 'bg-blue-100';
        default:
            return 'bg-gray-100';
    }
});

const iconClass = computed(() => {
    switch (props.type) {
        case 'success':
            return 'text-green-600';
        case 'error':
            return 'text-red-600';
        case 'warning':
            return 'text-yellow-600';
        case 'info':
            return 'text-blue-600';
        default:
            return 'text-gray-600';
    }
});

const confirmButtonClass = computed(() => {
    switch (props.type) {
        case 'success':
            return 'bg-green-600 hover:bg-green-700';
        case 'error':
            return 'bg-red-600 hover:bg-red-700';
        case 'warning':
            return 'bg-yellow-600 hover:bg-yellow-700';
        case 'info':
            return 'bg-blue-600 hover:bg-blue-700';
        default:
            return 'bg-gray-600 hover:bg-gray-700';
    }
});

function close() {
    emit('update:modelValue', false);
    emit('close');
}

function confirm() {
    emit('confirm');
    close();
}

function cancel() {
    emit('cancel');
    close();
}

function handleBackdropClick() {
    if (props.closeOnBackdrop) {
        close();
    }
}
</script>