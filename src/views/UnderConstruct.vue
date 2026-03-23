<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center justify-center p-1 transition-all duration-300 ease-in-out"
  >
    <div
      class="bg-main border-border max-h-md m-5 flex h-full w-full max-w-md flex-col items-center rounded-2xl border-5 transition-all duration-300 ease-in-out"
    >
      <h2>
        {{ state === 'login' ? 'Вход' : 'Регистрация' }}
      </h2>
      <Tabs v-model="state" :items="tabs" />

      <form @submit.prevent="handleSubmit" class="w-full space-y-5">
        <div class="p-5">
          <label class="text-text block font-medium">Имя пользователя</label>
          <Input
            id="username"
            v-model="username"
            type="text"
            required
            :mode="inputModes.login"
            @blur="validateUsernameField"
            @input="usernameErrors = []"
          />
          <div v-if="usernameErrors.length" class="text-error mt-2 space-y-1 text-sm">
            <p v-for="(err, idx) in usernameErrors" :key="idx">{{ err }}</p>
          </div>
        </div>

        <div class="p-5">
          <label class="text-text block font-medium">Пароль</label>
          <Input
            id="password"
            v-model="password"
            type="password"
            required
            :mode="inputModes.password"
            @blur="validatePasswordField"
          />
          <div v-if="passwordErrors.length" class="text-error mt-2 space-y-1 text-sm">
            <p v-for="(err, idx) in passwordErrors" :key="idx">{{ err }}</p>
          </div>
        </div>

        <div v-if="state === 'register'" class="p-5">
          <label class="text-text block font-medium">Подтверждение пароля</label>
          <Input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            :mode="inputModes.confirmPassword"
            @blur="validateConfirmPassword"
          />
          <div v-if="confirmPasswordError" class="text-error mt-2 text-sm">
            {{ confirmPasswordError }}
          </div>
        </div>

        <div v-if="errorMessage" class="p-x-5 text-error flex justify-center font-medium">
          {{ errorMessage }}
        </div>

        <div class="flex justify-center px-5 py-2">
          <Button type="submit" :state="state" :state_list="state_list"></Button>
        </div>
      </form>
    </div>
    <div
      class="bg-main border-border text-text max-h-md m-5 block flex h-full w-full max-w-md flex-col items-center rounded-2xl border-5 font-medium transition-all duration-300 ease-in-out"
    >
      <RouterLink class="hover:text-text-a" :to="{ name: 'dev' }">DEV</RouterLink>
      <RouterLink class="hover:text-text-a" :to="{ name: 'building' }">BUILDING</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAccountsStore } from '@/stores/accounts';
import { useRouter } from 'vue-router';
import { validateLogin, validatePassword } from '@/utils/validation';
import Button from '@/components/forms/SmartButton.vue';
import Input from '@/components/forms/SmartInput.vue';
import Tabs from '@/components/forms/Tabs.vue';

const authStore = useAuthStore();
const accountsStore = useAccountsStore();
const router = useRouter();

const state = ref('login');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');

// Ошибки валидации
const usernameErrors = ref([]);
const passwordErrors = ref([]);
const confirmPasswordError = ref('');

// Настройки конструктора формы
const state_list = ref({ login: 'Войти', register: 'Зарегистрироваться' });
const tabs = [
  { value: 'login', label: 'Вход' },
  { value: 'register', label: 'Регистрация' },
];
const inputModes = ref({ login: '', password: '', confirmPassword: '' });

// Валидация имени пользователя
const validateUsernameField = () => {
  const result = validateLogin(username.value);
  usernameErrors.value = result.errors;
  inputModes.value.login = result.isValid ? 'correct' : 'error';
  return result.isValid;
};

// Валидация пароля
const validatePasswordField = () => {
  const result = validatePassword(password.value);
  passwordErrors.value = result.errors;
  inputModes.value.password = result.isValid ? 'correct' : 'error';
  return result.isValid;
};

// Валидация подтверждения пароля
const validateConfirmPassword = () => {
  inputModes.value.confirmPassword = '';
  if (state.value !== 'register') return true;
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Пароли не совпадают';
    inputModes.value.confirmPassword = 'error';
    return false;
  } else {
    confirmPasswordError.value = '';
    inputModes.value.confirmPassword = 'correct';
    return true;
  }
};

// Общая валидация формы регистрации
const validateRegistrationForm = () => {
  let isValid = true;
  const isUsernameValid = validateUsernameField();
  const isPasswordValid = validatePasswordField();
  const isConfirmValid = validateConfirmPassword();
  if (!isUsernameValid) isValid = false;
  if (!isPasswordValid) isValid = false;
  if (!isConfirmValid) isValid = false;
  return isValid;
};

const handleSubmit = () => {
  errorMessage.value = '';

  if (state.value === 'login') {
    const account = accountsStore.findAccount(username.value, password.value);
    if (account) {
      authStore.login(username.value);
      router.push('/main');
    } else {
      errorMessage.value = 'Неверное имя пользователя или пароль';
    }
  } else {
    // Сначала валидируем форму регистрации
    if (!validateRegistrationForm()) {
      return; // Если ошибки есть, не отправляем
    }

    if (accountsStore.usernameExists(username.value)) {
      errorMessage.value = 'Пользователь с таким именем уже существует';
      return;
    }

    accountsStore.addAccount({
      username: username.value,
      password: password.value,
    });
    authStore.login(username.value);
    router.push('/main');
  }
};
</script>
