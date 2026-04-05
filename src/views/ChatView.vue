<template>
  <div
    class="bg-background flex min-h-screen w-full max-w-screen flex-row items-center justify-center p-0 transition-all duration-300"
  >
    <ChatList />
    <div
      class="bg-background flex min-h-screen max-w-screen min-w-lg flex-col items-center justify-center p-0 transition-all duration-300"
    >
      <div class="flex h-full w-screen max-w-4xl flex-col">
        <!-- Область сообщений -->
        <div class="custom-scrollbar h-full w-full overflow-y-auto p-4 pb-30">
          <div v-if="store.messages.length === 0" class="text-text-a text-center">
            Нет сообщений. Начните диалог!
          </div>
          <ChatMessage v-for="(msg, idx) in store.messages" :key="idx" :message="msg" />
          <div v-if="store.loading" class="text-text-a mt-2 text-center">Ассистент печатает...</div>
          <div v-if="store.error" class="text-error mt-2 text-center">
            {{ store.error }}
          </div>
        </div>

        <!-- Поле ввода -->
        <div
          class="fixed bottom-0 left-1/2 w-full max-w-4xl -translate-x-1/2 bg-transparent p-4 shadow-lg"
        >
          <div class="flex w-full gap-2">
            <textarea
              v-model="userInput"
              class="bg-main border-border text-text w-full rounded-2xl border p-2 focus:outline-none"
              rows="2"
              placeholder="Введите сообщение..."
              @keydown.ctrl.enter="send"
            ></textarea>
            <button
              @click="send"
              :disabled="store.loading || !userInput.trim()"
              class="btn-default w-auto! px-6"
            >
              ⇧
            </button>
          </div>
          <div class="text-text-a mt-1 text-xs">Ctrl+Enter для отправки</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useOpenRouterStore } from '@/stores/llm/openrouter';
import ChatMessage from '@/components/chat/ChatMessage.vue';
import ChatList from '@/components/chat/ChatList.vue';

const store = useOpenRouterStore();
const userInput = ref('');

const send = async () => {
  if (!userInput.value.trim() || store.loading) return;
  const message = userInput.value;
  userInput.value = '';
  await store.sendMessage(message);
};
</script>
