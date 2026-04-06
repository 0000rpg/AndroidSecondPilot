<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center justify-center p-4 transition-all duration-300"
  >
    <div class="card-base w-full! max-w-md">
      <h2>Настройки чат-бота</h2>
      <div class="w-full space-y-5 p-4">
        <!-- Выбор провайдера -->
        <div>
          <label class="mb-2 block">Провайдер LLM</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2">
              <input type="radio" value="openrouter" v-model="chatStore.provider" class="h-4 w-4" />
              <span>OpenRouter (облачный)</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" value="lmstudio" v-model="chatStore.provider" class="h-4 w-4" />
              <span>LM Studio (локальный)</span>
            </label>
          </div>
        </div>

        <!-- Настройки OpenRouter -->
        <div v-if="chatStore.provider === 'openrouter'">
          <label>API ключ OpenRouter</label>
          <Input
            v-model="apiKeyInput"
            type="password"
            placeholder="sk-or-v1-..."
            :mode="apiKeyInput ? 'correct' : 'default'"
          />
          <div class="text-text-a mt-1 text-xs">Ключ хранится локально в браузере</div>
          <div class="mt-3">
            <button @click="saveKey" class="btn-default w-full">Сохранить ключ</button>
          </div>
        </div>

        <!-- Настройки LM Studio -->
        <div v-if="chatStore.provider === 'lmstudio'">
          <label>API URL (полный endpoint)</label>
          <Input
            v-model="chatStore.lmstudioUrl"
            type="text"
            placeholder="http://localhost:1234/v1/chat/completions"
            :mode="chatStore.lmstudioUrl ? 'correct' : 'default'"
          />
          <div class="text-text-a mt-1 text-xs">
            Пример: http://localhost:1234/v1/chat/completions
          </div>

          <label class="mt-3">Имя модели</label>
          <Input
            v-model="chatStore.lmstudioModel"
            type="text"
            placeholder="gemma-3-4b-it-qat"
            :mode="chatStore.lmstudioModel ? 'correct' : 'default'"
          />
          <div class="text-text-a mt-1 text-xs">Модель, загруженная в LM Studio</div>
        </div>

        <!-- Общие кнопки -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button @click="clearHistory" class="btn-error">Уничтожить чаты</button>
        </div>

        <!-- Сообщения об ошибках/успехе -->
        <div
          v-if="chatStore.error && chatStore.error.includes('API ключ')"
          class="text-error text-center"
        >
          {{ chatStore.error }}
        </div>
        <div v-if="saveSuccess" class="text-correct text-center">Ключ сохранён</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useChatsStore } from '@/stores/llm/chats';
import Input from '@/components/forms/SmartInput.vue';

const chatStore = useChatsStore();
const apiKeyInput = ref(chatStore.apiKey);
const saveSuccess = ref(false);

const saveKey = () => {
  chatStore.setApiKey(apiKeyInput.value);
  saveSuccess.value = true;
  setTimeout(() => (saveSuccess.value = false), 2000);
};

const clearHistory = () => {
  if (confirm('Вы действительно хотите удалить все данные чатов?')) {
    chatStore.clearAllChats();
  }
};
</script>
