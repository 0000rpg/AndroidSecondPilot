<template>
  <header
    class="bg-background border-border text-text sticky top-0 z-50 w-full border-b-2 transition-all duration-300 ease-in-out"
  >
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <!-- Логотип или бренд -->
      <RouterLink to="/" class="flex items-center space-x-2">
        <div class="bg-primary h-8 w-8 overflow-hidden rounded-lg">
          <img
            src="/src/assets/images/logo/logo500.png"
            alt="Logo"
            class="h-full w-full object-cover brightness-0 invert"
          />
        </div>
      </RouterLink>

      <!-- Навигационные кнопки -->
      <nav class="hidden items-center space-x-1 md:flex">
        <RouterLink
          v-for="item in navItems"
          :key="item.id"
          :to="item.path"
          custom
          v-slot="{ navigate, isActive, href }"
        >
          <HeaderButton :active="isActive" :href="href" @click="navigate">
            {{ item.label }}
          </HeaderButton>
        </RouterLink>
      </nav>

      <!-- Правая секция с дополнительными кнопками -->
      <div class="flex items-center space-x-2">
        <!-- Кнопка входа (показывается если не авторизован) -->
        <RouterLink
          v-if="!authStore.isAuthenticated"
          to="/"
          custom
          v-slot="{ navigate, isActive, href }"
        >
          <HeaderButton :active="isActive" :href="href" size="sm" @click="navigate">
            Вход
          </HeaderButton>
        </RouterLink>

        <!-- Кнопка выхода (показывается если авторизован) -->
        <HeaderButton v-else size="sm" @click="handleLogout"> Выход </HeaderButton>

        <!-- Мобильное меню -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="text-foreground hover:bg-muted rounded-lg p-2 transition-colors md:hidden"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Мобильное меню -->
    <div
      v-if="mobileMenuOpen"
      class="bg-background border-border absolute top-16 right-0 left-0 z-50 border-b md:hidden"
    >
      <div class="flex flex-col space-y-1 p-4">
        <!-- Навигационные ссылки -->
        <RouterLink
          v-for="item in navItems"
          :key="item.id"
          :to="item.path"
          custom
          v-slot="{ navigate, isActive, href }"
        >
          <HeaderButton
            :active="isActive"
            :href="href"
            full-width
            @click="
              () => {
                navigate();
                mobileMenuOpen = false;
              }
            "
          >
            {{ item.label }}
          </HeaderButton>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import HeaderButton from '@/components/blocks/parts/HeaderButton.vue';
import { useAuthStore } from '@/stores/users/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Определение пунктов меню с путями
const navItems = [
  { id: 'home', label: 'Главная', path: '/' },
  { id: 'admin', label: 'Админ панель', path: '/admin' },
  { id: 'dev', label: 'Палитра', path: '/dev' },
  { id: 'building', label: 'Песочница', path: '/underConstruct' },
];

// Функция выхода
const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

// Состояние компонента
const mobileMenuOpen = ref(false);

// Закрывать мобильное меню при смене маршрута
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false;
  }
);
</script>
