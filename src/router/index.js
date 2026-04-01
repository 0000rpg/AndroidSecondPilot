import { createRouter, createWebHashHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import MainView from '@/views/MainView.vue';
import { useAuthStore } from '@/stores/auth';

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
      component: () => import('@/views/DevPlayground.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/underConstruct',
      name: 'building',
      component: () => import('@/views/UnderConstruct.vue'),
      meta: { requiresAuth: false },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
