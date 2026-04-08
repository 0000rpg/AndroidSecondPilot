<template>
  <div class="fixed top-16 left-0 h-[calc(100vh-12.5rem)]" :class="showChatList ? 'z-10' : 'z-1'">
    <div class="relative h-full">
      <div
        class="h-full transition-all duration-300 ease-out"
        :class="showChatList ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'"
      >
        <div
          class="custom-scrollbar flex h-full max-w-xs min-w-2xs flex-col items-start overflow-x-hidden overflow-y-auto bg-transparent p-2 pr-4"
        >
          <div
            v-for="chat in chatsStore.chats"
            :key="chat.id"
            class="bg-main border-border text-text hover:bg-main-a relative mb-2 w-full cursor-pointer rounded-2xl border p-2 transition-all"
            :class="{ 'border-theme border-2': chatsStore.currentChatId === chat.id }"
            @click="chatsStore.setCurrentChat(chat.id)"
          >
            <div class="flex items-center justify-between">
              <span class="truncate text-sm font-medium" v-if="editingId !== chat.id">
                {{ chat.name }}
              </span>
              <input
                v-else
                v-model="editName"
                type="text"
                class="bg-main-tb border-border text-text z-5 w-full rounded px-1 text-sm"
                @keyup.enter="saveRename(chat.id)"
                @blur="saveRename(chat.id)"
                @keyup.esc="cancelEdit"
                autofocus
              />
              <div class="absolute top-5 right-1">
                <button
                  @click.stop="toggleMenu(chat.id)"
                  class="text-text-a hover:text-text px-1 text-xl leading-5"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenu === chat.id"
                  class="bg-main border-border absolute top-5 right-0 z-20 w-34 rounded-md border shadow-md"
                >
                  <button
                    @click="startRename(chat)"
                    class="hover:bg-main-tb block w-full px-3 py-1 text-left text-sm"
                  >
                    Переименовать
                  </button>
                  <button
                    @click="deleteChat(chat.id)"
                    class="hover:bg-main-tb text-error block w-full px-3 py-1 text-left text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
            <div class="text-text-a mt-1 truncate text-xs">
              {{ lastMessagePreview(chat) }}
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-glass border-border hover:bg-theme-a absolute top-4 right-4 z-20 cursor-pointer rounded-2xl border px-2.5 py-1 transition-all duration-300 ease-out"
        :class="showChatList ? 'translate-x-12' : '-translate-x-56'"
        @click="showChatList = !showChatList"
      >
        #
      </div>
    </div>
  </div>
  <div
    class="bg-glass border-border hover:bg-theme-a fixed top-16 right-2 z-20 m-4 cursor-pointer rounded-2xl border px-2.5 py-1 transition-all duration-300 ease-out"
    @click="createNewChat"
  >
    +
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useChatsStore } from '../stores/chats';

const chatsStore = useChatsStore();
const showChatList = ref(false);
const activeMenu = ref(null);
const editingId = ref(null);
const editName = ref('');

const lastMessagePreview = (chat) => {
  const lastMsg = chat.messages?.[chat.messages.length - 1];
  if (!lastMsg) return 'Нет сообщений';
  const preview =
    lastMsg.content.length > 50 ? lastMsg.content.slice(0, 50) + '…' : lastMsg.content;
  return `${lastMsg.role === 'user' ? '👤' : '🤖'} ${preview}`;
};

const toggleMenu = (id) => {
  activeMenu.value = activeMenu.value === id ? null : id;
};

const createNewChat = () => {
  chatsStore.createChat();
  activeMenu.value = null;
};

const startRename = (chat) => {
  editingId.value = chat.id;
  editName.value = chat.name;
  activeMenu.value = null;
};

const saveRename = (id) => {
  if (editingId.value === id && editName.value.trim()) {
    chatsStore.renameChat(id, editName.value);
  }
  editingId.value = null;
  editName.value = '';
};

const cancelEdit = () => {
  editingId.value = null;
  editName.value = '';
};

const deleteChat = (id) => {
  if (confirm('Удалить этот чат?')) {
    chatsStore.deleteChat(id);
    activeMenu.value = null;
  }
};
</script>
