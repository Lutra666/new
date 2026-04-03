# 鳌龙财务管理系统

> 专业版批发零售财务解决方案

## 📋 项目概述

这是一个基于 React + Node.js + MySQL 的财务管理系统，专为中小型企业设计，提供完整的进销存和财务管理功能。

当前仓库已升级为“可运行正式版骨架”：
- 前端可登录并浏览主要业务页面
- 后端补齐了基础 API 路由
- 默认使用本地持久化模式（正式版空数据初始化），无需先安装 MySQL
- 需要接真实数据库时，可通过 `USE_REAL_DB=true` 切换
- 商品/客户/供应商/销售/采购/库存等页面已支持基础增删改查
- 启动时会自动校验 token 对应用户资料，避免本地缓存造成假登录状态
- 新增高级启动器（自动检查依赖、自动拉起前后端、自动健康检查、自动打开浏览器）

### 🚀 核心功能
- **商品管理** - 商品信息、分类、价格体系
- **客户管理** - 客户档案、信用额度、往来账款
- **供应商管理** - 供应商信息、采购往来
- **销售管理** - 销售订单、发货、收款
- **采购管理** - 采购订单、入库、付款
- **库存管理** - 库存查询、调拨、预警
- **财务管理** - 收付款、应收应付、财务报表
- **报表中心** - 销售报表、利润分析、库存报表

### 🛠 技术栈
- **前端**: React 18 + Ant Design Pro + Axios
- **后端**: Node.js + Express + Sequelize
- **数据库**: MySQL 8.0
- **认证**: JWT Token
- **构建工具**: Webpack + Babel

### 📁 项目结构
```
finance-system/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── middleware/   # 中间件
│   │   └── config/       # 配置文件
│   ├── package.json
│   └── .env
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 通用组件
│   │   ├── services/     # API 服务
│   │   └── utils/        # 工具函数
│   ├── package.json
│   └── public/
└── docs/                 # 文档
```

### 🚀 快速开始

1. **一键启动（推荐）**
```bash
cd finance-system-backup
npm start
```

如果你更喜欢无终端的可视化启动体验，可以使用：
```bash
npm run start:gui
```
该模式会打开现代化 GUI 启动器，带步骤进度、状态日志与自动检测。

高级启动器会自动：
- 检查 `backend/node_modules` 和 `frontend/node_modules`
- 缺失时自动执行 `npm install`
- 自动启动后端和前端
- 等待服务健康后自动打开 `http://localhost:3000`

2. **配置环境变量**
```bash
# 复制示例配置
cp backend/.env.example backend/.env
```

3. **手动分开启动（备用）**
```bash
# 启动后端
cd backend
npm start

# 启动前端
cd frontend
npm start
```

4. **访问系统**
```bash
前端: http://localhost:3000
后端: http://localhost:3001
```

- 默认账户: `admin / admin123`
- 默认账户首次上线建议立即修改密码；若登录返回 `requirePasswordChange=true`，表示仍在默认密码状态
- 正式版初始不包含预览业务数据，请按实际业务录入
- 本地敏感字段（如用户联系方式）已加密落盘，备份支持签名校验防篡改
- 支持登录失败锁定策略（可在 `.env` 配置重试次数与锁定时长）
- 默认仅监听本机地址（`BIND_HOST=127.0.0.1`），需要局域网访问时请显式改为 `0.0.0.0`

5. **切换到真实数据库模式**
```bash
# 编辑 backend/.env
USE_REAL_DB=true
```

然后准备 MySQL 数据库和表结构，再重启后端即可。

6. **开机自动启动（Windows）**
```bash
# 安装开机自启动
npm run autostart:install

# 取消开机自启动
npm run autostart:remove
```

### 🔐 API 接口

#### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息
- `POST /api/auth/change-password` - 修改当前用户密码（新密码需至少 8 位，且包含字母和数字）

#### 业务接口
- `GET /api/products` - 获取商品列表
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

- `GET /api/customers` - 获取客户列表
- `POST /api/customers` - 创建客户
- `PUT /api/customers/:id` - 更新客户
- `DELETE /api/customers/:id` - 删除客户

- `GET /api/suppliers` - 获取供应商列表
- `POST /api/suppliers` - 创建供应商
- `PUT /api/suppliers/:id` - 更新供应商
- `DELETE /api/suppliers/:id` - 删除供应商

- `GET /api/sales` - 获取销售订单
- `POST /api/sales` - 创建销售订单
- `PUT /api/sales/:id` - 更新销售订单
- `DELETE /api/sales/:id` - 删除销售订单

- `GET /api/purchases` - 获取采购订单
- `POST /api/purchases` - 创建采购订单
- `PUT /api/purchases/:id` - 更新采购订单
- `DELETE /api/purchases/:id` - 删除采购订单

- `GET /api/inventory` - 获取库存信息
- `PUT /api/inventory/adjust` - 库存调整
- `POST /api/inventory/transfer` - 库存调拨

- `GET /api/finance` - 获取财务数据
- `POST /api/finance/received` - 创建收款单
- `POST /api/finance/paid` - 创建付款单

- `GET /api/data` - 获取数据任务
- `GET /api/data/backups` - 获取备份列表
- `POST /api/data/backup` - 创建本地备份
- `POST /api/data/restore` - 按备份文件名恢复数据
- `GET /api/system/audit-logs` - 获取操作审计日志

### 📊 数据库设计

#### 核心表结构
- `users` - 用户表
- `products` - 商品表
- `categories` - 商品分类表
- `customers` - 客户表
- `suppliers` - 供应商表
- `sales_orders` - 销售订单表
- `purchase_orders` - 采购订单表
- `inventory` - 库存表
- `accounts` - 账户表
- `payment_received` - 收款单表
- `payment_paid` - 付款单表

### 🛡 安全措施

- JWT Token 认证
- JWT 签发/校验强制 `issuer + audience + HS256`
- 密码哈希存储（bcrypt）
- 敏感字段加密落盘（AES-GCM）
- SQL 注入防护
- XSS 攻击防护
- 速率限制
- 登录专属限流（防爆破）
- 输入验证
- CORS 配置
- 备份签名校验（防篡改）
- 登录失败锁定策略
- 高风险接口管理员鉴权（审计日志/诊断/备份恢复）
- Electron 导航隔离（禁止外链跳转与新窗口）

### 📈 性能优化

- 数据库索引优化
- 查询缓存
- 分页加载
- 压缩传输
- 静态资源优化

### 🚨 错误处理

- 统一错误响应格式
- 详细错误日志
- 异常捕获机制
- 数据验证

### 📝 许可证

本项目仅供学习交流使用。

---

鳌龙科技 | 2026
