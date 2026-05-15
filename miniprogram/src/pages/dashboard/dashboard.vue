<template>
  <view class="dashboard">
    <!-- 顶部横幅 -->
    <view class="dash-banner">
      <view class="banner-text">
        <text class="banner-greeting">{{ greeting }}</text>
        <text class="banner-date">{{ bannerDate }}</text>
      </view>
      <view class="banner-icon">
        <up-icon name="calendar" size="32" color="#fff" />
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-row">
      <app-stat-card title="当月销售额" :value="'¥' + formatCurrency(summary.totalSales)" color="primary" icon="rmb-circle" />
      <app-stat-card title="当月采购额" :value="'¥' + formatCurrency(summary.totalPurchases)" color="success" icon="cart" />
    </view>
    <view class="stats-row">
      <app-stat-card title="应收账款" :value="'¥' + formatCurrency(summary.receivable)" color="warning" icon="arrow-up" />
      <app-stat-card title="应付账款" :value="'¥' + formatCurrency(summary.payable)" color="danger" icon="arrow-down" />
    </view>

    <!-- 资金账户 -->
    <view class="stats-row" v-if="summary.accounts && summary.accounts.length">
      <app-stat-card
        v-for="acc in summary.accounts"
        :key="acc.id"
        :title="acc.name"
        :value="'¥' + formatCurrency(acc.balance)"
        :color="acc.type === 'cash' ? 'info' : acc.type === 'bank' ? 'primary' : 'warning'"
        :icon="acc.type === 'cash' ? 'wallet' : acc.type === 'bank' ? 'credit-card' : 'star'"
      />
    </view>

    <!-- 最近交易 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近交易</text>
      </view>
      <app-list-card
        v-for="tx in summary.recentTransactions"
        :key="tx.id"
        :showArrow="false"
      >
        <view class="tx-row">
          <view class="tx-info">
            <text class="tx-title">{{ tx.title || tx.orderNo }}</text>
            <text class="tx-date">{{ formatDate(tx.date) }}</text>
          </view>
          <text :class="['tx-amount', tx.type === 'received' || tx.type === '销售' ? 'income' : 'expense']">
            {{ tx.type === 'received' || tx.type === '销售' ? '+' : '-' }}¥{{ formatCurrency(tx.amount) }}
          </text>
        </view>
      </app-list-card>
      <app-empty-state v-if="!loading && !summary.recentTransactions?.length" text="暂无交易记录" />
    </view>

    <!-- 热销商品 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热销商品</text>
      </view>
      <app-list-card
        v-for="p in summary.topProducts"
        :key="p.id || p.name"
        :showArrow="false"
      >
        <view class="product-row">
          <view class="product-info">
            <text class="product-name">{{ p.name }}</text>
            <text class="product-meta">库存 {{ p.stock }} | 已售 {{ p.sold || 0 }}</text>
          </view>
          <text class="product-price">¥{{ formatCurrency(p.price) }}</text>
        </view>
      </app-list-card>
      <app-empty-state v-if="!loading && !summary.topProducts?.length" text="暂无商品数据" />
    </view>

    <app-loading-skeleton v-if="loading" :count="4" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchMobileSummary } from '@/api/finance';
import { formatCurrency, formatDate } from '@/utils/index';

const loading = ref(true);

const summary = ref({
  totalSales: 0,
  totalPurchases: 0,
  receivable: 0,
  payable: 0,
  accounts: [],
  recentTransactions: [],
  topProducts: [],
});

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return '早上好';
  if (h < 18) return '下午好';
  return '晚上好';
});

const bannerDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await fetchMobileSummary();
    summary.value = res;
  } catch {
    try {
      const { fetchFinanceSummary } = await import('@/api/finance');
      const { fetchProducts } = await import('@/api/products');
      const [fin, prods] = await Promise.all([fetchFinanceSummary(), fetchProducts()]);

      const prodList = prods.items || prods;
      summary.value = {
        totalSales: fin.totalSales || 0,
        totalPurchases: fin.totalPurchases || 0,
        receivable: fin.receivable || 0,
        payable: fin.payable || 0,
        accounts: fin.accounts || [],
        recentTransactions: fin.recentTransactions || [],
        topProducts: (prodList || [])
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 5),
      };
    } catch {
      uni.showToast({ title: '加载失败', icon: 'none' });
    }
  } finally {
    loading.value = false;
  }
};

onShow(() => loadData());
onPullDownRefresh(async () => {
  await loadData();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 40rpx;
}

.dash-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24rpx;
  padding: 32rpx 36rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #2f7af8 0%, #6c63ff 100%);
  box-shadow: 0 8rpx 24rpx rgba(47, 122, 248, 0.3);
}

.banner-greeting {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6rpx;
}

.banner-date {
  font-size: 24rpx;
  color: rgba(255,255,255,0.75);
}

.banner-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  padding: 0 12rpx;
}

.section {
  margin-top: 24rpx;
}

.section-header {
  padding: 0 32rpx;
  margin-bottom: 4rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #18243d;
}

.tx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tx-info {
  flex: 1;
  min-width: 0;
}

.tx-title {
  display: block;
  font-size: 28rpx;
  color: #18243d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tx-date {
  font-size: 22rpx;
  color: #8b9bb5;
  margin-top: 4rpx;
}

.tx-amount {
  font-size: 30rpx;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.tx-amount.income { color: #26a69a; }
.tx-amount.expense { color: #e74c3c; }

.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: #18243d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-meta {
  font-size: 22rpx;
  color: #8b9bb5;
  margin-top: 4rpx;
}

.product-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #2f7af8;
  flex-shrink: 0;
  margin-left: 16rpx;
}
</style>
