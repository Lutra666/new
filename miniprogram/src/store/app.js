import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const darkMode = ref(false);
  const loading = ref(false);

  const applyTheme = (isDark) => {
    const bgColor = isDark ? '#0d1b2a' : '#ffffff';
    const frontColor = isDark ? '#ffffff' : '#000000';
    uni.setNavigationBarColor({ frontColor, backgroundColor: bgColor });
    uni.setBackgroundColor({ backgroundColor: isDark ? '#0d1b2a' : '#f5f6fa' });
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.$el) {
      currentPage.$el.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  };

  const setDarkMode = (value) => {
    darkMode.value = value;
    uni.setStorageSync('darkMode', value ? '1' : '0');
    applyTheme(value);
  };

  const initDarkMode = () => {
    const stored = uni.getStorageSync('darkMode');
    if (stored) {
      darkMode.value = stored === '1';
    } else {
      const sysInfo = uni.getSystemInfoSync();
      darkMode.value = sysInfo.theme === 'dark';
    }
    applyTheme(darkMode.value);
  };

  const setLoading = (value) => {
    loading.value = value;
    if (value) {
      uni.showLoading({ title: '加载中...', mask: true });
    } else {
      uni.hideLoading();
    }
  };

  return { darkMode, loading, setDarkMode, initDarkMode, setLoading };
});
