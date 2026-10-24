/**
 * @fileoverview Legacy Native Component (Adaptee).
 * Represents legacy native capabilities with incompatible interface or missing functionality.
 * This component uses older APIs that need to be adapted for the new Target interface.
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Biometrics } from '@capacitor/biometrics';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Legacy Native Component - Adaptee.
 * Contains legacy methods with incompatible signatures or missing functionality.
 * The Adapter will wrap this to provide the Target interface.
 */
class LegacyNativeComponent {
  /**
   * Constructor for legacy component.
   */
  constructor() {}

  /**
   * LEGACY: Capture photo - returns base64 string instead of File object.
   * This is incompatible with the Target interface which expects File|null.
   * @returns {Promise<string|null>} Base64 encoded image or null on error.
   */
  async capturePhotoBase64() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64, // LEGACY: returns base64 instead of URI/File
        source: CameraSource.Camera,
      });

      if (!photo.base64String) return null;

      // LEGACY: Returns base64 string instead of File object
      const header = 'data:image/jpeg;base64,';
      return header + photo.base64String;
    } catch (error) {
      console.error('Legacy capturePhotoBase64 error:', error);
      return null;
    }
  }

  /**
   * LEGACY: Get position - returns legacy format with different structure.
   * Missing timestamp field that Target interface requires.
   * @returns {Promise<GeolocationPosition|null>} Legacy position object or null.
   */
  async getLegacyPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();

      // LEGACY: Returns incomplete position object (missing timestamp)
      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        // Missing: timestamp field required by Target interface
      };
    } catch (error) {
      console.error('Legacy getLegacyPosition error:', error);
      return null;
    }
  }

  /**
   * LEGACY: Biometric auth - throws exception on failure instead of returning boolean.
   * This violates the Target interface contract which expects Promise<boolean>.
   * @returns {Promise<void>} Throws on failure (incompatible with Target).
   */
  async attemptBiometricAuth() {
    try {
      const available = await Biometrics.checkAvailability();
      if (!available.isAvailable) {
        console.warn('Legacy: Биометрия недоступна');
        return; // Returns undefined instead of false
      }

      const result = await Biometrics.verify({
        reason: 'Подтвердите личность для входа',
        title: 'Биометрическая аутентификация',
      });

      if (result.verified) {
        console.log('Legacy: Биометрия успешна');
        return; // Returns undefined instead of true
      } else {
        throw new Error('Biometric verification failed'); // Throws instead of returning false
      }
    } catch (error) {
      console.error('Legacy biometric auth error:', error);
      throw error; // Throws exception instead of returning false
    }
  }

  /**
   * LEGACY: Vibrate - uses deprecated API with different signature.
   * The old vibrate() method doesn't accept duration parameter properly.
   * @param {number} [duration=200] - Duration in milliseconds (legacy behavior).
   * @returns {Promise<void>}
   */
  async triggerHaptics(duration = 200) {
    try {
      // LEGACY: Haptics.impact() doesn't support duration, only style
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      // Additional vibration using legacy navigator API if available
      if (navigator.vibrate) {
        setTimeout(() => navigator.vibrate(duration), 10);
      }
    } catch (error) {
      console.warn('Legacy haptics error:', error);
      // Fallback to navigator.vibrate with duration support
      if (navigator.vibrate) {
        navigator.vibrate(duration);
      }
    }
  }

  /**
   * LEGACY: Check native platform - returns string instead of boolean.
   * @returns {'android'|'ios'|'web'} Platform name as string (incompatible).
   */
  getPlatformName() {
    return Capacitor.getPlatform(); // Returns 'android', 'ios', or 'web' as string
  }

  /**
   * LEGACY: Missing method - no way to check if running in native environment.
   * This functionality needs to be added by the Adapter.
   */
}

export const legacyNativeComponent = new LegacyNativeComponent();
export default LegacyNativeComponent;
