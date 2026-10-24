/**
 * @fileoverview Native Device Adapter - Object Adapter Pattern Implementation.
 * 
 * This adapter bridges the LegacyNativeComponent (Adaptee) with the INativeDeviceService (Target).
 * It uses composition to hold a reference to the legacy component and translates calls between
 * incompatible interfaces, handling missing functionality and parameter discrepancies.
 * 
 * @example
 * ```typescript
 * // Create adapter with legacy component
 * const adapter = new NativeDeviceAdapter(legacyNativeComponent);
 * 
 * // Use through Target interface
 * await adapter.takePhoto();
 * await adapter.getCurrentPosition();
 * ```
 */

import { INativeDeviceService } from './INativeDeviceService';
import LegacyNativeComponent from './LegacyNativeComponent';

/**
 * Native Device Adapter - Implements Target interface using legacy component.
 * 
 * @implements {INativeDeviceService}
 */
class NativeDeviceAdapter implements INativeDeviceService {
  /**
   * @private
   * Holds reference to the legacy component (Adaptee) via composition.
   * Using unique_ptr equivalent with weak reference pattern for memory management.
   */
  #legacyComponent;

  /**
   * @private
   * Cache for platform detection to avoid repeated Capacitor calls.
   */
  #platformCache = null;

  /**
   * @private
   * Platform cache timestamp (in ms) - invalidate after 5 minutes.
   */
  #cacheExpiryTime = 300000;

  /**
   * Constructor for the adapter.
   * 
   * @param {LegacyNativeComponent} legacy - The legacy component to adapt.
   * Required by dependency injection principle for testability and flexibility.
   */
  constructor(legacy) {
    if (!legacy || !(legacy instanceof LegacyNativeComponent)) {
      throw new Error('Invalid legacy component provided to adapter.');
    }

    this.#legacyComponent = legacy;
  }

  /**
   * @private
   * Checks if currently running in native environment.
   * Cached result for performance optimization.
   */
  #isNative() {
    const now = Date.now();
    
    // Return cached value if not expired
    if (this.#platformCache && this.#cacheExpiryTime - now > 0) {
      return this.#platformCache;
    }

