<template>
  <transition name="modal-fade">
    <div
      v-if="modelValue"
      class="bg-glass fixed inset-0 flex flex-col items-center justify-center overflow-y-auto p-1 transition-all duration-300 ease-in-out md:pt-50"
    >
      <div
        class="bg-main border-border max-h-md m-5 flex h-fit w-full max-w-md flex-col items-center rounded-2xl border-5 transition-all duration-300 ease-in-out"
      >
        <h2>{{ mode === 'add' ? 'Добавить аккаунт' : 'Редактировать аккаунт' }}</h2>
        <form @submit.prevent="$emit('save')" class="w-full space-y-5">
          <div class="p-5">
            <label for="modal-username">Имя пользователя</label>
            <Input id="modal-username" v-model="form.username" type="text" required />
          </div>
          <div class="p-5">
            <label for="modal-password">Пароль</label>
            <Input id="modal-password" v-model="form.password" type="password" required />
          </div>
          <div v-if="error" class="p-x-5 text-error flex justify-center font-medium">
            {{ error }}
          </div>
          <div class="grid grid-cols-2 gap-2 px-5 py-2">
            <Button type="button" state="Отмена" mode="block" @click="$emit('close')" />
            <Button type="submit" state="Сохранить" />
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import Button from '@/shared/ui/SmartButton.vue';
import Input from '@/shared/ui/SmartInput.vue';

defineProps({
  modelValue: { type: Boolean, required: true },
  mode: { type: String, default: 'add' },
  form: { type: Object, required: true },
  error: { type: String, default: '' },
});
defineEmits(['save', 'close']);
</script>
