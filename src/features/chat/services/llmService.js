import { llmRepository } from './llmRepository';
import { LlmProviderFactoryRegistry } from '../factories/LlmProviderFactoryRegistry';

/**
 * Сервис-фасад для взаимодействия с LLM API.
 *
 * Назначение: координирует выбор семейства провайдера и вызывает репозиторий.
 */
export class LLMService {
  /**
   * Создает экземпляр сервиса, используя конфигурацию и тип провайдера.
   * @param {string} providerType - Тип используемого провайдера.
   * @param {Object} config - Конфигурация API.
   */
  constructor(providerType, config) {
    this.providerType = providerType;
    this.config = config;
  }

  /**
   * Выбирает и выполняет потоковый запрос к LLM провайдеру через llmRepository.
   * @param {Array<Object>} messages - История сообщений для контекста.
   * @param {AbortSignal} signal - Сигнал отмены запроса.
   * @returns {AsyncGenerator<{content: string, reasoning_details?: any}>}
   */
  async *streamResponse(messages, signal) {
    const factory = LlmProviderFactoryRegistry.getFactory(this.providerType);
    const builder = factory.createConfigBuilder();
    const configForRepo = builder.build(this.config);

    const stream = await llmRepository.sendStreamingRequest(
      configForRepo,
      messages,
      signal,
      factory
    );

    yield* stream;
  }
}
