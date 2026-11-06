import { ChatRequestHandler } from './ChatRequestHandler';

/**
 * @fileoverview Обработчик, отклоняющий пустые сообщения.
 */
export class EmptyMessageHandler extends ChatRequestHandler {
  async handle(request) {
    if (!request.content || !request.content.trim()) {
      request.error = 'Пустое сообщение не отправляется.';
      request.handled = true;
      request.success = false;
      return request;
    }

    return this.passToNext(request);
  }
}
