import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/users/auth';
import { useAccountsStore } from '@/stores/users/accounts';
import { useRouter } from 'vue-router';

export function useAdminPanel() {
  const authStore = useAuthStore();
  const accountsStore = useAccountsStore();
  const router = useRouter();

  // Modal state
  const showModal = ref(false);
  const modalMode = ref('add'); // 'add' or 'edit'
  const editForm = reactive({
    id: null,
    username: '',
    password: '',
  });
  const modalError = ref('');

  // Open add account modal
  const openAddModal = () => {
    modalMode.value = 'add';
    editForm.id = null;
    editForm.username = '';
    editForm.password = '';
    modalError.value = '';
    showModal.value = true;
  };

  // Open edit account modal
  const openEditModal = (account) => {
    modalMode.value = 'edit';
    editForm.id = account.id;
    editForm.username = account.username;
    editForm.password = account.password;
    modalError.value = '';
    showModal.value = true;
  };

  // Close modal
  const closeModal = () => {
    showModal.value = false;
  };

  // Save account (add or update)
  const saveAccount = () => {
    modalError.value = '';

    // Check for duplicate username
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

      // Update current user if needed
      const updatedAccount = accountsStore.accounts.find((a) => a.id === editForm.id);
      if (authStore.user === updatedAccount?.username) {
        authStore.user = editForm.username;
      }
    }
    closeModal();
  };

  // Delete account
  const deleteAccount = (id, username) => {
    if (confirm(`Вы уверены, что хотите удалить аккаунт ${username}?`)) {
      accountsStore.deleteAccount(id);

      // Logout if deleting current user
      if (authStore.user === username) {
        authStore.logout();
        router.push('/');
      }
    }
  };

  // Logout
  const logout = () => {
    authStore.logout();
    router.push('/');
  };

  return {
    // State
    showModal,
    modalMode,
    editForm,
    modalError,

    // Methods
    openAddModal,
    openEditModal,
    closeModal,
    saveAccount,
    deleteAccount,
    logout,

    // Stores (for direct access in template if needed)
    authStore,
    accountsStore,
  };
}
