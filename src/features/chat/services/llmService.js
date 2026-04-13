import { llmRepository } from './llmRepository';

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
  async *streamResponse(messages) {
    let configForRepo;

    // Логика выбора конфигурации остается здесь (Фасад), но не реализуется в классах-обертках.
    if (this.providerType === 'openrouter') {
      if (!this.config?.apiKey || !this.config?.model) {
        throw new Error("OpenRouter provider requires 'apiKey' and 'model'.");
      }
      configForRepo = {
        type: 'openrouter',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey: this.config.apiKey,
        model: this.config.model,
      };
    } else if (this.providerType === 'lmstudio') {
      if (!this.config?.lmstudioUrl || !this.config?.lmstudioModel) {
        throw new Error("LMStudio provider requires 'lmstudioUrl' and 'lmstudioModel'.");
      }
      configForRepo = {
        type: 'lmstudio', // Используем тип, который распознает llmRepository
        url: this.config.lmstudioUrl,
        model: this.config.lmstudioModel,
      };
    } else {
      throw new Error(`Unsupported LLM provider: ${this.providerType}`);
    }

    // Делегируем всю сложную логику API-вызова и парсинга в llmRepository.js
    const stream = await llmRepository.sendStreamingRequest(configForRepo, messages);
    yield* stream;
  }
}