<template>
  <Header v-show="showShell"></Header>
  <router-view />
  <Footer v-show="showShell"></Footer>
</template>

<script setup>
import Header from '@/components/blocks/Header.vue';
import Footer from '@/components/blocks/Footer.vue';
import { useAuthStore } from '@/stores/users/auth';
import { computed } from 'vue';
const authStore = useAuthStore();
const showShell = computed(() => authStore.isAuthenticated);
</script>

<style>
/* Глобальные стили можно добавить здесь */
</style>
