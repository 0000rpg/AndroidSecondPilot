<template>
  <div class="fixed top-16 left-0 z-10 h-[calc(100vh-12.5rem)]">
    <div class="relative h-full">
      <div
        class="h-full transition-all duration-300 ease-out"
        :class="showChatList ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'"
      >
        <div
          class="custom-scrollbar flex h-full max-w-xs min-w-2xs flex-col items-start overflow-x-hidden overflow-y-auto bg-transparent p-2 pr-4"
        >
          <div
            class="bg-main border-border text-text m-2 w-full overflow-x-clip overflow-y-clip rounded-2xl border p-1 px-2"
            v-for="dialog in dialogList"
            :key="dialog.id"
          >
            {{ dialog.name }}
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
  >
    +
  </div>
</template>

<script setup>
import { ref } from 'vue';

const showChatList = ref(true);
const dialogList = ref([
  {
    name: 'First ap complete',
    id: '1234',
    lastChanged: '05-04-2026',
  },
  {
    name: 'a',
    id: '1234',
    lastChanged: '05-04-2026',
  },
]);
</script>
