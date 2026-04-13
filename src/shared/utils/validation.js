/**
 * @fileoverview Модуль валидации форм
 * Содержит функции для проверки полей ввода
 */

/**
 * Проверка email
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return re.test(email);
};

/**
 * Проверка телефонного номера (международный формат, например +7 999 123-45-67)
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  // Убираем все нецифровые символы, оставляем только цифры и +
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const re = /^\+?\d{10,15}$/; // от 10 до 15 цифр, может начинаться с +
  return re.test(cleaned);
};

/**
 * Проверка логина (имени пользователя):
 * - обязательно (если required)
 * - допустимые символы: буквы (латиница, кириллица), цифры, подчёркивание, дефис
 * - минимальная и максимальная длина
 * @param {string} login
 * @param {Object} options
 * @returns {Object} { isValid, errors }
 */
export const validateLogin = (login, options = {}) => {
  const {
    required = true,
    minLength = 3,
    maxLength = 20,
    allowedCharsRegex = /^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/,
  } = options;

  const errors = [];

  // Проверка на пустое значение
  const isEmpty = !login || login.trim() === '';
  if (required && isEmpty) {
    errors.push('Имя пользователя обязательно');
    return { isValid: false, errors };
  }

  // Если не обязательный и пустой – валидация пройдена
  if (!required && isEmpty) {
    return { isValid: true, errors: [] };
  }

  const trimmed = login.trim();

  // Проверка длины
  if (trimmed.length < minLength) {
    errors.push(`Имя пользователя должно содержать не менее ${minLength} символов`);
  }
  if (trimmed.length > maxLength) {
    errors.push(`Имя пользователя должно содержать не более ${maxLength} символов`);
  }

  // Проверка допустимых символов
  if (!allowedCharsRegex.test(trimmed)) {
    errors.push('Разрешены только буквы, цифры, подчёркивание и дефис');
  }

  // Дополнительные проверки (опционально): не начинаться/заканчиваться дефисом/подчёркиванием
  // Можно добавить как опции
  const { noStartEndWithDash = false, noStartEndWithUnderscore = false } = options;

  if (noStartEndWithDash && (trimmed.startsWith('-') || trimmed.endsWith('-'))) {
    errors.push('Имя пользователя не может начинаться или заканчиваться дефисом');
  }
  if (noStartEndWithUnderscore && (trimmed.startsWith('_') || trimmed.endsWith('_'))) {
    errors.push('Имя пользователя не может начинаться или заканчиваться подчёркиванием');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Проверка пароля:
 * - длина минимум 8 символов
 * - хотя бы одна цифра
 * - хотя бы одна буква в верхнем регистре
 * - хотя бы одна буква в нижнем регистре
 * - хотя бы один специальный символ (опционально)
 * @param {string} password
 * @param {Object} options
 * @returns {Object} { isValid, errors }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireDigit = true,
    requireUppercase = true,
    requireLowercase = true,
    requireSpecial = false,
  } = options;

  const errors = [];

  if (!password) {
    errors.push('Пароль обязателен');
    return { isValid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Пароль должен содержать не менее ${minLength} символов`);
  }
  if (requireDigit && !/\d/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }
  if (requireUppercase && !/[A-ZА-ЯЁ]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву');
  }
  if (requireLowercase && !/[a-zа-яё]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву');
  }
  if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы один специальный символ');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Валидация радиокнопки (проверка, что выбран один из вариантов)
 * @param {any} value
 * @param {Array} options - массив допустимых значений
 * @returns {boolean}
 */
export const validateRadio = (value, options) => {
  return options.includes(value);
};

/**
 * Валидация чекбокса (согласие)
 * @param {boolean} checked
 * @returns {boolean}
 */
export const validateCheckbox = (checked) => {
  return checked === true;
};

/**
 * Универсальная функция валидации с поддержкой нескольких правил
 * @param {any} value
 * @param {Array<Function>} validators - массив функций валидации
 * @returns {Object} { isValid, errors }
 */
export const composeValidators = (value, validators) => {
  const errors = [];
  for (const validator of validators) {
    const result = validator(value);
    if (result !== true) {
      errors.push(result);
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Пример использования composeValidators:
 * const validateUsername = composeValidators([
 *   (v) => v && v.length >= 3 || 'Минимум 3 символа',
 *   (v) => /^[a-zA-Z0-9_]+$/.test(v) || 'Только латиница, цифры и подчёркивание',
 * ]);
 */

// Дополнительные вспомогательные функции
export const isRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const minLength = (length) => (value) => {
  if (!value) return false;
  return value.length >= length;
};

export const maxLength = (length) => (value) => {
  if (!value) return true; // пустое поле не проверяем на maxLength (лучше комбинировать с required)
  return value.length <= length;
};
