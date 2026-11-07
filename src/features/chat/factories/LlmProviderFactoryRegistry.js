import { OpenRouterProviderFactory } from './OpenRouterProviderFactory';
import { LmStudioProviderFactory } from './LmStudioProviderFactory';

/**
 * @fileoverview Реестр конкретных фабрик провайдеров LLM.
 */
const factories = {
  openrouter: new OpenRouterProviderFactory(),
  lmstudio: new LmStudioProviderFactory(),
  openai: new LmStudioProviderFactory(),
};

export class LlmProviderFactoryRegistry {
  /**
   * Возвращает фабрику для указанного типа провайдера.
   * @param {string} providerType
   * @returns {LlmProviderFactory}
   */
  static getFactory(providerType) {
    const factory = factories[providerType];

    if (!factory) {
      throw new Error(`Неподдерживаемый тип провайдера: ${providerType}`);
    }

    return factory;
  }
}
