// src/stores/llm/chats.js
import { defineStore } from 'pinia';

export const useChatsStore = defineStore('chats', {
  state: () => ({
    // OpenRouter
    apiKey: '',
    model: 'nvidia/nemotron-3-super-120b-a12b:free',
    // Provider selection
    provider: 'openrouter', // 'openrouter' or 'lmstudio'
    // LMStudio settings
    lmstudioUrl: 'http://localhost:1234/v1/chat/completions',
    lmstudioModel: 'gemma-3-4b-it-qat',
    // Common
    chats: [],
    currentChatId: null,
    loading: false,
    error: null,
  }),
  persist: true,
  getters: {
    currentChat: (state) => state.chats.find((c) => c.id === state.currentChatId) || null,
  },
  actions: {
    init() {
      if (this.chats.length === 0) {
        this.createChat('Новый чат');
      }
      if (!this.currentChatId && this.chats.length) {
        this.currentChatId = this.chats[0].id;
      }
    },

    createChat(name = null) {
      const id = Date.now().toString();
      const chatName = name || `Чат ${this.chats.length + 1}`;
      const newChat = {
        id,
        name: chatName,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.chats.push(newChat);
      this.currentChatId = id;
      return id;
    },

    deleteChat(id) {
      const index = this.chats.findIndex((c) => c.id === id);
      if (index === -1) return;
      this.chats.splice(index, 1);
      if (this.currentChatId === id) {
        this.currentChatId = this.chats.length ? this.chats[0].id : null;
      }
    },

    renameChat(id, newName) {
      const chat = this.chats.find((c) => c.id === id);
      if (chat) chat.name = newName.trim() || 'Без названия';
    },

    setCurrentChat(id) {
      if (this.chats.find((c) => c.id === id)) {
        this.currentChatId = id;
      }
    },

    clearCurrentChatMessages() {
      const chat = this.currentChat;
      if (chat) chat.messages = [];
    },

    clearAllChats() {
      this.chats = [];
      this.currentChatId = null;
      this.createChat('Новый чат');
    },

    setApiKey(key) {
      this.apiKey = key;
      this.error = null;
    },

    setProvider(provider) {
      this.provider = provider;
      this.error = null;
    },

    setLmstudioUrl(url) {
      this.lmstudioUrl = url;
      this.error = null;
    },

    setLmstudioModel(model) {
      this.lmstudioModel = model;
      this.error = null;
    },

    async sendMessage(content) {
      if (this.provider === 'openrouter' && !this.apiKey) {
        this.error = 'API ключ OpenRouter не задан. Перейдите в настройки.';
        return;
      }
      if (this.provider === 'lmstudio' && !this.lmstudioUrl) {
        this.error = 'URL LMStudio не задан. Перейдите в настройки.';
        return;
      }
      if (!content.trim()) return;

      const chat = this.currentChat;
      if (!chat) return;

      this.loading = true;
      this.error = null;

      // Добавляем сообщение пользователя
      const userMessage = { role: 'user', content: content.trim() };
      chat.messages.push(userMessage);
      chat.updatedAt = new Date().toISOString();

      // Плейсхолдер ассистента
      const assistantPlaceholder = { role: 'assistant', content: '', reasoning_details: null };
      chat.messages.push(assistantPlaceholder);

      // Подготовка истории
      const apiMessages = chat.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      try {
        let response;
        // 1. Формируем запрос в зависимости от провайдера
        if (this.provider === 'openrouter') {
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: this.model,
              messages: apiMessages,
              stream: true,
            }),
            signal: controller.signal,
          });
        } else {
          response = await fetch(this.lmstudioUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.lmstudioModel,
              messages: apiMessages,
              stream: true,
            }),
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = 'Ошибка API';
          try {
            const errData = await response.json();
            errorMessage =
              errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
          } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullContent = '';
        let reasoningDetails = null;

        try {
          while (true) {
            const chatStillExists = this.chats.some((c) => c.id === chat.id);
            if (!chatStillExists) break;

            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;

              if (trimmed.startsWith('data: ')) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  if (json.error) throw new Error(json.error.message || 'Ошибка API');

                  // Для OpenRouter: delta.content / delta.reasoning_details
                  // Для LM Studio: тоже delta.content (совместимо с OpenAI)
                  const delta = json.choices?.[0]?.delta;
                  if (!delta) continue;

                  if (delta.content !== undefined && delta.content !== null) {
                    fullContent += delta.content;
                    const chatToUpdate = this.chats.find((c) => c.id === chat.id);
                    if (chatToUpdate && chatToUpdate.messages.length > 0) {
                      const lastIndex = chatToUpdate.messages.length - 1;
                      if (chatToUpdate.messages[lastIndex].role === 'assistant') {
                        chatToUpdate.messages[lastIndex] = {
                          ...chatToUpdate.messages[lastIndex],
                          content: fullContent,
                          reasoning_details: reasoningDetails,
                        };
                        chatToUpdate.updatedAt = new Date().toISOString();
                      }
                    }
                  }

                  if (delta.reasoning_details !== undefined && delta.reasoning_details !== null) {
                    reasoningDetails = delta.reasoning_details;
                    const chatToUpdate = this.chats.find((c) => c.id === chat.id);
                    if (chatToUpdate && chatToUpdate.messages.length > 0) {
                      const lastIndex = chatToUpdate.messages.length - 1;
                      if (chatToUpdate.messages[lastIndex].role === 'assistant') {
                        chatToUpdate.messages[lastIndex] = {
                          ...chatToUpdate.messages[lastIndex],
                          content: fullContent,
                          reasoning_details: reasoningDetails,
                        };
                        chatToUpdate.updatedAt = new Date().toISOString();
                      }
                    }
                  }
                } catch (e) {
                  console.error('Ошибка парсинга SSE:', e, 'Line:', trimmed);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Ошибка при чтении потока:', streamError);
          throw streamError;
        } finally {
          try {
            await reader.cancel();
          } catch (e) {}
        }

        // Финальная проверка (если ответ пустой)
        const finalChat = this.chats.find((c) => c.id === chat.id);
        if (finalChat && finalChat.messages.length > 0) {
          const lastMessage = finalChat.messages[finalChat.messages.length - 1];
          if (
            lastMessage.role === 'assistant' &&
            !lastMessage.content &&
            !lastMessage.reasoning_details
          ) {
            finalChat.messages.pop();
            finalChat.updatedAt = new Date().toISOString();
            if (!this.error) this.error = 'Ассистент не вернул ответа. Попробуйте ещё раз.';
          }
        }
      } catch (err) {
        console.error('Ошибка отправки сообщения:', err);
        if (err.name === 'AbortError') {
          this.error = 'Превышено время ожидания ответа от сервера (2 минуты). Попробуйте ещё раз.';
        } else if (
          err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError')
        ) {
          this.error = 'Ошибка сети. Проверьте подключение к интернету.';
        } else {
          this.error = err.message || 'Произошла неизвестная ошибка';
        }

        const chatToUpdate = this.chats.find((c) => c.id === chat.id);
        if (chatToUpdate && chatToUpdate.messages.length > 0) {
          const lastMessage = chatToUpdate.messages[chatToUpdate.messages.length - 1];
          if (lastMessage.role === 'assistant') {
            chatToUpdate.messages.pop();
            chatToUpdate.updatedAt = new Date().toISOString();
          }
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
