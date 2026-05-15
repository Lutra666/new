<template>
  <view class="list-card" hover-class="list-card-hover" @click="$emit('click')">
    <view class="list-card-body">
      <slot />
    </view>
    <view class="list-card-arrow" v-if="showArrow">
      <up-icon name="arrow-right" size="18" color="#c0ccda" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  showArrow: { type: Boolean, default: false },
});

defineEmits(['click']);
</script>

<style lang="scss" scoped>
.list-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin: 12rpx 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
}

.list-card-body {
  flex: 1;
  min-width: 0;
}

.list-card-hover {
  transform: scale(0.98);
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.08);
  transition: all 0.15s ease;
}

.list-card-arrow {
  margin-left: 16rpx;
  flex-shrink: 0;
}
</style>
