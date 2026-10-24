# Adapter Pattern Implementation Guide

## Quick Start

```javascript
import { NativeDeviceAdapterFactory } from './shared/services';

// Get adapter (auto-selects based on environment)
const service = NativeDeviceAdapterFactory.getAdapter();

// Use through Target interface
await service.takePhoto();
await service.getCurrentPosition();
await service.authenticateWithBiometry();
await service.vibrate(200);
console.log('Native:', service.isNative());
```

## Architecture Overview

### Pattern Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (LoginView, ChatView, SettingsView, etc.)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  NativeFacade (Facade Pattern)               │
│  - Lazy adapter initialization                               │
│  - Error handling and logging                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              INativeDeviceService (Target Interface)         │
│  Contract expected by all client code                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           NativeDeviceAdapter (Object Adapter Pattern)       │
│  - Composition with LegacyNativeComponent                    │
│  - Type conversion and enrichment                            │
│  - Error normalization                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         LegacyNativeComponent (Adaptee)                     │
│  - Capacitor native APIs                                     │
│  - Legacy method signatures                                  │
│  - Incompatible return types                                 │
└─────────────────────────────────────────────────────────────┘
```

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| `INativeDeviceService.js` | Target interface definition | `src/shared/services/` |
| `LegacyNativeComponent.js` | Adaptee with legacy methods | `src/shared/services/` |
| `NativeDeviceAdapter.js` | Object adapter implementation | `src/shared/services/` |
| `index.js` | Factory and exports | `src/shared/services/` |
| `nativeFacade.js` | Facade using adapter pattern | `src/shared/services/` |

## Usage Patterns

### Pattern 1: Automatic Adapter Selection (Recommended)

```javascript
import { NativeDeviceAdapterFactory } from './shared/services';

// Factory automatically selects appropriate implementation
const service = NativeDeviceAdapterFactory.getAdapter();

// Works in both web and native environments
await service.takePhoto(); // Returns File|null
await service.getCurrentPosition(); // Returns GeolocationPosition|null
```

### Pattern 2: Explicit Legacy Component Adaptation

```javascript
import { NativeDeviceAdapterFactory } from './shared/services';
import LegacyNativeComponent from './LegacyNativeComponent';

// Create legacy component instance
const legacy = new LegacyNativeComponent();

// Wrap with adapter
const adapter = NativeDeviceAdapterFactory.createWithLegacy(legacy);

// Use through Target interface
await adapter.takePhoto({ quality: 80 });
```

### Pattern 3: Mock Adapter for Testing

```javascript
import { NativeDeviceAdapterFactory } from './shared/services';

// For unit tests - use mock implementation
const testService = NativeDeviceAdapterFactory.createDirect();

// Mock always returns false for isNative()
testService.isNative(); // false (web environment)

// Mock provides consistent behavior across platforms
await testService.getCurrentPosition(); // Returns mock position
```

### Pattern 4: Custom Adapter Implementation

```javascript
import { INativeDeviceService } from './shared/services';

class MyCustomAdapter implements INativeDeviceService {
  async takePhoto() {
    // Custom implementation using different API
    const photo = await customCameraAPI.capture();
    return new File([photo], 'custom.jpg', { type: 'image/jpeg' });
  }
  
  // Implement other interface methods...
}

// Use custom adapter
const service = NativeDeviceAdapterFactory.createWithLegacy(myCustomAdapter);
```

## Interface Contract

### INativeDeviceService Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `takePhoto(options)` | `{quality, source}` | `Promise<File\|null>` | Capture photo from camera or library |
| `getCurrentPosition()` | - | `Promise<GeolocationPosition\|null>` | Get current GPS position |
| `authenticateWithBiometry()` | - | `Promise<boolean>` | Verify with biometric data |
| `vibrate(duration)` | `number` (ms) | `Promise<void>` | Trigger haptic feedback |
| `isNative()` | - | `boolean` | Check if running in native environment |

### GeolocationPosition Structure

```javascript
{
  coords: {
    latitude: number,      // GPS latitude (-90 to 90)
    longitude: number,     // GPS longitude (-180 to 180)
    accuracy: number       // Accuracy in meters
  },
  timestamp: Date          // When position was obtained
}
```

## Error Handling

### Adapter Error Strategy

The adapter follows a **fail-safe** approach:

| Scenario | Behavior |
|----------|----------|
| Legacy method throws exception | Caught and converted to `false` or `null` |
| Legacy method returns undefined | Normalized to appropriate default value |
| Type conversion fails | Returns `null` instead of throwing |
| Platform unavailable | Logs warning, returns safe default |

### Example Error Flow

```javascript
// Legacy component throws exception
legacyComponent.attemptBiometricAuth() // Throws: "Biometric failed"

// Adapter catches and normalizes
await adapter.authenticateWithBiometry() // Returns: false (not throwing)

// Client code handles gracefully
const authenticated = await service.authenticateWithBiometry();
if (!authenticated) {
  console.log('Authentication failed, showing fallback login');
}
```

## Testing Guide

### Running Tests

```bash
# Install dependencies if not already done
npm install

# Run adapter pattern tests
npx vitest run src/shared/services__tests__NativeDeviceAdapter.test.js

