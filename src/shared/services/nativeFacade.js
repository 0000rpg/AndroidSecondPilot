/**
 * Фасад для нативных возможностей устройства (камера, геолокация, биометрия и т.д.)
 * Реализация по умолчанию – заглушки или Web API там, где это возможно.
 * В дальнейшем будет заменён на адаптер Capacitor при работе в нативном окружении.
 */

class NativeFacade {
  /**
   * Сделать фото с помощью камеры
   * @returns {Promise<File|null>} - файл изображения или null при ошибке
   */
  async takePhoto() {
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
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.warn('Ошибка геолокации:', error);
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  }

  /**
   * Аутентификация по биометрии (отпечаток пальца / Face ID)
   * @returns {Promise<boolean>} - успешна ли аутентификация
   */
  async authenticateWithBiometry() {
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
      navigator.vibrate(duration);
    } else {
      console.warn('Вибрация не поддерживается');
    }
  }

  /**
   * Проверить, запущено ли приложение в нативной оболочке (Capacitor)
   * @returns {boolean}
   */
  isNative() {
    // @ts-ignore
    return !!window.Capacitor?.isNativePlatform?.();
  }
}

export const nativeFacade = new NativeFacade();
