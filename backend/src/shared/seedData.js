const bcrypt = require('bcryptjs');

const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const defaultAdminHash = bcrypt.hashSync(defaultAdminPassword, 10);

const t = () => new Date().toISOString();
const d = (s) => s; // 日期快捷方式

const demoProducts = [
  { id: 1, name: '优质大米 5kg', category: '粮油调味', price: 39.90, stock: 200, unit: '袋', createdAt: t(), updatedAt: t() },
  { id: 2, name: '金龙鱼食用油 1.8L', category: '粮油调味', price: 29.90, stock: 150, unit: '桶', createdAt: t(), updatedAt: t() },
  { id: 3, name: '特仑苏纯牛奶 250ml×12', category: '乳品饮料', price: 69.90, stock: 80, unit: '箱', createdAt: t(), updatedAt: t() },
  { id: 4, name: '农夫山泉矿泉水 550ml×24', category: '饮料冲调', price: 35.00, stock: 300, unit: '箱', createdAt: t(), updatedAt: t() },
  { id: 5, name: '康师傅红烧牛肉面 5连包', category: '方便速食', price: 12.50, stock: 500, unit: '包', createdAt: t(), updatedAt: t() },
  { id: 6, name: '维达抽纸 3层×10包', category: '日用百货', price: 29.90, stock: 120, unit: '提', createdAt: t(), updatedAt: t() },
  { id: 7, name: '蓝月亮洗衣液 3kg', category: '日用清洁', price: 49.90, stock: 60, unit: '瓶', createdAt: t(), updatedAt: t() },
  { id: 8, name: '海天金标生抽 500ml', category: '粮油调味', price: 9.90, stock: 200, unit: '瓶', createdAt: t(), updatedAt: t() },
  { id: 9, name: '伊利安慕希酸奶 205g×12', category: '乳品饮料', price: 59.90, stock: 100, unit: '箱', createdAt: t(), updatedAt: t() },
  { id: 10, name: '奥利奥饼干 696g', category: '休闲零食', price: 25.90, stock: 180, unit: '盒', createdAt: t(), updatedAt: t() },
  { id: 11, name: '三只松鼠坚果礼盒 1.2kg', category: '休闲零食', price: 128.00, stock: 45, unit: '盒', createdAt: t(), updatedAt: t() },
  { id: 12, name: '立白洗洁精 1.5kg', category: '日用清洁', price: 15.90, stock: 160, unit: '瓶', createdAt: t(), updatedAt: t() },
];

const demoCustomers = [
  { id: 1, name: '永辉超市', contact: '采购部王经理', phone: '13800001111', level: 'A', balance: 0, createdAt: t(), updatedAt: t() },
  { id: 2, name: '华润万家', contact: '供应链李总', phone: '13900002222', level: 'A', balance: 4993, createdAt: t(), updatedAt: t() },
  { id: 3, name: '社区便利店张姐', contact: '张姐', phone: '13600003333', level: 'B', balance: 0, createdAt: t(), updatedAt: t() },
  { id: 4, name: '美团优选供应商', contact: '采购刘经理', phone: '13700004444', level: 'B', balance: 1850, createdAt: t(), updatedAt: t() },
  { id: 5, name: '阿里巴巴零售通', contact: '渠道陈经理', phone: '13500005555', level: 'C', balance: 0, createdAt: t(), updatedAt: t() },
  { id: 6, name: '大润发超市', contact: '采购赵总', phone: '13300006666', level: 'A', balance: 3200, createdAt: t(), updatedAt: t() },
];

const demoSuppliers = [
  { id: 1, name: '中粮集团', contact: '销售部赵经理', phone: '13810001111', payable: 0, createdAt: t(), updatedAt: t() },
  { id: 2, name: '伊利乳业', contact: '大客户陈经理', phone: '13910002222', payable: 5550, createdAt: t(), updatedAt: t() },
  { id: 3, name: '宝洁中国', contact: '渠道张总', phone: '13610003333', payable: 0, createdAt: t(), updatedAt: t() },
  { id: 4, name: '联合利华', contact: '商务李经理', phone: '13710004444', payable: 1800, createdAt: t(), updatedAt: t() },
  { id: 5, name: '益海嘉里', contact: '华东区孙总', phone: '13210005555', payable: 0, createdAt: t(), updatedAt: t() },
];

