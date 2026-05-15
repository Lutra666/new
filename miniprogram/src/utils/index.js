export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatDate = (value, format = 'YYYY-MM-DD') => {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value).slice(0, 10);

  const pad = (n) => String(n).padStart(2, '0');
  return format
    .replace('YYYY', d.getFullYear())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()));
};

export const truncate = (text, maxLen = 12) => {
  if (!text) return '-';
  return String(text).length > maxLen
    ? String(text).slice(0, maxLen) + '...'
    : String(text);
};

export const statusColorMap = {
  '已完成': 'success',
  '已入库': 'success',
  '待收款': 'warning',
  '待付款': 'warning',
  '待发货': 'info',
  '待审核': 'info',
  '已取消': 'error',
  '已退款': 'error',
  '已关闭': 'error',
  '草稿': 'info',
  '处理中': 'primary',
};

export const getStatusColor = (status) => statusColorMap[status] || 'info';
