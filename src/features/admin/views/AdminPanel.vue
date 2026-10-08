<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center justify-center p-1 transition-all duration-300 ease-in-out"
  >
    <div class="card-base">
      <h2 class="text-2xl font-bold">Добро пожаловать, {{ authStore.user }}!</h2>

      <div class="w-full space-y-5">
        <div class="grid grid-cols-2 items-center gap-4 p-2">
          <button @click="openAddModal" class="btn-correct">Добавить аккаунт</button>
          <button @click="logout" class="btn-default">Выйти</button>
        </div>

        <AccountTable
          :accounts="accountsStore.accounts"
          @edit="openEditModal"
          @delete="deleteAccount"
        />
      </div>
    </div>

    <AccountFormModal
      v-model="showModal"
      :mode="modalMode"
      :form="editForm"
      :error="modalError"
      @save="saveAccount"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { useAdminPanel } from '../composables/useAdminPanel';
import AccountTable from '../components/AccountTable.vue';
import AccountFormModal from '../components/AccountFormModal.vue';

const {
  showModal,
  modalMode,
  editForm,
  modalError,
  openAddModal,
  openEditModal,
  closeModal,
  saveAccount,
  deleteAccount,
  logout,
  accountsStore,
  authStore,
} = useAdminPanel();
</script>
