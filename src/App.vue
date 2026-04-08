<template>
  <Header v-show="showShell" />
  <router-view class="mt-20" />
</template>

<script setup>
import Header from '@/shared/ui/Header.vue';
import { useAuthStore } from '@/features/auth/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const showShell = computed(() => authStore.isAuthenticated);
</script>
