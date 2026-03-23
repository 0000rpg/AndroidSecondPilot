<template>
  <div class="p-8">
    <RouterLink :to="{ name: 'dev' }">DEV</RouterLink>
    <RouterLink :to="{ name: 'building' }">BUILDING</RouterLink>
  </div>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded bg-white p-8 shadow-md">
      <h2 class="mb-6 text-center text-2xl font-bold">
        {{ mode === 'login' ? 'Вход' : 'Регистрация' }}
      </h2>

      <div class="mb-4 flex border-b">
        <button
          @click="mode = 'login'"
          class="flex-1 py-2 text-center"
          :class="mode === 'login' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'"
        >
          Вход
        </button>
        <button
          @click="mode = 'register'"
          class="flex-1 py-2 text-center"
          :class="
            mode === 'register' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          "
        >
          Регистрация
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="mb-2 block text-sm font-bold text-gray-700" for="username"
            >Имя пользователя</label
          >
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-bold text-gray-700" for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>

        <div v-if="mode === 'register'" class="mb-4">
          <label class="mb-2 block text-sm font-bold text-gray-700" for="confirmPassword"
            >Подтверждение пароля</label
          >
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>

        <div v-if="errorMessage" class="mb-4 text-sm text-red-500">{{ errorMessage }}</div>

        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="focus:shadow-outline w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            {{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAccountsStore } from '@/stores/accounts';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const accountsStore = useAccountsStore();
const router = useRouter();

const mode = ref('login');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');

const handleSubmit = () => {
  errorMessage.value = '';

  if (mode.value === 'login') {
    const account = accountsStore.findAccount(username.value, password.value);
    if (account) {
      authStore.login(username.value);
      router.push('/main');
    } else {
      errorMessage.value = 'Неверное имя пользователя или пароль';
    }
  } else {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Пароли не совпадают';
      return;
    }
    if (accountsStore.usernameExists(username.value)) {
      errorMessage.value = 'Пользователь с таким именем уже существует';
      return;
    }
    accountsStore.addAccount({ username: username.value, password: password.value });
    authStore.login(username.value);
    router.push('/main');
  }
};
</script>
