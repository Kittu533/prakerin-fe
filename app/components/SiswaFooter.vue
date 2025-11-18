<template>
  <footer class="bg-white backdrop-blur-lg border-t border-white/20 py-6 mt-auto">
    <div class="container mx-auto px-4">
      <div class="text-center text-black text-sm">
        <p>{{ currentYear }}© SMK N 2 Wonogiri</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>