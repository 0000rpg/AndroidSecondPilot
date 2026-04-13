/**
 * @fileoverview Менеджер бизнес-логики для управления состоянием чатов.
 */
export class ChatManager {
  /**
   * @param {Array<Object>} initialChats - Начальный массив чатов.
   */
  constructor(initialChats = []) {
    this.chats = [...initialChats];
  }

  /**
   * Получает ID текущего активного чата (первый в списке).
   * @returns {string | null} ID первого чата или null, если список пуст.
   */
  get currentChatId() {
    return this.chats.length > 0 ? this.chats[0].id : null;
  }

  /**
   * Инициализирует состояние, если чаты пусты или текущий ID не установлен.
   * @returns {{initialChats: Array<Object>, initialChatId: string | null}} Объект с начальными данными для Pinia Store.
   */
  init() {
    if (this.chats.length === 0) {
      const newId = this.createChat('Новый чат');
      return { initialChats: [this.chats[0]], initialChatId: newId };
    } else if (!this.currentChatId && this.chats.length > 0) {
      // Если текущий ID не установлен, выбираем первый чат
      return { initialChats: [...this.chats], initialChatId: this.chats[0].id };
    }
    return { initialChats: [...this.chats], initialChatId: this.currentChatId };
  }

  /**
   * Создает новый чат и возвращает его ID.
   * @param {string | null} name - Имя нового чата.
   * @returns {string} ID созданного чата.
   */
  createChat(name = null) {
    const id = Date.now().toString();
    const chatName = name || `Чат ${this.chats.length + 1}`;
    const newChat = {
      id,
      name: chatName,
      lastMessageContent: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.chats.push(newChat);
    return id;
  }

  /**
   * Удаляет чат по ID и возвращает новый активный ID или null.
   * @param {string} id - ID удаляемого чата.
   * @returns {{updatedChats: Array<Object>, newActiveId: string | null}} Объект с обновленным массивом и новым ID.
   */
  deleteChat(id) {
    const index = this.chats.findIndex((c) => c.id === id);
    if (index === -1) return { updatedChats: [...this.chats], newActiveId: this.currentChatId };

    const updatedChats = [...this.chats];
    updatedChats.splice(index, 1);

    // Определяем новый активный ID
    let newActiveId;
    if (this.currentChatId === id) {
      newActiveId = updatedChats.length > 0 ? updatedChats[0].id : null;
    } else {
      newActiveId = this.currentChatId;
    }

    return { updatedChats, newActiveId };
  }

  /**
   * Переименовывает чат.
   * @param {string} id - ID чата для переименования.
   * @param {string | null} newName - Новое имя.
   */
  renameChat(id, newName) {
    const chat = this.chats.find((c) => c.id === id);
    if (chat) chat.name = (newName || '').trim() || 'Без названия';
  }

  /**
   * Устанавливает активный чат по ID, если он существует.
   * @param {string} id - ID целевого чата.
   * @returns {boolean} true, если чат найден и установлен, иначе false.
   */
  setCurrentChat(id) {
    if (this.chats.find((c) => c.id === id)) {
      return true;
    }
    return false;
  }

  /**
   * Очищает все чаты и создает новый пустой, возвращая его ID.
   * @returns {{updatedChats: Array<Object>, newActiveId: string}} Объект с обновленным массивом и новым ID.
   */
  clearAllChats() {
    const newChat = this.createChat('Новый чат');
    return { updatedChats: [newChat], newActiveId: newChat };
  }
}
