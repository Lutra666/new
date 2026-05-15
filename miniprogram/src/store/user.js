import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getToken, setToken, clearToken, setUser, getUser } from '@/utils/auth';
import { login as loginApi, getProfile } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const user = ref(getUser() || null);
  const token = ref(getToken() || '');

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const username = computed(() => user.value?.username || '');
  const role = computed(() => user.value?.role || 'viewer');

  const login = async (username, password) => {
    const res = await loginApi({ username, password });
    token.value = res.token;
    user.value = res.user;
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const fetchProfile = async () => {
    const res = await getProfile();
    user.value = res.user;
    setUser(res.user);
    return res;
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    clearToken();
  };

  return { user, token, isLoggedIn, isAdmin, username, role, login, fetchProfile, logout };
});
