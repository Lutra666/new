<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=30&pause=1000&color=4F46E5&center=true&vCenter=true&random=false&width=700&lines=%F0%9F%92%B0+%E9%B3%8C%E9%BE%99%E8%B4%A2%E5%8A%A1%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F;%E8%BF%9B%E9%94%80%E5%AD%98+%C2%B7+%E8%B5%84%E9%87%91%E6%B5%81+%C2%B7+AI+%E6%99%BA%E8%83%BD%E5%88%86%E6%9E%90" alt="鳌龙财务管理系统">

  <p align="center">
    <strong>面向批发零售企业的桌面级 ERP 财务管理软件</strong>
    <br>
    内置 AI 智能分析引擎，兼具桌面应用的安全与 Web 的灵活
  </p>

  <p align="center">
    <img src="https://img.shields.io/github/stars/Lutra666/new?style=for-the-badge&color=4F46E5">
    <img src="https://img.shields.io/github/forks/Lutra666/new?style=for-the-badge&color=0D9488">
    <img src="https://img.shields.io/github/license/Lutra666/new?style=for-the-badge&color=8B5CF6">
    <img src="https://img.shields.io/github/last-commit/Lutra666/new?style=for-the-badge&color=D97706">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react">
    <img src="https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js">
  </p>

  <br>

  <img src="https://picsum.photos/seed/finance-system/1200/600" alt="系统预览" style="border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
</div>

<br>

## ✨ 核心特性

<div align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/artificial-intelligence.png" width="64"><br>
        <strong>AI 智能分析</strong>
        <p>自然语言查询数据、一键生成经营报告、自动检测异常、智能经营建议</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/database.png" width="64"><br>
        <strong>双模式存储</strong>
        <p>JSON 本地文件零配置开箱即用，MySQL 8.0 一键切换正式部署</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/cloud-backup.png" width="64"><br>
        <strong>自动备份</strong>
        <p>定时自动备份 + 签名防篡改 + 一键恢复，数据安全有保障</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/paint-palette.png" width="64"><br>
        <strong>暗色主题</strong>
        <p>亮色/暗色一键切换，从按钮向外扩散的过渡动画，视觉体验拉满</p>
      </td>
    </tr>
    <tr>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/shopping-cart.png" width="64"><br>
        <strong>进销存一体化</strong>
        <p>商品管理、采购入库、销售出库、库存预警、多仓库调拨</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/money.png" width="64"><br>
        <strong>财务记账</strong>
        <p>收支流水、应收应付、账户余额、利润概览，一目了然</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/lock.png" width="64"><br>
        <strong>安全可靠</strong>
        <p>JWT 鉴权、登录锁定、AES-256 加密、Electron 沙箱模式</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/desktop.png" width="64"><br>
        <strong>桌面应用</strong>
        <p>Electron 打包为 Windows .exe 安装程序，双击安装即可使用</p>
      </td>
    </tr>
  </table>
</div>

<br>

## 🤖 AI 智能分析

v1.0.9 起内置 AI 引擎，通过 Anthropic SDK 对接大语言模型（默认 DeepSeek V4，可切换 Claude）。

<div align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/chat.png" width="64"><br>
        <strong>智能问答</strong>
        <p>自然语言查询经营数据<br>SSE 流式打字机输出</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/document.png" width="64"><br>
        <strong>智能报告</strong>
        <p>一键生成四类报告<br>经营·客户·库存·资金</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/warning-shield.png" width="64"><br>
        <strong>异常检测</strong>
        <p>自动扫描订单/库存/财务<br>🔴高·🟠中·🔵低</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluency/96/000000/idea.png" width="64"><br>
        <strong>经营建议</strong>
        <p>AI 顾问角色<br>销售·成本·库存·资金·客户</p>
      </td>
    </tr>
  </table>
</div>

```bash
# backend/.env AI 配置
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
ANTHROPIC_API_KEY=sk-your-api-key-here
AI_MODEL=deepseek-v4-pro
```

> 💡 默认 DeepSeek，可切换 Claude API：`https://api.anthropic.com`

<br>

## 🚀 快速开始

