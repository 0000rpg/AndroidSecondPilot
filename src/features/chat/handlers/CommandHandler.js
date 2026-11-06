import { ChatRequestHandler } from './ChatRequestHandler';

/**
 * @fileoverview Обработчик команд чата (/clear, /new).
 */
export class CommandHandler extends ChatRequestHandler {
  async handle(request) {
    const command = request.content.trim().toLowerCase();

    if (command === '/clear') {
      request.chat.messages = [];
      request.chat.updatedAt = new Date().toISOString();
      await request.chatsStore.saveChats();

      request.handled = true;
      request.success = true;
      return request;
    }

    if (command === '/new') {
      await request.chatsStore.createChat();

      request.handled = true;
      request.success = true;
      return request;
    }

    if (command.startsWith('/')) {
      request.error = `Неизвестная команда: ${command}`;
      request.handled = true;
      request.success = false;
      return request;
    }

    return this.passToNext(request);
  }
}
