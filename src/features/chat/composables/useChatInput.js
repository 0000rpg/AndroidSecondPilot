import { ref } from 'vue';
import { useMessagesStore } from '../stores/messages';

/**
 * Композабл для управления состоянием ввода пользователя и отправки сообщения.
 */
export function useChatInput() {
  const userInput = ref('');
  const messagesStore = useMessagesStore();

  /**
   * Обработчик отправки сообщения. Вызывает метод sendMessage в хранилище сообщений.
   */
  const send = async () => {
    if (!userInput.value.trim() || messagesStore.streaming) return;
    const message = userInput.value;
    userInput.value = '';
    await messagesStore.sendMessage(message);
  };

  return {
    userInput,
    send,
    isLoading: messagesStore.streaming,
    error: messagesStore.sendError,
  };
}