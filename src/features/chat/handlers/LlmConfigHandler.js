import { ChatRequestHandler } from './ChatRequestHandler';
import { LLMService } from '../services/llmService';

/**
 * @fileoverview Обработчик, инициализирующий LLMService перед отправкой запроса.
 */
export class LlmConfigHandler extends ChatRequestHandler {
  async handle(request) {
    try {
      const provider = request.providerStore.provider;
      const config = request.providerStore.config;

      if (!config) {
        request.error = 'Конфигурация провайдера не загружена.';
        request.handled = true;
        request.success = false;
        return request;
      }

      request.llmService = new LLMService(provider, config);
    } catch (error) {
      request.error = error.message || 'Не удалось инициализировать сервис LLM.';
      request.handled = true;
      request.success = false;
      return request;
    }

    return this.passToNext(request);
  }
}
