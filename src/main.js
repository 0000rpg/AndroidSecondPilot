import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// Импорт сервисов (на будущее)
import { storageRepository, nativeFacade /*, capacitorAdapter*/ } from '@/shared/services';

// Определяем, какой фасад использовать (нативный или web)
const activeNativeFacade = nativeFacade; // nativeFacade.isNative() ? capacitorAdapter : nativeFacade;

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

// Предоставляем сервисы для использования в composables и компонентах
app.provide('storageRepository', storageRepository);
app.provide('nativeFacade', activeNativeFacade);

app.use(pinia);
app.use(router);

app.mount('#app');
