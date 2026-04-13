import { LLMService } from './llmService';
import { useChatsStore } from '../stores/chats';

/**
 * @fileoverview Сервис, отвечающий за всю бизнес-логику отправки сообщений в LLM.
 */
export class MessageSenderService {
  /**
   * @param {LLMService} llmService - Инициализированный LLM Service для выполнения запросов.
   */
  constructor(llmService) {
    this.llmService = llmService;
  }

  /**
   * Обрабатывает весь цикл отправки сообщения: от форматирования до обновления UI в реальном времени.
   * @param {string} content - Текст сообщения пользователя.
   * @returns {Promise<void>} Асинхронная операция, которая обновляет состояние чата.
   */
  async sendMessage(content) {
    const chatsStore = useChatsStore();
    const chat = chatsStore.currentChat;

    if (!chat || !content.trim()) {
      throw new Error('Невозможно отправить сообщение: нет активного чата или контент пуст.');
    }

    // 1. Добавляем сообщение пользователя (User Message)
    const userMessage = { role: 'user', content: content.trim() };
    if (!chat.messages) chat.messages = [];
    chat.messages.push(userMessage);
    chat.updatedAt = new Date().toISOString();

    // 2. Создаем плейсхолдер ассистента (Assistant Placeholder)
    const assistantPlaceholder = { role: 'assistant', content: '', reasoning_details: null };
    chat.messages.push(assistantPlaceholder);
    const assistantIndex = chat.messages.length - 1;

    // 3. Формируем историю для API (исключая последний пустой плейсхолдер)
    const apiMessages = chat.messages
      .slice(0, -1)
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      let fullContent = '';
      let reasoningDetails = null;

      // 4. Потоковая обработка ответа LLM
      for await (const chunk of this.llmService.streamResponse(apiMessages)) {
        if (chunk.content) {
          fullContent += chunk.content;
        }
        if (chunk.reasoning_details) {
          // Конкатенация reasoning details, если они приходят в разных чанках
          reasoningDetails = (reasoningDetails || '') + String(chunk.reasoning_details);
        }

        // Обновление плейсхолдера: заменяем объект целиком, чтобы Vue заметил изменение
        const updatedMessage = {
          ...assistantPlaceholder,
          content: fullContent,
          reasoning_details: reasoningDetails,
        };
        chat.messages.splice(assistantIndex, 1, updatedMessage);
        // Обновляем ссылку на плейсхолдер для следующих итераций
        Object.assign(assistantPlaceholder, updatedMessage);

        // Триггерим обновление чата (обязательно для реактивности)
        chat.updatedAt = new Date().toISOString();
      }
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      throw err; // Перебрасываем ошибку, чтобы Store мог ее обработать
    } finally {
      // Финальное обновление времени в случае успеха или ошибки
      chat.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Очищает сообщения текущего чата.
   */
  clearCurrentChatMessages() {
    const chatsStore = useChatsStore();
    const chat = chatsStore.currentChat;
    if (chat) chat.messages = [];
  }
}
