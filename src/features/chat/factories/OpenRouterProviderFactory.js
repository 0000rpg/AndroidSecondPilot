import { LlmProviderFactory } from './LlmProviderFactory';
import { OpenRouterConfigBuilder } from '../builders/OpenRouterConfigBuilder';
import { OpenRouterProvider } from '../services/llmRepository';

/**
 * @fileoverview Фабрика семейства OpenRouter.
 */
export class OpenRouterProviderFactory extends LlmProviderFactory {
  createConfigBuilder() {
    return new OpenRouterConfigBuilder();
  }

  createProvider(config) {
    return new OpenRouterProvider(config);
  }
}
