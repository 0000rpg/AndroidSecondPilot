import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountsStore } from '@/features/auth/stores/accounts';
import { useAuthStore } from '@/features/auth/stores/auth';

export function useAdminPanel() {
  const router = useRouter();
  const accountsStore = useAccountsStore();
  const authStore = useAuthStore();

  // Состояние модального окна
  const showModal = ref(false);
  const modalMode = ref('add'); // 'add' или 'edit'
  const editForm = reactive({
    id: null,
    username: '',
    password: '',
  });
  const modalError = ref('');

  // Открыть модалку добавления
  const openAddModal = () => {
    modalMode.value = 'add';
    editForm.id = null;
    editForm.username = '';
    editForm.password = '';
    modalError.value = '';
    showModal.value = true;
  };

  // Открыть модалку редактирования
  const openEditModal = (account) => {
    modalMode.value = 'edit';
    editForm.id = account.id;
    editForm.username = account.username;
    editForm.password = account.password;
    modalError.value = '';
    showModal.value = true;
  };

  // Закрыть модалку
  const closeModal = () => {
    showModal.value = false;
  };

  // Сохранить аккаунт (добавить или обновить)
  const saveAccount = () => {
    modalError.value = '';

    const existing = accountsStore.accounts.find((acc) => acc.username === editForm.username);

    if (existing && (modalMode.value === 'add' || existing.id !== editForm.id)) {
      modalError.value = 'Пользователь с таким именем уже существует';
      return;
    }

    if (modalMode.value === 'add') {
      accountsStore.addAccount({
        username: editForm.username,
        password: editForm.password,
      });
    } else {
      accountsStore.updateAccount(editForm.id, {
        username: editForm.username,
        password: editForm.password,
      });

      const updatedAccount = accountsStore.accounts.find((a) => a.id === editForm.id);
      if (authStore.user === updatedAccount?.username) {
        authStore.user = editForm.username;
      }
    }
    closeModal();
  };

  // Удалить аккаунт
  const deleteAccount = (id, username) => {
    if (confirm(`Вы уверены, что хотите удалить аккаунт ${username}?`)) {
      accountsStore.deleteAccount(id);
      if (authStore.user === username) {
        authStore.logout();
        router.push('/');
      }
    }
  };

  // Выйти из системы
  const logout = () => {
    authStore.logout();
    router.push('/');
  };

  return {
    // Состояние
    showModal,
    modalMode,
    editForm,
    modalError,
    // Методы UI
    openAddModal,
    openEditModal,
    closeModal,
    // Бизнес-методы
    saveAccount,
    deleteAccount,
    logout,
    // Доступ к хранилищам (если нужно в шаблоне)
    accountsStore,
    authStore,
  };
}
