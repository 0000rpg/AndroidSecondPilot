/**
 * @fileoverview Index file для экспорта сервисов и адаптеров.
 */
import { StorageRepositoryFactory } from './storageRepository';
import { nativeFacade } from './nativeFacade';
import NativeDeviceAdapter, { LegacyNativeComponent } from './LegacyNativeComponent';
import INativeDeviceService from './INativeDeviceService';

// В будущем сюда можно добавить другие сервисы (если всё-таки будут)

/**
 * Экспонирует фабрику для получения экземпляра репозитория.
 * Потребителям следует использовать StorageRepositoryFactory.getAdapter() напрямую.
 */
export { StorageRepositoryFactory };
// Для совместимости с существующими импортами, экспортируем готовый экземпляр.
export const storageRepository = StorageRepositoryFactory.getAdapter();
export { nativeFacade };

/**
 * Factory for creating Native Device Adapter instances with dependency injection.
 * Supports both legacy component adaptation and direct implementation.
 */
export class NativeDeviceAdapterFactory {
  /**
   * Creates an adapter wrapping a legacy component (Object Adapter Pattern).
   * @param {LegacyNativeComponent} legacy - The legacy component to adapt.
   * @returns {INativeDeviceService} Adapter implementing Target interface.
   */
  static createWithLegacy(legacy) {
    if (!legacy || !(legacy instanceof LegacyNativeComponent)) {
      throw new Error('Invalid legacy component provided.');
    }
    return new NativeDeviceAdapter(legacy);
  }

  /**
   * Creates an adapter with direct implementation (for testing).
   * @returns {INativeDeviceService} Adapter implementing Target interface.
   */
  static createDirect() {
    // For testing - returns a mock that implements the Target interface directly
    return new MockNativeDeviceAdapter();
  }

  /**
   * Gets the current adapter instance based on environment.
   * @returns {INativeDeviceService} Current adapter instance.
   */
  static getAdapter() {
    // Check if legacy component is available
    try {
      const legacy = new LegacyNativeComponent();
      return this.createWithLegacy(legacy);
    } catch (error) {
      console.warn('[AdapterFactory] Failed to create legacy adapter, using mock:', error.message);
      return this.createDirect();
    }
  }
}

/**
 * Mock implementation for testing the Target interface.
 */
class MockNativeDeviceAdapter implements INativeDeviceService {
  async takePhoto() {
    console.log('[Mock] takePhoto called');
    // Simulate photo capture delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return null;
  }

  async getCurrentPosition() {
    console.log('[Mock] getCurrentPosition called');
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      coords: {
        latitude: 55.7558,
        longitude: 37.6173,
        accuracy: 10,
      },
      timestamp: new Date(),
    };
  }

  async authenticateWithBiometry() {
    console.log('[Mock] authenticateWithBiometry called');
    await new Promise(resolve => setTimeout(resolve, 50));
    return true;
  }

  async vibrate(duration = 200) {
    console.log(`[Mock] vibrate called with duration: ${duration}`);
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  isNative() {
    console.log('[Mock] isNative called');
    return false; // Mock always returns false (web environment)
  }
}

export { NativeDeviceAdapterFactory };
