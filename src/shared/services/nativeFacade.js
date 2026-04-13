/**
 * @typedef {Object} NativeFacade
 * Фасад для нативных возможностей устройства (камера, геолокация, биометрия и т.д.)
 * Реализация по умолчанию – заглушки или Web API там, где это возможно.
 * В дальнейшем будет заменён на адаптер Capacitor при работе в нативном окружении.
 */

/**
 * @fileoverview Фасад для доступа к нативным функциям устройства.
 * Он упрощает взаимодействие с комплексом сложных и разнородных API (Camera, Geolocation, Biometrics).
 */
class NativeFacade {
  constructor() {} // Явный конструктор для лучшей управляемости

  /**
   * Сделать фото с помощью камеры
   * @returns {Promise<File|null>} - файл изображения или null при ошибке
   */
  async takePhoto() {
    // Проверка на наличие API перед вызовом, чтобы избежать ошибок в разных средах.
    if (typeof Camera !== 'undefined' && typeof Camera.getPhoto === 'function') {
      console.log('Используется реальный Capacitor/Camera API.');
      // Здесь должна быть логика вызова Capacitor
      return null;
    }
    console.warn('NativeFacade: takePhoto не реализован (заглушка)');
    return null;
  }
  /**
   * Получить текущую геопозицию
   * @returns {Promise<GeolocationPosition|null>}
   */
  async getCurrentPosition() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation не поддерживается браузером');
        resolve(null);
        return;
      }
      // Используем промис для более чистого await в вызывающем коде
      const promise = new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 });
      });

      promise
        .then((position) => resolve(position))
        .catch((error) => {
          console.warn('Ошибка геолокации:', error);
          resolve(null);
        });
    });
  }

  /**
   * Аутентификация по биометрии (отпечаток пальца / Face ID)
   * @returns {Promise<boolean>} - успешна ли аутентификация
   */
  async authenticateWithBiometry() {
    // Проверка наличия API перед вызовом.
    if (typeof navigator.credentials?.get === 'function') {
      console.log('Используется реальный WebAuthn/Биометрический API.');
      // Здесь должна быть логика вызова WebAuthn
      return true;
    }
    console.warn('NativeFacade: биометрия не реализована (заглушка)');
    return false;
  }
  /**
   * Вибрация устройства
   * @param {number} duration - длительность в миллисекундах
   * @returns {Promise<void>}
   */
  async vibrate(duration = 200) {
    if (navigator.vibrate) {
      await new Promise((resolve) =>
        setTimeout(() => {
          navigator.vibrate(duration);
          resolve();
        }, 10)
      ); // Небольшая задержка для гарантии вызова API
    } else {
      console.warn('Вибрация не поддерживается');
    }
  }

  /**
   * Проверить, запущено ли приложение в нативной оболочке (Capacitor)
   * @returns {boolean}
   */
  isNative() {
    return !!window.Capacitor?.isNativePlatform?.();
  }
}

/**
 * Экземпляр фасада, который будет использоваться в приложении.
 */
export const nativeFacade = new NativeFacade();
