<template>
  <div class="page-shell">
    <AppHeader class="app-header-fixed" />
    <main class="page-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
}

.page-main {
  padding-top: 118px;
}

@media (max-width: 980px) {
  .page-main {
    padding-top: 108px;
  }
}

@media (max-width: 680px) {
  .page-main {
    padding-top: 100px;
  }
}
</style>
