<template>
  <div class="main-container">
    <h2>Добро пожаловать, {{ authStore.user }}!</h2>
    <textarea v-model="text" placeholder="Введите текст..." rows="5"></textarea>
    <button @click="clearStorage">Очистить хранилище</button>
    <button @click="logout">Выйти</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Текстовое поле, привязанное к состоянию в Pinia (или локально)
const text = ref('') // можно также хранить в отдельном store

const clearStorage = () => {
  // Очистка всего хранилища Pinia (сброс состояния)
  authStore.$reset()
  // Также можно очистить localStorage вручную, если нужно
  localStorage.clear()
  text.value = ''
  alert('Хранилище очищено')
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.main-container { max-width: 500px; margin: 50px auto; padding: 20px; }
textarea { width: 100%; margin-bottom: 10px; padding: 8px; }
button { margin-right: 10px; padding: 10px; }
</style>