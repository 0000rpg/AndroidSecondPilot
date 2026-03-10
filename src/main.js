import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from './stores/auth'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)

app.use(createPinia())

app.use(pinia)

app.use(router)

const authStore = useAuthStore()
authStore.loadFromStorage()

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.mount('#app')
