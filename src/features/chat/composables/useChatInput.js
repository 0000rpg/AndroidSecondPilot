import { ref } from 'vue';
import { useMessagesStore } from '../stores/messages';

export function useChatInput() {
  const userInput = ref('');
  const messagesStore = useMessagesStore();

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
