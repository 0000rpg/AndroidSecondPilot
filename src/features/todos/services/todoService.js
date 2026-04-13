/**
 * @typedef {object} TodoItem
 * @property {number} id
 * @property {string} text
 * @property {boolean} completed
 * @property {string} createdAt
 */

/**
 * Сервис для управления доменом задач (Todos).
 * Отвечает за бизнес-логику, а не за управление состоянием.
 */
export class TodoService {
  /**
   * Создает новую задачу.
   * @param {string} text Текст новой задачи.
   * @returns {TodoItem | null} Новая задача или null в случае ошибки.
   */
  static addTodo(text) {
    if (!text || typeof text !== 'string' || !text.trim()) return null;

    const newTodo = {
      id: Date.now(), // В реальном приложении это должен быть ID из БД/API
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    return newTodo;
  }

  /**
   * Обновляет существующую задачу в списке.
   * @param {Array<TodoItem>} todosList - Текущий список задач.
   * @param {number} id ID задачи для обновления.
   * @param {string} newText Новый текст.
   * @returns {{updatedList: Array<TodoItem>, success: boolean}} Объект с обновленным списком и статусом успеха.
   */
  static updateTodo(todosList, id, newText) {
    if (!Array.isArray(todosList)) return { updatedList: [], success: false };
    if (typeof newText !== 'string' || !newText.trim())
      return { updatedList: todosList, success: false };

    const updatedList = todosList.map((todo) =>
      todo.id === id ? { ...todo, text: newText.trim() } : todo
    );
    return { updatedList, success: true };
  }

  /**
   * Переключает статус задачи в списке.
   * @param {Array<TodoItem>} todosList - Текущий список задач.
   * @param {number} id ID задачи для переключения статуса.
   * @returns {{updatedList: Array<TodoItem>, success: boolean}} Объект с обновленным списком и статусом успеха.
   */
  static toggleTodo(todosList, id) {
    if (!Array.isArray(todosList)) return { updatedList: [], success: false };

    const updatedList = todosList.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    return { updatedList, success: true };
  }

  /**
   * Удаляет задачу по ID из списка.
   * @param {Array<TodoItem>} todosList - Текущий список задач.
   * @param {number} id ID задачи для удаления.
   * @returns {{updatedList: Array<TodoItem>, success: boolean}} Объект с обновленным списком и статусом успеха.
   */
  static deleteTodo(todosList, id) {
    if (!Array.isArray(todosList)) return { updatedList: [], success: false };

    const updatedList = todosList.filter((todo) => todo.id !== id);
    return { updatedList, success: true };
  }

  /**
   * Фильтрует и удаляет все выполненные задачи из списка.
   * @param {Array<TodoItem>} todosList - Текущий список задач.
   * @returns {{updatedList: Array<TodoItem>, deletedCount: number}} Объект с обновленным списком и количеством удаленных элементов.
   */
  static clearCompleted(todosList) {
    if (!Array.isArray(todosList)) return { updatedList: [], deletedCount: 0 };

    const initialLength = todosList.length;
    const updatedList = todosList.filter((todo) => !todo.completed);
    const deletedCount = initialLength - updatedList.length;

    return { updatedList, deletedCount };
  }
}
