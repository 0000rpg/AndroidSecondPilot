<template>
  <!-- safelist скрытых классов, чтобы Tailwind их увидел -->
  <div class="hidden">
    <div class="bg-theme bg-header bg-background bg-text bg-snow bg-border bg-border-accent bg-marker bg-accent bg-section bg-aside-action bg-cell-header bg-cell-even"></div>
    <div class="bg-q1 bg-q2 bg-q3 bg-q4 bg-q5 bg-q6 bg-q7 bg-q8 bg-q9 bg-q10 bg-q11 bg-q12 bg-q13"></div>
  </div>
  <div class="grid grid-cols-5 gap-5 w-full p-4 bg-[repeating-linear-gradient(45deg,#000_0px,#000_20px,#fff_20px,#fff_40px)]">
    <ColorBox v-for="(color, index) in devColorsList" :key="index" :colorClass="'bg-'+color" />
  </div>
  <div class="grid grid-cols-5 gap-5 w-full p-4 bg-white">
    <ColorBox v-for="(color, index) in devColorsList" :key="index" :colorClass="'bg-'+color" />
  </div>
  <div class="grid grid-cols-5 gap-5 w-full p-4 bg-black">
    <ColorBox v-for="(color, index) in devColorsList" :key="index" :colorClass="'bg-'+color" />
  </div>
  <div class="color-wheel" aria-label="Цветовой круг из заданных цветов"></div>
</template>
<script setup>
import ColorBox from '@/components/dev/DevPaletteBuilder.vue'
import {ref} from 'vue'
const colorsList = ref([
  'theme',
  'header',
  'background',
  'text',
  'snow',
  'border-accent',
  'border',
  'marker',
  'accent',
  'section',
  'aside-action',
  'cell-header',
  'cell-even',
])

const devColorsList = ref([
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
  'q7',
  'q8',
  'q9',
  'q10',
  'q11',
  'q12',
  'q13',
])

import '@/assets/main.css'
</script>
<style scoped>
:root {
  /* Ваши переменные */
  --color-theme: #ed6c21;
  --color-header: #18191a;
  --color-background: #1c1e21;
  --color-text: #f5f5f5;
  --color-snow: #ffffff;
  --color-border: #5c5c5c;
  --color-border-accent: #757575;
  --color-marker: #b3b3b3;
  --color-accent: rgb(255, 145, 35);
  --color-section: rgba(34, 36, 39, 0.8);
  --color-aside-action: rgba(43, 45, 48, 0.8);
  --color-cell-header: rgba(47, 49, 53, 0.4);
  --color-cell-even: rgba(45, 47, 51, 0.8);
}

.color-wheel {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  /* Резкие границы между цветами — без плавных переходов */
  background: conic-gradient(
    var(--color-theme) 0deg, var(--color-theme) 27.6923deg,
    var(--color-header) 27.6923deg, var(--color-header) 55.3846deg,
    var(--color-background) 55.3846deg, var(--color-background) 83.0769deg,
    var(--color-text) 83.0769deg, var(--color-text) 110.7692deg,
    var(--color-snow) 110.7692deg, var(--color-snow) 138.4615deg,
    var(--color-border) 138.4615deg, var(--color-border) 166.1538deg,
    var(--color-border-accent) 166.1538deg, var(--color-border-accent) 193.8462deg,
    var(--color-marker) 193.8462deg, var(--color-marker) 221.5385deg,
    var(--color-accent) 221.5385deg, var(--color-accent) 249.2308deg,
    var(--color-section) 249.2308deg, var(--color-section) 276.9231deg,
    var(--color-aside-action) 276.9231deg, var(--color-aside-action) 304.6154deg,
    var(--color-cell-header) 304.6154deg, var(--color-cell-header) 332.3077deg,
    var(--color-cell-even) 332.3077deg, var(--color-cell-even) 360deg
  );
  /* Дополнительно: тень для акцента */
  box-shadow: 0 0 0 2px var(--color-border), 0 4px 12px rgba(0,0,0,0.3);
  /* Центрирование, если нужно */
  margin: 0 auto;
}
</style>