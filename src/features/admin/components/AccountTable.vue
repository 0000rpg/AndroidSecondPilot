<!-- Таблица учётных записей с кнопками действий -->
<template>
  <div class="text-text min-w-full overflow-x-auto p-4">
    <!-- Заголовок таблицы -->
    <div
      class="border-border text-text mb-2 grid grid-cols-7 items-center gap-4 border-b-2 text-base font-medium uppercase"
    >
      <div class="col-span-3 text-left">Имя пользователя</div>
      <div class="col-span-2 text-left">Пароль</div>
      <div class="col-span-2 text-center">Действия</div>
    </div>

    <!-- Строки данных -->
    <div v-for="account in accounts" :key="account.id">
      <div class="border-border mb-1 grid grid-cols-7 items-center gap-4 border-b text-base">
        <div class="col-span-3 text-left">{{ account.username }}</div>
        <div class="col-span-2 text-left">{{ account.password }}</div>
        <div class="col-span-2 text-center">
          <button @click="onEdit(account)" class="btn-default mb-1 w-full py-1 text-base">
            Edit
          </button>
          <button
            @click="onDelete(account.id, account.username)"
            class="btn-error mb-1 w-full py-1 text-base"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  accounts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['edit', 'delete']);

const onEdit = (account) => {
  emit('edit', account);
};

const onDelete = (id, username) => {
  emit('delete', id, username);
};
</script>
