<template>
  <view class="orders-page">
    <!-- 销售/采购 Tab -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view class="tab-line" v-if="activeTab === tab.key" />
      </view>
    </view>

    <app-search-header
      v-model="keyword"
      :placeholder="activeTab === 'sales' ? '搜索客户或订单号...' : '搜索供应商或订单号...'"
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
      <view class="order-top">
        <view class="order-info">
          <text class="order-no">{{ item.orderNo }}</text>
          <up-tag
            :text="item.status"
            :type="getStatusColor(item.status)"
            size="small"
          />
        </view>
        <amount-display :value="item.amount" size="md" />
      </view>
      <view class="order-bottom">
        <text class="order-party">
          {{ activeTab === 'sales' ? '客户：' : '供应商：' }}{{ item.customer || item.supplier }}
        </text>
        <text class="order-date">{{ formatDate(item.date) }}</text>
        <text class="order-items" v-if="item.items">
          {{ item.items.length }} 种商品
        </text>
      </view>
    </app-list-card>

    <app-empty-state
      v-if="filteredList.length === 0 && !loading"
      :text="keyword ? '未找到匹配订单' : '暂无订单'"
      :showRetry="!keyword"
      @retry="loadData"
    />

    <app-loading-skeleton v-if="loading" />

    <!-- 新建 FAB -->
    <view class="fab" @click="goCreate">
      <up-icon name="plus" size="28" color="#fff" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchSales, fetchPurchases } from '@/api/orders';
import { formatDate, getStatusColor } from '@/utils/index';

const tabs = [
  { key: 'sales', label: '销售订单' },
  { key: 'purchases', label: '采购订单' },
];

const activeTab = ref('sales');
const orders = ref([]);
const keyword = ref('');
const loading = ref(false);

const filteredList = computed(() => {
  if (!keyword.value) return orders.value;
  const kw = keyword.value.toLowerCase();
  return orders.value.filter(
    (o) =>
      (o.orderNo || '').toLowerCase().includes(kw) ||
      (o.customer || '').toLowerCase().includes(kw) ||
      (o.supplier || '').toLowerCase().includes(kw)
  );
});

const switchTab = (tab) => {
  activeTab.value = tab;
  keyword.value = '';
  loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    const fetcher = activeTab.value === 'sales' ? fetchSales : fetchPurchases;
    const res = await fetcher();
    orders.value = res.items || res;
  } catch {
    // handled
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {};

const goDetail = (item) => {
  uni.navigateTo({
    url: `/pages/orders/order-detail?type=${activeTab.value}&id=${item.id}`,
  });
};

const goCreate = () => {
  uni.navigateTo({
    url: `/pages/orders/order-form?type=${activeTab.value}`,
  });
};

onShow(() => loadData());
onPullDownRefresh(async () => {
  await loadData();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 120rpx;
  position: relative;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 24rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #8b9bb5;
}

.tab-item.active .tab-text {
  color: #2f7af8;
  font-weight: 600;
}

.tab-line {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 4rpx;
  background: #2f7af8;
  border-radius: 2rpx;
}

.order-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8rpx;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.order-no {
  font-size: 26rpx;
  font-weight: 600;
  color: #18243d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-bottom {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.order-party {
  font-size: 24rpx;
  color: #8b9bb5;
}

.order-date {
  font-size: 22rpx;
  color: #c0ccda;
}

.order-items {
  font-size: 22rpx;
  color: #c0ccda;
}

.fab {
  position: fixed;
  bottom: calc(60rpx + env(safe-area-inset-bottom));
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2f7af8, #6c63ff);
  box-shadow: 0 8rpx 24rpx rgba(47, 122, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
</style>
