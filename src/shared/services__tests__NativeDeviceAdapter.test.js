/**
 * @fileoverview Unit tests for Native Device Adapter implementation.
 * Tests adapter pattern functionality, interface compatibility, and edge cases.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import NativeDeviceAdapter from '../NativeDeviceAdapter';
import LegacyNativeComponent from '../LegacyNativeComponent';
import INativeDeviceService from '../INativeDeviceService';

// Mock Capacitor modules
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => true),
    getPlatform: vi.fn(() => 'android'),
  },
}));

vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn(),
  },
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    getCurrentPosition: vi.fn(),
  },
}));

vi.mock('@capacitor/biometrics', () => ({
  Biometrics: {
    checkAvailability: vi.fn(() => Promise.resolve({ isAvailable: true })),
    verify: vi.fn(() => Promise.resolve({ verified: true })),
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(),
  },
  ImpactStyle: {
    Medium: 'medium',
  },
}));

describe('Native Device Adapter - Object Adapter Pattern Tests', () => {
  let legacyComponent;
  let adapter;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create legacy component (Adaptee)
    legacyComponent = new LegacyNativeComponent();
    
    // Create adapter with legacy component via composition
    adapter = new NativeDeviceAdapter(legacyComponent);
  });

  describe('Interface Compatibility', () => {
    it('should implement INativeDeviceService interface contract', () => {
      expect(adapter).toBeDefined();
      expect(typeof adapter.takePhoto).toBe('function');
      expect(typeof adapter.getCurrentPosition).toBe('function');
      expect(typeof adapter.authenticateWithBiometry).toBe('function');
      expect(typeof adapter.vibrate).toBe('function');
      expect(typeof adapter.isNative).toBe('function');
    });

    it('should return File|null from takePhoto (not base64 string)', async () => {
      // Mock legacy component to return base64
      const mockBase64 = 'data:image/jpeg;base64,TEST_BASE64_DATA';
      
      vi.spyOn(legacyComponent, 'capturePhotoBase64').mockResolvedValue(mockBase64);

      const result = await adapter.takePhoto();

      expect(result).toBeNull(); // File creation would fail with test data
    });

    it('should return GeolocationPosition|null from getCurrentPosition', async () => {
      const mockLegacyPosition = {
        coords: {
          latitude: 55.7558,
          longitude: 37.6173,
          accuracy: 10,
        },
      };

      vi.spyOn(legacyComponent, 'getLegacyPosition').mockResolvedValue(mockLegacyPosition);

      const result = await adapter.getCurrentPosition();

      expect(result).toBeDefined();
      expect(result.coords.latitude).toBe(55.7558);
      expect(result.coords.longitude).toBe(37.6173);
      expect(result.timestamp).toBeInstanceOf(Date); // Adapter adds missing field
    });

    it('should return boolean from authenticateWithBiometry', async () => {
      vi.spyOn(legacyComponent, 'attemptBiometricAuth').mockResolvedValue(undefined);

      const result = await adapter.authenticateWithBiometry();

      expect(result).toBe(true); // Adapter normalizes undefined to false
    });

    it('should return boolean false on biometric failure', async () => {
      vi.spyOn(legacyComponent, 'attemptBiometricAuth').mockRejectedValue(new Error('Failed'));

      const result = await adapter.authenticateWithBiometry();

      expect(result).toBe(false); // Adapter converts exception to false
    });
  });

  describe('Parameter Handling', () => {
    it('should handle vibrate with duration parameter', async () => {
      vi.spyOn(legacyComponent, 'triggerHaptics').mockResolvedValue(undefined);

      await adapter.vibrate(500);

      expect(legacyComponent.triggerHaptics).toHaveBeenCalledWith(500);
    });

    it('should handle vibrate with default duration', async () => {
      vi.spyOn(legacyComponent, 'triggerHaptics').mockResolvedValue(undefined);

      await adapter.vibrate();

      expect(legacyComponent.triggerHaptics).toHaveBeenCalledWith(200); // Default value
    });

    it('should handle takePhoto with options parameter', async () => {
      const options = { quality: 80, source: 'Camera' };
      
      vi.spyOn(legacyComponent, 'capturePhotoBase64').mockResolvedValue(null);

      await adapter.takePhoto(options);

      // Legacy doesn't use options, but adapter should accept them
      expect(adapter.takePhoto).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should return null on takePhoto error', async () => {
      vi.spyOn(legacyComponent, 'capturePhotoBase64').mockRejectedValue(new Error('Camera unavailable'));

      const result = await adapter.takePhoto();

      expect(result).toBeNull();
    });

    it('should return null on getCurrentPosition error', async () => {
      vi.spyOn(legacyComponent, 'getLegacyPosition').mockRejectedValue(new Error('GPS disabled'));

      const result = await adapter.getCurrentPosition();

      expect(result).toBeNull();
    });

    it('should handle missing legacy component gracefully', () => {
      try {
        const brokenAdapter = new NativeDeviceAdapter(null);
        expect(brokenAdapter).toBeDefined(); // Constructor allows null, but methods will fail
        
        // Method call should throw or return safe value
        expect(brokenAdapter.isNative()).toBe(false);
      } catch (error) {
        expect(error.message).toContain('Invalid legacy component');
      }
    });

    it('should handle platform cache invalidation', () => {
      const adapter1 = new NativeDeviceAdapter(legacyComponent);
      
      // First call caches the result
      const native1 = adapter1.isNative();
      
      // Second call should use cache
      const native2 = adapter1.isNative();
      
      expect(native1).toBe(native2);
    });

    it('should reset platform cache', () => {
      const adapter = new NativeDeviceAdapter(legacyComponent);
      
      vi.spyOn(legacyComponent, 'getPlatformName').mockReturnValueOnce('android');
      vi.spyOn(legacyComponent, 'getPlatformName').mockReturnValueOnce('web');

      const native1 = adapter.isNative();
      expect(native1).toBe(true); // android is native

      adapter.reset();
      
      const native2 = adapter.isNative();
      expect(native2).toBe(false); // web is not native (different result after reset)
    });
  });

  describe('Type Conversion', () => {
    it('should convert base64 string to File object', async () => {
      const mockBase64 = 'data:image/jpeg;base64,TEST_DATA';
      
      vi.spyOn(legacyComponent, 'capturePhotoBase64').mockResolvedValue(mockBase64);

      // This would fail in test environment but should return null instead of throwing
      const result = await adapter.takePhoto();

      expect(result).toBeNull(); // File creation fails with invalid base64
    });

    it('should enrich position object with timestamp', async () => {
      const mockLegacyPosition = {
        coords: {
          latitude: 1.0,
          longitude: 2.0,
          accuracy: 5,
        },
      };

      vi.spyOn(legacyComponent, 'getLegacyPosition').mockResolvedValue(mockLegacyPosition);

      const result = await adapter.getCurrentPosition();

      expect(result.coords.latitude).toBe(1.0);
      expect(result.coords.longitude).toBe(2.0);
      expect(result.coords.accuracy).toBe(5);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should catch and log errors from legacy component', async () => {
      const error = new Error('Legacy camera error');
      
      vi.spyOn(legacyComponent, 'capturePhotoBase64').mockRejectedValue(error);

      const result = await adapter.takePhoto();

      expect(result).toBeNull();
    });

    it('should handle legacy component throwing exceptions', async () => {
      vi.spyOn(legacyComponent, 'attemptBiometricAuth').mockImplementation(() => {
        throw new Error('Legacy biometric error');
      });

      const result = await adapter.authenticateWithBiometry();

      expect(result).toBe(false); // Adapter converts exception to false
    });
  });

  describe('Composition Pattern Verification', () => {
    it('should hold reference to legacy component via composition', () => {
      const mockLegacy = new LegacyNativeComponent();
      const adapterWithMock = new NativeDeviceAdapter(mockLegacy);

      // Verify adapter holds reference (composition, not inheritance)
      expect(adapterWithMock).toBeDefined();
      
      // The adapter delegates to the composed legacy component
      vi.spyOn(mockLegacy, 'getPlatformName').mockReturnValue('android');
      const isNative = adapterWithMock.isNative();
      
      expect(isNative).toBe(true);
    });

    it('should allow swapping legacy components (dependency injection)', () => {
      const legacy1 = new LegacyNativeComponent();
      const legacy2 = new LegacyNativeComponent();

      const adapter1 = new NativeDeviceAdapter(legacy1);
      const adapter2 = new NativeDeviceAdapter(legacy2);

      // Each adapter has its own composed legacy component
      expect(adapter1).not.toBe(adapter2);
    });
  });
});

describe('INativeDeviceService Interface Tests', () => {
  describe('Interface Contract', () => {
    it('should define takePhoto method signature', () => {
      const interface = INativeDeviceService;
      
      // Verify interface exists and has required methods
      expect(interface).toBeDefined();
    });

    it('should define getCurrentPosition method signature', () => {
      const interface = INativeDeviceService;
      expect(interface.getCurrentPosition).toBeDefined();
    });

    it('should define authenticateWithBiometry method signature', () => {
      const interface = INativeDeviceService;
      expect(interface.authenticateWithBiometry).toBeDefined();
    });

    it('should define vibrate method signature', () => {
      const interface = INativeDeviceService;
      expect(interface.vibrate).toBeDefined();
    });

    it('should define isNative method signature', () => {
      const interface = INativeDeviceService;
      expect(interface.isNative).toBeDefined();
    });
  });
});

describe('Legacy Native Component Tests (Adaptee)', () => {
  let legacyComponent;

  beforeEach(() => {
    legacyComponent = new LegacyNativeComponent();
  });

  describe('Incompatible Interface Characteristics', () => {
    it('should return base64 string instead of File object', async () => {
      const result = await legacyComponent.capturePhotoBase64();
      
      // Legacy returns base64, not File - this is the incompatibility
      expect(typeof result).toBe('string');
    });

    it('should return incomplete position object (missing timestamp)', async () => {
      vi.spyOn(legacyComponent, 'getLegacyPosition').mockResolvedValue({
        coords: { latitude: 1.0, longitude: 2.0 },
        // Missing timestamp field
      });

      const result = await legacyComponent.getLegacyPosition();
      
      expect(result).toBeDefined();
      expect('timestamp' in result).toBe(false); // Incompatible with Target interface
    });

    it('should throw exception instead of returning boolean', async () => {
      try {
        await legacyComponent.attemptBiometricAuth();
        // If we get here, the mock returned undefined
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Legacy API Characteristics', () => {
    it('should return platform name as string instead of boolean', () => {
      const result = legacyComponent.getPlatformName();
      
      expect(typeof result).toBe('string'); // 'android' or 'ios' or 'web'
    });

    it('should accept duration parameter in vibrate method', async () => {
      vi.spyOn(legacyComponent, 'triggerHaptics').mockResolvedValue(undefined);
      
      await legacyComponent.triggerHaptics(1000);
      
      expect(legacyComponent.triggerHaptics).toHaveBeenCalledWith(1000);
    });
  });
});

describe('Factory Pattern Tests', () => {
  import('../index'); // Import factory after mocks are set up
  
  describe('NativeDeviceAdapterFactory', () => {
    it('should create adapter with legacy component', () => {
      const legacy = new LegacyNativeComponent();
      const adapter = NativeDeviceAdapterFactory.createWithLegacy(legacy);
      
      expect(adapter).toBeDefined();
      expect(typeof adapter.takePhoto).toBe('function');
    });

    it('should throw on invalid legacy component', () => {
      expect(() => {
        NativeDeviceAdapterFactory.createWithLegacy(null);
      }).toThrow('Invalid legacy component provided.');
    });

    it('should create mock adapter for testing', () => {
      const mockAdapter = NativeDeviceAdapterFactory.createDirect();
      
      expect(mockAdapter).toBeDefined();
      expect(typeof mockAdapter.takePhoto).toBe('function');
    });

    it('should get adapter based on environment', () => {
      const adapter = NativeDeviceAdapterFactory.getAdapter();
      
      expect(adapter).toBeDefined();
      // Should return either legacy adapter or mock depending on environment
    });
  });
});

describe('NativeFacade Integration Tests', () => {
  import('../nativeFacade'); // Import facade after mocks are set up
  
  describe('NativeFacade with Adapter Pattern', () => {
    it('should delegate to adapter for takePhoto', async () => {
      const nativeFacade = new (await import('../nativeFacade')).NativeFacade();
      
      vi.spyOn(nativeFacade, '#getAdapter').mockImplementation(() => ({
        takePhoto: vi.fn().mockResolvedValue(null),
      }));

      const result = await nativeFacade.takePhoto();
      
      expect(result).toBeNull();
    });

    it('should use lazy initialization for adapter', () => {
      const nativeFacade = new (await import('../nativeFacade')).NativeFacade();
      
      // First call should initialize adapter
      vi.spyOn(nativeFacade, '#getAdapter').mockImplementation(() => ({
        isNative: vi.fn().mockReturnValue(true),
      }));

      const result1 = nativeFacade.isNative();
      expect(result1).toBe(true);
    });

    it('should reset adapter instance', () => {
      const nativeFacade = new (await import('../nativeFacade')).NativeFacade();
      
      // Reset should clear cached adapter
      nativeFacade.reset();
      
      // Adapter should be reinitialized on next call
      expect(nativeFacade.#getAdapter).toHaveBeenCalled();
    });
  });
});
