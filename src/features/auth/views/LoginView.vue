<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center justify-center p-1 transition-all duration-300 ease-in-out"
  >
    <div class="card-base">
      <h2>
        {{ state === 'login' ? 'Вход' : 'Регистрация' }}
      </h2>
      <Tabs v-model="state" :items="tabs" />

      <form @submit.prevent="handleSubmit" class="w-full space-y-5">
        <div class="p-5">
          <label>Имя пользователя</label>
          <SmartInput
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
          <label>Пароль</label>
          <SmartInput
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
          <label>Подтверждение пароля</label>
          <SmartInput
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
          <SmartButton type="submit" :state="state" :state_list="state_list"></SmartButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAuthForm } from '../composables/useAuthForm';
import SmartButton from '@/shared/ui/SmartButton.vue';
import SmartInput from '@/shared/ui/SmartInput.vue';
import Tabs from '@/shared/ui/Tabs.vue';

const {
  state,
  username,
  password,
  confirmPassword,
  errorMessage,
  usernameErrors,
  passwordErrors,
  confirmPasswordError,
  inputModes,
  tabs,
  state_list,
  handleSubmit,
  validateUsernameField,
  validatePasswordField,
  validateConfirmPassword,
} = useAuthForm();
</script>
