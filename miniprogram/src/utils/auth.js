const TOKEN_KEY = 'finance_token';
const USER_KEY = 'finance_user';

export const getToken = () => uni.getStorageSync(TOKEN_KEY) || '';

export const setToken = (token) => uni.setStorageSync(TOKEN_KEY, token);

export const clearToken = () => {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(USER_KEY);
};

export const isLoggedIn = () => !!getToken();

export const getUser = () => {
  try {
    const raw = uni.getStorageSync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => uni.setStorageSync(USER_KEY, JSON.stringify(user));
