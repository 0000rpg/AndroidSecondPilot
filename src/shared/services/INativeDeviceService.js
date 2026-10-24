/**
 * @fileoverview Target Interface for Native Device Services.
 * Defines the contract that all native device service implementations must satisfy.
 * This interface represents what the client (application) expects from native capabilities.
 */

/**
 * @typedef {Object} INativeDeviceService
 * @property {(options?: PhotoOptions) => Promise<File|null>} takePhoto - Capture photo using camera
 * @property {() => Promise<GeolocationPosition|null>} getCurrentPosition - Get current device location
 * @property {() => Promise<boolean>} authenticateWithBiometry - Authenticate user with biometric data
 * @property {(duration?: number) => Promise<void>} vibrate - Trigger device haptic feedback
 * @property {() => boolean} isNative - Check if running in native environment (Capacitor)
 */

/**
 * @typedef {Object} PhotoOptions
 * @property {number} [quality=90] - Image quality percentage
 * @property {boolean} [allowEditing=false] - Allow photo editing before capture
 * @property {'Camera'|'PhotoLibrary'} [source='Camera'] - Camera or photo library source
 */

/**
 * @typedef {Object} GeolocationPosition
 * @property {number} coords.latitude - Latitude coordinate
 * @property {number} coords.longitude - Longitude coordinate
 * @property {number} coords.accuracy - Accuracy in meters
 * @property {Date} timestamp - Timestamp of position fix
 */

/**
 * Interface definition for native device service capabilities.
 * This serves as the Target interface that the Adapter will implement.
 */
export class INativeDeviceService {
  /**
   * Capture a photo using the device camera.
   * @param {PhotoOptions} [options] - Optional configuration for photo capture.
   * @returns {Promise<File|null>} Resolved File object or null on error.
   */
  async takePhoto(options) {}

  /**
   * Get current geolocation position from device GPS.
   * @returns {Promise<GeolocationPosition|null>} Position data or null on error.
   */
  async getCurrentPosition() {}

  /**
   * Authenticate user using biometric methods (fingerprint, face ID).
   * @returns {Promise<boolean>} True if authentication succeeded.
   */
  async authenticateWithBiometry() {}

  /**
   * Trigger haptic feedback on the device.
   * @param {number} [duration=200] - Duration in milliseconds (legacy parameter, may be ignored).
   * @returns {Promise<void>}
   */
  async vibrate(duration) {}

  /**
   * Check if currently running in native environment (Capacitor/Cordova).
   * @returns {boolean} True if native platform detected.
   */
  isNative() {}
}

export default INativeDeviceService;
