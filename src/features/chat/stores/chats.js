import { defineStore } from 'pinia';

export const useChatsStore = defineStore('chats', {
  state: () => ({
    chats: [],
    currentChatId: null,
  }),
  persist: true,
  getters: {
    currentChat: (state) => state.chats.find((c) => c.id === state.currentChatId) || null,
  },
  actions: {
    init() {
      if (this.chats.length === 0) {
        this.createChat('Новый чат');
      }
      if (!this.currentChatId && this.chats.length) {
        this.currentChatId = this.chats[0].id;
      }
    },
    createChat(name = null) {
      const id = Date.now().toString();
      const chatName = name || `Чат ${this.chats.length + 1}`;
      const newChat = {
        id,
        name: chatName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.chats.push(newChat);
      this.currentChatId = id;
      return id;
    },
    deleteChat(id) {
      const index = this.chats.findIndex((c) => c.id === id);
      if (index === -1) return;
      this.chats.splice(index, 1);
      if (this.currentChatId === id) {
        this.currentChatId = this.chats.length ? this.chats[0].id : null;
      }
    },
    renameChat(id, newName) {
      const chat = this.chats.find((c) => c.id === id);
      if (chat) chat.name = newName.trim() || 'Без названия';
    },
    setCurrentChat(id) {
      if (this.chats.find((c) => c.id === id)) {
        this.currentChatId = id;
      }
    },
    clearAllChats() {
      this.chats = [];
      this.currentChatId = null;
      this.createChat('Новый чат');
    },
  },
});
