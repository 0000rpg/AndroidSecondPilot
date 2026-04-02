<template>
  <div
    class="bg-background flex min-h-screen flex-col items-center justify-center p-1 transition-all duration-300 ease-in-out"
  >
    <div
      class="bg-main border-border max-h-md m-5 flex h-full w-full max-w-md flex-col items-center rounded-2xl border-5 transition-all duration-300 ease-in-out"
    >
      <h2 class="text-2xl font-bold">Добро пожаловать, {{ authStore.user }}!</h2>

      <!-- Grid табличка -->
      <div class="w-full space-y-5">
        <div class="grid grid-cols-2 items-center gap-4 p-2">
          <button @click="openAddModal" class="button-correct">Добавить аккаунт</button>
          <button @click="logout" class="button-default">Выйти</button>
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
                  class="button-default mb-1 w-full py-1 text-base"
                >
                  Edit
                </button>
                <button
                  @click="deleteAccount(account.id, account.username)"
                  class="button-error mb-1 w-full py-1 text-base"
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
    <div
      v-if="showModal"
      class="bg-opacity-75 fixed inset-0 flex items-center justify-center bg-gray-500"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6">
        <h3 class="mb-4 text-xl font-bold">
          {{ modalMode === 'add' ? 'Добавить аккаунт' : 'Редактировать аккаунт' }}
        </h3>
        <form @submit.prevent="saveAccount">
          <div class="mb-4">
            <label class="mb-2 block text-sm font-bold text-gray-700" for="modal-username"
              >Имя пользователя</label
            >
            <input
              id="modal-username"
              v-model="editForm.username"
              type="text"
              required
              class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div class="mb-4">
            <label class="mb-2 block text-sm font-bold text-gray-700" for="modal-password"
              >Пароль</label
            >
            <input
              id="modal-password"
              v-model="editForm.password"
              type="password"
              required
              class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div v-if="modalError" class="mb-4 text-sm text-red-500">{{ modalError }}</div>
          <div class="flex justify-end">
            <button
              type="button"
              @click="closeModal"
              class="mr-2 rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAccountsStore } from '@/stores/accounts';
import { useRouter } from 'vue-router';
import Button from '@/components/forms/SmartButton.vue';

const authStore = useAuthStore();
const accountsStore = useAccountsStore();
const router = useRouter();

const showModal = ref(false);
const modalMode = ref('add');
const editForm = reactive({ id: null, username: '', password: '' });
const modalError = ref('');

const openAddModal = () => {
  modalMode.value = 'add';
  editForm.id = null;
  editForm.username = '';
  editForm.password = '';
  modalError.value = '';
  showModal.value = true;
};

const openEditModal = (account) => {
  modalMode.value = 'edit';
  editForm.id = account.id;
  editForm.username = account.username;
  editForm.password = account.password;
  modalError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveAccount = () => {
  modalError.value = '';
  const existing = accountsStore.accounts.find((acc) => acc.username === editForm.username);
  if (existing && (modalMode.value === 'add' || existing.id !== editForm.id)) {
    modalError.value = 'Пользователь с таким именем уже существует';
    return;
  }

  if (modalMode.value === 'add') {
    accountsStore.addAccount({ username: editForm.username, password: editForm.password });
  } else {
    accountsStore.updateAccount(editForm.id, {
      username: editForm.username,
      password: editForm.password,
    });
    if (authStore.user === accountsStore.accounts.find((a) => a.id === editForm.id)?.username) {
      authStore.user = editForm.username;
    }
  }
  closeModal();
};

const deleteAccount = (id, username) => {
  if (confirm(`Вы уверены, что хотите удалить аккаунт ${username}?`)) {
    accountsStore.deleteAccount(id);
    if (authStore.user === username) {
      authStore.logout();
      router.push('/');
    }
  }
};

const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>
