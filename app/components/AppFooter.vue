<template>
  <footer class="footer-wrap">
    <div class="site-container">
      <div class="surface-card footer-box">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <img src="/logo-mark.png" alt="ONE STYLE FOREVER" />
            </div>

            <div class="footer-brand-text">
              <strong>ONE_STYLE</strong>
              <span>FOREVER</span>
            </div>
          </div>

          <nav class="footer-nav">
            <NuxtLink :to="localePath('/')">{{ $t('nav.home') }}</NuxtLink>
            <NuxtLink :to="localePath('/catalog')">{{ $t('nav.catalog') }}</NuxtLink>
            <NuxtLink :to="localePath('/about')">{{ $t('nav.about') }}</NuxtLink>
            <NuxtLink :to="localePath('/cart')">{{ $t('nav.cart') }}</NuxtLink>
          </nav>
        </div>

        <div class="footer-bottom">
          <p>{{ $t('footer.text') }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>

<style scoped>
.footer-wrap {
  padding: 0 0 24px;
}

.footer-box {
  padding: 26px 28px;
}

.footer-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.footer-logo {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #f8faf8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.footer-logo img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.footer-brand-text {
  display: grid;
  line-height: 1;
}

.footer-brand-text strong {
  font-size: 18px;
  letter-spacing: -0.03em;
}

.footer-brand-text span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 14px;
}

.footer-nav {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.footer-nav a {
  font-weight: 700;
  color: var(--muted);
  transition: 0.2s ease;
}

.footer-nav a:hover {
  color: var(--text);
}

.footer-bottom {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.footer-bottom p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

@media (max-width: 760px) {
  .footer-box {
    padding: 20px 18px;
  }

  .footer-grid {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-nav {
    gap: 12px;
    flex-direction: column;
  }
}
</style>