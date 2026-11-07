import { LlmConfigBuilder } from './LlmConfigBuilder';

/**
 * @fileoverview Построитель конфигурации для OpenRouter.
 */
export class OpenRouterConfigBuilder extends LlmConfigBuilder {
  build(rawConfig) {
    if (!rawConfig?.apiKey || !rawConfig?.model) {
      throw new Error("OpenRouter provider requires 'apiKey' and 'model'.");
    }

    return {
      type: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: rawConfig.apiKey,
      model: rawConfig.model,
    };
  }
}
