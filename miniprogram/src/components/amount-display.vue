<template>
  <text :class="['amount', 'amount-' + size]">
    <text class="amount-symbol">¥</text>{{ formatted }}
  </text>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/index';

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  size: { type: String, default: 'md' }, // sm, md, lg
});

const formatted = computed(() => formatCurrency(props.value));
</script>

<style lang="scss" scoped>
.amount {
  font-weight: 600;
  color: #18243d;
}
.amount-symbol {
  font-size: 0.75em;
  margin-right: 2rpx;
}
.amount-sm { font-size: 26rpx; }
.amount-md { font-size: 30rpx; }
.amount-lg { font-size: 36rpx; }
</style>
