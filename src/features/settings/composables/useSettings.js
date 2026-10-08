import { ref } from 'vue';
// Импортируем сторы в начале файла, чтобы они были доступны в глобальном контексте Vue при вызове useSettings()
import { useLlmProviderStore } from '@/features/chat/stores/llmProvider';
import { useChatsStore } from '@/features/chat/stores/chats';
/**
 * Композиция настроек приложения.
 * Использует Composition API для инкапсуляции логики взаимодействия с различными хранилищами.
 */
export function useSettings() {
  const llmStore = useLlmProviderStore();
  const chatsStore = useChatsStore();

  const saveSuccess = ref(false);

  const saveKey = () => {
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 2000);
  };

  /**
   * Очищает историю чатов, используя менеджер чатов для бизнес-логики.
   */
  const clearHistory = () => {
    if (confirm('Вы действительно хотите удалить все данные чатов?')) {
      // 2. Делегируем сложную логику очистки в ChatManager через Store Action
      chatsStore.clearAllChats();
    }
  };

  return { llmStore, saveSuccess, saveKey, clearHistory };
}
