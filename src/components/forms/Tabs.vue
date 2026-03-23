<template>
  <div
    class="flex w-full justify-between px-5 pb-5 text-2xl transition-all duration-300 ease-in-out"
  >
    <button
      v-for="item in items"
      :key="item.value"
      @click="handleClick(item.value)"
      class="flex-1 p-2 transition-all duration-100"
      :class="getButtonClasses(item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
    // :) Пример: [{ value: 'login', label: 'Вход' }, { value: 'register', label: 'Регистрация' }]
  },
  activeClass: {
    type: String,
    default: 'border-theme text-theme border-b-2 font-medium',
  },
  inactiveClass: {
    type: String,
    default: 'text-border-a hover:text-theme-a',
  },
});

const emit = defineEmits(['update:modelValue']);

const handleClick = (value) => {
  if (value !== props.modelValue) {
    emit('update:modelValue', value);
  }
};

const getButtonClasses = (value) => {
  return value === props.modelValue ? props.activeClass : props.inactiveClass;
};
</script>
