<script setup lang="ts">
definePageMeta({ layout: "admin" });

await navigateTo("/admin/master/companies?arsip=1", { replace: true });
</script>

<template>
  <div class="p-6 text-sm text-slate-500">
    Mengalihkan ke arsip perusahaan...
  </div>
</template>
