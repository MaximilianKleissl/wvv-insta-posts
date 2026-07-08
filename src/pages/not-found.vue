<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md mx-4 bg-white p-6 rounded-lg shadow">
      <div class="flex mb-4 gap-2">
        <AlertCircle class="h-8 w-8 text-red-500" />
        <h1 class="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
      </div>

      <p class="mt-4 text-sm text-gray-600">
        Did you forget to add the page to the router?
      </p>
    </div>
  </div>
</template>
