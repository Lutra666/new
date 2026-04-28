const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const now = () => new Date().toISOString();
const dataDir = process.env.MOCK_DATA_DIR
  ? path.resolve(process.env.MOCK_DATA_DIR)
  : path.resolve(__dirname, '../../data');
const storeFile = path.join(dataDir, 'mock-store.json');
const backupDir = path.join(dataDir, 'backups');
const secondaryBackupDir = process.env.SECONDARY_BACKUP_DIR
  ? path.resolve(process.env.SECONDARY_BACKUP_DIR)
  : '';
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const backupSignKey = process.env.BACKUP_SIGN_KEY || process.env.JWT_SECRET || 'finance-backup-sign';
const dataEncryptionKey = crypto
  .createHash('sha256')
  .update(process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET || 'finance-data-key')
  .digest();
const defaultAdminHash = bcrypt.hashSync(defaultAdminPassword, 10);

const clone = (value) => JSON.parse(JSON.stringify(value));

const sumBy = (items, key) =>
  (Array.isArray(items) ? items : []).reduce((sum, item) => sum + Number(item?.[key] || 0), 0);

const toCurrencyText = (value) => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0 });

const signState = (value) =>
  crypto.createHmac('sha256', backupSignKey).update(JSON.stringify(value)).digest('hex');

