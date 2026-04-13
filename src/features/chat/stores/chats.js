import { defineStore } from 'pinia';
// ИМПОРТ ИЗ ЦЕНТРАЛЬНОГО ФАЙЛА СЕРВИСОВ (index.js)
import { storageRepository } from '@/shared/services';
import { ChatManager } from '../managers/ChatManager';

/**
 * @fileoverview Менеджер бизнес-логики для управления состоянием чатов.
 *
 * Назначение: Инкапсулирует всю логику работы с массивом чатов, соблюдая SRP.
 * Этот класс не является Pinia Store, а чистой утилитой, которую использует Store как Фасад.
 */
export const useChatsStore = defineStore('chats', {
  state: () => ({
    // Инициализируем chatManager с пустым массивом, чтобы избежать проблем при первом рендере
    chatManager: new ChatManager([]),
    currentChatId: null, // Явно управляемое состояние для Pinia Store
  }),
  getters: {
    // currentChat использует state.currentChatId для поиска в chatManager.chats
    currentChat: (state) =>
      state.chatManager.chats.find((c) => c.id === state.currentChatId) || null,
    allChats: (state) => {
      return [...state.chatManager.chats];
    },
  },
  actions: {
    async init() {
      // 1. Попытка загрузить данные из хранилища с обработкой ошибок
      let savedChats = null;
      try {
        savedChats = await storageRepository.getItem('chat_history');
      } catch (e) {
        console.error('Ошибка при чтении истории чатов:', e);
      }
      if (Array.isArray(savedChats) && savedChats.length > 0) {
        this.chatManager.chats = savedChats; // Загружаем чаты в менеджер
        // Устанавливаем текущий ID на основе сохраненных данных
        this.currentChatId = savedChats[0].id || null;
      } else {
        // Если ничего не сохранено, инициализируем с нуля
        const initialData = this.chatManager.init();
        this.chatManager.chats = initialData.initialChats; // Обновляем внутренний массив
        this.currentChatId = initialData.initialChatId; // Устанавливаем ID в Pinia state
      }
    },
    async createChat(name = null) {
      // 1. Создаем чат через менеджер, который добавляет его в internal array
      const newId = this.chatManager.createChat(name);
      // 2. Обновляем state.currentChatId и сохраняем список чатов в хранилище
      this.currentChatId = newId;
      await this.saveChats();
      return newId;
    },
    async deleteChat(id) {
      // 1. Вызываем менеджер для получения нового состояния (массив без удаленного элемента и новый active ID)
      const result = this.chatManager.deleteChat(id);
      // 2. Применяем изменения к состоянию Store и сохраняем
      if (result) {
        this.chatManager.chats = result.updatedChats;
        this.currentChatId = result.newActiveId;
        await this.saveChats();
      }
      return result?.newActiveId;
    },
    async renameChat(id, newName) {
      this.chatManager.renameChat(id, newName);
      await this.saveChats();
    },
    setCurrentChat(id) {
      // Проверяем валидность ID и обновляем state.currentChatId только если чат существует в менеджере
      if (this.chatManager.chats.find((c) => c.id === id)) {
        this.currentChatId = id;
        // При смене чата, мы просто обновляем ID и сохраняем список, чтобы обеспечить консистентность
        this.saveChats();
      }
    },
    async clearAllChats() {
      // 1. Вызываем менеджер для получения нового состояния (массив с одним новым элементом)
      const result = this.chatManager.clearAllChats();
      // 2. Применяем изменения к состоянию Store и сохраняем
      this.chatManager.chats = result.updatedChats;
      this.currentChatId = result.newActiveId;
      await this.saveChats();
    },
    // --- Методы сохранения состояния (Persistence) ---
    async saveChats() {
      const chatsToSave = this.chatManager.chats.map((c) => ({ ...c })); // Глубокая копия для сохранения
      await storageRepository.setItem('chat_history', chatsToSave);
    },
  },
});
