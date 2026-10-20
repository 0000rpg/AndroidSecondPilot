import { createRouter, createWebHashHistory } from 'vue-router';
import LoginView from '@/features/auth/views/LoginView.vue';
import MainView from '@/features/todos/views/MainView.vue';
import { useAuthStore } from '@/features/auth/stores/auth';

/**
 * @fileoverview Vue Router setup with enhanced guard logic.
 */

/**
 * Глобальный гвард для проверки аутентификации.
 * @param {object} to - Целевой роут.
 * @param {object} from - Текущий роут.
 * @param {Function} next - Функция перехода.
 */
const isAuthenticatedRedirect = (to, authStore) =>
  authStore.isAuthenticated && to.path === '/';

const isUnauthorizedAccess = (to, authStore) =>
  to.meta.requiresAuth && !authStore.isAuthenticated;

const redirectToMain = (next) => next('/main');
const redirectToLogin = (next) => next('/');
const allowNavigation = (next) => next();

const authGuard = (to, from, next) => {
  const authStore = useAuthStore();

  if (isAuthenticatedRedirect(to, authStore)) return redirectToMain(next);
  if (isUnauthorizedAccess(to, authStore)) return redirectToLogin(next);
  return allowNavigation(next);
};

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
      meta: { requiresAuth: true }, // Метаданные для гварда
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
      meta: { requiresAuth: true, requiredRole: 'ADMIN' }, // Пример расширения метаданных
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

// Применяем гвард, который инкапсулирует логику авторизации.
router.beforeEach(authGuard);

export default router;