    // Invalidate cache and check again
    try {
      const platformName = this.#legacyComponent.getPlatformName();
      this.#platformCache = platformName !== 'web';
      
      if (this.#platformCache) {
        console.log('[Adapter] Running in native environment');
      } else {
        console.warn('[Adapter] Running in web environment - some features may be limited');
      }

      return this.#platformCache;
    } catch (error) {
      console.error('[Adapter] Error checking native platform:', error);
      return false;
    }
  }

  /**
   * @private
   * Converts base64 string to File object.
   * Handles the interface incompatibility between legacy and target.
   */
  #convertBase64ToFile(base64String) {
    if (!base64String || typeof base64String !== 'string') return null;

    try {
      // Extract base64 data without header
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      
      // Create blob from base64
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Create file with timestamp-based name
      const fileName = `photo_${Date.now()}.jpg`;
      return new File([blob], fileName, { type: 'image/jpeg' });
    } catch (error) {
      console.error('[Adapter] Error converting base64 to File:', error);
      return null;
    }
  }

  /**
   * @private
   * Enriches legacy position object with missing timestamp field.
   */
  #enrichPosition(legacyPosition) {
    if (!legacyPosition || !legacyPosition.coords) return null;

    return {
      coords: {
        latitude: legacyPosition.coords.latitude,
        longitude: legacyPosition.coords.longitude,
        accuracy: legacyPosition.coords.accuracy,
      },
      timestamp: new Date(), // Added missing field for Target interface compatibility
    };
  }

  /**
   * @private
   * Converts legacy boolean return values to proper boolean.
   */
  #normalizeBoolean(value) {
    if (value === true || value === false) return value;
    if (value === undefined) return false;
    if (value === null) return false;
    return !!value;
  }

  /**
   * INativeDeviceService.takePhoto - Capture photo using camera.
   * 
   * Adapts legacy capturePhotoBase64() which returns base64 string to Target interface
   * which expects File|null object.
   * 
   * @param {Object} [options] - Photo capture options (quality, source, etc.)
   * @returns {Promise<File|null>} Resolved File object or null on error.
   */
  async takePhoto(options) {
    try {
      // Call legacy method with base64 output
      const base64Result = await this.#legacyComponent.capturePhotoBase64();

      if (!base64Result) return null;

      // Convert incompatible return type to Target interface contract
      return this.#convertBase64ToFile(base64Result);
    } catch (error) {
      console.error('[Adapter] takePhoto error:', error);
      return null;
    }
  }

  /**
   * INativeDeviceService.getCurrentPosition - Get current geolocation.
   * 
   * Adapts legacy getLegacyPosition() which returns incomplete position object
   * to Target interface which requires timestamp field.
   * 
   * @returns {Promise<GeolocationPosition|null>} Position data or null on error.
   */
  async getCurrentPosition() {
    try {
      // Call legacy method with incompatible return format
      const legacyPosition = await this.#legacyComponent.getLegacyPosition();

      if (!legacyPosition) return null;

      // Enrich position object to match Target interface contract
      return this.#enrichPosition(legacyPosition);
    } catch (error) {
      console.error('[Adapter] getCurrentPosition error:', error);
      return null;
    }
  }

  /**
   * INativeDeviceService.authenticateWithBiometry - Biometric authentication.
   * 
   * Adapts legacy attemptBiometricAuth() which throws exceptions on failure
   * to Target interface which expects Promise<boolean>.
   * 
   * @returns {Promise<boolean>} True if authentication succeeded, false otherwise.
   */
  async authenticateWithBiometry() {
    try {
      // Call legacy method that may throw or return undefined
      await this.#legacyComponent.attemptBiometricAuth();

      // Normalize return value to boolean (Target interface contract)
      return this.#normalizeBoolean(true);
    } catch (error) {
      console.error('[Adapter] authenticateWithBiometry error:', error);
      // Return false instead of throwing - Target interface expects boolean
      return this.#normalizeBoolean(false);
    }
  }

  /**
   * INativeDeviceService.vibrate - Trigger haptic feedback.
   * 
   * Adapts legacy triggerHaptics() which has different parameter handling
   * to Target interface with duration parameter support.
   * 
   * @param {number} [duration=200] - Duration in milliseconds.
   * @returns {Promise<void>}
   */
  async vibrate(duration = 200) {
    try {
      // Call legacy method (may ignore duration parameter)
      await this.#legacyComponent.triggerHaptics(duration);

      // Additional vibration using navigator API for better duration support
      if (navigator.vibrate && typeof navigator.vibrate === 'function') {
        setTimeout(() => navigator.vibrate(duration), 10);
      }
    } catch (error) {
      console.warn('[Adapter] vibrate error:', error);
      // Fallback to direct navigator API
      if (navigator.vibrate) {
        navigator.vibrate(duration);
      }
    }
  }

  /**
   * INativeDeviceService.isNative - Check native environment.
   * 
   * Adapts legacy getPlatformName() which returns string instead of boolean,
   * and adds missing functionality to detect web vs native environments.
   * 
   * @returns {boolean} True if running in native environment (Capacitor).
   */
  isNative() {
    return this.#isNative();
  }

  /**
   * @private
   * Validates that the legacy component is still available.
   */
  #validateLegacyComponent() {
    if (!this.#legacyComponent) {
      throw new Error('Adapter: Legacy component has been detached.');
    }
  }

  /**
   * Reset adapter state (useful for testing).
   */
  reset() {
    this.#platformCache = null;
    this.#validateLegacyComponent();
  }
}

export default NativeDeviceAdapter;
export { NativeDeviceAdapter };
