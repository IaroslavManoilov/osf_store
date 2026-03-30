// app/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate'

import App from './app.vue'

// Создаем приложение Vue и подключаем Pinia с плагином для сохранения состояния
const app = createApp(App)
const pinia = createPinia()

// Подключаем плагин для сохранения состояния
pinia.use(piniaPersistedState)

app.use(pinia)
app.mount('#app')