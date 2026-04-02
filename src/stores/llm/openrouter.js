import { defineStore } from 'pinia';

export const useOpenRouterStore = defineStore('openrouter', {
  state: () => ({
    apiKey: '',
    messages: [],
    loading: false,
    error: null,
    model: 'qwen/qwen3.6-plus:free',
  }),
  persist: true,
  actions: {
    setApiKey(key) {
      this.apiKey = key;
      this.error = null;
    },
    clearHistory() {
      this.messages = [];
    },
    async sendMessage(userContent) {
      if (!this.apiKey) {
        this.error = 'API ключ не задан. Перейдите в настройки.';
        return;
      }
      if (!userContent.trim()) return;

      this.loading = true;
      this.error = null;

      // Добавляем сообщение пользователя
      this.messages.push({ role: 'user', content: userContent });

      // Подготавливаем историю для API (включая reasoning_details, если есть)
      const apiMessages = this.messages.map((msg) => {
        const m = { role: msg.role, content: msg.content };
        if (msg.reasoning_details) m.reasoning_details = msg.reasoning_details;
        return m;
      });

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
            reasoning: { enabled: true },
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || 'Ошибка API');
        }

        const data = await response.json();
        const assistantMsg = data.choices[0].message;

        // Сохраняем ответ ассистента вместе с reasoning_details
        this.messages.push({
          role: 'assistant',
          content: assistantMsg.content,
          reasoning_details: assistantMsg.reasoning_details || null,
        });
      } catch (err) {
        this.error = err.message;
        // Удаляем последнее сообщение пользователя при ошибке
        this.messages.pop();
      } finally {
        this.loading = false;
      }
    },
  },
});
