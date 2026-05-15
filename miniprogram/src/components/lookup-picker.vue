<template>
  <view class="lookup-picker" @click="open">
    <slot>
      <text :class="['lookup-text', { placeholder: !displayText }]">
        {{ displayText || placeholder }}
      </text>
      <up-icon name="arrow-down" size="14" color="#c0ccda" />
    </slot>
  </view>

  <up-popup :show="show" mode="bottom" @close="show = false" round="16">
    <view class="popup-wrap">
      <view class="popup-header">
        <text class="popup-title">{{ title }}</text>
        <up-icon name="close" size="20" color="#8b9bb5" @click="show = false" />
      </view>

      <view class="search-bar" v-if="searchable">
        <up-search
          v-model="keyword"
          placeholder="搜索..."
          :showAction="false"
          shape="round"
          bgColor="#f5f6fa"
        />
      </view>

      <scroll-view scroll-y class="popup-list" :style="{ maxHeight: maxHeight }">
        <view
          v-for="item in filteredList"
          :key="item[valueKey]"
          class="popup-item"
          :class="{ selected: modelValue === item[valueKey] }"
          @click="select(item)"
        >
          <text class="popup-item-label">{{ item[labelKey] }}</text>
          <text class="popup-item-sub" v-if="subLabelKey && item[subLabelKey]">
            {{ item[subLabelKey] }}
          </text>
          <up-icon
            v-if="modelValue === item[valueKey]"
            name="checkmark"
            size="18"
            color="#2f7af8"
          />
        </view>
        <view class="popup-empty" v-if="filteredList.length === 0">
          <text>暂无数据</text>
        </view>
      </scroll-view>
    </view>
  </up-popup>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  list: { type: Array, default: () => [] },
  labelKey: { type: String, default: 'name' },
  valueKey: { type: String, default: 'name' },
  subLabelKey: { type: String, default: '' },
  placeholder: { type: String, default: '请选择' },
  title: { type: String, default: '请选择' },
  searchable: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue']);

const show = ref(false);
const keyword = ref('');

const maxHeight = computed(() => {
  const sysInfo = uni.getSystemInfoSync();
  const vh = sysInfo.windowHeight || 667;
  return (vh * 0.55) + 'px';
});

const displayText = computed(() => {
  if (!props.modelValue) return '';
  const item = props.list.find((i) => i[props.valueKey] === props.modelValue);
  return item ? item[props.labelKey] : props.modelValue;
});

const filteredList = computed(() => {
  if (!keyword.value) return props.list;
  const kw = keyword.value.toLowerCase();
  return props.list.filter((item) => {
    const label = (item[props.labelKey] || '').toLowerCase();
    const sub = props.subLabelKey ? (item[props.subLabelKey] || '').toLowerCase() : '';
    return label.includes(kw) || sub.includes(kw);
  });
});

const open = () => {
  keyword.value = '';
  show.value = true;
};

const select = (item) => {
  emit('update:modelValue', item[props.valueKey]);
  show.value = false;
};
</script>

<style lang="scss" scoped>
.lookup-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
}

.lookup-text {
  font-size: 28rpx;
  color: #18243d;
}

.lookup-text.placeholder {
  color: #c0ccda;
}

.popup-wrap {
  padding: 32rpx 24rpx;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #18243d;
}

.search-bar {
  margin-bottom: 16rpx;
}

.popup-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f6fa;
}

.popup-item.selected {
  background: rgba(47, 122, 248, 0.04);
}

.popup-item-label {
  font-size: 28rpx;
  color: #18243d;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popup-item-sub {
  font-size: 24rpx;
  color: #8b9bb5;
  margin-right: 16rpx;
}

.popup-empty {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
  color: #c0ccda;
  font-size: 26rpx;
}
</style>
