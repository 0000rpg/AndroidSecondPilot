<template>
  <div :class="['mb-4 flex', isUser ? 'justify-end' : 'justify-start']">
    <div
      :class="[
        'max-w-[80%] rounded-2xl p-3',
        isUser ? 'bg-theme text-text' : 'bg-main-a border-border text-text border',
      ]"
    >
      <div class="whitespace-pre-wrap" v-html="markdownParser.parse(message.content)"></div>
      <div v-if="message.reasoning_details" class="mt-2">
        <button @click="showReasoning = !showReasoning" class="text-text-a text-xs underline">
          {{ showReasoning ? 'Скрыть ход мысли' : 'Показать ход мысли' }}
        </button>
        <div v-if="showReasoning" class="bg-main-tb mt-2 rounded p-2 text-xs italic">
          {{ message.reasoning_details }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { markdownParser } from '@/utils/markdownParser';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const isUser = props.message.role === 'user';
const showReasoning = ref(false);
</script>
