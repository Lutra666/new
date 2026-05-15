import { getToken, clearToken } from '@/utils/auth';

// 开发环境用本地地址，生产环境需替换为 HTTPS 域名
const BASE_URL = 'http://localhost:3001/api';

const request = (method, path, data = null, options = {}) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const header = { 'Content-Type': 'application/json' };
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url: BASE_URL + path,
      method,
      header,
      data,
      timeout: options.timeout || 15000,
      success(res) {
        const status = res.statusCode;
        const body = res.data;

        if (status >= 200 && status < 300) {
          resolve(body);
          return;
        }

        if (status === 401) {
          clearToken();
          uni.showToast({ title: '登录已失效，请重新登录', icon: 'none', duration: 2000 });
          setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1500);
          reject(new Error(body?.error || '认证失效'));
          return;
        }

        if (status === 403) {
          uni.showToast({ title: body?.error || '权限不足', icon: 'none' });
          reject(new Error(body?.error || '权限不足'));
          return;
        }

        if (status === 423) {
          uni.showToast({ title: body?.error || '账号已锁定', icon: 'none', duration: 3000 });
          reject(new Error(body?.error || '账号已锁定'));
          return;
        }

        if (status === 429) {
          uni.showToast({ title: '请求过于频繁，请稍后重试', icon: 'none' });
          reject(new Error('请求过于频繁'));
          return;
        }

        uni.showToast({ title: body?.error || '请求失败', icon: 'none' });
        reject(new Error(body?.error || `HTTP ${status}`));
      },
      fail(err) {
        uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
        reject(err);
      },
    });
  });
};

export const get = (path, params) => {
  let url = path;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (qs) url += '?' + qs;
  }
  return request('GET', url);
};

export const post = (path, data) => request('POST', path, data);
export const put = (path, data) => request('PUT', path, data);
export const del = (path) => request('DELETE', path);

export default { get, post, put, del };
