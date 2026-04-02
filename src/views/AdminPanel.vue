<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center justify-center p-1 transition-all duration-300 ease-in-out"
  >
    <div class="card-base">
      <h2 class="text-2xl font-bold">Добро пожаловать, {{ authStore.user }}!</h2>

      <!-- Grid табличка -->
      <div class="w-full space-y-5">
        <div class="grid grid-cols-2 items-center gap-4 p-2">
          <button @click="openAddModal" class="btn-correct">Добавить аккаунт</button>
          <button @click="logout" class="btn-default">Выйти</button>
        </div>
        <div class="text-text min-w-full overflow-x-auto p-4">
          <!-- Заголовок (grid) -->
          <div
            class="border-border text-text mb-2 grid grid-cols-7 items-center gap-4 border-b-2 text-base font-medium uppercase"
          >
            <div class="col-span-3 text-left">Имя пользователя</div>
            <div class="col-span-2 text-left">Пароль</div>
            <div class="col-span-2 text-center">Действия</div>
          </div>

          <!-- Строки данных -->
          <div v-for="account in accountsStore.accounts" :key="account.id">
            <div class="border-border mb-1 grid grid-cols-7 items-center gap-4 border-b text-base">
              <div class="col-span-3 text-left">{{ account.username }}</div>
              <div class="col-span-2 text-left">{{ account.password }}</div>
              <div class="col-span-2 text-center">
                <button
                  @click="openEditModal(account)"
                  class="btn-default mb-1 w-full py-1 text-base"
                >
                  Edit
                </button>
                <button
                  @click="deleteAccount(account.id, account.username)"
                  class="btn-error mb-1 w-full py-1 text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit -->
    <transition name="modal-fade">
      <div
        v-if="showModal"
        class="bg-glass fixed inset-0 flex flex-col items-center justify-center p-1 transition-all duration-300 ease-in-out"
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
              <Button type="submit" state="Сохранить" @click="closeModal"></Button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useAdminPanel } from '@/composables/useAdminPanel';
import Button from '@/components/forms/SmartButton.vue';
import Input from '@/components/forms/SmartInput.vue';

const {
  authStore,
  accountsStore,
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
} = useAdminPanel();
</script>