const demoSales = [
  {
    id: 1, orderNo: 'SO-20260501-001', customer: '永辉超市', status: '已完成',
    date: '2026-05-02', amount: 3293,
    items: [
      { productName: '优质大米 5kg', quantity: 50, unitPrice: 39.90 },
      { productName: '金龙鱼食用油 1.8L', quantity: 20, unitPrice: 29.90 },
      { productName: '农夫山泉矿泉水 550ml×24', quantity: 20, unitPrice: 35.00 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 2, orderNo: 'SO-20260503-001', customer: '华润万家', status: '待收款',
    date: '2026-05-03', amount: 4993,
    items: [
      { productName: '特仑苏纯牛奶 250ml×12', quantity: 30, unitPrice: 69.90 },
      { productName: '康师傅红烧牛肉面 5连包', quantity: 100, unitPrice: 12.50 },
      { productName: '维达抽纸 3层×10包', quantity: 30, unitPrice: 29.90 },
      { productName: '蓝月亮洗衣液 3kg', quantity: 15, unitPrice: 49.90 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 3, orderNo: 'SO-20260506-001', customer: '社区便利店张姐', status: '已完成',
    date: '2026-05-06', amount: 274,
    items: [
      { productName: '康师傅红烧牛肉面 5连包', quantity: 10, unitPrice: 12.50 },
      { productName: '海天金标生抽 500ml', quantity: 15, unitPrice: 9.90 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 4, orderNo: 'SO-20260508-001', customer: '大润发超市', status: '待发货',
    date: '2026-05-08', amount: 5860,
    items: [
      { productName: '伊利安慕希酸奶 205g×12', quantity: 40, unitPrice: 59.90 },
      { productName: '三只松鼠坚果礼盒 1.2kg', quantity: 20, unitPrice: 128.00 },
      { productName: '奥利奥饼干 696g', quantity: 30, unitPrice: 25.90 },
      { productName: '海天金标生抽 500ml', quantity: 50, unitPrice: 9.90 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 5, orderNo: 'SO-20260510-001', customer: '美团优选供应商', status: '已完成',
    date: '2026-05-10', amount: 1850,
    items: [
      { productName: '优质大米 5kg', quantity: 25, unitPrice: 39.90 },
      { productName: '立白洗洁精 1.5kg', quantity: 30, unitPrice: 15.90 },
      { productName: '维达抽纸 3层×10包', quantity: 10, unitPrice: 29.90 },
    ],
    createdAt: t(), updatedAt: t(),
  },
];

const demoPurchases = [
  {
    id: 1, orderNo: 'PO-20260501-001', supplier: '中粮集团', status: '已入库',
    date: '2026-05-01', amount: 14550,
    items: [
      { productName: '优质大米 5kg', quantity: 250, unitPrice: 35.00 },
      { productName: '金龙鱼食用油 1.8L', quantity: 120, unitPrice: 25.00 },
      { productName: '海天金标生抽 500ml', quantity: 200, unitPrice: 7.50 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 2, orderNo: 'PO-20260504-001', supplier: '伊利乳业', status: '待付款',
    date: '2026-05-04', amount: 5550,
    items: [
      { productName: '特仑苏纯牛奶 250ml×12', quantity: 50, unitPrice: 55.00 },
      { productName: '伊利安慕希酸奶 205g×12', quantity: 60, unitPrice: 45.00 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 3, orderNo: 'PO-20260507-001', supplier: '联合利华', status: '已入库',
    date: '2026-05-07', amount: 1800,
    items: [
      { productName: '蓝月亮洗衣液 3kg', quantity: 30, unitPrice: 35.00 },
      { productName: '立白洗洁精 1.5kg', quantity: 50, unitPrice: 12.00 },
    ],
    createdAt: t(), updatedAt: t(),
  },
  {
    id: 4, orderNo: 'PO-20260511-001', supplier: '益海嘉里', status: '运输中',
    date: '2026-05-11', amount: 6800,
    items: [
      { productName: '金龙鱼食用油 1.8L', quantity: 100, unitPrice: 25.00 },
      { productName: '优质大米 5kg', quantity: 120, unitPrice: 35.00 },
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
  { id: 7, sku: 'SKU-1007', product: '蓝月亮洗衣液 3kg', warehouse: '主仓库', quantity: 75, warning: 6, createdAt: t(), updatedAt: t() },
  { id: 8, sku: 'SKU-1008', product: '海天金标生抽 500ml', warehouse: '主仓库', quantity: 385, warning: 20, createdAt: t(), updatedAt: t() },
  { id: 9, sku: 'SKU-1009', product: '伊利安慕希酸奶 205g×12', warehouse: '主仓库', quantity: 120, warning: 15, createdAt: t(), updatedAt: t() },
  { id: 10, sku: 'SKU-1010', product: '奥利奥饼干 696g', warehouse: '主仓库', quantity: 180, warning: 20, createdAt: t(), updatedAt: t() },
  { id: 11, sku: 'SKU-1011', product: '三只松鼠坚果礼盒 1.2kg', warehouse: '主仓库', quantity: 45, warning: 5, createdAt: t(), updatedAt: t() },
  { id: 12, sku: 'SKU-1012', product: '立白洗洁精 1.5kg', warehouse: '主仓库', quantity: 190, warning: 20, createdAt: t(), updatedAt: t() },
];

const demoFinanceTransactions = [
  { id: 1, type: 'received', title: '永辉超市回款', counterparty: '永辉超市', amount: 3293, date: '2026-05-03' },
  { id: 2, type: 'paid', title: '中粮集团采购付款', counterparty: '中粮集团', amount: 14550, date: '2026-05-02' },
  { id: 3, type: 'received', title: '社区便利店回款', counterparty: '社区便利店张姐', amount: 274, date: '2026-05-07' },
  { id: 4, type: 'paid', title: '仓库月租', counterparty: '物流园区', amount: 3000, date: '2026-05-01' },
  { id: 5, type: 'received', title: '美团优选回款', counterparty: '美团优选供应商', amount: 1850, date: '2026-05-11' },
  { id: 6, type: 'paid', title: '伊利乳业部分付款', counterparty: '伊利乳业', amount: 3000, date: '2026-05-05' },
  { id: 7, type: 'paid', title: '水电物业费', counterparty: '城南物流园物业', amount: 1200, date: '2026-05-06' },
  { id: 8, type: 'received', title: '阿里巴巴零售通预付款', counterparty: '阿里巴巴零售通', amount: 5000, date: '2026-05-09' },
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
      { id: 3, name: '应收账款', type: 'receivable', balance: 10043, currency: 'CNY', status: 1, createdAt: t(), updatedAt: t() },
      { id: 4, name: '应付账款', type: 'payable', balance: 7350, currency: 'CNY', status: 1, createdAt: t(), updatedAt: t() },
    ],
    warehouses: [
      { id: 1, name: '主仓库', address: '城南物流园区A-12栋', manager: '老周', phone: '13820001111', status: 1, createdAt: t(), updatedAt: t() },
      { id: 2, name: '城北分仓', address: '城北工业园B-05号', manager: '小李', phone: '13920002222', status: 1, createdAt: t(), updatedAt: t() },
    ],
    financeTransactions: demoFinanceTransactions,
    dataTasks: [],
    auditLogs: [],
  };
}

module.exports = { buildDefaultState, defaultAdminPassword, defaultAdminHash };
