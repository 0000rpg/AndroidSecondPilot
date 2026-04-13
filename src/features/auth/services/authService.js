import { useAccountsStore } from '../stores/accounts';
import { accountService } from '../services/accountService';

/**
 * @fileoverview Сервис для бизнес-логики аутентификации.
 */
class AuthService {
  /**
   * Проверяет учетные данные пользователя.
   * @param {string} username - Логин.
   * @param {string} password - Пароль.
   * @param {Array<Object>} accountsList - Список всех аккаунтов для проверки (вместо useAccountsStore()).
   * @returns {{success: boolean, user?: {username: string}}} Результат аутентификации.
   */
  login(username, password, accountsList) {
    // Используем рефакторинговый accountService
    const foundAccount = accountService.findAccount(username, password, accountsList);

    if (foundAccount) {
      return { success: true, user: { username: foundAccount.username } };
    } else {
      return { success: false };
    }
  }

  /**
   * Выполняет логику выхода из системы.
   * В данном случае это просто сброс состояния (если бы были API вызовы, они бы здесь были).
   */
  logout() {
    // Здесь может быть вызов API для инвалидации токена на сервере
    console.log('AuthService: Выполнение логики выхода из системы.');
  }
}

export const authService = new AuthService();
