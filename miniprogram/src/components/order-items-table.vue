<template>
  <view class="items-table">
    <view class="table-header">
      <text class="col-name">商品名称</text>
      <text class="col-qty">数量</text>
      <text class="col-price">单价</text>
      <text class="col-amount">金额</text>
    </view>
    <view class="table-row" v-for="(item, index) in items" :key="index">
      <text class="col-name">{{ item.productName }}</text>
      <text class="col-qty">{{ item.quantity }}</text>
      <text class="col-price">¥{{ formatCurrency(item.unitPrice) }}</text>
      <text class="col-amount">¥{{ formatCurrency(item.quantity * item.unitPrice) }}</text>
    </view>
    <view v-if="!items || items.length === 0" class="table-empty">
      <text>暂无明细</text>
    </view>
  </view>
</template>

<script setup>
import { formatCurrency } from '@/utils/index';

defineProps({
  items: { type: Array, default: () => [] },
});
</script>

<style lang="scss" scoped>
.items-table {
  margin-top: 16rpx;
}

.table-header {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #e8ecf2;
}

.table-header text {
  font-size: 24rpx;
  color: #8b9bb5;
  font-weight: 600;
}

.table-row {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f6fa;
}

.table-row text {
  font-size: 26rpx;
  color: #18243d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-name { flex: 2; }
.col-qty { flex: 1; text-align: center; }
.col-price { flex: 1.5; text-align: right; }
.col-amount { flex: 1.5; text-align: right; font-weight: 600; }

.table-empty {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
  color: #c0ccda;
  font-size: 26rpx;
}
</style>
