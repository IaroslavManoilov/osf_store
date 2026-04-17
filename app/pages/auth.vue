<template>
  <div class="auth-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card auth-card">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title auth-title">{{ ui.title }}</h1>
          <p class="section-text auth-subtitle">{{ ui.subtitle }}</p>

          <div class="oauth-grid">
            <button
              type="button"
              class="oauth-btn"
              :disabled="oauthLoading === 'google'"
              @click="startOAuth('google')"
            >
              <span class="oauth-mark google">G</span>
              <span>{{ oauthLoading === 'google' ? ui.redirecting : ui.withGoogle }}</span>
            </button>
          </div>

          <div class="auth-separator">
            <span>{{ ui.or }}</span>
          </div>

          <div class="auth-mode-switch">
            <button
              type="button"
              class="mode-btn"
              :class="{ active: mode === 'register' }"
              @click="mode = 'register'"
            >
              {{ ui.registerTab }}
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ active: mode === 'login' }"
              @click="mode = 'login'"
            >
              {{ ui.loginTab }}
            </button>
          </div>

          <form v-if="mode === 'register'" class="auth-form" @submit.prevent="registerWithEmail">
            <label class="field">
              <span>{{ ui.name }}</span>
              <input
                v-model.trim="registerForm.name"
                type="text"
                autocomplete="name"
                required
                :placeholder="ui.namePlaceholder"
              />
            </label>

            <label class="field">
              <span>{{ ui.phone }}</span>
              <input
                v-model.trim="registerForm.phone"
                type="tel"
                autocomplete="tel"
                required
                :placeholder="ui.phonePlaceholder"
              />
            </label>

            <label class="field">
              <span>{{ ui.login }}</span>
              <input
                v-model.trim="registerForm.login"
                type="text"
                autocomplete="username"
                required
                :placeholder="ui.loginPlaceholder"
              />
            </label>

            <label class="field">
              <span>{{ ui.email }}</span>
              <input
                v-model.trim="registerForm.email"
                type="email"
                autocomplete="email"
                required
                placeholder="name@email.com"
              />
            </label>

            <label class="field">
              <span>{{ ui.password }}</span>
              <div class="password-wrap">
                <input
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  :placeholder="ui.passwordPlaceholder"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showRegisterPassword ? ui.hidePassword : ui.showPassword"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  <svg v-if="showRegisterPassword" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.4 10.4 0 0 1 12 5c5.5 0 9 5.5 9 7s-1 2.8-2.7 4.2M6.6 6.6C4.2 8.2 3 10.6 3 12c0 1.5 3.5 7 9 7a9.6 9.6 0 0 0 4.1-.9"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.7"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7" />
                  </svg>
                </button>
              </div>
            </label>

            <p class="auth-hint" :class="{ invalid: registerForm.password.length > 0 && registerForm.password.length < 8 }">
              {{ ui.passwordHint }}
            </p>

            <p v-if="infoMessage" class="auth-info">{{ infoMessage }}</p>
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

            <button type="submit" class="btn-main auth-submit" :disabled="registering || !canRegister">
              {{ registering ? ui.registering : ui.registerAction }}
            </button>
          </form>

          <form v-else class="auth-form" @submit.prevent="loginWithEmail">
            <label class="field">
              <span>{{ ui.email }}</span>
              <input
                v-model.trim="loginForm.email"
                type="email"
                autocomplete="email"
                required
                placeholder="name@email.com"
              />
            </label>

            <label class="field">
              <span>{{ ui.password }}</span>
              <div class="password-wrap">
                <input
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  minlength="8"
                  :placeholder="ui.passwordPlaceholder"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showLoginPassword ? ui.hidePassword : ui.showPassword"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  <svg v-if="showLoginPassword" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.4 10.4 0 0 1 12 5c5.5 0 9 5.5 9 7s-1 2.8-2.7 4.2M6.6 6.6C4.2 8.2 3 10.6 3 12c0 1.5 3.5 7 9 7a9.6 9.6 0 0 0 4.1-.9"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.7"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7" />
                  </svg>
                </button>
              </div>
            </label>

            <p v-if="infoMessage" class="auth-info">{{ infoMessage }}</p>
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

            <button type="submit" class="btn-main auth-submit" :disabled="loggingIn || !canLogin">
              {{ loggingIn ? ui.loggingIn : ui.loginAction }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const auth = useCustomerAuth()

const mode = ref<'register' | 'login'>('register')
const showRegisterPassword = ref(false)
const showLoginPassword = ref(false)
const oauthLoading = ref<'' | 'google'>('')
const registering = ref(false)
const loggingIn = ref(false)
const infoMessage = ref('')
const errorMessage = ref('')

const registerForm = reactive({
  name: '',
  phone: '',
  login: '',
  email: '',
  password: ''
})

const loginForm = reactive({
  email: '',
  password: ''
})

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
      title: 'Sign in or create account',
      subtitle: 'Use Google or create an account with email and password.',
      withGoogle: 'Continue with Google',
      redirecting: 'Redirecting...',
      or: 'or',
      registerTab: 'Register',
      loginTab: 'Sign in',
      name: 'Name',
      namePlaceholder: 'Your name',
      phone: 'Phone',
      phonePlaceholder: '+37368123456',
      login: 'Login',
      loginPlaceholder: 'your_login',
      email: 'Email',
      password: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      passwordHint: 'Password must contain at least 8 characters.',
      registerAction: 'Create account',
      registering: 'Creating account...',
      loginAction: 'Sign in',
      loggingIn: 'Signing in...',
      registeredSuccess: 'Account created successfully.',
      checkEmail: 'Check your email to confirm registration, then sign in.',
      fallback: 'Authentication failed. Please try again.'
    }
  }

  if (locale.value === 'ro') {
    return {
      label: 'Cont',
      title: 'Intră în cont sau creează unul nou',
      subtitle: 'Folosește Google sau înregistrează-te cu email și parolă.',
      withGoogle: 'Continuă cu Google',
      redirecting: 'Se redirecționează...',
      or: 'sau',
      registerTab: 'Înregistrare',
      loginTab: 'Autentificare',
      name: 'Nume',
      namePlaceholder: 'Numele tău',
      phone: 'Telefon',
      phonePlaceholder: '+37368123456',
      login: 'Login',
      loginPlaceholder: 'loginul_tău',
      email: 'Email',
      password: 'Parolă',
      passwordPlaceholder: 'Minim 8 caractere',
      showPassword: 'Arată parola',
      hidePassword: 'Ascunde parola',
      passwordHint: 'Parola trebuie să aibă cel puțin 8 caractere.',
      registerAction: 'Creează cont',
      registering: 'Se creează contul...',
      loginAction: 'Intră în cont',
      loggingIn: 'Se autentifică...',
      registeredSuccess: 'Contul a fost creat cu succes.',
      checkEmail: 'Verifică emailul pentru confirmare, apoi autentifică-te.',
      fallback: 'Autentificarea a eșuat. Încearcă din nou.'
    }
  }

  return {
    label: 'Аккаунт',
    title: 'Вход или регистрация',
    subtitle: 'Войти можно через Google или зарегистрироваться по email и паролю.',
    withGoogle: 'Продолжить через Google',
    redirecting: 'Переходим...',
    or: 'или',
    registerTab: 'Регистрация',
    loginTab: 'Вход',
    name: 'Имя',
    namePlaceholder: 'Ваше имя',
    phone: 'Телефон',
    phonePlaceholder: '+37368123456',
    login: 'Логин',
    loginPlaceholder: 'your_login',
    email: 'Email',
    password: 'Пароль',
    passwordPlaceholder: 'Минимум 8 символов',
    showPassword: 'Показать пароль',
    hidePassword: 'Скрыть пароль',
    passwordHint: 'Пароль должен быть минимум 8 символов.',
    registerAction: 'Создать аккаунт',
    registering: 'Создаем аккаунт...',
    loginAction: 'Войти',
    loggingIn: 'Входим...',
    registeredSuccess: 'Аккаунт успешно создан.',
    checkEmail: 'Проверьте email и подтвердите регистрацию, затем войдите.',
    fallback: 'Не удалось выполнить вход. Попробуйте снова.'
  }
})

