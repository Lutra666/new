const commonStatusOptions = [
  { label: '已启用', value: '已启用' },
  { label: '可执行', value: '可执行' },
  { label: '已完成', value: '已完成' },
  { label: '待处理', value: '待处理' },
  { label: '待付款', value: '待付款' },
  { label: '待收款', value: '待收款' },
];

const resourceMeta = {
  products: {
    title: '商品',
    labels: {
      name: '商品名称',
      category: '分类',
      price: '单价',
      stock: '库存',
      unit: '单位',
      updatedAt: '更新时间',
    },
    fields: {
      name: { type: 'text', required: true },
      category: { type: 'text', required: true },
      price: { type: 'number', min: 0, required: true },
      stock: { type: 'number', min: 0, required: true },
      unit: { type: 'text', required: true },
    },
  },
  customers: {
    title: '客户',
    labels: {
      name: '客户名称',
      contact: '联系人',
      phone: '联系电话',
      level: '客户等级',
      balance: '往来余额',
    },
    fields: {
      name: { type: 'text', required: true },
      contact: { type: 'text', required: true },
      phone: { type: 'text', required: true },
      level: { type: 'select', options: ['A', 'B', 'C'], required: true },
      balance: { type: 'number', min: 0, required: true },
    },
  },
  suppliers: {
    title: '供应商',
    labels: {
      name: '供应商名称',
      contact: '联系人',
      phone: '联系电话',
      payable: '应付金额',
    },
    fields: {
      name: { type: 'text', required: true },
      contact: { type: 'text', required: true },
      phone: { type: 'text', required: true },
      payable: { type: 'number', min: 0, required: true },
    },
  },
  sales: {
    title: '销售订单',
    labels: {
      orderNo: '单据编号',
      customer: '客户',
      amount: '金额',
      status: '状态',
      date: '日期',
    },
    fields: {
      orderNo: { type: 'text', required: true },
      customer: {
        type: 'lookup',
        required: true,
        lookup: { resource: 'customers', valueKey: 'name', labelKey: 'name' },
      },
      amount: { type: 'number', min: 0, required: true },
      status: { type: 'select', options: ['已完成', '待收款', '待发货'], required: true },
      date: { type: 'text', required: true },
    },
  },
  purchases: {
    title: '采购订单',
    labels: {
      orderNo: '单据编号',
      supplier: '供应商',
      amount: '金额',
      status: '状态',
      date: '日期',
    },
    fields: {
      orderNo: { type: 'text', required: true },
      supplier: {
        type: 'lookup',
        required: true,
        lookup: { resource: 'suppliers', valueKey: 'name', labelKey: 'name' },
      },
      amount: { type: 'number', min: 0, required: true },
      status: { type: 'select', options: ['已入库', '待付款', '待审核'], required: true },
      date: { type: 'text', required: true },
    },
  },
  inventory: {
    title: '库存',
    labels: {
      sku: 'SKU',
      product: '商品',
      warehouse: '仓库',
      quantity: '数量',
      warning: '预警值',
    },
    fields: {
      sku: { type: 'text', required: true },
      product: {
        type: 'lookup',
        required: true,
        lookup: { resource: 'products', valueKey: 'name', labelKey: 'name' },
      },
      warehouse: {
        type: 'lookup',
        required: true,
        lookup: { resource: 'warehouses', valueKey: 'name', labelKey: 'name' },
      },
      quantity: { type: 'number', min: 0, required: true },
      warning: { type: 'number', min: 0, required: true },
    },
  },
  data: {
    labels: {
      name: '任务名称',
      status: '状态',
      schedule: '执行策略',
    },
    fields: {
      status: { type: 'select', options: commonStatusOptions.map((item) => item.value) },
    },
  },
};

const defaultReadonlyKeys = ['id', 'created_at', 'last_login_at', 'updatedAt'];

const formatFieldLabel = (resource, key) => {
  const label = resourceMeta[resource]?.labels?.[key];
  if (label) {
    return label;
  }

  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (char) => char.toUpperCase());
};

const getFieldConfig = (resource, key) => resourceMeta[resource]?.fields?.[key] || { type: 'text' };

const getEditableFieldKeys = (resource, sample = {}) => {
  const sampleKeys = Object.keys(sample).filter((key) => !defaultReadonlyKeys.includes(key));
  if (sampleKeys.length > 0) {
    return sampleKeys;
  }

  const configuredKeys = Object.keys(resourceMeta[resource]?.fields || {});
  return configuredKeys;
};

export { resourceMeta, defaultReadonlyKeys, formatFieldLabel, getFieldConfig, getEditableFieldKeys };
