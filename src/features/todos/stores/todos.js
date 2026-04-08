import { defineStore } from 'pinia';

export const useTodosStore = defineStore('todos', {
  state: () => ({
    todos: [],
  }),
  persist: true,
  actions: {
    addTodo(text) {
      if (!text.trim()) return;
      this.todos.push({
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
    },
    toggleTodo(id) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) todo.completed = !todo.completed;
    },
    deleteTodo(id) {
      this.todos = this.todos.filter((t) => t.id !== id);
    },
    updateTodo(id, newText) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo && newText.trim()) todo.text = newText.trim();
    },
    clearCompleted() {
      this.todos = this.todos.filter((t) => !t.completed);
    },
  },
  getters: {
    activeTodos: (state) => state.todos.filter((t) => !t.completed),
    completedTodos: (state) => state.todos.filter((t) => t.completed),
    allCount: (state) => state.todos.length,
    activeCount: (state) => state.todos.filter((t) => !t.completed).length,
  },
});
