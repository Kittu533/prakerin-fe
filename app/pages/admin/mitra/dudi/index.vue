<script setup lang="ts">
definePageMeta({ layout: "admin" });

await navigateTo("/admin/master/companies", { replace: true });
</script>

<template>
  <div class="p-6 text-sm text-slate-500">
    Mengalihkan ke master perusahaan...
  </div>
</template>
