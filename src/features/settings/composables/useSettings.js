import { ref } from 'vue';
import { useLlmProviderStore } from '@/features/chat/stores/llmProvider';
import { useChatsStore } from '@/features/chat/stores/chats';

export function useSettings() {
  const llmStore = useLlmProviderStore();
  const chatsStore = useChatsStore();

  const apiKeyInput = ref(llmStore.apiKey);
  const saveSuccess = ref(false);

  const saveKey = () => {
    llmStore.setApiKey(apiKeyInput.value);
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 2000);
  };

  const clearHistory = () => {
    if (confirm('Вы действительно хотите удалить все данные чатов?')) {
      chatsStore.clearAllChats();
    }
  };

  return {
    llmStore,
    apiKeyInput,
    saveSuccess,
    saveKey,
    clearHistory,
  };
}
