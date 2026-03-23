<template>
  <input
    :class="inputClasses"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    @input="onInput"
    v-bind="$attrs"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  mode: {
    type: String, // default, error, correct, block
    default: 'default',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const onInput = (event) => {
  emit('update:modelValue', event.target.value);
};

// Классы для каждого режима
const classMap = {
  default: ['bg-stripes-diagonal-transparent', 'border-border', 'focus:border-theme-a'],
  error: ['bg-stripes-error', 'border-border', 'focus:border-error-a'],
  correct: ['bg-stripes-correct', 'border-border', 'focus:border-correct'],
  block: ['bg-main-tb', 'border-border', 'focus:border-main-tb-a'],
};

// Базовые классы, общие для всех режимов
const baseClasses = [
  'text-text',
  'w-full',
  'rounded-lg',
  'border',
  'px-4',
  'py-2',
  'transition-all',
  'focus:border-2',
  'focus:outline-none',
];

const inputClasses = computed(() => {
  const modeClasses = classMap[props.mode] || classMap.default;
  return [...baseClasses, ...modeClasses];
});
</script>
