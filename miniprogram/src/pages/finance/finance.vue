<template>
  <view class="finance-page">
    <view class="page-title">财务管理</view>

    <!-- 账户卡片 -->
    <view class="stats-row" v-if="summary.accounts && summary.accounts.length">
      <app-stat-card
        v-for="acc in summary.accounts"
        :key="acc.id"
        :title="acc.name"
        :value="'¥' + formatCurrency(acc.balance)"
        :color="accountColor(acc.type)"
        :icon="acc.type === 'cash' ? 'wallet' : acc.type === 'bank' ? 'credit-card' : 'star'"
      />
    </view>

    <view class="stats-row">
      <app-stat-card title="应收账款" :value="'¥' + formatCurrency(summary.receivable)" color="warning" icon="arrow-up" />
      <app-stat-card title="应付账款" :value="'¥' + formatCurrency(summary.payable)" color="danger" icon="arrow-down" />
    </view>

    <!-- 交易流水 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">交易流水</text>
        <view class="filter-tabs">
          <up-tag
            v-for="f in filters"
            :key="f.key"
            :text="f.label"
            :type="activeFilter === f.key ? 'primary' : 'info'"
            size="small"
            :plain="activeFilter !== f.key"
            @click="activeFilter = f.key"
            customStyle="margin-left: 8rpx;"
          />
        </view>
      </view>

      <app-list-card
        v-for="tx in filteredTransactions"
        :key="tx.id"
        :showArrow="false"
      >
        <view class="tx-row">
          <view class="tx-info">
            <text class="tx-title">{{ tx.title }}</text>
            <view class="tx-meta">
              <text class="tx-party" v-if="tx.counterparty">{{ tx.counterparty }}</text>
              <text class="tx-date">{{ formatDate(tx.date) }}</text>
            </view>
          </view>
          <text :class="['tx-amount', tx.type === 'received' ? 'income' : 'expense']">
            {{ tx.type === 'received' ? '+' : '-' }}¥{{ formatCurrency(tx.amount) }}
          </text>
        </view>
      </app-list-card>

      <app-empty-state v-if="!loading && filteredTransactions.length === 0" text="暂无交易记录" :showRetry="true" @retry="loadData" />
    </view>

    <app-loading-skeleton v-if="loading" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchFinanceSummary } from '@/api/finance';
import { formatCurrency, formatDate } from '@/utils/index';

const summary = ref({
  accounts: [],
  receivable: 0,
  payable: 0,
  recentTransactions: [],
});

const filters = [
  { key: 'all', label: '全部' },
  { key: 'received', label: '收入' },
  { key: 'paid', label: '支出' },
];
const activeFilter = ref('all');
const loading = ref(false);

const filteredTransactions = computed(() => {
  const txs = summary.value.recentTransactions || [];
  if (activeFilter.value === 'all') return txs;
  return txs.filter((t) => t.type === activeFilter.value);
});

const accountColor = (type) => {
  const map = { cash: 'info', bank: 'primary', receivable: 'warning', payable: 'danger' };
  return map[type] || 'info';
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await fetchFinanceSummary();
    summary.value = {
      accounts: res.accounts || [],
      receivable: res.receivable || 0,
      payable: res.payable || 0,
      recentTransactions: res.recentTransactions || [],
    };
  } catch {
    // handled
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
.finance-page {
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

.stats-row {
  display: flex;
  flex-wrap: wrap;
  padding: 0 12rpx;
}

.section {
  margin-top: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  margin-bottom: 4rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #18243d;
}

.filter-tabs {
  display: flex;
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

.tx-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 4rpx;
}

.tx-party {
  font-size: 22rpx;
  color: #8b9bb5;
}

.tx-date {
  font-size: 22rpx;
  color: #8b9bb5;
}

.tx-amount {
  font-size: 30rpx;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.tx-amount.income { color: #26a69a; }
.tx-amount.expense { color: #e74c3c; }
</style>
