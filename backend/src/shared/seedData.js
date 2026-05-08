const bcrypt = require('bcryptjs');

const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const defaultAdminHash = bcrypt.hashSync(defaultAdminPassword, 10);

const t = () => new Date().toISOString();

const demoProducts = [
  { id: 1, name: '优质大米 5kg', category: '粮油调味', price: 39.90, stock: 200, unit: '袋', createdAt: t(), updatedAt: t() },
  { id: 2, name: '金龙鱼食用油 1.8L', category: '粮油调味', price: 29.90, stock: 150, unit: '桶', createdAt: t(), updatedAt: t() },
  { id: 3, name: '特仑苏纯牛奶 250ml×12', category: '乳品饮料', price: 69.90, stock: 80, unit: '箱', createdAt: t(), updatedAt: t() },
  { id: 4, name: '农夫山泉矿泉水 550ml×24', category: '饮料冲调', price: 35.00, stock: 300, unit: '箱', createdAt: t(), updatedAt: t() },
  { id: 5, name: '康师傅红烧牛肉面 5连包', category: '方便速食', price: 12.50, stock: 500, unit: '包', createdAt: t(), updatedAt: t() },
  { id: 6, name: '维达抽纸 3层×10包', category: '日用百货', price: 29.90, stock: 120, unit: '提', createdAt: t(), updatedAt: t() },
  { id: 7, name: '蓝月亮洗衣液 3kg', category: '日用清洁', price: 49.90, stock: 60, unit: '瓶', createdAt: t(), updatedAt: t() },
  { id: 8, name: '海天金标生抽 500ml', category: '粮油调味', price: 9.90, stock: 200, unit: '瓶', createdAt: t(), updatedAt: t() },
];

const demoCustomers = [
  { id: 1, name: '永辉超市', contact: '采购部王经理', phone: '13800001111', level: 'A', balance: 0, createdAt: t(), updatedAt: t() },
  { id: 2, name: '华润万家', contact: '供应链李总', phone: '13900002222', level: 'A', balance: 4993, createdAt: t(), updatedAt: t() },
  { id: 3, name: '社区便利店张姐', contact: '张姐', phone: '13600003333', level: 'B', balance: 0, createdAt: t(), updatedAt: t() },
  { id: 4, name: '美团优选供应商', contact: '采购刘经理', phone: '13700004444', level: 'B', balance: 0, createdAt: t(), updatedAt: t() },
  { id: 5, name: '阿里巴巴零售通', contact: '渠道陈经理', phone: '13500005555', level: 'C', balance: 0, createdAt: t(), updatedAt: t() },
];

const demoSuppliers = [
  { id: 1, name: '中粮集团', contact: '销售部赵经理', phone: '13810001111', payable: 0, createdAt: t(), updatedAt: t() },
  { id: 2, name: '伊利乳业', contact: '大客户陈经理', phone: '13910002222', payable: 5550, createdAt: t(), updatedAt: t() },
  { id: 3, name: '宝洁中国', contact: '渠道张总', phone: '13610003333', payable: 0, createdAt: t(), updatedAt: t() },
  { id: 4, name: '联合利华', contact: '商务李经理', phone: '13710004444', payable: 0, createdAt: t(), updatedAt: t() },
];

