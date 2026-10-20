/**
 * Локальное расширение для объекта чата.
 * Инкапсулирует методы, которые должны были бы располагаться в самом классе Chat,
 * однако исходный объект чата — plain object и недоступен для модификации.
 */
export class NullChat {
  constructor() {
    this.id = null;
    this.name = 'Нет чата';
    this.messages = [];
    this.createdAt = null;
    this.updatedAt = null;
  }

  isNull() {
    return true;
  }
}

export const nullChat = new NullChat();

export class ChatExtension {
  constructor(chat) {
    this._chat = chat || nullChat;
  }

  get id() {
    return this._chat.id;
  }
  get name() {
    return this._chat.name;
  }
  get messages() {
    return this._chat.messages;
  }

  getLastMessage() {
    const msgs = this.messages;
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  }

  getPreview() {
    const msg = this.getLastMessage();
    if (!msg) return 'Нет сообщений';
    const text = msg.content.length > 50 ? msg.content.slice(0, 50) + '…' : msg.content;
    return `${msg.role === 'user' ? '👤' : '🤖'} ${text}`;
  }

  isNull() {
    return this._chat.isNull?.() ?? false;
  }
}
