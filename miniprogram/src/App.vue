<script setup>
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { getToken, clearToken } from '@/utils/auth';

onLaunch(async () => {
  // 初始化暗色模式
  const appStore = useAppStore();
  appStore.initDarkMode();

  const token = getToken();
  if (!token) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }

  uni.showLoading({ title: '加载中...', mask: true });

  const userStore = useUserStore();
  try {
    await userStore.fetchProfile();
    uni.hideLoading();
    uni.reLaunch({ url: '/pages/dashboard/dashboard' });
  } catch {
    uni.hideLoading();
    clearToken();
    uni.reLaunch({ url: '/pages/login/login' });
  }
});
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/uni.scss';
</style>
