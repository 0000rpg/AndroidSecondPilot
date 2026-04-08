import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useAccountsStore } from '../stores/accounts';
import { accountService } from '../services/accountService';
import { validateLogin, validatePassword } from '@/shared/utils/validation';

export function useAuthForm() {
  const router = useRouter();
  const authStore = useAuthStore();
  const accountsStore = useAccountsStore();

  // Состояние
  const state = ref('login');
  const username = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const errorMessage = ref('');

  // Ошибки валидации
  const usernameErrors = ref([]);
  const passwordErrors = ref([]);
  const confirmPasswordError = ref('');
  const inputModes = ref({ login: '', password: '', confirmPassword: '' });

  // Валидация
  const validateUsernameField = () => {
    const result = validateLogin(username.value);
    usernameErrors.value = result.errors;
    inputModes.value.login = result.isValid ? 'correct' : 'error';
    return result.isValid;
  };

  const validatePasswordField = () => {
    const result = validatePassword(password.value);
    passwordErrors.value = result.errors;
    inputModes.value.password = result.isValid ? 'correct' : 'error';
    return result.isValid;
  };

  const validateConfirmPassword = () => {
    if (state.value !== 'register') return true;
    const isValid = password.value === confirmPassword.value;
    confirmPasswordError.value = isValid ? '' : 'Пароли не совпадают';
    inputModes.value.confirmPassword = isValid ? 'correct' : 'error';
    return isValid;
  };

  const validateRegistrationForm = () => {
    return validateUsernameField() && validatePasswordField() && validateConfirmPassword();
  };

  // Сабмит
  const handleSubmit = async () => {
    errorMessage.value = '';

    if (state.value === 'login') {
      return handleLogin();
    } else {
      return handleRegistration();
    }
  };

  const handleLogin = () => {
    const account = accountService.findAccount(username.value, password.value);
    if (account) {
      authStore.login(username.value);
      router.push('/main');
      return true;
    } else {
      errorMessage.value = 'Неверное имя пользователя или пароль';
      return false;
    }
  };

  const handleRegistration = () => {
    if (!validateRegistrationForm()) return false;

    if (accountService.usernameExists(username.value)) {
      errorMessage.value = 'Пользователь с таким именем уже существует';
      return false;
    }

    accountsStore.addAccount({
      username: username.value,
      password: password.value,
    });
    authStore.login(username.value);
    router.push('/main');
    return true;
  };

  // UI конфигурация
  const tabs = [
    { value: 'login', label: 'Вход' },
    { value: 'register', label: 'Регистрация' },
  ];
  const state_list = ref({ login: 'Войти', register: 'Зарегистрироваться' });

  return {
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
  };
}
