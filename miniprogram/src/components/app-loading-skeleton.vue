<template>
  <view class="skeleton-wrap">
    <view v-for="i in count" :key="i" class="skeleton-card">
      <view class="skeleton-line skeleton-line-long" />
      <view class="skeleton-line skeleton-line-short" />
      <view class="skeleton-line skeleton-line-mid" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 },
});
</script>

<style lang="scss" scoped>
.skeleton-wrap { padding: 24rpx; }

.skeleton-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.skeleton-line {
  height: 24rpx;
  background: linear-gradient(90deg, #eef0f4 25%, #f5f6fa 50%, #eef0f4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6rpx;
  margin-bottom: 16rpx;
}

.skeleton-line-long { width: 70%; }
.skeleton-line-mid { width: 50%; }
.skeleton-line-short { width: 30%; margin-bottom: 0; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
