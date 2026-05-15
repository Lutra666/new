<template>
  <view class="items-editor">
    <view class="editor-header">
      <text class="editor-title">订单明细</text>
      <up-button type="primary" size="small" text="+ 添加行" plain @click="addRow" />
    </view>

    <view class="editor-row" v-for="(row, index) in modelValue" :key="index">
      <view class="row-top">
        <view class="product-picker">
          <lookup-picker
            v-model="row.productName"
            :list="productList"
            labelKey="name"
            valueKey="name"
            subLabelKey="price"
            placeholder="选择商品"
            title="选择商品"
          />
        </view>
        <up-icon
          name="close-circle-fill"
          size="20"
          color="#e74c3c"
          @click="removeRow(index)"
        />
      </view>
      <view class="row-bottom">
        <view class="field">
          <text class="field-label">数量</text>
          <up-input
            v-model="row.quantity"
            type="number"
            placeholder="数量"
            border="bottom"
            inputAlign="right"
            @update:modelValue="calcRowAmount(index)"
          />
        </view>
        <view class="field">
          <text class="field-label">单价</text>
          <up-input
            v-model="row.unitPrice"
            type="digit"
            placeholder="单价"
            border="bottom"
            inputAlign="right"
            @update:modelValue="calcRowAmount(index)"
          />
        </view>
        <view class="field">
          <text class="field-label">金额</text>
          <text class="row-amount">¥{{ formatCurrency((+row.quantity || 0) * (+row.unitPrice || 0)) }}</text>
        </view>
      </view>
    </view>

    <view v-if="modelValue.length === 0" class="editor-empty">
      <text>请添加订单明细</text>
    </view>

    <view class="editor-total" v-if="modelValue.length > 0">
      <text class="total-label">合计</text>
      <text class="total-value">¥{{ formatCurrency(totalAmount) }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed, watch } from 'vue';
import { formatCurrency } from '@/utils/index';
import lookupPicker from './lookup-picker.vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  productList: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);

const totalAmount = computed(() =>
  props.modelValue.reduce((sum, row) =>
    sum + (+row.quantity || 0) * (+row.unitPrice || 0), 0)
);

const addRow = () => {
  const rows = [...props.modelValue, { productName: '', quantity: 1, unitPrice: 0 }];
  emit('update:modelValue', rows);
};

const removeRow = (index) => {
  const rows = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', rows);
};

const calcRowAmount = (index) => {
  // 自动从商品列表填充单价
  const row = props.modelValue[index];
  if (row && row.productName && (!row.unitPrice || row.unitPrice === '0')) {
    const product = props.productList.find((p) => p.name === row.productName);
    if (product) {
      const rows = [...props.modelValue];
      rows[index] = { ...rows[index], unitPrice: String(product.price) };
      emit('update:modelValue', rows);
    }
  }
};

// 当商品变化时自动填单价
watch(
  () => props.modelValue.map((r) => r.productName),
  () => {
    props.modelValue.forEach((row, idx) => calcRowAmount(idx));
  }
);
</script>

<style lang="scss" scoped>
.items-editor {
  margin-top: 24rpx;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.editor-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #18243d;
}

.editor-row {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-picker {
  flex: 1;
  min-width: 0;
}

.row-bottom {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.field {
  flex: 1;
  min-width: 0;
}

.field-label {
  font-size: 22rpx;
  color: #8b9bb5;
  margin-bottom: 4rpx;
}

.row-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #18243d;
  text-align: right;
  display: block;
  padding: 10rpx 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-empty {
  display: flex;
  justify-content: center;
  padding: 60rpx;
  color: #c0ccda;
  font-size: 26rpx;
}

.editor-total {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16rpx 0;
  border-top: 2rpx solid #e8ecf2;
}

.total-label {
  font-size: 26rpx;
  color: #8b9bb5;
  margin-right: 16rpx;
}

.total-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #e74c3c;
}
</style>