### 在线体验
👉 **[ahut615.top/finance](https://ahut615.top/finance)** &nbsp;|&nbsp; 账号 `admin` / 密码 `admin123`

### 开发模式

```bash
git clone https://github.com/Lutra666/new.git
cd new && npm start
# 自动安装依赖 → 后端(3001) → 前端(3000) → 浏览器
```

### Windows 安装包

| 版本 | 下载 |
|------|------|
| **v1.0.10** | [下载 .exe](https://github.com/Lutra666/new/releases/download/v1.0.10/Aolong.Finance.System.Setup.1.0.10.exe) |
| v1.0.9 | [下载 .exe](https://github.com/Lutra666/new/releases/download/v1.0.9/Aolong.Finance.System.Setup.1.0.9.exe) |
| 全部版本 | [Releases 页面](https://github.com/Lutra666/new/releases) |

### 默认账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |

<br>

## 🧱 技术栈

| 层级 | 技术 |
|------|------|
| 🖥 前端 | React 18 + Ant Design 5 + react-router-dom 6 + axios |
| ⚙️ 后端 | Node.js 24 + Express 4 + JWT HS256 鉴权 |
| 🤖 AI | Anthropic SDK + DeepSeek V4 + SSE 流式响应 |
| 💾 数据 | JSON 本地（默认）/ MySQL 8.0 + Sequelize |
| 🖼 桌面 | Electron 37 + electron-builder + NSIS |
| 🔒 安全 | helmet + cors + rate-limit + bcryptjs + AES-256-GCM |

<br>

## 📦 功能模块

| 模块 | 说明 |
|------|------|
| 📦 商品管理 | 名称、分类、单价、单位、库存 |
| 👥 客户管理 | 联系人、电话、等级(A/B/C)、应收余额 |
| 🏭 供应商管理 | 联系人、电话、应付余额 |
| 🏗 仓库管理 | 多仓库信息维护 |
| 🛒 销售订单 | 多商品行、数量联动、金额自动计算、库存不足拒出库 |
| 📥 采购订单 | 供应商选择、入库自动增库存 |
| 📊 库存管理 | 实时库存、安全预警、仓库检索 |
| 💰 财务管理 | 收支记账、账户余额、流水 |
| 📈 数据报表 | 销售/利润/库存/客户统计、热销排行 |
| 🤖 AI 分析 | 问答、报告、异常检测、经营建议 |
| ⚙️ 系统管理 | 用户管理、角色权限、审计日志、诊断面板 |
| 💾 数据备份 | 备份/恢复、定时备份、签名防篡改 |
| 🌓 暗色模式 | 亮/暗一键切换、扩散过渡动画 |

<br>

## 🛠 项目结构

```
new/
├── backend/src/          # Express API 服务器
│   ├── server.js         # 主入口
│   ├── routes/           # API 路由 (auth/products/sales/ai...)
│   ├── middleware/        # JWT 鉴权中间件
│   ├── data/mockStore.js # 本地 JSON 存储引擎
│   ├── shared/           # 加密、种子数据、订单工具
│   └── config/database.js# MySQL 连接配置
├── frontend/src/         # React 18 前端
│   ├── app.js            # 根组件：路由、主题、状态
│   ├── pages/            # 页面组件（懒加载）
│   ├── components/       # 通用组件 + AI 模块
│   └── services/api.js   # axios 实例 + 拦截器
├── electron/main.js      # Electron 桌面外壳
├── miniprogram/          # 微信小程序 (uni-app/Vue3)
└── scripts/              # PowerShell 启动脚本
```

<br>

## 🌐 服务端部署

### 环境要求
- Ubuntu 22.04+ / Node.js 24+ / MySQL 8.0 / Nginx 1.24+

```bash
# 安装环境
apt update && apt install -y nodejs mysql-server nginx git

# 克隆仓库
cd /opt && git clone https://github.com/Lutra666/new.git finance-system
cd finance-system/backend

# 配置并启动
cp .env.example .env && nano .env  # 修改 JWT_SECRET 和数据库信息
npm install --production
npm install -g pm2
pm2 start src/server.js --name finance-backend
pm2 save && pm2 startup
```

### Nginx 参考

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    location / { root /opt/finance-system/frontend/build; index index.html; try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://127.0.0.1:3001; proxy_set_header Host $host; }
}
```

### SSL 证书

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

<br>

## 📖 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|---------|
| **1.0.10** | 2026-05-15 | UI 全面重构（暖灰+靛蓝、多层阴影、侧边栏固定）、打印完整订单、仓库管理、报表真实趋势 |
| **1.0.9** | 2026-05-14 | 🤖 AI 智能分析（问答/报告/异常检测/建议，SSE 流式输出，DeepSeek V4） |
| **1.0.8** | 2026-05-08 | 安全加固、架构重构、19 个测试 |
| **1.0.7** | 2026-04-28 | OrderPage 共享组件、auth 中间件、空状态完善 |
| **1.0.0** | 2026-03 | 🎉 首发：CRUD、订单、库存、财务、报表、认证、备份 |

<br>

## 🤝 贡献指南

欢迎提交 Issue 和 PR！提交规范：`feat:` 新功能 · `fix:` 修复 · `docs:` 文档 · `style:` 样式 · `refactor:` 重构 · `perf:` 性能

<br>

## 📄 许可证

MIT License · Copyright (c) 2026 鳌龙

---

<div align="center">
  <p>用 ❤️ 构建 | 由 <a href="https://github.com/Lutra666">Lutra666</a> 开发维护</p>
  <img src="https://visitor-badge.laobi.icu/badge?page_id=Lutra666.new&style=for-the-badge" alt="访客统计">
</div>
