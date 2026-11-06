import { defineStore } from 'pinia';
import { useChatsStore } from './chats';
import { useLlmProviderStore } from './llmProvider';
import { EmptyMessageHandler } from '../handlers/EmptyMessageHandler';
import { StreamingGuardHandler } from '../handlers/StreamingGuardHandler';
import { CommandHandler } from '../handlers/CommandHandler';
import { LlmConfigHandler } from '../handlers/LlmConfigHandler';
import { LlmSendHandler } from '../handlers/LlmSendHandler';

/**
 * Собирает цепочку обязанностей для обработки запросов чата.
 * @returns {EmptyMessageHandler}
 */
function buildChatRequestChain() {
  const chain = new EmptyMessageHandler();

  chain
    .setNext(new StreamingGuardHandler())
    .setNext(new CommandHandler())
    .setNext(new LlmConfigHandler())
    .setNext(new LlmSendHandler());

  return chain;
}

/**
 * @fileoverview Store, отвечающий за логику отправки сообщений в LLM.
 *
 * Назначение: Координирует процесс взаимодействия с API (формирование истории, стриминг, обновление UI).
 */
export const useMessagesStore = defineStore('messages', {
  state: () => ({
    streaming: false,
    sendError: null,
  }),
  getters: {
    currentMessages: () => {
      const chatsStore = useChatsStore();
      return chatsStore.currentChat.messages;
    },
  },
  actions: {
    async sendMessage(content) {
      const chatsStore = useChatsStore();
      const providerStore = useLlmProviderStore();
      const chat = chatsStore.currentChat;

      if (chat.isNull?.()) return false;

      const chain = buildChatRequestChain();

      const request = {
        content,
        chat,
        store: this,
        providerStore,
        chatsStore,
        llmService: null,
        handled: false,
        success: false,
        error: null,
      };

      const result = await chain.handle(request);

      this.sendError = result.error || null;
      return result.success;
    },

    clearCurrentChatMessages() {
      const chatsStore = useChatsStore();
      const chat = chatsStore.currentChat;
      if (chat) chat.messages = [];
    },
  },
});
