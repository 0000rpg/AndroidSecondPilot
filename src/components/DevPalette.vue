<template>
  <!-- safelist скрытых классов, чтобы Tailwind их увидел -->
  <div class="hidden">
    <div class="bg-theme bg-header bg-background bg-text bg-snow bg-border bg-border-accent bg-marker bg-accent bg-section bg-aside-action bg-cell-header bg-cell-even"></div>
  </div>
  <div class="grid grid-cols-5 gap-5 w-full p-4 bg-[repeating-linear-gradient(45deg,#000_0px,#000_20px,#fff_20px,#fff_40px)]">
    <ColorBox v-for="(color, index) in colorsList" :key="index" :colorClass="'bg-'+color" />
  </div>
  <div class="grid grid-cols-5 gap-5 w-full p-4 bg-white">
    <ColorBox v-for="(color, index) in colorsList" :key="index" :colorClass="'bg-'+color" />
  </div>
  <div class="grid grid-cols-5 gap-5 w-full p-4 bg-black">
    <ColorBox v-for="(color, index) in colorsList" :key="index" :colorClass="'bg-'+color" />
  </div>
</template>
<script setup>
import ColorBox from '@/components/DevPaletteBuilder.vue'
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

import '@/assets/main.css'
</script>