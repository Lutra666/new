<template>
  <view class="empty-wrap">
    <up-icon :name="icon" size="80" color="#c0ccda" />
    <text class="empty-text">{{ text }}</text>
    <up-button
      v-if="showRetry"
      type="primary"
      size="small"
      :text="retryText"
      plain
      @click="$emit('retry')"
      customStyle="margin-top: 24rpx;"
    />
  </view>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'file-text' },
  text: { type: String, default: '暂无数据' },
  showRetry: { type: Boolean, default: false },
  retryText: { type: String, default: '重试' },
});

defineEmits(['retry']);
</script>

<style lang="scss" scoped>
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #c0ccda;
  margin-top: 24rpx;
}
</style>
