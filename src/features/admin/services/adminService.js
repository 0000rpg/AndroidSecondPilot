/**
 * @fileoverview Сервис для бизнес-логики управления пользователями и аккаунтами.
 */

/**
 * @typedef {object} Account
 * @property {number|string} id - Уникальный ID аккаунта.
 * @property {string} username - Имя пользователя.
 * @property {string} password - Пароль (в реальном приложении это должно быть хешировано).
 */

/**
 * Сервис для управления данными пользователей и аутентификацией в админ-панели.
 */
export class AdminService {
  constructor(accountsList, authStore) {
    // Принимаем список аккаунтов и текущее состояние Auth Store как зависимости (DIP).
    this.accounts = accountsList;
    this.authStore = authStore;
  }

  /**
   * Проверяет уникальность имени пользователя в списке.
   * @param {string} username - Имя для проверки.
   * @returns {boolean} true, если имя свободно.
   */
  isUsernameUnique(username) {
    return !this.accounts.some((acc) => acc.username === username);
  }

  /**
   * Добавляет нового пользователя в список аккаунтов.
   * @param {string} username - Имя пользователя.
   * @param {string} password - Пароль.
   * @returns {{success: boolean, message?: string}} Результат операции.
   */
  addAccount(username, password) {
    if (!username || !password) return { success: false, message: 'Поля не могут быть пустыми.' };

    if (this.isUsernameUnique(username)) {
      const newAccount = { id: Date.now(), username, password };
      // В реальном приложении здесь был бы вызов API для сохранения в БД
      return { success: true, account: newAccount };
    } else {
      return { success: false, message: 'Пользователь с таким именем уже существует.' };
    }
  }

  /**
   * Обновляет данные существующего пользователя.
   * @param {number|string} id - ID аккаунта для обновления.
   * @param {string} username - Новое имя пользователя.
   * @param {string} password - Новый пароль.
   * @returns {{success: boolean, message?: string}} Результат операции.
   */
  updateAccount(id, username, password) {
    if (!username || !password) return { success: false, message: 'Поля не могут быть пустыми.' };

    const accountIndex = this.accounts.findIndex((acc) => acc.id === id);
    if (accountIndex === -1) return { success: false, message: 'Аккаунт не найден.' };

    // Проверка уникальности после обновления
    const isConflict = this.accounts.some(
      (acc, index) => index !== accountIndex && acc.username === username
    );

    if (isConflict) {
      return { success: false, message: 'Пользователь с таким именем уже существует.' };
    }

    // Обновление данных в локальном списке
    const updatedAccount = { ...this.accounts[accountIndex], username, password };
    // В реальной жизни здесь был бы вызов API для обновления
    return { success: true, account: updatedAccount };
  }

  /**
   * Удаляет аккаунт и обрабатывает логику выхода из системы, если удаленный пользователь активен.
   * @param {number|string} id - ID аккаунта для удаления.
   * @param {string} username - Имя пользователя.
   * @returns {{success: boolean, message?: string}} Результат операции.
   */
  deleteAccount(id, username) {
    if (this.authStore.user === username) {
      // Если удаляем активного пользователя, принудительно выходим из системы
      this.authStore.logout();
      return { success: true, message: 'Аккаунт удален. Вы автоматически вышли из системы.' };
    }
    // В реальной жизни здесь был бы API-вызов удаления
    return { success: true, message: `Аккаунт ${username} успешно помечен как удаленный.` };
  }

  /**
   * @param {Array<Account>} accountsList - Новый список аккаунтов.
   */
  setAccounts(accountsList) {
    this.accounts = accountsList;
  }
}
