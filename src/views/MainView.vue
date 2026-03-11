<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Добро пожаловать, {{ authStore.user }}!</h2>
        <button
          @click="logout"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >Выйти</button>
      </div>

      <div class="bg-white rounded shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Список аккаунтов</h3>
          <button
            @click="openAddModal"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >Добавить аккаунт</button>
        </div>

        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Имя пользователя</th>
              <th class="py-3 px-6 text-left">Пароль</th>
              <th class="py-3 px-6 text-center">Действия</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm">
            <tr v-for="account in accountsStore.accounts" :key="account.id" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left">{{ account.username }}</td>
              <td class="py-3 px-6 text-left">{{ account.password }}</td>
              <td class="py-3 px-6 text-center">
                <button
                  @click="openEditModal(account)"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2"
                >Edit</button>
                <button
                  @click="deleteAccount(account.id, account.username)"
                  class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                >Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Add/Edit -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">{{ modalMode === 'add' ? 'Добавить аккаунт' : 'Редактировать аккаунт' }}</h3>
        <form @submit.prevent="saveAccount">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="modal-username">Имя пользователя</label>
            <input
              id="modal-username"
              v-model="editForm.username"
              type="text"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="modal-password">Пароль</label>
            <input
              id="modal-password"
              v-model="editForm.password"
              type="password"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div v-if="modalError" class="mb-4 text-red-500 text-sm">{{ modalError }}</div>
          <div class="flex justify-end">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >Отмена</button>
            <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const router = useRouter()

const showModal = ref(false)
const modalMode = ref('add')
const editForm = reactive({ id: null, username: '', password: '' })
const modalError = ref('')

const openAddModal = () => {
  modalMode.value = 'add'
  editForm.id = null
  editForm.username = ''
  editForm.password = ''
  modalError.value = ''
  showModal.value = true
}

const openEditModal = (account) => {
  modalMode.value = 'edit'
  editForm.id = account.id
  editForm.username = account.username
  editForm.password = account.password
  modalError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveAccount = () => {
  modalError.value = ''
  const existing = accountsStore.accounts.find(acc => acc.username === editForm.username)
  if (existing && (modalMode.value === 'add' || existing.id !== editForm.id)) {
    modalError.value = 'Пользователь с таким именем уже существует'
    return
  }

  if (modalMode.value === 'add') {
    accountsStore.addAccount({ username: editForm.username, password: editForm.password })
  } else {
    accountsStore.updateAccount(editForm.id, { username: editForm.username, password: editForm.password })
    if (authStore.user === accountsStore.accounts.find(a => a.id === editForm.id)?.username) {
      authStore.user = editForm.username
    }
  }
  closeModal()
}

const deleteAccount = (id, username) => {
  if (confirm(`Вы уверены, что хотите удалить аккаунт ${username}?`)) {
    accountsStore.deleteAccount(id)
    if (authStore.user === username) {
      authStore.logout()
      router.push('/')
    }
  }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>