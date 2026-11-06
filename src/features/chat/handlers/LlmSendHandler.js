import { ChatRequestHandler } from './ChatRequestHandler';
import { MessageSender } from '../managers/MessageSender';

/**
 * @fileoverview Обработчик, отправляющий сообщение в LLM и обрабатывающий ответ.
 */
export class LlmSendHandler extends ChatRequestHandler {
  async handle(request) {
    const { store, chat, content, llmService } = request;

    store.streaming = true;
    store.sendError = null;

    const sender = new MessageSender(store, chat, content, llmService);

    try {
      await sender.compute();
      request.success = true;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      request.error = error.message || 'Неизвестная ошибка при генерации ответа.';
      request.success = false;

      if (
        chat.messages[sender.assistantIndex] === sender.assistantPlaceholder ||
        chat.messages[sender.assistantIndex]?.role === 'assistant'
      ) {
        chat.messages.splice(sender.assistantIndex, 1);
        chat.updatedAt = new Date().toISOString();
      }
    } finally {
      store.streaming = false;
      request.handled = true;
    }

    return request;
  }
}