const demoSales = [
  {
    id: 1, orderNo: 'SO-20260401-001', customer: '永辉超市', status: '已完成',
    date: '2026-04-01', amount: 3293,
    items: [
      { productName: '优质大米 5kg', quantity: 50, unitPrice: 39.90 },
      { productName: '金龙鱼食用油 1.8L', quantity: 20, unitPrice: 29.90 },
      { productName: '农夫山泉矿泉水 550ml×24', quantity: 20, unitPrice: 35.00 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 2, orderNo: 'SO-20260402-001', customer: '华润万家', status: '待收款',
    date: '2026-04-02', amount: 4993,
    items: [
      { productName: '特仑苏纯牛奶 250ml×12', quantity: 30, unitPrice: 69.90 },
      { productName: '康师傅红烧牛肉面 5连包', quantity: 100, unitPrice: 12.50 },
      { productName: '维达抽纸 3层×10包', quantity: 30, unitPrice: 29.90 },
      { productName: '蓝月亮洗衣液 3kg', quantity: 15, unitPrice: 49.90 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 3, orderNo: 'SO-20260405-001', customer: '社区便利店张姐', status: '已完成',
    date: '2026-04-05', amount: 274,
    items: [
      { productName: '康师傅红烧牛肉面 5连包', quantity: 10, unitPrice: 12.50 },
      { productName: '海天金标生抽 500ml', quantity: 15, unitPrice: 9.90 },
    ],
    createdAt: t(), updatedAt: t(),
  },
];

const demoPurchases = [
  {
    id: 1, orderNo: 'PO-20260401-001', supplier: '中粮集团', status: '已入库',
    date: '2026-04-01', amount: 14550,
    items: [
      { productName: '优质大米 5kg', quantity: 250, unitPrice: 35.00 },
      { productName: '金龙鱼食用油 1.8L', quantity: 120, unitPrice: 25.00 },
      { productName: '海天金标生抽 500ml', quantity: 200, unitPrice: 7.50 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 2, orderNo: 'PO-20260403-001', supplier: '伊利乳业', status: '待付款',
    date: '2026-04-03', amount: 5550,
    items: [
      { productName: '特仑苏纯牛奶 250ml×12', quantity: 50, unitPrice: 55.00 },
      { productName: '农夫山泉矿泉水 550ml×24', quantity: 100, unitPrice: 28.00 },
    ],
    createdAt: t(), updatedAt: t(),
  },
];

const demoInventory = [
  { id: 1, sku: 'SKU-1001', product: '优质大米 5kg', warehouse: '主仓库', quantity: 400, warning: 20, createdAt: t(), updatedAt: t() },
  { id: 2, sku: 'SKU-1002', product: '金龙鱼食用油 1.8L', warehouse: '主仓库', quantity: 250, warning: 15, createdAt: t(), updatedAt: t() },
  { id: 3, sku: 'SKU-1003', product: '特仑苏纯牛奶 250ml×12', warehouse: '主仓库', quantity: 100, warning: 10, createdAt: t(), updatedAt: t() },
  { id: 4, sku: 'SKU-1004', product: '农夫山泉矿泉水 550ml×24', warehouse: '主仓库', quantity: 380, warning: 30, createdAt: t(), updatedAt: t() },
  { id: 5, sku: 'SKU-1005', product: '康师傅红烧牛肉面 5连包', warehouse: '主仓库', quantity: 390, warning: 50, createdAt: t(), updatedAt: t() },
  { id: 6, sku: 'SKU-1006', product: '维达抽纸 3层×10包', warehouse: '主仓库', quantity: 90, warning: 12, createdAt: t(), updatedAt: t() },
  { id: 7, sku: 'SKU-1007', product: '蓝月亮洗衣液 3kg', warehouse: '主仓库', quantity: 45, warning: 6, createdAt: t(), updatedAt: t() },
  { id: 8, sku: 'SKU-1008', product: '海天金标生抽 500ml', warehouse: '主仓库', quantity: 385, warning: 20, createdAt: t(), updatedAt: t() },
];

const demoFinanceTransactions = [
  { id: 1, type: 'received', title: '永辉超市回款', counterparty: '永辉超市', amount: 3293, date: '2026-04-03' },
  { id: 2, type: 'paid', title: '中粮集团采购付款', counterparty: '中粮集团', amount: 14550, date: '2026-04-02' },
  { id: 3, type: 'received', title: '社区便利店回款', counterparty: '社区便利店张姐', amount: 274, date: '2026-04-06' },
  { id: 4, type: 'paid', title: '仓库月租', counterparty: '物流园区', amount: 3000, date: '2026-04-01' },
];

function buildDefaultState() {
  return {
    users: [
      {
        id: 1,
        username: 'admin',
        passwordHash: defaultAdminHash,
        role: 'admin',
        phone: '',
        email: '',
        status: 1,
        createdAt: t(),
        lastLoginAt: null,
        passwordUpdatedAt: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    ],
    products: demoProducts,
    customers: demoCustomers,
    suppliers: demoSuppliers,
    sales: demoSales,
    purchases: demoPurchases,
    inventory: demoInventory,
    accounts: [
      { id: 1, name: '现金账户', type: 'cash', balance: 8000, currency: 'CNY', status: 1, createdAt: t(), updatedAt: t() },
      { id: 2, name: '银行存款', type: 'bank', balance: 50000, currency: 'CNY', status: 1, createdAt: t(), updatedAt: t() },
      { id: 3, name: '应收账款', type: 'receivable', balance: 4993, currency: 'CNY', status: 1, createdAt: t(), updatedAt: t() },
      { id: 4, name: '应付账款', type: 'payable', balance: 5550, currency: 'CNY', status: 1, createdAt: t(), updatedAt: t() },
    ],
    warehouses: [
      { id: 1, name: '主仓库', address: '城南物流园区A-12栋', manager: '老周', phone: '13820001111', status: 1, createdAt: t(), updatedAt: t() },
    ],
    financeTransactions: demoFinanceTransactions,
    dataTasks: [],
    auditLogs: [],
  };
}

module.exports = { buildDefaultState, defaultAdminPassword, defaultAdminHash };
