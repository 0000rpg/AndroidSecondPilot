/**
 * Адаптер для Capacitor – реализация нативных возможностей через плагины Capacitor.
 * Используется, когда приложение запущено на устройстве (Android/iOS).
 * Для работы требуется установка плагинов:
 *   @capacitor/camera
 *   @capacitor/geolocation
 *   @capacitor/biometrics (или @capacitor/fingerprint)
 *   @capacitor/haptics (для вибрации)
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Biometrics } from '@capacitor/biometrics';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

class CapacitorAdapter {
  /**
   * Сделать фото с помощью камеры
   * @returns {Promise<File|null>}
   */
  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (!photo.webPath) return null;

      // Преобразуем URI в File
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const fileName = `photo_${Date.now()}.jpg`;
      return new File([blob], fileName, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Ошибка при съёмке фото:', error);
      return null;
    }
  }

  /**
   * Получить текущую геопозицию
   * @returns {Promise<GeolocationPosition|null>}
   */
  async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();
      return position;
    } catch (error) {
      console.error('Ошибка получения геопозиции:', error);
      return null;
    }
  }

  /**
   * Аутентификация по биометрии
   * @returns {Promise<boolean>}
   */
  async authenticateWithBiometry() {
    try {
      // Проверяем доступность биометрии
      const available = await Biometrics.checkAvailability();
      if (!available.isAvailable) {
        console.warn('Биометрия недоступна');
        return false;
      }

      const result = await Biometrics.verify({
        reason: 'Подтвердите личность для входа',
        title: 'Биометрическая аутентификация',
      });
      return result.verified;
    } catch (error) {
      console.error('Ошибка биометрической аутентификации:', error);
      return false;
    }
  }

  /**
   * Вибрация (используем Haptics для тактильного отклика)
   * @param {number} duration - длительность (не поддерживается в Haptics, оставляем для совместимости)
   */
  async vibrate(duration = 200) {
    try {
      // В Capacitor Haptics не поддерживает длительную вибрацию, только короткие эффекты
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('Ошибка вибрации через Haptics:', error);
      // fallback на navigator.vibrate если доступен
      if (navigator.vibrate) navigator.vibrate(duration);
    }
  }

  /**
   * Проверить, запущено ли в нативном окружении
   * @returns {boolean}
   */
  isNative() {
    return Capacitor.isNativePlatform();
  }
}

export const capacitorAdapter = new CapacitorAdapter();
