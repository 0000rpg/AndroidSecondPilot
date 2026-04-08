<template>
  <div class="flex gap-2">
    <input
      v-model="newTodoText"
      type="text"
      placeholder="Что нужно сделать?"
      class="bg-main-tb border-border text-text focus:ring-theme w-full rounded-lg border p-2 focus:ring-2 focus:outline-none"
      @keyup.enter="addTodo"
    />
    <button @click="addTodo" class="btn-default !w-auto px-6">Добавить</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTodosStore } from '../stores/todos';

const todosStore = useTodosStore();
const newTodoText = ref('');

const addTodo = () => {
  if (newTodoText.value.trim()) {
    todosStore.addTodo(newTodoText.value);
    newTodoText.value = '';
  }
};
</script>
