import { useAccountsStore } from '../stores/accounts';

class AccountService {
  /**
   * Проверяет, существует ли пользователь с таким именем
   * @param {string} username
   * @returns {boolean}
   */
  usernameExists(username) {
    const accountsStore = useAccountsStore();
    return accountsStore.accounts.some((acc) => acc.username === username);
  }

  /**
   * Находит аккаунт по логину и паролю
   * @param {string} username
   * @param {string} password
   * @returns {object | undefined}
   */
  findAccount(username, password) {
    const accountsStore = useAccountsStore();
    return accountsStore.accounts.find(
      (acc) => acc.username === username && acc.password === password
    );
  }
}

export const accountService = new AccountService();
