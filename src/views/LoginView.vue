<template>
  <div class="login-container">
    <h2>Вход в приложение</h2>
    <form @submit.prevent="handleLogin">
      <input type="text" v-model="username" placeholder="Имя пользователя" required />
      <input type="password" v-model="password" placeholder="Пароль" required />
      <button type="submit">Войти</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')

const handleLogin = () => {
  // Простейшая имитация: любой непустой логин/пароль считается успешным
  if (username.value && password.value) {
    authStore.login(username.value)
    router.push('/main')
  } else {
    alert('Введите логин и пароль')
  }
}
</script>

<style scoped>
.login-container { max-width: 300px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; }
input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
button { width: 100%; padding: 10px; background: #42b983; color: white; border: none; }
</style>