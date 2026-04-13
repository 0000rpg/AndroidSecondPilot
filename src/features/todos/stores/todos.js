import { defineStore } from 'pinia';
import { TodoService } from '../services/todoService.js';

export const useTodosStore = defineStore('todos', {
  state: () => ({
    todos: [],
  }),
  persist: true,
  actions: {
    addTodo(text) {
      const newTodo = TodoService.addTodo(text);
      if (newTodo) this.todos.push(newTodo);
    },
    toggleTodo(id) {
      // Используем сервис для получения обновленного списка, а затем мутируем состояние
      const result = TodoService.toggleTodo(this.todos, id);
      if (result.success) {
        this.todos = result.updatedList;
      }
    },
    deleteTodo(id) {
      // Используем сервис для получения обновленного списка
      const result = TodoService.deleteTodo(this.todos, id);
      if (result.success) {
        this.todos = result.updatedList;
      }
    },
    updateTodo(id, newText) {
      // Используем сервис для проверки и получения нового списка
      const { updatedList: newList, success } = TodoService.updateTodo(this.todos, id, newText);
      if (success) {
        this.todos = newList;
      }
    },
    clearCompleted() {
      // Используем сервис для расчета и получения нового списка
      const { updatedList: newList, deletedCount } = TodoService.clearCompleted(this.todos);
      this.todos = newList;
      return deletedCount; // Возвращаем количество удаленных элементов
    },
  },
  getters: {
    activeTodos: (state) => state.todos.filter((t) => !t.completed),
    completedTodos: (state) => state.todos.filter((t) => t.completed),
    allCount: (state) => state.todos.length,
    activeCount: (state) => state.todos.filter((t) => !t.completed).length,
  },
});
