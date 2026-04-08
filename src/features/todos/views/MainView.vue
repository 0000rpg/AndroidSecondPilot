<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center p-4 transition-all duration-300"
  >
    <div class="card-base w-full! max-w-2xl!">
      <h2>Мои заметки</h2>

      <!-- Форма добавления -->
      <div class="w-full px-4 pb-4">
        <TodoInput />
      </div>

      <!-- Список задач -->
      <TodoList />
    </div>
  </div>
</template>

<script setup>
import TodoInput from '../components/TodoInput.vue';
import TodoList from '../components/TodoList.vue';
</script>
