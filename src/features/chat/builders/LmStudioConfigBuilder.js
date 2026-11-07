import { LlmConfigBuilder } from './LlmConfigBuilder';

/**
 * @fileoverview Построитель конфигурации для LM Studio.
 */
export class LmStudioConfigBuilder extends LlmConfigBuilder {
  build(rawConfig) {
    if (!rawConfig?.lmstudioUrl || !rawConfig?.lmstudioModel) {
      throw new Error("LMStudio provider requires 'lmstudioUrl' and 'lmstudioModel'.");
    }

    return {
      type: 'lmstudio',
      url: rawConfig.lmstudioUrl,
      model: rawConfig.lmstudioModel,
    };
  }
}
