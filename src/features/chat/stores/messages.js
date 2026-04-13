import { defineStore } from 'pinia';
import { useChatsStore } from './chats';
import { LLMService } from '../services/llmService';
import { useLlmProviderStore } from './llmProvider';

/**
 * @fileoverview Store, отвечающий за логику отправки сообщений в LLM.
 *
 * Назначение: Координирует процесс взаимодействия с API (формирование истории, стриминг, обновление UI).
 */
export const useMessagesStore = defineStore('messages', {
  state: () => ({
    streaming: false,
    sendError: null,
  }),
  getters: {
    currentMessages: () => {
      const chatsStore = useChatsStore();
      return chatsStore.currentChat?.messages || [];
    },
  },
  actions: {
    async sendMessage(content) {
      const chatsStore = useChatsStore();
      const providerStore = useLlmProviderStore();
      const chat = chatsStore.currentChat;
      if (!chat || !content.trim()) return;

      // 1. Проверка конфигурации и инициализация LLMService
      let llmService;
      try {
        const provider = providerStore.provider;
        const config = providerStore.config;
        if (!config) {
          this.sendError = 'Конфигурация провайдера не загружена.';
          return;
        }
        llmService = new LLMService(provider, config);
      } catch (e) {
        this.sendError = e.message || 'Не удалось инициализировать сервис LLM.';
        return;
      }

      this.streaming = true;
      this.sendError = null;

      // Добавляем сообщение пользователя
      const userMessage = { role: 'user', content: content.trim() };
      if (!chat.messages) chat.messages = [];
      chat.messages.push(userMessage);
      chat.updatedAt = new Date().toISOString();

      // Плейсхолдер ассистента
      const assistantPlaceholder = { role: 'assistant', content: '', reasoning_details: null };
      chat.messages.push(assistantPlaceholder);
      const assistantIndex = chat.messages.length - 1;

      // История для API – все сообщения кроме последнего пустого ассистента
      const apiMessages = chat.messages
        .slice(0, -1)
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        let fullContent = '';
        let reasoningDetails = null;

        // Потоковая обработка ответа LLM
        for await (const chunk of llmService.streamResponse(apiMessages)) {
          if (chunk.content) {
            fullContent += chunk.content;
          }
          if (chunk.reasoning_details) {
            // Конкатенация reasoning details, если они приходят в разных чанках
            reasoningDetails = (reasoningDetails || '') + String(chunk.reasoning_details);
          }

          // Ключевой момент: заменяем объект целиком, чтобы Vue заметил изменение
          const updatedMessage = {
            ...assistantPlaceholder,
            content: fullContent,
            reasoning_details: reasoningDetails,
          };
          chat.messages.splice(assistantIndex, 1, updatedMessage);
          // Обновляем ссылку на плейсхолдер для следующих итераций
          Object.assign(assistantPlaceholder, updatedMessage);

          // Триггерим обновление чата (опционально, но полезно)
          chat.updatedAt = new Date().toISOString();
        }

        chat.updatedAt = new Date().toISOString();
      } catch (err) {
        console.error('Ошибка отправки сообщения:', err);
        this.sendError = err.message || 'Неизвестная ошибка при генерации ответа.';
        // Удаляем плейсхолдер в случае ошибки
        if (
          chat.messages[assistantIndex] === assistantPlaceholder ||
          chat.messages[assistantIndex]?.role === 'assistant'
        ) {
          chat.messages.splice(assistantIndex, 1);
          chat.updatedAt = new Date().toISOString();
        }
      } finally {
        this.streaming = false;
      }
    },

    clearCurrentChatMessages() {
      const chatsStore = useChatsStore();
      const chat = chatsStore.currentChat;
      if (chat) chat.messages = [];
    },
  },
});
