import { createRouter, createWebHashHistory } from 'vue-router';
import LoginView from '@/features/auth/views/LoginView.vue';
import MainView from '@/features/todos/views/MainView.vue';
import { useAuthStore } from '@/features/auth/stores/auth';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/main',
      name: 'main',
      component: MainView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dev',
      name: 'dev',
      component: () => import('@/features/dev/views/DevPlayground.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/underConstruct',
      name: 'building',
      component: () => import('@/features/dev/views/CurrentPagePlayground.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/features/admin/views/AdminPanel.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/features/chat/views/ChatView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/features/settings/views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated && to.path === '/') {
    next('/main');
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
