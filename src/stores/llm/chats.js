import { defineStore } from 'pinia';

export const useChatsStore = defineStore('chats', {
  state: () => ({
    apiKey: '',
    model: 'qwen/qwen3.6-plus:free',
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
    setApiKey(key) {
      this.apiKey = key;
      this.error = null;
    },
    async sendMessage(content) {
      if (!this.apiKey) {
        this.error = 'API ключ не задан. Перейдите в настройки.';
        return;
      }
      if (!content.trim()) return;

      const chat = this.currentChat;
      if (!chat) return;

      this.loading = true;
      this.error = null;

      // Добавляем сообщение пользователя
      chat.messages.push({ role: 'user', content: content.trim() });
      chat.updatedAt = new Date().toISOString();

      // Создаём placeholder для ответа ассистента
      const assistantMessage = {
        role: 'assistant',
        content: '',
        reasoning_details: null,
      };
      chat.messages.push(assistantMessage);

      // Подготовка истории для API (без reasoning_details)
      const apiMessages = chat.messages
        .filter((m) => m.role !== 'system') // если понадобится system prompt
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: apiMessages,
            stream: true,
            reasoning: { enabled: true },
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || 'Ошибка API');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullContent = '';
        let reasoningDetails = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // последняя часть может быть неполной

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta;
                if (delta?.content) {
                  fullContent += delta.content;
                  assistantMessage.content = fullContent;
                  // Обновляем реактивно (Vue должен подхватить)
                }
                if (delta?.reasoning_details) {
                  reasoningDetails = delta.reasoning_details;
                  assistantMessage.reasoning_details = reasoningDetails;
                }
              } catch (e) {
                console.warn('Ошибка парсинга SSE:', e);
              }
            }
          }
        }
        // Если reasoning_details не пришёл в потоке, проверяем финальный объект (некоторые модели присылают отдельно)
        // Обновляем время последнего изменения
        chat.updatedAt = new Date().toISOString();
      } catch (err) {
        this.error = err.message;
        // Удаляем placeholder сообщения ассистента при ошибке
        chat.messages.pop();
      } finally {
        this.loading = false;
      }
    },
  },
});
