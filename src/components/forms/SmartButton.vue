<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="tag === 'button' ? disabled : undefined"
    v-bind="$attrs"
    @click="handleClick"
  >
    {{ buttonText }}
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  mode: {
    type: String, // default, error, correct, block
    default: 'default',
  },
  state: {
    type: String,
    required: true,
  },
  state_list: {
    type: Object,
    required: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: String,
    default: 'button',
  },
});

const emit = defineEmits(['click']);

const background = {
  default: ['bg-theme', 'hover:bg-theme-a'],
  block: ['bg-main-tb', 'hover:bg-main-tb-a'],
  correct: ['bg-correct', 'hover:bg-correct-a'],
  error: ['bg-error', 'hover:bg-error-a'],
};

const baseButtonClasses = [
  'border-border',
  'hover:border-border-a',
  'text-text',
  'w-full',
  'rounded-2xl',
  'border-2',
  'p-2',
  'text-lg',
  'font-bold',
  'transition-all',
  'duration-300',
  'ease-in-out',
];

const buttonClasses = computed(() => {
  const modeKey = props.mode;
  const modeClasses = background[modeKey] || background.default;
  const classes = [...baseButtonClasses, ...modeClasses];

  if (props.disabled) {
    classes.push('opacity-50', 'cursor-not-allowed');
  }

  return classes;
});

const buttonText = computed(() => (props.state_list ? props.state_list[props.state] : props.state));

const handleClick = (event) => {
  if (props.disabled) return;
  emit('click', event);
};
</script>
