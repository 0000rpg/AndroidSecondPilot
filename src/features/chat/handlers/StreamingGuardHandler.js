import { ChatRequestHandler } from './ChatRequestHandler';

/**
 * @fileoverview Обработчик, запрещающий отправку сообщения во время генерации ответа.
 */
export class StreamingGuardHandler extends ChatRequestHandler {
  async handle(request) {
    if (request.store.streaming) {
      request.error = 'Ассистент ещё отвечает. Дождитесь завершения генерации.';
      request.handled = true;
      request.success = false;
      return request;
    }

    return this.passToNext(request);
  }
}
