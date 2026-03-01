<script setup lang="ts">
import { onMounted } from "vue";

definePageMeta({ layout: "admin" });

const router = useRouter();

// Redirect to index with create modal open
onMounted(() => {
    // Navigate to index and let it handle the modal
    router.replace("/admin/periode-pkl?modal=create");
});
</script>

<template>
    <div></div>
</template>
