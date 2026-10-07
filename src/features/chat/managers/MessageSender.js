/**
 * @fileoverview Менеджер отправки сообщения в LLM и потоковой обработки ответа.
 *
 * Назначение: инкапсулирует подготовку истории для API и стриминг ответа
 * (паттерн "Replace Method with Method Object").
 */
export class MessageSender {
  /**
   * @param {Object} store - Store сообщений (useMessagesStore).
   * @param {Object} chat - Текущий чат.
   * @param {string} content - Текст сообщения пользователя.
   * @param {Object} llmService - Экземпляр LLMService.
   */
  constructor(store, chat, content, llmService) {
    this.store = store;
    this.chat = chat;
    this.content = content;
    this.llmService = llmService;

    this.fullContent = '';
    this.reasoningDetails = null;
    this.assistantPlaceholder = null;
    this.assistantIndex = null;
    this.apiMessages = null;
  }

  /**
   * Выполняет полный цикл отправки: подготовка истории и стриминг ответа.
   * @returns {Promise<void>}
   */
  async compute() {
    this._prepareMessages();
    await this._streamResponse();
  }

  /**
   * Формирует историю сообщений для API и плейсхолдер ассистента.
   */
  _prepareMessages() {
    const userMessage = { role: 'user', content: this.content.trim() };
    if (!this.chat.messages) this.chat.messages = [];
    this.chat.messages.push(userMessage);
    this.chat.updatedAt = new Date().toISOString();

    this.assistantPlaceholder = {
      role: 'assistant',
      content: '',
      reasoning_details: null,
    };
    this.chat.messages.push(this.assistantPlaceholder);
    this.assistantIndex = this.chat.messages.length - 1;

    this.apiMessages = this.chat.messages
      .slice(0, -1)
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));
  }

  /**
   * Потоково обновляет ответ ассистента в чате.
   * @returns {Promise<void>}
   */
  async _streamResponse() {
    for await (const chunk of this.llmService.streamResponse(this.apiMessages)) {
      if (chunk.content) {
        this.fullContent += chunk.content;
      }
      if (chunk.reasoning_details) {
        this.reasoningDetails =
          (this.reasoningDetails || '') + String(chunk.reasoning_details);
      }

      // Заменяем объект целиком, чтобы Vue заметил изменение
      const updatedMessage = {
        ...this.assistantPlaceholder,
        content: this.fullContent,
        reasoning_details: this.reasoningDetails,
      };
      this.chat.messages.splice(this.assistantIndex, 1, updatedMessage);
      // Обновляем ссылку на плейсхолдер для следующих итераций
      Object.assign(this.assistantPlaceholder, updatedMessage);

      this.chat.updatedAt = new Date().toISOString();
    }

    this.chat.updatedAt = new Date().toISOString();
  }
}
