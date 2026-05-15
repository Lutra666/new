<template>
  <view class="products-page">
    <view class="page-title">商品管理</view>

    <app-search-header
      v-model="keyword"
      placeholder="搜索商品名称或分类..."
      :count="filteredList.length"
      @search="onSearch"
      @clear="keyword = ''"
    />

    <app-list-card
      v-for="item in filteredList"
      :key="item.id"
      :showArrow="true"
      @click="goDetail(item)"
    >
      <view class="product-row">
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <view class="product-meta">
            <up-tag :text="item.category" type="info" size="small" plain />
            <text class="meta-stock">库存 {{ item.stock }}{{ item.unit }}</text>
          </view>
        </view>
        <amount-display :value="item.price" size="md" />
      </view>
    </app-list-card>

    <app-empty-state
      v-if="filteredList.length === 0 && !loading"
      :text="keyword ? '未找到匹配商品' : '暂无商品'"
      :showRetry="!keyword"
      @retry="loadProducts"
    />

    <app-loading-skeleton v-if="loading" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchProducts } from '@/api/products';

const products = ref([]);
const keyword = ref('');
const loading = ref(false);

const filteredList = computed(() => {
  if (!keyword.value) return products.value;
  const kw = keyword.value.toLowerCase();
  return products.value.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(kw) ||
      (p.category || '').toLowerCase().includes(kw)
  );
});

const loadProducts = async () => {
  loading.value = true;
  try {
    const res = await fetchProducts();
    products.value = res.items || res;
  } catch {
    // error handled by request interceptor
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {};

const goDetail = (item) => {
  uni.navigateTo({ url: `/pages/products/product-detail?id=${item.id}` });
};

onShow(() => {
  loadProducts();
});

onPullDownRefresh(async () => {
  await loadProducts();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.products-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 40rpx;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #18243d;
  padding: 24rpx 32rpx 8rpx;
}

.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.product-info {
  flex: 1;
  min-width: 0;
  margin-right: 16rpx;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: #18243d;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-stock {
  font-size: 22rpx;
  color: #8b9bb5;
}
</style>
