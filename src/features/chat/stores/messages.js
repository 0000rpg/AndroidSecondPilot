import { defineStore } from 'pinia';
import { useChatsStore } from './chats';
import { useLlmProviderStore } from './llmProvider';
import { llmRepository } from '../services/llmRepository';

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    // Сообщения не хранятся здесь – они лежат в текущем чате (chatsStore.currentChat.messages)
    // Но для удобства добавим локальный статус отправки
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
      if (!chat) return;
      if (!content.trim()) return;

      // Проверки
      if (providerStore.provider === 'openrouter' && !providerStore.apiKey) {
        this.sendError = 'API ключ OpenRouter не задан. Перейдите в настройки.';
        return;
      }
      if (providerStore.provider === 'lmstudio' && !providerStore.lmstudioUrl) {
        this.sendError = 'URL LMStudio не задан. Перейдите в настройки.';
        return;
      }

      this.streaming = true;
      this.sendError = null;
      providerStore.setStatus('loading');

      // Добавляем сообщение пользователя
      const userMessage = { role: 'user', content: content.trim() };
      if (!chat.messages) chat.messages = [];
      chat.messages.push(userMessage);
      chat.updatedAt = new Date().toISOString();

      // Плейсхолдер ассистента
      const assistantPlaceholder = { role: 'assistant', content: '', reasoning_details: null };
      chat.messages.push(assistantPlaceholder);

      // Подготовка истории (без системных сообщений)
      const apiMessages = chat.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        // Выбор конфигурации провайдера
        let providerConfig;
        if (providerStore.provider === 'openrouter') {
          providerConfig = {
            type: 'openrouter',
            apiKey: providerStore.apiKey,
            model: providerStore.model,
            url: 'https://openrouter.ai/api/v1/chat/completions',
          };
        } else {
          providerConfig = {
            type: 'lmstudio',
            url: providerStore.lmstudioUrl,
            model: providerStore.lmstudioModel,
          };
        }

        // Вызов репозитория
        const stream = await llmRepository.sendStreamingRequest(providerConfig, apiMessages);

        let fullContent = '';
        let reasoningDetails = null;

        for await (const chunk of stream) {
          const currentChat = chatsStore.currentChat;
          if (!currentChat || currentChat.id !== chat.id) break;

          const lastMsg = currentChat.messages[currentChat.messages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            if (chunk.content !== undefined && chunk.content !== null) {
              fullContent += chunk.content;
              lastMsg.content = fullContent;
            }
            if (chunk.reasoning_details !== undefined && chunk.reasoning_details !== null) {
              reasoningDetails = chunk.reasoning_details;
              lastMsg.reasoning_details = reasoningDetails;
            }
            currentChat.updatedAt = new Date().toISOString();
          }
        }

        // Если ответ пустой – удаляем плейсхолдер
        const finalChat = chatsStore.currentChat;
        if (finalChat && finalChat.messages.length > 0) {
          const lastMsg = finalChat.messages[finalChat.messages.length - 1];
          if (lastMsg.role === 'assistant' && !lastMsg.content && !lastMsg.reasoning_details) {
            finalChat.messages.pop();
            finalChat.updatedAt = new Date().toISOString();
            if (!this.sendError) this.sendError = 'Ассистент не вернул ответа.';
          }
        }

        providerStore.setStatus('success');
      } catch (err) {
        console.error('Ошибка отправки сообщения:', err);
        this.sendError = err.message || 'Неизвестная ошибка';
        providerStore.setStatus('error', this.sendError);

        // Удаляем плейсхолдер ассистента
        const currentChat = chatsStore.currentChat;
        if (currentChat && currentChat.messages.length > 0) {
          const lastMsg = currentChat.messages[currentChat.messages.length - 1];
          if (lastMsg.role === 'assistant') {
            currentChat.messages.pop();
            currentChat.updatedAt = new Date().toISOString();
          }
        }
      } finally {
        this.streaming = false;
        if (providerStore.status === 'loading') providerStore.setStatus('idle');
      }
    },

    clearCurrentChatMessages() {
      const chatsStore = useChatsStore();
      const chat = chatsStore.currentChat;
      if (chat) chat.messages = [];
    },
  },
});
