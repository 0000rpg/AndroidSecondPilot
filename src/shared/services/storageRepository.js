/**
 * Репозиторий для работы с localStorage
 * Абстрагирует прямое обращение к localStorage, позволяя в будущем заменить на Capacitor Storage или IndexedDB
 */

class StorageRepository {
  /**
   * Сохранить значение в хранилище
   * @param {string} key - ключ
   * @param {any} value - значение (будет сериализовано в JSON)
   */
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Ошибка сохранения в localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Получить значение из хранилища
   * @param {string} key - ключ
   * @param {any} defaultValue - значение по умолчанию, если ключ отсутствует
   * @returns {any} десериализованное значение или defaultValue
   */
  getItem(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Ошибка чтения из localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Удалить ключ из хранилища
   * @param {string} key
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Ошибка удаления из localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Очистить всё хранилище
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Ошибка очистки localStorage', error);
      return false;
    }
  }

  /**
   * Проверить наличие ключа
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  }
}

export const storageRepository = new StorageRepository();
