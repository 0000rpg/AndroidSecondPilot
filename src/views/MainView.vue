<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center p-4 transition-all duration-300"
  >
    <div class="card-base !w-full !max-w-2xl max-w-2xl">
      <h2>Мои заметки</h2>

      <!-- Форма добавления -->
      <div class="w-full px-4 pb-4">
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
      </div>

      <!-- Фильтры и статистика -->
      <div class="flex w-full flex-wrap items-center justify-between gap-2 px-4 pb-2">
        <div class="flex gap-2">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="currentFilter = filter.value"
            :class="[
              'rounded-lg px-3 py-1 text-sm font-medium transition-all',
              currentFilter === filter.value
                ? 'bg-theme text-text'
                : 'bg-main-tb text-text-a hover:bg-main-tb-a',
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
        <button
          v-if="todosStore.completedTodos.length"
          @click="todosStore.clearCompleted()"
          class="btn-error !w-auto px-3 py-1 text-sm"
        >
          Очистить выполненные
        </button>
      </div>

      <!-- Список задач -->
      <div class="w-full space-y-2 p-4">
        <div v-if="filteredTodos.length === 0" class="text-text-a py-8 text-center">
          Нет задач. Добавьте свою первую цель!
        </div>
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          class="bg-main-tb border-border hover:border-theme-a flex items-center gap-3 rounded-xl border p-3 transition-all"
        >
          <!-- Чекбокс -->
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="todosStore.toggleTodo(todo.id)"
            class="bg-main checked:bg-theme relative h-5 w-5 cursor-pointer appearance-none rounded border border-gray-600 checked:border-gray-500"
            :class="
              todo.completed
                ? 'after:absolute after:top-0 after:left-1 after:text-sm after:text-white after:content-[\'\u2713\']'
                : ''
            "
          />

          <!-- Текст задачи (редактируемый) -->
          <div class="flex-1">
            <span
              v-if="editingId !== todo.id"
              :class="[
                'text-lg break-words',
                todo.completed ? 'text-text-a line-through' : 'text-text',
              ]"
              @dblclick="startEdit(todo)"
            >
              {{ todo.text }}
            </span>
            <input
              v-else
              v-model="editText"
              type="text"
              class="bg-main border-border text-text w-full rounded-lg border p-1"
              @keyup.enter="saveEdit(todo.id)"
              @blur="saveEdit(todo.id)"
              @keyup.esc="cancelEdit"
              autofocus
            />
          </div>

          <!-- Кнопка удалить -->
          <button
            @click="todosStore.deleteTodo(todo.id)"
            class="text-error hover:text-error-a transition-colors"
            title="Удалить"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Статистика внизу -->
      <div class="text-text-a border-border w-full border-t px-4 py-3 text-center text-sm">
        Всего: {{ todosStore.allCount }} | Активных: {{ todosStore.activeCount }} | Выполнено:
        {{ todosStore.completedTodos.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTodosStore } from '@/stores/uniqueStorage/todos';

const todosStore = useTodosStore();

// Новая задача
const newTodoText = ref('');

// Фильтры
const filters = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
];
const currentFilter = ref('all');

const filteredTodos = computed(() => {
  if (currentFilter.value === 'active') return todosStore.activeTodos;
  if (currentFilter.value === 'completed') return todosStore.completedTodos;
  return todosStore.todos;
});

// Добавление
const addTodo = () => {
  if (newTodoText.value.trim()) {
    todosStore.addTodo(newTodoText.value);
    newTodoText.value = '';
  }
};

// Редактирование (по двойному клику)
const editingId = ref(null);
const editText = ref('');

const startEdit = (todo) => {
  editingId.value = todo.id;
  editText.value = todo.text;
};

const saveEdit = (id) => {
  if (editingId.value === id) {
    todosStore.updateTodo(id, editText.value);
    editingId.value = null;
    editText.value = '';
  }
};

const cancelEdit = () => {
  editingId.value = null;
  editText.value = '';
};
</script>
