<template>
  <picture v-if="useModernFormats" :class="pictureClass">
    <source :srcset="avifSrc" type="image/avif" />
    <source :srcset="webpSrc" type="image/webp" />
    <img
      :src="src"
      :alt="alt"
      :class="imgClass"
      :loading="loading"
      :decoding="decoding"
      :fetchpriority="fetchpriority"
      :sizes="sizes"
      :width="width"
      :height="height"
      :style="imgStyle"
    />
  </picture>

  <img
    v-else
    :src="src"
    :alt="alt"
    :class="imgClass"
    :loading="loading"
    :decoding="decoding"
    :fetchpriority="fetchpriority"
    :sizes="sizes"
    :width="width"
    :height="height"
    :style="imgStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  imgClass?: string
  pictureClass?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  fetchpriority?: 'high' | 'low' | 'auto'
  sizes?: string
  width?: number | string
  height?: number | string
  imgStyle?: string | Record<string, string>
}>(), {
  imgClass: '',
  pictureClass: '',
  loading: 'lazy',
  decoding: 'async',
  fetchpriority: 'auto',
  sizes: '',
  width: undefined,
  height: undefined,
  imgStyle: undefined
})

const srcLower = computed(() => String(props.src || '').toLowerCase())
const useModernFormats = computed(() => /^\/.+\.(png|jpg|jpeg)$/.test(srcLower.value))
const baseSrc = computed(() => String(props.src || '').replace(/\.(png|jpg|jpeg)$/i, ''))
const webpSrc = computed(() => `${baseSrc.value}.webp`)
const avifSrc = computed(() => `${baseSrc.value}.avif`)
</script>

