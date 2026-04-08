<template>
  <div @click="copyToClipboard" :class="[colorClass, 'p-4', 'rounded-xl', 'border-2']" ref="box">
    <p class="max-w-fit rounded-md border-2 bg-white p-1">{{ colorHex }} {{ colorClass }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';

const props = defineProps({
  colorClass: {
    type: String,
    required: true,
  },
});

const box = ref(null);
const colorHex = ref('');

// Получение реального цвета из CSS (rgba или hex)
const rgbHex = computed(() => {
  const rgbString = window.getComputedStyle(box.value).backgroundColor;
  const match = rgbString.match(/\d+\.?\d*/g);
  if (!match || match.length < 3) return rgbString;

  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);
  const a = match.length >= 4 ? parseFloat(match[3]) : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
});

function updateColor() {
  if (box.value) {
    colorHex.value = rgbHex.value;
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rgbHex.value);
  } catch (error) {
    console.log('Копирование цвета: ', error);
  }
};

onMounted(updateColor);
watch(() => props.colorClass, updateColor);
</script>
