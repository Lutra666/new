<template>
  <view class="search-header">
    <up-search
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :showAction="false"
      shape="round"
      bgColor="#f5f6fa"
      @search="$emit('search', $event)"
      @clear="$emit('clear')"
      height="40"
    />
    <view class="search-tag" v-if="count !== undefined">
      <up-tag :text="'共 ' + count + ' 条'" type="info" size="small" plain />
    </view>
  </view>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索...' },
  count: { type: Number, default: undefined },
});

defineEmits(['update:modelValue', 'search', 'clear']);
</script>

<style lang="scss" scoped>
.search-header {
  padding: 16rpx 24rpx;
  background: #fff;
}

.search-tag {
  padding: 8rpx 24rpx 0;
}
</style>
