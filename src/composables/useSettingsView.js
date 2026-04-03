import { ref } from 'vue';
import { useOpenRouterStore } from '@/stores/llm/openrouter';
import Input from '@/components/forms/SmartInput.vue';

export function useSettingsView() {
  const store = useOpenRouterStore();
  const apiKeyInput = ref(store.apiKey);
  const saveSuccess = ref(false);

  const saveKey = () => {
    store.setApiKey(apiKeyInput.value);
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 2000);
  };

  const clearHistory = () => {
    if (confirm('Удалить всю историю сообщений?')) {
      store.clearHistory();
    }
  };
  return {
    // Хранилища
    store,
    apiKeyInput,
    // Состояния
    saveSuccess,
    // Методы
    saveKey,
    clearHistory,
  }
}



