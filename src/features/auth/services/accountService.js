import { useAccountsStore } from '../stores/accounts'; // Предполагаем, что store теперь экспортирует класс или объект с данными
/**
 * @fileoverview Сервис для работы с бизнес-логикой аккаунтов.
 */
class AccountService {
  /**
   * Проверяет, существует ли пользователь с таким именем в предоставленном списке.
   * @param {string} username - Имя пользователя для проверки.
   * @param {Array<Object>} accountsList - Список всех аккаунтов (вместо вызова useAccountsStore()).
   * @returns {boolean} Успешно ли найдено имя пользователя.
   */
  usernameExists(username, accountsList) {
    if (!accountsList || !Array.isArray(accountsList)) return false;
    return accountsList.some((acc) => acc.username === username);
  }

  /**
   * Находит аккаунт по логину и паролю в предоставленном списке.
   * @param {string} username - Логин пользователя.
   * @param {string} password - Пароль пользователя.
   * @param {Array<Object>} accountsList - Список всех аккаунтов.
   * @returns {object | undefined} Найденный объект аккаунта или undefined.
   */
  findAccount(username, password, accountsList) {
    if (!accountsList || !Array.isArray(accountsList)) return undefined;
    return accountsList.find((acc) => acc.username === username && acc.password === password);
  }
}

export const accountService = new AccountService();
