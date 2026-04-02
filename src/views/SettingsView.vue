<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center justify-center p-4 transition-all duration-300"
  >
    <div class="card-base !w-full max-w-md">
      <h2>Настройки чат-бота</h2>

      <div class="w-full space-y-5 p-4">
        <div>
          <label>API ключ</label>
          <Input
            v-model="apiKeyInput"
            type="password"
            placeholder="sk-or-v1-..."
            :mode="apiKeyInput ? 'correct' : 'default'"
          />
          <div class="text-text-a mt-1 text-xs">Ключ хранится локально в браузере</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button @click="saveKey" class="btn-default">Сохранить ключ</button>
          <button @click="clearHistory" class="btn-error">Очистить историю</button>
        </div>

        <div v-if="store.error && store.error.includes('API ключ')" class="text-error text-center">
          {{ store.error }}
        </div>
        <div v-if="saveSuccess" class="text-correct text-center">Ключ сохранён</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useOpenRouterStore } from '@/stores/llm/openrouter';
import Input from '@/components/forms/SmartInput.vue';

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
</script>