# Watch mode for development
npx vitest src/shared/services__tests__NativeDeviceAdapter.test.js --watch
```

### Test Coverage Targets

| Component | Target Coverage | Current Status |
|-----------|-----------------|----------------|
| Interface Contract | 100% | ✅ |
| Type Conversion | 95%+ | ✅ |
| Error Handling | 90%+ | ✅ |
| Composition Pattern | 100% | ✅ |

### Writing Adapter Tests

```javascript
import NativeDeviceAdapter from './NativeDeviceAdapter';
import LegacyNativeComponent from './LegacyNativeComponent';

describe('Adapter Type Conversion', () => {
  it('should convert base64 to File object', async () => {
    const legacy = new LegacyNativeComponent();
    
    // Mock legacy method
    vi.spyOn(legacy, 'capturePhotoBase64')
      .mockResolvedValue('data:image/jpeg;base64,TEST');
    
    const adapter = new NativeDeviceAdapter(legacy);
    const result = await adapter.takePhoto();
    
    expect(result).toBeInstanceOf(File); // Adapter converts type
  });
});
```

## Migration Guide

### From Old Code to New Adapter Pattern

**Before (Direct Legacy Usage):**
```javascript
// Direct use of legacy component - incompatible with new architecture
const photoBase64 = await legacyComponent.capturePhotoBase64();
console.log(photoBase64); // Base64 string, not File object
```

**After (Adapter Pattern):**
```javascript
// Use through adapter - compatible interface
const service = NativeDeviceAdapterFactory.getAdapter();
const photoFile = await service.takePhoto();
console.log(photoFile); // File object with proper metadata
```

### Updating Existing Code

1. **Replace direct legacy calls:**
   ```javascript
   // Old: Direct legacy usage
   const position = await legacyComponent.getLegacyPosition();
   
   // New: Through adapter
   const service = NativeDeviceAdapterFactory.getAdapter();
   const position = await service.getCurrentPosition();
   ```

2. **Update error handling:**
   ```javascript
   // Old: Try-catch for exceptions
   try {
     await legacyComponent.attemptBiometricAuth();
   } catch (error) {
     console.error(error);
   }
   
   // New: Adapter returns boolean directly
   const authenticated = await service.authenticateWithBiometry();
   if (!authenticated) {
     // Handle failure
   }
   ```

## Best Practices

### ✅ DO

- Use factory pattern for adapter creation (`NativeDeviceAdapterFactory`)
- Implement interface contract in all adapters
- Add error handling and logging at facade level
- Test with mock adapters for unit tests
- Cache expensive operations (platform detection)

### ❌ DON'T

- Call legacy methods directly without going through adapter
- Modify legacy component to match new interface (breaks encapsulation)
- Ignore type conversion requirements (base64 → File)
- Assume all legacy methods work identically in all environments
- Forget to reset cached state during testing

## Troubleshooting

### Issue: Adapter returns null unexpectedly

**Cause**: Legacy method throwing exception or returning undefined  
**Solution**: Check adapter error logs, verify legacy component availability

```javascript
// Enable debug logging
console.log('[Adapter] Running in native environment'); // Should appear on first call
```

### Issue: Platform detection inconsistent

**Cause**: Capacitor not properly initialized  
**Solution**: Ensure Capacitor is installed and synced

```bash
npm install @capacitor/core @capacitor/camera @capacitor/geolocation
npx cap sync
```

### Issue: Tests fail with "Invalid legacy component"

**Cause**: Legacy component not instantiated correctly  
**Solution**: Verify constructor call in test setup

```javascript
// Correct instantiation
const legacy = new LegacyNativeComponent(); // Not null or undefined
const adapter = new NativeDeviceAdapter(legacy);
```

## Performance Considerations

### Caching Strategy

The adapter caches platform detection to avoid repeated Capacitor calls:

- **Cache Duration**: 5 minutes (300,000 ms)
- **Reset Method**: Call `adapter.reset()` or `facade.reset()`
- **Memory Impact**: Minimal (single boolean value)

### Lazy Initialization

Adapter is created on first use to avoid unnecessary instantiation:

```javascript
// First call - creates adapter
await service.takePhoto(); // Adapter initialized here

// Subsequent calls - uses cached adapter
await service.getCurrentPosition(); // No new initialization
```

## Security Considerations

### Biometric Authentication

The adapter handles biometric security properly:

- Uses Capacitor's secure biometric API
- Returns boolean (not sensitive data)
- Handles failures gracefully without exposing implementation details

### File Handling

Photo capture follows security best practices:

- Validates base64 string before conversion
- Uses proper MIME type detection
- Sanitizes file names with timestamps

## Version Compatibility

| Environment | Supported | Notes |
|-------------|-----------|-------|
| Capacitor 3.x+ | ✅ Yes | Full native support |
| Capacitor 5.x+ | ✅ Yes | Recommended version |
| Web (Browser) | ⚠️ Limited | Falls back to mock adapter |
| Cordova | ⚠️ Partial | May require custom adapter |

## Support & Resources

### Documentation Files

- `adapter-pattern-uml.md` - Visual diagrams and architecture
- `adapter-pattern-report.md` - Detailed implementation report
- This file (`ADAPTER_PATTERN_README.md`) - Quick reference guide

### Related Patterns Used

- **Facade Pattern**: NativeFacade simplifies adapter usage
- **Factory Pattern**: NativeDeviceAdapterFactory creates adapters
- **Dependency Injection**: Constructor injection for testability

---

**Last Updated**: October 24, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
