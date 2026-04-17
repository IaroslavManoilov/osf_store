<template>
  <div class="auth-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card auth-card">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title auth-title">{{ ui.title }}</h1>
          <p class="section-text auth-subtitle">{{ ui.subtitle }}</p>

          <form class="auth-form" @submit.prevent="verifyCode">
            <label class="field">
              <span>{{ ui.name }}</span>
              <input v-model.trim="form.name" type="text" autocomplete="name" required />
            </label>

            <label class="field">
              <span>{{ ui.email }}</span>
              <input v-model.trim="form.email" type="email" autocomplete="email" placeholder="name@email.com" />
            </label>

            <label class="field">
              <span>{{ ui.phone }}</span>
              <input
                v-model.trim="form.phone"
                type="tel"
                autocomplete="tel"
                placeholder="+37368123456"
                required
              />
            </label>

            <div class="auth-actions">
              <button type="button" class="btn-alt" :disabled="sendingCode || !canSendCode" @click="sendCode">
                {{ sendingCode ? ui.sendingCode : ui.sendCode }}
              </button>
            </div>

            <label v-if="otpSent" class="field">
              <span>{{ ui.code }}</span>
              <input v-model.trim="form.code" type="text" inputmode="numeric" maxlength="6" placeholder="123456" required />
            </label>

            <p v-if="infoMessage" class="auth-info">{{ infoMessage }}</p>
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

            <button type="submit" class="btn-main" :disabled="verifying || !otpSent || !form.code">
              {{ verifying ? ui.verifying : ui.signIn }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const auth = useCustomerAuth()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  code: ''
})

const sendingCode = ref(false)
const verifying = ref(false)
const otpSent = ref(false)
const infoMessage = ref('')
const errorMessage = ref('')

const safeNext = computed(() => {
  const raw = Array.isArray(route.query.next) ? route.query.next[0] : route.query.next
  const next = String(raw || '').trim()
  if (!next || !next.startsWith('/')) return '/orders'
  if (next.startsWith('//')) return '/orders'
  return next
})

const ui = computed(() => {
  if (locale.value === 'en') {
    return {
      label: 'Account',
      title: 'Sign in before checkout',
      subtitle: 'Your orders and status updates will be private for your account only.',
      name: 'Your name',
      email: 'Email',
      phone: 'Phone',
      code: 'SMS code',
      sendCode: 'Send code',
      sendingCode: 'Sending...',
      signIn: 'Confirm and sign in',
      verifying: 'Verifying...',
      codeSent: 'Code sent. Enter SMS code to continue.',
      fallback: 'Auth failed. Please try again.'
    }
  }

  if (locale.value === 'ro') {
    return {
      label: 'Cont',
      title: 'Autentificare înainte de checkout',
      subtitle: 'Comenzile și statusurile tale vor fi private doar în contul tău.',
      name: 'Numele tău',
      email: 'Email',
      phone: 'Telefon',
      code: 'Cod SMS',
      sendCode: 'Trimite codul',
      sendingCode: 'Se trimite...',
      signIn: 'Confirmă și intră',
      verifying: 'Se verifică...',
      codeSent: 'Cod trimis. Introdu codul SMS pentru a continua.',
      fallback: 'Autentificare eșuată. Încearcă din nou.'
    }
  }

  return {
    label: 'Аккаунт',
    title: 'Вход перед оформлением заказа',
    subtitle: 'Твои заказы и статусы будут видны только в твоем аккаунте.',
    name: 'Ваше имя',
    email: 'Email',
    phone: 'Телефон',
    code: 'SMS код',
    sendCode: 'Отправить код',
    sendingCode: 'Отправляем...',
    signIn: 'Подтвердить и войти',
    verifying: 'Проверяем...',
    codeSent: 'Код отправлен. Введите SMS код для входа.',
    fallback: 'Не удалось войти. Попробуйте снова.'
  }
})

const canSendCode = computed(() => {
  const phone = String(form.phone || '').replace(/[^\d+]/g, '')
  return phone.length >= 7
})

const getApiMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    return maybeError.data?.statusMessage || maybeError.statusMessage || maybeError.message || ui.value.fallback
  }
  return ui.value.fallback
}

const sendCode = async () => {
  errorMessage.value = ''
  infoMessage.value = ''
  sendingCode.value = true

  try {
    await auth.sendOtp(form.phone)
    otpSent.value = true
    infoMessage.value = ui.value.codeSent
  } catch (error) {
    errorMessage.value = getApiMessage(error)
  } finally {
    sendingCode.value = false
  }
}

const verifyCode = async () => {
  if (!otpSent.value || !form.code) return
  errorMessage.value = ''
  infoMessage.value = ''
  verifying.value = true

  try {
    await auth.verifyOtp(form.phone, form.code)
    await auth.saveProfile({
      name: form.name,
      email: form.email,
      phone: form.phone
    })
    await navigateTo(localePath(safeNext.value))
  } catch (error) {
    errorMessage.value = getApiMessage(error)
  } finally {
    verifying.value = false
  }
}

onMounted(async () => {
  await auth.initAuth()
  if (auth.isAuthenticated.value && auth.profile.value) {
    form.name = auth.profile.value.name || ''
    form.email = auth.profile.value.email || ''
    form.phone = auth.profile.value.phone || ''
    await navigateTo(localePath(safeNext.value))
  }
})
</script>

<style scoped>
.auth-page {
  padding-top: 22px;
  padding-bottom: 84px;
}

.auth-card {
  max-width: 680px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.auth-title {
  margin: 0;
}

.auth-subtitle {
  margin: 0;
}

.auth-form {
  display: grid;
  gap: 14px;
}

.auth-actions {
  display: flex;
  justify-content: flex-start;
}

.auth-info {
  color: #2f6f49;
  font-weight: 600;
}
</style>
