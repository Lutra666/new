<template>
  <view class="stat-card" :class="'stat-' + color">
    <view class="stat-accent" />
    <view class="stat-body">
      <text class="stat-value">{{ value }}</text>
      <view class="stat-title-row">
        <up-icon v-if="icon" :name="icon" size="18" :color="iconColor" />
        <text class="stat-title">{{ title }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: '0' },
  color: { type: String, default: 'primary' },
  icon: { type: String, default: '' },
});

const colorMap = {
  primary: '#2f7af8',
  success: '#26a69a',
  warning: '#f5a623',
  danger: '#e74c3c',
  info: '#8b9bb5',
};

const iconColor = computed(() => colorMap[props.color] || colorMap.info);
</script>

<style lang="scss" scoped>
.stat-card {
  flex: 1;
  min-width: 44%;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin: 12rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
}

.stat-accent {
  position: absolute;
  top: 0; left: 0;
  width: 8rpx;
  height: 100%;
  border-radius: 4rpx 0 0 4rpx;
}

.stat-primary { background: linear-gradient(135deg, #eef4fb 0%, #dce8f8 100%); }
.stat-primary .stat-accent { background: #2f7af8; box-shadow: 0 0 12rpx rgba(47,122,248,0.5); }

.stat-success { background: linear-gradient(135deg, #e8f5f3 0%, #d2ede8 100%); }
.stat-success .stat-accent { background: #26a69a; box-shadow: 0 0 12rpx rgba(38,166,154,0.4); }

.stat-warning { background: linear-gradient(135deg, #fef8ee 0%, #fdf0d6 100%); }
.stat-warning .stat-accent { background: #f5a623; box-shadow: 0 0 12rpx rgba(245,166,35,0.4); }

.stat-danger { background: linear-gradient(135deg, #fdf0f0 0%, #fbe0e0 100%); }
.stat-danger .stat-accent { background: #e74c3c; box-shadow: 0 0 12rpx rgba(231,76,60,0.4); }

.stat-info { background: linear-gradient(135deg, #f0f2f8 0%, #e2e5ef 100%); }
.stat-info .stat-accent { background: #8b9bb5; box-shadow: 0 0 12rpx rgba(139,155,181,0.3); }

.stat-body {
  position: relative;
  z-index: 1;
}

.stat-value {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #18243d;
  margin-bottom: 8rpx;
}

.stat-title-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.stat-title {
  font-size: 26rpx;
  color: #8b9bb5;
}
</style>
