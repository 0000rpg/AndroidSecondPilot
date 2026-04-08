import { defineStore } from 'pinia';

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [],
  }),
  persist: true,
  actions: {
    addAccount(account) {
      const id = Date.now() + Math.random();
      this.accounts.push({ id, ...account });
    },
    updateAccount(id, updatedData) {
      const index = this.accounts.findIndex((acc) => acc.id === id);
      if (index !== -1) {
        this.accounts[index] = { ...this.accounts[index], ...updatedData };
      }
    },
    deleteAccount(id) {
      this.accounts = this.accounts.filter((acc) => acc.id !== id);
    },
    // findAccount и usernameExists вынесены в сервис :)
  },
});
