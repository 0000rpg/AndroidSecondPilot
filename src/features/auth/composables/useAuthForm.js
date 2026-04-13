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

  const handleLogin = async () => {
    // 1. Получаем контекст аккаунтов перед вызовом стора
    const accountsList = accountsStore.accounts;

    if (!accountsList || accountsList.length === 0) {
      errorMessage.value = 'Невозможно войти: В системе нет зарегистрированных учетных записей.';
      return false;
    }

    // 2. Вызываем метод login в сторе, передавая ВСЕ необходимые данные (username, password, context).
    const success = authStore.login(username.value, password.value);

    if (success) {
      router.push('/main');
      return true;
    } else {
      errorMessage.value = 'Неверное имя пользователя или пароль.';
      return false;
    }
  };

  const handleRegistration = async () => {
    if (!validateRegistrationForm()) return false;

    if (accountService.usernameExists(username.value, accountsStore.accounts)) {
      errorMessage.value = 'Пользователь с таким именем уже существует';
      return false;
    }

    // Добавление аккаунта
    accountsStore.addAccount({
      username: username.value,
      password: password.value,
    });

    // Логин после регистрации (теперь передаем пароль)
    const success = authStore.login(username.value, password.value);

    if (success) {
      router.push('/main');
      return true;
    } else {
      errorMessage.value = 'Регистрация прошла успешно, но вход не удался.';
      return false;
    }
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
