<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">{{ mode === 'login' ? 'Вход' : 'Регистрация' }}</h2>

      <div class="flex mb-4 border-b">
        <button
          @click="mode = 'login'"
          class="flex-1 py-2 text-center"
          :class="mode === 'login' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'"
        >Вход</button>
        <button
          @click="mode = 'register'"
          class="flex-1 py-2 text-center"
          :class="mode === 'register' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'"
        >Регистрация</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">Имя пользователя</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div v-if="mode === 'register'" class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="confirmPassword">Подтверждение пароля</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">{{ errorMessage }}</div>

        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const router = useRouter()

const mode = ref('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleSubmit = () => {
  errorMessage.value = ''

  if (mode.value === 'login') {
    const account = accountsStore.findAccount(username.value, password.value)
    if (account) {
      authStore.login(username.value)
      router.push('/main')
    } else {
      errorMessage.value = 'Неверное имя пользователя или пароль'
    }
  } else {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Пароли не совпадают'
      return
    }
    if (accountsStore.usernameExists(username.value)) {
      errorMessage.value = 'Пользователь с таким именем уже существует'
      return
    }
    accountsStore.addAccount({ username: username.value, password: password.value })
    authStore.login(username.value)
    router.push('/main')
  }
}
</script>