const canRegister = computed(() => {
  return (
    !!registerForm.name.trim() &&
    !!registerForm.phone.trim() &&
    !!registerForm.login.trim() &&
    !!registerForm.email.trim() &&
    registerForm.password.length >= 8
  )
})

const canLogin = computed(() => !!loginForm.email.trim() && loginForm.password.length >= 8)

const getApiMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    return maybeError.data?.statusMessage || maybeError.statusMessage || maybeError.message || ui.value.fallback
  }
  return ui.value.fallback
}

const resetMessages = () => {
  infoMessage.value = ''
  errorMessage.value = ''
}

const getOAuthRedirectUrl = () => {
  if (!import.meta.client) return undefined
  const path = localePath({
    path: '/auth',
    query: { next: safeNext.value }
  })
  return new URL(path, window.location.origin).toString()
}

const startOAuth = async (provider: 'google') => {
  resetMessages()
  oauthLoading.value = provider
  try {
    const data = await auth.signInWithOAuth(provider, getOAuthRedirectUrl())
    const oauthUrl = String((data as { url?: string } | null)?.url || '').trim()
    if (import.meta.client && oauthUrl) {
      window.location.assign(oauthUrl)
      return
    }
    throw new Error(ui.value.fallback)
  } catch (error) {
    errorMessage.value = getApiMessage(error)
    oauthLoading.value = ''
  }
}

