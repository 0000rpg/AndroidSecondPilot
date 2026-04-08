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

    <transition name="modal-fade">
      <div
        v-if="showModal"
        class="bg-glass fixed inset-0 flex flex-col items-center justify-center overflow-y-auto p-1 transition-all duration-300 ease-in-out md:pt-50"
      >
        <div
          class="bg-main border-border max-h-md m-5 flex h-fit w-full max-w-md flex-col items-center rounded-2xl border-5 transition-all duration-300 ease-in-out"
        >
          <h2>
            {{ modalMode === 'add' ? 'Добавить аккаунт' : 'Редактировать аккаунт' }}
          </h2>
          <form @submit.prevent="saveAccount" class="w-full space-y-5">
            <div class="p-5">
              <label for="modal-username">Имя пользователя</label>
              <Input id="modal-username" v-model="editForm.username" type="text" required />
            </div>
            <div class="p-5">
              <label for="modal-password">Пароль</label>
              <Input id="modal-password" v-model="editForm.password" type="password" required />
            </div>
            <div v-if="modalError" class="p-x-5 text-error flex justify-center font-medium">
              {{ modalError }}
            </div>
            <div class="grid grid-cols-2 gap-2 px-5 py-2">
              <Button type="button" state="Отмена" mode="block" @click="closeModal"></Button>
              <Button type="submit" state="Сохранить"></Button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useAdminPanel } from '../composables/useAdminPanel';
import AccountTable from '../components/AccountTable.vue';
import Button from '@/shared/ui/SmartButton.vue';
import Input from '@/shared/ui/SmartInput.vue';

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
