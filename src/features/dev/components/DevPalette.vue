<template>
  <!-- safelist скрытых классов, чтобы Tailwind их увидел -->
  <div class="hidden">
    <div
      class="bg-theme bg-theme-a bg-main bg-main-a bg-border bg-border-a bg-text bg-text-a bg-main-td bg-main-td-a bg-main-tb bg-main-tb-a bg-background bg-glass bg-correct bg-correct-a bg-error bg-error-a"
    ></div>
  </div>

  <!-- Отображение на разных фонах -->
  <div
    class="grid w-full grid-cols-5 gap-5 bg-[repeating-linear-gradient(45deg,#000_0px,#000_20px,#fff_20px,#fff_40px)] p-4"
  >
    <ColorBox v-for="(color, index) in devColorsList" :key="index" :colorClass="'bg-' + color" />
  </div>
  <div class="grid w-full grid-cols-5 gap-5 bg-white p-4">
    <ColorBox v-for="(color, index) in devColorsList" :key="index" :colorClass="'bg-' + color" />
  </div>
  <div class="grid w-full grid-cols-5 gap-5 bg-black p-4">
    <ColorBox v-for="(color, index) in devColorsList" :key="index" :colorClass="'bg-' + color" />
  </div>
</template>

<script setup>
import ColorBox from './DevPaletteBuilder.vue';
import { ref } from 'vue';

// Список всех цветовых классов из темы
const devColorsList = ref([
  'theme',
  'theme-a',
  'main',
  'main-a',
  'border',
  'border-a',
  'text',
  'text-a',
  'main-td',
  'main-td-a',
  'main-tb',
  'main-tb-a',
  'background',
  'glass',
  'correct',
  'correct-a',
  'error',
  'error-a',
]);
</script>
