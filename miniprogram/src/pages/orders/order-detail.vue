<template>
  <view class="detail-page">
    <app-loading-skeleton v-if="loading" :count="2" />

    <template v-else-if="order">
      <!-- 订单头 -->
      <view class="detail-card">
        <view class="header-row">
          <text class="order-no">{{ order.orderNo }}</text>
          <up-tag :text="order.status" :type="statusColor(order.status)" size="small" />
        </view>
        <view class="info-rows">
          <view class="info-row">
            <text class="info-label">{{ type === 'sales' ? '客户' : '供应商' }}</text>
            <text class="info-value">{{ order.customer || order.supplier }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">日期</text>
            <text class="info-value">{{ formatDate(order.date) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">订单金额</text>
            <amount-display :value="order.amount" size="lg" />
          </view>
        </view>
      </view>

      <!-- 明细 -->
      <view class="detail-card">
        <text class="section-title">订单明细</text>
        <order-items-table :items="order.items" />
      </view>

      <!-- 操作 -->
      <view class="actions">
        <up-button type="primary" text="编辑" plain @click="goEdit" />
        <up-button type="error" text="删除" plain @click="showDel = true" />
      </view>

      <up-modal
        :show="showDel"
        title="删除确认"
        :content="'确定删除订单 ' + order.orderNo + ' 吗？'"
        showCancelButton
        @confirm="handleDelete"
        @cancel="showDel = false"
      />
    </template>

    <app-empty-state
      v-if="!loading && !order"
      text="订单不存在或加载失败"
      showRetry
      @retry="loadOrder"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchSales, fetchPurchases, deleteSalesOrder, deletePurchaseOrder } from '@/api/orders';
import { formatDate } from '@/utils/index';
import orderItemsTable from '@/components/order-items-table.vue';

const order = ref(null);
const type = ref('sales');
const loading = ref(true);
const showDel = ref(false);
let orderId = null;

const statusColor = (status) => {
  const map = {
    '已完成': 'success', '已入库': 'success', '待收款': 'warning',
    '待付款': 'warning', '待发货': 'info', '待审核': 'info',
  };
  return map[status] || 'info';
};

const loadOrder = async () => {
  loading.value = true;
  try {
    const fetcher = type.value === 'sales' ? fetchSales : fetchPurchases;
    const res = await fetcher();
    const list = res.items || res;
    order.value = list.find((o) => String(o.id) === String(orderId));
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

onLoad(async (options) => {
  type.value = options.type || 'sales';
  orderId = options.id;
  await loadOrder();
});

onPullDownRefresh(async () => {
  await loadOrder();
  uni.stopPullDownRefresh();
});

const goEdit = () => {
  uni.navigateTo({
    url: `/pages/orders/order-form?type=${type.value}&id=${order.value.id}`,
  });
};

const handleDelete = async () => {
  try {
    const deleter = type.value === 'sales' ? deleteSalesOrder : deletePurchaseOrder;
    await deleter(order.value.id);
    showDel.value = false;
    uni.showToast({ title: '已删除', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch {
    // handled
  }
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 24rpx;
}

.detail-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f6fa;
}

.order-no {
  font-size: 32rpx;
  font-weight: 700;
  color: #18243d;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  font-size: 26rpx;
  color: #8b9bb5;
}

.info-value {
  font-size: 26rpx;
  color: #18243d;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #18243d;
  margin-bottom: 8rpx;
  display: block;
}

.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}
</style>
