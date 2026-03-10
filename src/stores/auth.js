import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),
  persist: true,
  actions: {
    login(username) {
      this.user = username
      this.isAuthenticated = true
      // Сохраняем в localStorage для восстановления после перезагрузки
      localStorage.setItem('auth', JSON.stringify({ user: username, isAuthenticated: true }))
    },
    logout() {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('auth')
    },
    // Загрузка состояния из localStorage при инициализации
    loadFromStorage() {
      const saved = localStorage.getItem('auth')
      if (saved) {
        const parsed = JSON.parse(saved)
        this.user = parsed.user
        this.isAuthenticated = parsed.isAuthenticated
      }
    }
  }
})