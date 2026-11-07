import { LlmProviderFactory } from './LlmProviderFactory';
import { LmStudioConfigBuilder } from '../builders/LmStudioConfigBuilder';
import { LmStudioProvider } from '../services/llmRepository';

/**
 * @fileoverview Фабрика семейства LM Studio.
 */
export class LmStudioProviderFactory extends LlmProviderFactory {
  createConfigBuilder() {
    return new LmStudioConfigBuilder();
  }

  createProvider(config) {
    return new LmStudioProvider(config);
  }
}
