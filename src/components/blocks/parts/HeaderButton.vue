<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="tag === 'button' ? disabled : undefined"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
  fullWidth: {
    type: Boolean,
    default: false,
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

const buttonClasses = computed(() => {
  const classes = [
    'relative',
    'rounded-lg',
    'px-4',
    'py-2',
    'text-sm',
    'font-bold',
    'transition-all',
    'duration-300',
    'ease-in-out',
    'border-2',
    'border-border',
    'text-text',
    'hover:border-border-a',
    'hover:bg-main-tb',
    'focus:ring-2',
    'focus:ring-theme',
    'focus:ring-offset-2',
    'focus:outline-none',
  ];

  // Размер sm
  if (props.size === 'sm') {
    classes.push('px-3', 'py-1.5', 'text-xs');
  }

  // Полная ширина
  if (props.fullWidth) {
    classes.push('w-full');
  }

  // Активное состояние
  if (props.active) {
    classes.push('bg-theme', 'hover:bg-theme-a', 'active-with-line');
  } else {
    classes.push('bg-transparent');
  }

  // Отключенное состояние
  if (props.disabled) {
    classes.push('opacity-50', 'cursor-not-allowed');
  }

  return classes;
});

const handleClick = (event) => {
  if (props.disabled) return;
  emit('click', event);
};
</script>

<style scoped>
.active-with-line {
  position: relative;
}

.active-with-line::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 0.125rem;
  background-color: var(--color-text);
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 10px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}
</style>
