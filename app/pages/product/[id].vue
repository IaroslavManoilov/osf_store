<template>
  <div>
    <button @click="openQuickView(product)">Быстрый просмотр</button>

    <!-- Modal for Quick View -->
    <div v-if="isQuickViewVisible" class="quick-view-modal">
      <div class="modal-content">
        <span @click="closeQuickView" class="close-btn">×</span>
        <img :src="product.image" :alt="product.title" class="modal-image" />
        <h2>{{ product.title }}</h2>
        <p class="price">{{ product.price }} MDL</p>
        <p class="description">{{ product.description }}</p>

        <div class="sizes">
          <button
            v-for="size in product.sizes"
            :key="size"
            @click="selectedSize = size"
            :class="{ active: selectedSize === size }"
          >
            {{ size }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const product = ref({
  id: '1',
  title: 'OSF Halfzip White',
  price: 900,
  image: '/products/1.jpg',
  category: 'Sweater',
  description: 'Чистый базовый элемент бренда ONE STYLE FOREVER.',
  sizes: ['S', 'M', 'L'],
});

const isQuickViewVisible = ref(false);
const selectedSize = ref('');

const openQuickView = (product) => {
  this.product = product; // Passing the selected product to display in the modal
  isQuickViewVisible.value = true;
};

const closeQuickView = () => {
  isQuickViewVisible.value = false;
};
</script>

<style scoped>
.quick-view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.size-btn {
  min-width: 48px;
  height: 44px;
  border-radius: 999px;
  padding: 0 16px;
  cursor: pointer;
}
</style>