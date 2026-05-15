<template>
  <view class="inventory-page">
    <view class="page-title">库存管理</view>

    <app-search-header
      v-model="keyword"
      placeholder="搜索商品名称..."
      :count="filteredList.length"
      @search="onSearch"
      @clear="keyword = ''"
    />

    <app-list-card
      v-for="item in filteredList"
      :key="item.id"
      :showArrow="false"
      :class="{ 'low-stock': item.quantity <= item.warning }"
    >
      <view class="inv-row">
        <view class="inv-info">
          <text class="inv-name">{{ item.product }}</text>
          <view class="inv-meta">
            <text class="sku">{{ item.sku }}</text>
            <text class="warehouse">{{ item.warehouse }}</text>
          </view>
        </view>
        <view class="inv-qty">
          <text class="qty-value" :class="{ warning: item.quantity <= item.warning }">
            {{ item.quantity }}
          </text>
          <text class="qty-label">库存</text>
        </view>
      </view>
      <view class="warn-bar" v-if="item.quantity <= item.warning">
        <up-icon name="warning" size="14" color="#f5a623" />
        <text class="warn-text">库存不足 (警戒线 {{ item.warning }})</text>
      </view>
    </app-list-card>

    <app-empty-state
      v-if="filteredList.length === 0 && !loading"
      :text="keyword ? '未找到匹配库存' : '暂无库存数据'"
      :showRetry="!keyword"
      @retry="loadData"
    />

    <app-loading-skeleton v-if="loading" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchInventory } from '@/api/inventory';

const items = ref([]);
const keyword = ref('');
const loading = ref(false);

const filteredList = computed(() => {
  if (!keyword.value) return items.value;
  const kw = keyword.value.toLowerCase();
  return items.value.filter((i) =>
    (i.product || '').toLowerCase().includes(kw) ||
    (i.sku || '').toLowerCase().includes(kw)
  );
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await fetchInventory();
    items.value = res.items || res;
  } catch {
    // handled
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {};

onShow(() => loadData());
onPullDownRefresh(async () => {
  await loadData();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.inventory-page {
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

.inv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.inv-info {
  flex: 1;
  min-width: 0;
  margin-right: 16rpx;
}

.inv-name {
  display: block;
  font-size: 28rpx;
  color: #18243d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inv-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 4rpx;
}

.sku, .warehouse {
  font-size: 22rpx;
  color: #8b9bb5;
}

.inv-qty {
  text-align: center;
  flex-shrink: 0;
}

.qty-value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #26a69a;
}

.qty-value.warning {
  color: #f5a623;
}

.qty-label {
  font-size: 22rpx;
  color: #8b9bb5;
}

.warn-bar {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid #fef0d0;
}

.warn-text {
  font-size: 22rpx;
  color: #f5a623;
}

:deep(.low-stock) {
  border-left: 4rpx solid #f5a623 !important;
}
</style>
