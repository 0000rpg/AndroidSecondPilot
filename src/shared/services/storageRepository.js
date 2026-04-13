/**
 * @fileoverview Storage system with native and web support.
 */

/**
 * @typedef {Object} IStorageService
 * Интерфейс для любого сервиса локального хранения данных.
 */

// --- Адаптер Capacitor (Нативный) ---
// На данный момент поддержку прекратил, всё через web
class CapacitorStorageAdapter {
  constructor() {} // Конструктор для явного создания экземпляра

  /**
   * @param {string} key
   * @param {*} value
   * @returns {Promise<boolean>}
   */
  async setItem(key, value) {
    console.log(`[Native] Setting ${key}`);
    // await Capacitor.Plugins.Preferences.set({ key: key, value: JSON.stringify(value) });
    return true;
  }

  /**
   * @param {string} key
   * @returns {Promise<*>}
   */
  async getItem(key) {
    console.log(`[Native] Getting ${key}`);
    // const result = await Capacitor.Plugins.Preferences.get({ key: key });
    // return result.value ? JSON.parse(result.value) : null;
    return null; // Заглушка для симуляции
  }

  /**
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async removeItem(key) {
    console.log(`[Native] Removing ${key}`);
    // await Capacitor.Plugins.Preferences.remove({ key: key });
    return true;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async clear() {
    console.log('[Native] Clearing all storage');
    // await Capacitor.Plugins.Preferences.clear();
    return true;
  }

  /**
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    // const result = await Capacitor.Plugins.Preferences.get({ key: key });
    // return !!result.value;
    return false; // Заглушка
  }
}

// --- Адаптер LocalStorage (Web) ---
class LocalStorageAdapter {
  constructor() {}

  /**
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
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
   * @param {string} key
   * @param {*} [defaultValue=null]
   * @returns {*}
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
   * @param {string} key
   * @returns {boolean}
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
   * @returns {boolean}
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
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * Фабрика для выбора и предоставления нужного адаптера, соблюдая DIP.
 * Потребители будут запрашивать экземпляр через эту фабрику/сервис.
 */
export class StorageRepositoryFactory {
  /**
   * Определяет, какой адаптер использовать в зависимости от окружения.
   * @returns {IStorageService} Экземпляр репозитория.
   */
  static getAdapter() {
    // Проверка наличия Capacitor (нативный контекст)
    if (typeof window !== 'undefined' && window.Capacitor) {
      console.log('Используется CapacitorStorageAdapter.');
      return new CapacitorStorageAdapter();
    } else {
      console.warn('Не обнаружен Capacitor, используется LocalStorageAdapter.');
      return new LocalStorageAdapter();
    }
  }
}
// Экспортируем фабрику для использования в main.js и других местах.
