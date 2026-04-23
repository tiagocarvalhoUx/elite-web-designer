import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/auth'
import AOS from 'aos'
import 'aos/dist/aos.css'

const app = createApp(App)

// Inicializar AOS (Animate On Scroll)
AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 100,
  delay: 0,
  mirror: false,
  anchorPlacement: 'top-bottom'
})

app.use(createPinia())
app.use(router)

// Interceptor para tratar erros de autenticação (401/403)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

app.mount('#app')

registerSW({ immediate: true })
