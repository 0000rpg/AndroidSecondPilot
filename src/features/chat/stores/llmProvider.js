import { defineStore } from 'pinia';

export const useLlmProviderStore = defineStore('llmProvider', {
  state: () => ({
    provider: 'openrouter', // 'openrouter' or 'lmstudio'
    // OpenRouter
    apiKey: '',
    model: 'nvidia/nemotron-3-super-120b-a12b:free',
    // LMStudio
    lmstudioUrl: 'http://localhost:1234/v1/chat/completions',
    lmstudioModel: 'google/gemma-4-e4b',
    // Общие поля статуса
    status: 'idle', // 'idle', 'loading', 'success', 'error'
    error: null,
  }),
  getters: {
    config: (state) => {
      if (state.provider === 'openrouter') {
        return {
          type: 'openrouter',
          apiKey: state.apiKey,
          model: state.model,
        };
      } else {
        return {
          type: 'lmstudio',
          lmstudioUrl: state.lmstudioUrl,
          lmstudioModel: state.lmstudioModel,
        };
      }
    },
  },
  persist: true,
  actions: {
    setProvider(provider) {
      this.provider = provider;
      this.error = null;
    },
    setConfigField(field, value, clearError = true) {
      this[field] = value;
      if (clearError) this.error = null;
    },
    setStatus(status, errorMsg = null) {
      this.status = status;
      this.error = errorMsg;
    },
    clearError() {
      this.error = null;
      this.status = 'idle';
    },
  },
});