const encryptField = (value) => {
  if (value === null || typeof value === 'undefined' || value === '') {
    return '';
  }
  if (typeof value !== 'string') {
    return value;
  }
  if (value.startsWith('enc:v1:')) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dataEncryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

const decryptField = (value) => {
  if (typeof value !== 'string' || !value.startsWith('enc:v1:')) {
    return value;
  }
  const parts = value.split(':');
  if (parts.length !== 5) {
    return '';
  }

  try {
    const iv = Buffer.from(parts[2], 'base64');
    const tag = Buffer.from(parts[3], 'base64');
    const ciphertext = Buffer.from(parts[4], 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', dataEncryptionKey, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    return '';
  }
};

const buildDefaultState = () => {
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

  return {
    users: [
      {
        id: 1,
        username: 'admin',
        password_hash: defaultAdminHash,
        role: 'admin',
        phone: '',
        email: '',
        status: 1,
        created_at: t(),
        last_login_at: null,
        password_updated_at: null,
        failed_login_attempts: 0,
        locked_until: null,
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
};

const ensureDirs = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
};

const normalizeUsers = (users) => {
  if (!Array.isArray(users)) {
    return clone(buildDefaultState().users);
  }

  return users.map((user, index) => {
    const passwordHash =
      user.password_hash ||
      (user.password ? bcrypt.hashSync(user.password, 10) : index === 0 ? defaultAdminHash : null);
    return {
      id: user.id || index + 1,
      username: user.username,
      password_hash: passwordHash,
      role: user.role || 'viewer',
      phone: user.phone || '',
      email: user.email || '',
      status: typeof user.status === 'number' ? user.status : 1,
      created_at: user.created_at || now(),
      last_login_at: user.last_login_at || null,
      password_updated_at: user.password_updated_at || null,
      failed_login_attempts: Number(user.failed_login_attempts || 0),
      locked_until: user.locked_until || null,
    };
  });
};

const decryptSensitiveState = (rawState) => {
  const next = clone(rawState || {});

  const decryptArrayFields = (collectionName, fields) => {
    if (!Array.isArray(next[collectionName])) {
      return;
    }
    next[collectionName] = next[collectionName].map((item) => {
      const updated = { ...item };
      fields.forEach((field) => {
        if (typeof updated[field] !== 'undefined') {
          updated[field] = decryptField(updated[field]);
        }
      });
      return updated;
    });
  };

  decryptArrayFields('users', ['phone', 'email']);
  decryptArrayFields('customers', ['phone', 'contact']);
  decryptArrayFields('suppliers', ['phone', 'contact']);

  return next;
};

const encryptSensitiveState = (rawState) => {
  const next = clone(rawState || {});

  const encryptArrayFields = (collectionName, fields) => {
    if (!Array.isArray(next[collectionName])) {
      return;
    }
    next[collectionName] = next[collectionName].map((item) => {
      const updated = { ...item };
      fields.forEach((field) => {
        if (typeof updated[field] !== 'undefined') {
          updated[field] = encryptField(updated[field]);
        }
      });
      return updated;
    });
  };

  encryptArrayFields('users', ['phone', 'email']);
  encryptArrayFields('customers', ['phone', 'contact']);
  encryptArrayFields('suppliers', ['phone', 'contact']);

  return next;
};

const normalizeState = (raw) => {
  const base = buildDefaultState();
  const merged = {
    ...base,
    ...(raw || {}),
  };

  return {
    ...merged,
    users: normalizeUsers(merged.users),
    products: Array.isArray(merged.products) ? merged.products : [],
    customers: Array.isArray(merged.customers) ? merged.customers : [],
    suppliers: Array.isArray(merged.suppliers) ? merged.suppliers : [],
    sales: Array.isArray(merged.sales) ? merged.sales : [],
    purchases: Array.isArray(merged.purchases) ? merged.purchases : [],
    inventory: Array.isArray(merged.inventory) ? merged.inventory : [],
    accounts: Array.isArray(merged.accounts) ? merged.accounts : [],
    warehouses: Array.isArray(merged.warehouses) ? merged.warehouses : [],
    financeTransactions: Array.isArray(merged.financeTransactions) ? merged.financeTransactions : [],
    dataTasks: Array.isArray(merged.dataTasks) ? merged.dataTasks : clone(base.dataTasks),
    auditLogs: Array.isArray(merged.auditLogs) ? merged.auditLogs : [],
  };
};

const loadStateFromDisk = () => {
  try {
    ensureDirs();
    if (!fs.existsSync(storeFile)) {
      return buildDefaultState();
    }

    const raw = fs.readFileSync(storeFile, 'utf8');
    return normalizeState(decryptSensitiveState(JSON.parse(raw)));
  } catch (error) {
    console.error('加载本地数据失败，已回退默认数据:', error.message);
    return buildDefaultState();
  }
};

const state = loadStateFromDisk();

const persistState = () => {
  ensureDirs();
  const sanitized = normalizeState(state);
  const encrypted = encryptSensitiveState(sanitized);
  const tmpFile = `${storeFile}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(encrypted, null, 2), 'utf8');
  fs.renameSync(tmpFile, storeFile);
};

const resourceMap = {
  products: 'products',
  customers: 'customers',
  suppliers: 'suppliers',
  sales: 'sales',
  purchases: 'purchases',
  inventory: 'inventory',
  accounts: 'accounts',
  warehouses: 'warehouses',
};

const getCollection = (name) => {
  const key = resourceMap[name] || name;
  if (!state[key]) {
    state[key] = [];
  }
  return state[key];
};

const list = (name) => clone(getCollection(name));

const create = (name, payload) => {
  const collection = getCollection(name);
  const ts = now();
  const item = {
    id: collection.length ? Math.max(...collection.map((entry) => entry.id || 0)) + 1 : 1,
    ...payload,
    createdAt: payload.createdAt || ts,
    updatedAt: ts,
  };
  collection.unshift(item);
  persistState();
  return clone(item);
};

const update = (name, id, payload) => {
  const collection = getCollection(name);
  const index = collection.findIndex((entry) => String(entry.id) === String(id));

  if (index === -1) {
    return null;
  }

  collection[index] = {
    ...collection[index],
    ...payload,
    updatedAt: now(),
  };
  persistState();
  return clone(collection[index]);
};

const remove = (name, id) => {
  const collection = getCollection(name);
  const index = collection.findIndex((entry) => String(entry.id) === String(id));

  if (index === -1) {
    return false;
  }

  collection.splice(index, 1);
  persistState();
  return true;
};

const findUserByUsername = (username) =>
  state.users.find((user) => user.username === username && user.status === 1) || null;

const findUserById = (id) => state.users.find((user) => String(user.id) === String(id)) || null;

const verifyUserPassword = async (user, plainPassword) => {
  if (!user?.password_hash || !plainPassword) {
    return false;
  }
  return bcrypt.compare(plainPassword, user.password_hash);
};

const createUser = (payload) => {
  const user = {
    id: state.users.length ? Math.max(...state.users.map((entry) => entry.id || 0)) + 1 : 1,
    status: 1,
    created_at: now(),
    last_login_at: null,
    password_updated_at: now(),
    username: payload.username,
    password_hash: bcrypt.hashSync(payload.password, 10),
    role: payload.role || 'viewer',
    phone: payload.phone || '',
    email: payload.email || '',
    failed_login_attempts: 0,
    locked_until: null,
  };
  state.users.push(user);
  persistState();
  return clone(user);
};

const touchLastLogin = (id) => {
  const user = findUserById(id);
  if (user) {
    user.last_login_at = now();
    user.failed_login_attempts = 0;
    user.locked_until = null;
    persistState();
  }
};

const getUserLockState = (user) => {
  if (!user?.locked_until) {
    return { locked: false, remainingSeconds: 0 };
  }
  const remain = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 1000);
  if (remain <= 0) {
    user.locked_until = null;
    user.failed_login_attempts = 0;
    persistState();
    return { locked: false, remainingSeconds: 0 };
  }
  return { locked: true, remainingSeconds: remain };
};

const recordLoginFailure = (user, maxAttempts, lockMinutes) => {
  if (!user) {
    return { locked: false, attempts: 0, remainingSeconds: 0 };
  }

  const cap = Math.max(Number(maxAttempts) || 5, 3);
  const mins = Math.max(Number(lockMinutes) || 15, 1);
  user.failed_login_attempts = Number(user.failed_login_attempts || 0) + 1;
  let locked = false;
  let remainingSeconds = 0;

  if (user.failed_login_attempts >= cap) {
    user.locked_until = new Date(Date.now() + mins * 60 * 1000).toISOString();
    user.failed_login_attempts = 0;
    locked = true;
    remainingSeconds = mins * 60;
  }

  persistState();
  return { locked, attempts: Number(user.failed_login_attempts || 0), remainingSeconds };
};

const getFinanceSummary = () => {
  const receivable = sumBy(state.customers, 'balance');
  const payable = sumBy(state.suppliers, 'payable');
  const cashBalance = sumBy(state.accounts, 'balance');
  const received = sumBy(
    state.financeTransactions.filter((item) => item.type === 'received'),
    'amount'
  );
  const paid = sumBy(
    state.financeTransactions.filter((item) => item.type === 'paid'),
    'amount'
  );

  return {
    receivable,
    payable,
    cashBalance,
    monthlyProfit: received - paid,
    transactions: clone(state.financeTransactions),
  };
};

const addFinanceTransaction = (type, payload) => {
  const transaction = {
    id: state.financeTransactions.length
      ? Math.max(...state.financeTransactions.map((entry) => entry.id || 0)) + 1
      : 1,
    type,
    date: payload.date || new Date().toISOString().slice(0, 10),
    ...payload,
  };
  state.financeTransactions.unshift(transaction);
  persistState();
  return clone(transaction);
};

const getReportSummary = () => ({
  cards: [
    { key: 'sales', title: '累计销售额', value: toCurrencyText(sumBy(state.sales, 'amount')), trend: 'N/A' },
    { key: 'profit', title: '累计利润', value: toCurrencyText(getFinanceSummary().monthlyProfit), trend: 'N/A' },
    {
      key: 'stock',
      title: '库存件数',
      value: toCurrencyText(sumBy(state.inventory, 'quantity')),
      trend: 'N/A',
    },
    { key: 'customers', title: '客户总数', value: toCurrencyText(state.customers.length), trend: 'N/A' },
  ],
  topProducts: clone(state.products).slice(0, 3),
});

const getSystemInfo = () => ({
  appName: '鳌龙财务管理系统',
  mode: 'production',
  version: '1.0.7',
  features: ['正式版数据存储', '账号鉴权', '本地备份恢复', '操作审计'],
});

const getDataTasks = () => clone(state.dataTasks);

const isUsingDefaultAdminPassword = async (user, plainPassword) => {
  if (user?.username !== 'admin') {
    return false;
  }
  const defaultHashMatches = await bcrypt.compare(defaultAdminPassword, user.password_hash || '');
  if (!defaultHashMatches) {
    return false;
  }
  return verifyUserPassword(user, plainPassword);
};

const changeUserPassword = async ({ userId, username, oldPassword, newPassword }) => {
  const user =
    typeof userId !== 'undefined' && userId !== null
      ? findUserById(userId)
      : findUserByUsername(username);

  if (!user || user.status !== 1) {
    return { ok: false, error: '用户不存在' };
  }

  const matched = await verifyUserPassword(user, oldPassword);
  if (!matched) {
    return { ok: false, error: '原密码错误' };
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.password_updated_at = now();
  persistState();
  return { ok: true };
};

const listBackups = () => {
  ensureDirs();
  return fs
    .readdirSync(backupDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => {
      const fullPath = path.join(backupDir, entry.name);
      const stat = fs.statSync(fullPath);
      return {
        fileName: entry.name,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
};

const createBackup = (operator = 'system') => {
  ensureDirs();
  const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const fullPath = path.join(backupDir, fileName);
  const stateClone = encryptSensitiveState(clone(state));
  const signature = signState(stateClone);
  const content = {
    meta: {
      createdAt: now(),
      operator,
      version: '1.0.7',
      signature,
    },
    state: stateClone,
  };
  fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf8');
  let secondaryFullPath = '';
  if (secondaryBackupDir) {
    if (!fs.existsSync(secondaryBackupDir)) {
      fs.mkdirSync(secondaryBackupDir, { recursive: true });
    }
    secondaryFullPath = path.join(secondaryBackupDir, fileName);
    fs.copyFileSync(fullPath, secondaryFullPath);
  }
  return {
    fileName,
    fullPath,
    secondaryFullPath,
  };
};

const restoreBackup = (fileName) => {
  ensureDirs();
  const safeName = path.basename(fileName || '');
  const fullPath = path.join(backupDir, safeName);
  if (!safeName || !safeName.endsWith('.json') || !fs.existsSync(fullPath)) {
    return { ok: false, error: '备份文件不存在' };
  }

  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    const nextState = parsed?.state;
    const backupSignature = parsed?.meta?.signature;

    if (!nextState || !Array.isArray(nextState.users)) {
      return { ok: false, error: '备份文件格式无效' };
    }
    if (!backupSignature || signState(nextState) !== backupSignature) {
      return { ok: false, error: '备份签名校验失败，文件可能被篡改' };
    }

    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, normalizeState(decryptSensitiveState(nextState)));

    persistState();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `恢复失败: ${error.message}` };
  }
};

const appendAuditLog = (entry) => {
  const item = {
    id: state.auditLogs.length ? Math.max(...state.auditLogs.map((log) => log.id || 0)) + 1 : 1,
    createdAt: now(),
    ...entry,
  };
  state.auditLogs.unshift(item);
  state.auditLogs = state.auditLogs.slice(0, 2000);
  persistState();
  return clone(item);
};

const listAuditLogs = (limit = 200) => clone(state.auditLogs.slice(0, limit));

module.exports = {
  list,
  create,
  update,
  remove,
  findUserByUsername,
  findUserById,
  verifyUserPassword,
  createUser,
  touchLastLogin,
  getUserLockState,
  recordLoginFailure,
  getFinanceSummary,
  addFinanceTransaction,
  getReportSummary,
  getSystemInfo,
  getDataTasks,
  isUsingDefaultAdminPassword,
  changeUserPassword,
  listBackups,
  createBackup,
  restoreBackup,
  appendAuditLog,
  listAuditLogs,
};
