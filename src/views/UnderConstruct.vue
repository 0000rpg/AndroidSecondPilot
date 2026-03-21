<template>
  <div class="bg-q13 min-h-screen flex flex-col justify-center items-center transition-all ease-in-out duration-300">
    <div class="bg-q3 m-5 rounded-2xl border-q5 border-5 max-w-md w-full max-h-md h-full flex flex-col items-center transition-all ease-in-out duration-300">
      <h2 class="text-q7 m-5 text-center text-5xl font-bold">{{ mode === 'login' ? 'Вход' : 'Регистрация' }}</h2>

      <div class="flex justify-between w-full p-5 border-t-2 border-q5 text-2xl transition-all ease-in-out duration-300">
        <button
          @click="mode = 'login'"
          class="flex-1 p-2 transition-all duration-100"
          :class="mode === 'login' ? 'border-b-2 border-q1 text-q1 font-medium' : 'text-q6 hover:text-q2'"
        >Вход</button>
        <button
          @click="mode = 'register'"
          class="flex-1 p-2 transition-all duration-100"
          :class="mode === 'register' ? 'border-b-2 border-q1 text-q1 font-medium' : 'text-q6 hover:text-q2'"
        >Регистрация</button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5 w-full">
        <div class="p-5">
          <label class="block text-q7 font-medium">Имя пользователя</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="bg-stripes-diagonal-transparent w-full px-4 py-2 border border-q5 rounded-lg transition-all focus:border-q2 focus:border-2 focus:outline-none text-q7"
          />
        </div>

        <div class="p-5">
          <label class="block text-q7 font-medium">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="bg-stripes-diagonal-transparent w-full px-4 py-2 border border-q5 rounded-lg transition-all focus:border-q2 focus:border-2 focus:outline-none text-q7"
          />
        </div>

        <div v-if="mode === 'register'" class="p-5">
          <label class="block text-q7 font-medium">Подтверждение пароля</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="bg-stripes-diagonal-transparent w-full px-4 py-2 border border-q5 rounded-lg transition-all focus:border-q2 focus:border-2 focus:outline-none text-q7"
          />
        </div>

        <div v-if="errorMessage" class="p-x-5 text-red-700 font-medium flex justify-center">{{ errorMessage }}</div>

        <div class="py-2 px-5 flex justify-center">
          <button
            type="submit"
            class="bg-q1 hover:bg-q2 w-full p-2 border-2 border-q5 hover:border-q6 text-lg text-q7 font-bold rounded-2xl transition-all ease-in-out duration-300"
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