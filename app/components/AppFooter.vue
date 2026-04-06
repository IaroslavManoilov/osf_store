<template>
  <footer class="app-footer">
    <div class="site-container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>ONE STYLE FOREVER</h3>
          <p>{{ $t('footer.description') }}</p>

          <div class="trust-row">
            <span class="trust-pill">{{ $t('footer.trustShipping') }}</span>
            <span class="trust-pill">{{ $t('footer.trustPayment') }}</span>
            <span class="trust-pill">{{ $t('footer.trustSupport') }}</span>
          </div>

          <div class="footer-social">
            <a
              href="https://www.instagram.com/iaroslav_manoilov_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              class="social-link"
            >
              IG
            </a>
            <a
              href="https://t.me/iaroslav_manoilov"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              class="social-link"
            >
              TG
            </a>
          </div>
        </div>

        <div class="footer-links">
          <div class="footer-section">
            <h4>{{ $t('footer.shop') }}</h4>
            <ul>
              <li><NuxtLink :to="localePath('/catalog')">{{ $t('nav.catalog') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/wishlist')">{{ $t('nav.wishlist') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/cart')">{{ $t('nav.cart') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/checkout')">{{ $t('nav.checkout') }}</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>{{ $t('footer.company') }}</h4>
            <ul>
              <li><NuxtLink :to="localePath('/about')">{{ $t('nav.about') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/contacts')">{{ $t('footer.contact') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/shipping')">{{ $t('footer.shipping') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/returns')">{{ $t('footer.returns') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/admin')">Admin</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>{{ $t('footer.support') }}</h4>
            <ul>
              <li><NuxtLink :to="localePath('/faq')">{{ $t('footer.faq') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/size-guide')">{{ $t('footer.sizeGuide') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/care')">{{ $t('footer.care') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/privacy')">{{ $t('footer.privacy') }}</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>{{ $t('footer.copyright') }}</p>
        <p>{{ $t('footer.paymentLine') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #131a20, #0f151a);
  color: #f5f7fa;
  padding: 54px 0 26px;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  margin-bottom: 28px;
}

.footer-brand h3 {
  font-size: 30px;
  margin: 0 0 14px;
  letter-spacing: -0.03em;
}

.footer-brand p {
  max-width: 560px;
  margin: 0;
  color: #a1acb9;
  line-height: 1.7;
}

.trust-row {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trust-pill {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #313f4d;
  color: #cfdae6;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.footer-social {
  margin-top: 18px;
  display: flex;
  gap: 10px;
}

.social-link {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid #334152;
  color: #ecf2f8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  transition: 0.2s ease;
}

.social-link:hover {
  background: #216640;
  border-color: #216640;
}

.footer-links {
  display: flex;
  gap: 46px;
}

.footer-section h4 {
  margin: 0 0 16px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d8e3ef;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 8px;
}

.footer-section a {
  color: #a9b5c3;
  font-size: 14px;
  line-height: 1.35;
  word-break: break-word;
}

.footer-section a:hover {
  color: #eef4fb;
}

.footer-bottom {
  border-top: 1px solid #2f3d4d;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.footer-bottom p {
  margin: 0;
  color: #8f9baa;
  font-size: 13px;
}

@media (max-width: 880px) {
  .footer-content {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 22px;
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    justify-content: stretch;
  }
}

@media (max-width: 680px) {
  .app-footer {
    padding: 38px 0 22px;
  }

  .footer-content {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px;
  }

  .footer-brand h3 {
    font-size: 22px;
    margin-bottom: 10px;
  }

  .footer-brand p {
    font-size: 14px;
    line-height: 1.5;
  }

  .trust-row {
    margin-top: 14px;
    gap: 6px;
  }

  .trust-pill {
    min-height: 30px;
    padding: 0 10px;
    font-size: 11px;
  }

  .footer-social {
    margin-top: 12px;
  }

  .footer-links {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .footer-section h4 {
    margin-bottom: 10px;
    font-size: 12px;
  }

  .footer-section li {
    margin-bottom: 6px;
  }

  .footer-section a {
    font-size: 13px;
  }

  .footer-bottom {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    gap: 10px;
  }

  .footer-bottom p {
    font-size: 12px;
  }
}

@media (max-width: 540px) {
  .footer-content {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px;
  }

  .footer-links {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .footer-brand h3 {
    font-size: 20px;
  }

  .footer-brand p {
    font-size: 13px;
    line-height: 1.45;
  }

  .footer-section h4 {
    font-size: 11px;
    letter-spacing: 0.1em;
  }

  .footer-section a {
    font-size: 12px;
    line-height: 1.3;
  }

  .footer-bottom {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
