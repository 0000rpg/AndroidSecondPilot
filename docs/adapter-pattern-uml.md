# Adapter Pattern Implementation - UML Diagram

## Overview

This document describes the Object Adapter Pattern implementation for integrating legacy native components with modern system architecture.

## Class Diagram (Mermaid)

```mermaid
classDiagram
    %% Target Interface
    class INativeDeviceService {
        <<interface>>
        +takePhoto(options): Promise~File|null~
        +getCurrentPosition(): Promise~GeolocationPosition|null~
        +authenticateWithBiometry(): Promise<boolean>
        +vibrate(duration): Promise<void>
        +isNative(): boolean
    }

    %% Adaptee - Legacy Component with incompatible interface
    class LegacyNativeComponent {
        +capturePhotoBase64(): Promise~string|null~
        +getLegacyPosition(): Promise~GeolocationPosition|null~
        +attemptBiometricAuth(): Promise<void>
        +triggerHaptics(duration): Promise<void>
        +getPlatformName(): string
    }

    %% Adapter - Bridges Target and Adaptee using composition
    class NativeDeviceAdapter {
        -#legacyComponent: LegacyNativeComponent
        -#platformCache: boolean
        -#cacheExpiryTime: number
        +takePhoto(options): Promise~File|null~
        +getCurrentPosition(): Promise~GeolocationPosition|null~
        +authenticateWithBiometry(): Promise<boolean>
        +vibrate(duration): Promise<void>
        +isNative(): boolean
        +reset()
    }

    %% Factory for dependency injection
    class NativeDeviceAdapterFactory {
        +createWithLegacy(legacy): INativeDeviceService
        +createDirect(): INativeDeviceService
        +getAdapter(): INativeDeviceService
    }

    %% Mock adapter for testing
    class MockNativeDeviceAdapter {
        +takePhoto(): Promise~File|null~
        +getCurrentPosition(): Promise~GeolocationPosition|null~
        +authenticateWithBiometry(): Promise<boolean>
        +vibrate(duration): Promise<void>
        +isNative(): boolean
    }

    %% Facade - High-level interface for clients
    class NativeFacade {
        -#adapter: INativeDeviceService
        +takePhoto(): Promise~File|null~
        +getCurrentPosition(): Promise~GeolocationPosition|null~
        +authenticateWithBiometry(): Promise<boolean>
        +vibrate(duration): Promise<void>
        +isNative(): boolean
        +reset()
    }

    %% Relationships
    INativeDeviceService ..|> NativeDeviceAdapter : implements (Target)
    NativeDeviceAdapter *-- LegacyNativeComponent : composition (Adaptee)
    NativeDeviceAdapterFactory --> NativeDeviceAdapter : creates
    NativeDeviceAdapterFactory --> MockNativeDeviceAdapter : creates for testing
    NativeFacade ..> INativeDeviceService : uses via adapter
    
    note for NativeDeviceAdapter "Uses Composition over Inheritance\nHolds reference to Adaptee"
    note for LegacyNativeComponent "Legacy API with incompatible methods:\n- Returns base64 instead of File\n- Missing timestamp field\n- Throws exceptions instead of returning boolean"
    note for INativeDeviceService "Target interface - contract expected by client"
```

## Sequence Diagram (Mermaid)

```mermaid
sequenceDiagram
    participant Client as Application/Client
    participant Facade as NativeFacade
    participant Adapter as NativeDeviceAdapter
    participant Legacy as LegacyNativeComponent
    
    Note over Client,Legacy: Request to capture photo
    
    Client->>Facade: takePhoto()
    Facade->>Facade: #getAdapter()
    
    alt First call - lazy initialization
        Facade->>AdapterFactory: getAdapter()
        Factory->>Legacy: new LegacyNativeComponent()
        Factory-->>Facade: NativeDeviceAdapter(legacy)
    end
    
    Adapter->>Legacy: capturePhotoBase64()
    Note over Legacy: Returns base64 string (incompatible)
    
    Adapter->>Adapter: #convertBase64ToFile(base64)
    Note over Adapter: Type conversion logic
    
    Adapter-->>Facade: File|null
    Facade-->>Client: Photo file or null
```

## Component Relationships

### 1. Target Interface (INativeDeviceService)
- **Role**: Defines the contract expected by client code
- **Responsibility**: Specifies methods and return types that must be supported
- **Implementation**: Implemented by Adapter class

### 2. Adaptee (LegacyNativeComponent)
- **Role**: Existing legacy component with incompatible interface
- **Characteristics**: 
  - Uses older API patterns
  - Returns different data types (base64 vs File)
  - Missing required fields (timestamp)
  - Exception-based error handling instead of boolean returns

### 3. Adapter (NativeDeviceAdapter)
- **Role**: Bridges Target and Adaptee using composition
- **Key Features**:
  - Holds reference to LegacyNativeComponent via constructor injection
  - Translates incompatible return types
  - Adds missing functionality
  - Handles parameter discrepancies
  - Provides state isolation through caching

### 4. Factory (NativeDeviceAdapterFactory)
- **Role**: Creates adapter instances with dependency injection
- **Benefits**:
  - Decouples client from concrete adapter implementation
  - Enables testing with mock adapters
  - Supports runtime adapter selection

## Pattern Justification

### Why Object Adapter Pattern?

1. **Composition over Inheritance**: More flexible and testable than Class Adapter pattern
2. **Single Responsibility**: Each class has one clear purpose
3. **Open/Closed Principle**: Easy to add new adapters without modifying existing code
4. **Dependency Injection**: Facilitates testing and configuration flexibility

### Trade-offs

| Aspect | Benefit | Cost |
|--------|---------|------|
| Flexibility | Can swap implementations easily | Slightly more complex initialization |
| Testability | Mocking is straightforward | Requires factory pattern setup |
| Maintainability | Clear separation of concerns | More files to manage |
| Performance | Minimal overhead (just method forwarding) | Caching adds memory usage |

## Usage Example

```javascript
import { NativeDeviceAdapterFactory } from './shared/services';

// Option 1: Automatic adapter selection
const service = NativeDeviceAdapterFactory.getAdapter();
await service.takePhoto();

// Option 2: Explicit legacy component adaptation
import LegacyNativeComponent from './LegacyNativeComponent';
const legacy = new LegacyNativeComponent();
const adapter = NativeDeviceAdapterFactory.createWithLegacy(legacy);

// Option 3: For testing - use mock implementation
const testAdapter = NativeDeviceAdapterFactory.createDirect();
```

## Files Created/Modified

1. `INativeDeviceService.js` - Target interface definition
2. `LegacyNativeComponent.js` - Adaptee with legacy methods
3. `NativeDeviceAdapter.js` - Object adapter implementation
4. `index.js` - Updated exports and factory pattern
5. `nativeFacade.js` - Facade using adapter pattern
6. `adapter-pattern-uml.md` - This documentation