const registerWithEmail = async () => {
  resetMessages()
  if (!canRegister.value) return

  if (registerForm.password.length < 8) {
    errorMessage.value = ui.value.passwordHint
    return
  }

  registering.value = true
  try {
    const result = await auth.signUpWithEmail({
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name,
      phone: registerForm.phone,
      login: registerForm.login
    })

    if (result.needsEmailConfirmation) {
      infoMessage.value = ui.value.checkEmail
      mode.value = 'login'
      loginForm.email = registerForm.email
      return
    }

    infoMessage.value = ui.value.registeredSuccess
    await navigateTo(localePath(safeNext.value))
  } catch (error) {
    errorMessage.value = getApiMessage(error)
  } finally {
    registering.value = false
  }
}

const loginWithEmail = async () => {
  resetMessages()
  if (!canLogin.value) return

  loggingIn.value = true
  try {
    await auth.signInWithPassword(loginForm.email, loginForm.password)
    await navigateTo(localePath(safeNext.value))
  } catch (error) {
    errorMessage.value = getApiMessage(error)
  } finally {
    loggingIn.value = false
  }
}

const redirectIfAuthed = async () => {
  if (!auth.isAuthenticated.value) return
  await navigateTo(localePath(safeNext.value))
}

watch(mode, () => {
  resetMessages()
})

watch(
  () => auth.isAuthenticated.value,
  (next) => {
    if (next) {
      void redirectIfAuthed()
    }
  }
)

onMounted(async () => {
  await auth.initAuth()
  await redirectIfAuthed()
})
</script>

<style scoped>
.auth-page {
  padding-top: 18px;
  padding-bottom: 84px;
}

.auth-card {
  max-width: 760px;
  margin: 0 auto;
  padding: clamp(20px, 3vw, 30px);
  display: grid;
  gap: 16px;
}

.auth-title,
.auth-subtitle {
  margin: 0;
}

.oauth-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.oauth-btn {
  min-height: 52px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 800;
  color: #172236;
  cursor: pointer;
}

.oauth-btn:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.oauth-mark {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 900;
}

.oauth-mark.google {
  background: #eef3ff;
  color: #1f5db8;
}

.auth-separator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b778b;
  font-weight: 700;
  font-size: 13px;
}

.auth-separator::before,
.auth-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.auth-mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 999px;
  width: fit-content;
}

.mode-btn {
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font-weight: 800;
  color: #4f6178;
  cursor: pointer;
}

.mode-btn.active {
  background: #edf4ec;
  color: #193125;
}

.auth-form {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 7px;
}

.field > span {
  font-weight: 800;
  font-size: 14px;
}

.field input {
  min-height: 52px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 14px;
  font-size: 16px;
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  width: 100%;
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #4f6077;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.password-toggle svg {
  width: 20px;
  height: 20px;
}

.auth-hint {
  margin: -2px 0 0;
  color: #5f6d82;
  font-size: 13px;
  font-weight: 600;
}

.auth-hint.invalid {
  color: #b54747;
}

.auth-info {
  color: #2f6f49;
  font-weight: 700;
  margin: 0;
}

.auth-submit {
  width: 100%;
}

@media (max-width: 720px) {
  .auth-card {
    border-radius: 22px;
    padding: 18px 14px;
  }

  .field input {
    min-height: 48px;
    font-size: 15px;
  }
}
</style>
