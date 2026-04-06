<template>
  <div class="about-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card intro-box">
          <div class="intro-grid">
            <div class="intro-content">
              <span class="section-label">{{ t('about.label') }}</span>

              <h1 class="section-title intro-title">
                {{ t('about.title') }}
              </h1>

              <p class="section-text intro-text">
                {{ t('about.subtitle') }}
              </p>

              <div class="intro-actions">
                <NuxtLink :to="localePath('/catalog')" class="btn-main">
                  {{ t('about.ctaCatalog') }}
                </NuxtLink>

                <NuxtLink :to="localePath('/contacts')" class="btn-alt">
                  {{ t('about.ctaContacts') }}
                </NuxtLink>
              </div>
            </div>

            <div class="intro-visual">
              <div class="visual-box">
                <img src="/logo-preview.png" alt="ONE STYLE FOREVER" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="surface-card manifesto-box">
          <div class="manifesto-grid">
            <div class="manifesto-content">
              <span class="section-label">{{ t('about.manifestoLabel') }}</span>

              <h2 class="block-title manifesto-title">
                {{ t('about.manifestoTitle') }}
              </h2>

              <p class="section-text manifesto-text">
                {{ t('about.manifestoText') }}
              </p>
            </div>

            <div class="manifesto-points">
              <div class="manifesto-item">
                <strong>{{ t('about.point1Title') }}</strong>
                <span>{{ t('about.point1Text') }}</span>
              </div>

              <div class="manifesto-item">
                <strong>{{ t('about.point2Title') }}</strong>
                <span>{{ t('about.point2Text') }}</span>
              </div>

              <div class="manifesto-item">
                <strong>{{ t('about.point3Title') }}</strong>
                <span>{{ t('about.point3Text') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="surface-card values-box">
          <div class="section-top">
            <div>
              <span class="section-label">{{ t('about.valuesLabel') }}</span>
              <h2 class="block-title">{{ t('about.valuesTitle') }}</h2>
            </div>
          </div>

          <div class="values-grid">
            <article class="value-card">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 20h12a2 2 0 0 0 2-2V8.5a2 2 0 0 0-.586-1.414l-2.5-2.5A2 2 0 0 0 15.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 12h8M8 16h5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </div>

              <h3>{{ t('about.value1Title') }}</h3>
              <p>{{ t('about.value1Text') }}</p>
            </article>

            <article class="value-card">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 21s-6.5-4.35-8.5-8.02C1.94 9.98 3.58 6 7.45 6c1.93 0 3.17 1.02 4.05 2.3C12.38 7.02 13.62 6 15.55 6c3.87 0 5.51 3.98 3.95 6.98C18.5 16.65 12 21 12 21Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <h3>{{ t('about.value2Title') }}</h3>
              <p>{{ t('about.value2Text') }}</p>
            </article>

            <article class="value-card">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                  <path
                    d="m9.5 12 1.7 1.7 3.8-4.2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <h3>{{ t('about.value3Title') }}</h3>
              <p>{{ t('about.value3Text') }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="story-grid">
          <div class="surface-card story-card">
            <span class="section-label">{{ t('about.storyLabel') }}</span>
            <h2 class="block-title">{{ t('about.storyTitle') }}</h2>
            <p class="section-text story-text">
              {{ t('about.storyText') }}
            </p>
          </div>

          <div class="surface-card founder-card">
            <span class="section-label">{{ t('about.founderLabel') }}</span>
            <h2 class="founder-name">{{ t('about.founderName') }}</h2>
            <p class="section-text founder-text">
              {{ t('about.founderText') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="contacts" class="section-space">
      <div class="site-container">
        <div class="surface-card contacts-box">
          <div class="section-top contacts-top">
            <div>
              <span class="section-label">{{ t('about.contactsLabel') }}</span>
              <h2 class="block-title">{{ t('about.contactsTitle') }}</h2>
              <p class="section-text contacts-text">
                {{ t('about.contactsText') }}
              </p>
            </div>
          </div>

          <div class="contacts-grid">
            <a class="contact-card" href="tel:+37368514544">
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5.5 4h3l1.2 4.1-1.8 1.8a15.7 15.7 0 0 0 6.2 6.2l1.8-1.8L20 15.5v3c0 .83-.67 1.5-1.5 1.5C10.49 20 4 13.51 4 5.5 4 4.67 4.67 4 5.5 4Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div>
                <strong>{{ t('about.phoneLabel') }}</strong>
                <span>+37368514544</span>
              </div>
            </a>

            <a class="contact-card" href="mailto:iarosalv2003manoilov@gmail.com">
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 6h16v12H4z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                  <path
                    d="m5 7 7 6 7-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div>
                <strong>{{ t('about.emailLabel') }}</strong>
                <span>iarosalv2003manoilov@gmail.com</span>
              </div>
            </a>

            <a
              class="contact-card"
              href="https://www.instagram.com/iaroslav_manoilov_/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <strong>{{ t('about.instagramLabel') }}</strong>
                <span>@iaroslav_manoilov_</span>
              </div>
            </a>

            <a
              class="contact-card"
              href="https://t.me/iaroslav_manoilov"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M21 4 3.8 10.63c-.78.3-.74 1.42.07 1.66l4.38 1.3 1.67 5.04c.24.73 1.19.85 1.6.2l2.38-3.72 4.58 3.4c.57.42 1.39.1 1.52-.6L22 5.1A.92.92 0 0 0 21 4Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                  <path
                    d="m8.25 13.59 9.95-7.22"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div>
                <strong>{{ t('about.telegramLabel') }}</strong>
                <span>@iaroslav_manoilov</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.about-page {
  padding-top: 18px;
}

.intro-box,
.manifesto-box,
.values-box,
.story-card,
.founder-card,
.contacts-box {
  padding: 32px;
}

.intro-grid,
.manifesto-grid,
.story-grid {
  display: grid;
  gap: 22px;
}

.intro-grid {
  grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.92fr);
  align-items: center;
}

.intro-title {
  max-width: 760px;
  font-size: clamp(34px, 4vw, 54px);
  line-height: 0.98;
}

.intro-text {
  max-width: 620px;
  margin: 16px 0 22px;
}

.intro-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.intro-visual {
  display: flex;
  align-items: stretch;
}

.visual-box {
  width: 100%;
  min-height: 280px;
  border-radius: 28px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  display: grid;
  place-items: center;
  padding: 22px;
}

.visual-box img {
  width: 100%;
  max-width: 220px;
  object-fit: contain;
}

.manifesto-grid {
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  align-items: start;
}

.manifesto-title {
  max-width: 760px;
}

.manifesto-text {
  max-width: 760px;
  margin-top: 16px;
}

.manifesto-points {
  display: grid;
  gap: 14px;
}

.manifesto-item {
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: #f8faf8;
}

.manifesto-item strong {
  display: block;
  margin-bottom: 6px;
  font-size: 18px;
}

.manifesto-item span {
  color: var(--muted);
  line-height: 1.6;
}

.section-top {
  margin-bottom: 24px;
}

.block-title {
  margin: 0;
  font-size: 38px;
  line-height: 1.03;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.value-card {
  padding: 24px;
  border-radius: 26px;
  border: 1px solid var(--border);
  background: #fff;
}

.icon-box {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #edf3ee;
  color: #356747;
  margin-bottom: 18px;
}

.icon-box svg {
  width: 24px;
  height: 24px;
}

.value-card h3 {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.1;
}

.value-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.story-grid {
  grid-template-columns: 1.05fr 0.95fr;
}

.story-text,
.founder-text,
.contacts-text {
  margin-top: 16px;
}

.founder-name {
  margin: 0;
  font-size: 32px;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.contacts-top {
  margin-bottom: 24px;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: #fff;
  transition: 0.2s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(24, 39, 27, 0.08);
}

.contact-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #edf3ee;
  color: #356747;
  flex-shrink: 0;
}

.contact-icon svg {
  width: 24px;
  height: 24px;
}

.contact-card strong {
  display: block;
  margin-bottom: 4px;
  font-size: 16px;
}

.contact-card span {
  color: var(--muted);
  line-height: 1.5;
  word-break: break-word;
}

@media (max-width: 1200px) {
  .intro-grid,
  .manifesto-grid,
  .values-grid,
  .story-grid,
  .contacts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .intro-box,
  .manifesto-box,
  .values-box,
  .story-card,
  .founder-card,
  .contacts-box {
    padding: 24px;
  }

  .block-title {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .about-page {
    padding-top: 12px;
  }

  .intro-box,
  .manifesto-box,
  .values-box,
  .story-card,
  .founder-card,
  .contacts-box {
    padding: 18px;
  }

  .intro-title {
    font-size: 34px;
    line-height: 1;
  }

  .block-title {
    font-size: 28px;
  }

  .intro-text,
  .manifesto-text,
  .story-text,
  .founder-text,
  .contacts-text {
    font-size: 16px;
  }

  .visual-box {
    min-height: 210px;
    border-radius: 22px;
  }

  .value-card {
    padding: 18px;
  }

  .value-card h3 {
    font-size: 21px;
  }

  .contact-card {
    align-items: flex-start;
  }
}
</style>
