import { llmRepository } from './llmRepository';

const providerConfigBuilders = {
  openrouter: (config) => {
    if (!config?.apiKey || !config?.model) {
      throw new Error("OpenRouter provider requires 'apiKey' and 'model'.");
    }
    return {
      type: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model,
    };
  },
  lmstudio: (config) => {
    if (!config?.lmstudioUrl || !config?.lmstudioModel) {
      throw new Error("LMStudio provider requires 'lmstudioUrl' and 'lmstudioModel'.");
    }
    return {
      type: 'lmstudio',
      url: config.lmstudioUrl,
      model: config.lmstudioModel,
    };
  },
};

/**
 * Сервис-фасад для взаимодействия с LLM API.
 *
 * Назначение: Координирует выбор правильного провайдера и вызывает репозиторий.
 */
export class LLMService {
  /**
   * Создает экземпляр сервиса, используя конфигурацию и тип провайдера.
   * @param {string} providerType - Тип используемого провайдера ('openrouter' или 'lmstudio').
   * @param {Object} config - Конфигурация API (должна содержать необходимые ключи).
   */
  constructor(providerType, config) {
    this.providerType = providerType;
    this.config = config;
  }

  /**
   * Выбирает и выполняет потоковый запрос к LLM провайдеру через llmRepository.
   * @param {Array<Object>} messages - История сообщений для контекста.
   * @returns {AsyncGenerator<{content: string, reasoning_details?: any}>} Генератор чанков ответа.
   */
  async *streamResponse(messages, signal) {
    const buildConfig = providerConfigBuilders[this.providerType];
    if (!buildConfig) {
      throw new Error(`Unsupported LLM provider: ${this.providerType}`);
    }

    const configForRepo = buildConfig(this.config);
    const stream = await llmRepository.sendStreamingRequest(configForRepo, messages, signal);
    yield* stream;
  }
}