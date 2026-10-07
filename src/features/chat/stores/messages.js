import { defineStore } from 'pinia';
import { useChatsStore } from './chats';
import { LLMService } from '../services/llmService';
import { useLlmProviderStore } from './llmProvider';
import { MessageSender } from '../managers/MessageSender';

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

      const sender = new MessageSender(this, chat, content, llmService);

      try {
        await sender.compute();
      } catch (err) {
        console.error('Ошибка отправки сообщения:', err);
        this.sendError = err.message || 'Неизвестная ошибка при генерации ответа.';
        // Удаляем плейсхолдер в случае ошибки
        if (
          chat.messages[sender.assistantIndex] === sender.assistantPlaceholder ||
          chat.messages[sender.assistantIndex]?.role === 'assistant'
        ) {
          chat.messages.splice(sender.assistantIndex, 1);
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
