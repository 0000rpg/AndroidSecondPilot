/**
 * @typedef {Object} NativeFacade
 * Фасад для нативных возможностей устройства (камера, геолокация, биометрия и т.д.)
 * Реализация по умолчанию – заглушки или Web API там, где это возможно.
 * В дальнейшем будет заменён на адаптер Capacitor при работе в нативном окружении.
 */

/**
 * @fileoverview Фасад для доступа к нативным функциям устройства через Adapter Pattern.
 * Использует Object Adapter Pattern для интеграции LegacyNativeComponent с Target interface.
 * 
 * Архитектура:
 * - INativeDeviceService (Target) - интерфейс, ожидаемый клиентом
 * - LegacyNativeComponent (Adaptee) - legacy компонент с несовместимым интерфейсом
 * - NativeDeviceAdapter - адаптер, использующий композицию для мостирования между ними
 */

import { NativeDeviceAdapterFactory } from './index';

/**
 * Фасадная служба для нативных функций через Adapter Pattern.
 * Автоматически выбирает подходящий адаптер в зависимости от окружения.
 */
class NativeFacade {
  /**
   * @private
   * Current adapter instance - lazily initialized on first use.
   */
  #adapter = null;

  /**
   * Constructor for facade service.
   * Uses dependency injection via factory pattern.
   */
  constructor() {}

  /**
   * Get or create the current adapter instance.
   * @private
   * @returns {INativeDeviceService} Current adapter implementing Target interface.
   */
  #getAdapter() {
    if (!this.#adapter) {
      console.log('[NativeFacade] Initializing Native Device Adapter');
      this.#adapter = NativeDeviceAdapterFactory.getAdapter();
    }
    return this.#adapter;
  }

  /**
   * Сделать фото с помощью камеры
   * @returns {Promise<File|null>} - файл изображения или null при ошибке
   */
  async takePhoto() {
    const adapter = this.#getAdapter();
    try {
      console.log('[NativeFacade] Capturing photo via adapter');
      return await adapter.takePhoto();
    } catch (error) {
      console.error('[NativeFacade] takePhoto failed:', error);
      return null;
    }
  }

  /**
   * Получить текущую геопозицию
   * @returns {Promise<GeolocationPosition|null>}
   */
  async getCurrentPosition() {
    const adapter = this.#getAdapter();
    try {
      console.log('[NativeFacade] Getting current position via adapter');
      return await adapter.getCurrentPosition();
    } catch (error) {
      console.error('[NativeFacade] getCurrentPosition failed:', error);
      return null;
    }
  }

  /**
   * Аутентификация по биометрии (отпечаток пальца / Face ID)
   * @returns {Promise<boolean>} - успешна ли аутентификация
   */
  async authenticateWithBiometry() {
    const adapter = this.#getAdapter();
    try {
      console.log('[NativeFacade] Authenticating with biometrics via adapter');
      return await adapter.authenticateWithBiometry();
    } catch (error) {
      console.error('[NativeFacade] authenticateWithBiometry failed:', error);
      return false;
    }
  }

  /**
   * Вибрация устройства
   * @param {number} duration - длительность в миллисекундах
   * @returns {Promise<void>}
   */
  async vibrate(duration = 200) {
    const adapter = this.#getAdapter();
    try {
      console.log(`[NativeFacade] Vibrating for ${duration}ms via adapter`);
      return await adapter.vibrate(duration);
    } catch (error) {
      console.error('[NativeFacade] vibrate failed:', error);
    }
  }

  /**
   * Проверить, запущено ли приложение в нативной оболочке (Capacitor)
   * @returns {boolean}
   */
  isNative() {
    const adapter = this.#getAdapter();
    try {
      console.log('[NativeFacade] Checking native platform via adapter');
      return adapter.isNative();
    } catch (error) {
      console.error('[NativeFacade] isNative check failed:', error);
      return false;
    }
  }

  /**
   * Reset adapter instance (useful for testing/reinitialization).
   */
  reset() {
    this.#adapter = null;
  }
}

/**
 * Экземпляр фасада, который будет использоваться в приложении.
 * Использует Object Adapter Pattern для интеграции legacy компонентов.
 */
export const nativeFacade = new NativeFacade();
