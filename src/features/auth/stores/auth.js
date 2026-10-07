import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import { useAccountsStore } from '@/features/auth/stores/accounts';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  persist: true,
  actions: {
    /**
     * Логинит пользователя.
     * @param {string} username - Имя пользователя.
     * @param {string} password - Пароль пользователя.
     */
    login(username, password) {
      if (!useAccountsStore().accounts || useAccountsStore().accounts.length === 0) {
        console.error('Невозможно войти: Список учетных записей пуст.');
        return false; // Возвращаем явный флаг ошибки
      }

      // Вызываем сервис, передавая ему контекст (список аккаунтов), логин и пароль.
      const result = authService.login(username, password, useAccountsStore().accounts);

      if (result && result.success && result.user) {
        this.user = result.user.username;
        this.isAuthenticated = true;
        return true;
      } else {
        // Логируем ошибку, чтобы пользователь увидел ее в UI
        console.error('Login failed:', result?.message || 'Не удалось войти.');
        return false;
      }
    },
    logout() {
      authService.logout(); // Вызываем сервис для выполнения логики выхода
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
