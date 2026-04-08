<template>
  <input
    :class="inputClasses"
    :type="inputType"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    @input="onInput"
    v-bind="$attrs"
    @dblclick="handleShowPassword"
    @touchstart="onTouchStart"
  />
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  mode: { type: String, default: 'default' }, // default, error, correct, block
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const currentType = ref(props.type);
let lastTouch = 0;
const DOUBLE_TAP_DELAY = 300;

const onInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const classMap = {
  default: ['bg-stripes-diagonal-transparent', 'border-border', 'focus:border-theme-a'],
  error: ['bg-stripes-error', 'border-border', 'focus:border-error-a'],
  correct: ['bg-stripes-correct', 'border-border', 'focus:border-correct'],
  block: ['bg-main-tb', 'border-border', 'focus:border-main-tb-a'],
};

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

const inputType = computed(() => currentType.value);

const onTouchStart = (touchEvent) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTouch;
  if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
    touchEvent.preventDefault();
    handleShowPassword();
  }
  lastTouch = currentTime;
};

const handleShowPassword = () => {
  if (currentType.value === 'password') {
    currentType.value = 'text';
  } else if (currentType.value === 'text' && props.type === 'password') {
    currentType.value = 'password';
  }
};
</script>
