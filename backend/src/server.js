const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const jwt = require('jsonwebtoken');
const store = require('./data/mockStore');

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = (process.env.NODE_ENV || 'development') !== 'production';
const frontendBuildPath = path.resolve(__dirname, '../../frontend/build');
const autoBackupEnabled = process.env.AUTO_BACKUP_ENABLED !== 'false';
const autoBackupIntervalMinutes = Math.max(Number(process.env.AUTO_BACKUP_INTERVAL_MINUTES) || 1440, 30);
const jwtIssuer = process.env.JWT_ISSUER || 'finance-system';
const jwtAudience = process.env.JWT_AUDIENCE || 'finance-desktop';
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const bindHost = process.env.BIND_HOST || '127.0.0.1';

app.disable('x-powered-by');

if (!isDev) {
  const weakJwtSecrets = new Set(['', 'change-this-secret-in-production']);
  if (weakJwtSecrets.has(process.env.JWT_SECRET || '')) {
    throw new Error('生产环境必须配置安全的 JWT_SECRET');
  }
}

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || (isDev ? 5000 : 100),
    message: {
      error: '请求过于频繁，请稍后再试',
      code: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 开发环境本机访问不做限流，避免本地联调被误伤
    skip: (req) => {
      const ip = req.ip || '';
      const localIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
      return req.path === '/health' || (isDev && localIps.includes(ip));
    },
  })
);

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 20,
  message: {
    error: '登录尝试过于频繁，请稍后再试',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (isDev) {
        return callback(null, true);
      }
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS origin not allowed'));
    },
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(hpp());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ['HS256'], issuer: jwtIssuer, audience: jwtAudience },
    (error, user) => {
      if (error) {
        return res.status(403).json({ error: '令牌无效或已过期' });
      }

      req.user = user;
      next();
    }
  );
};

app.use((req, res, next) => {
  const shouldAudit = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!shouldAudit) {
    return next();
  }

  const start = Date.now();
  res.on('finish', () => {
    const requestPath = req.originalUrl || req.path;
    if (res.statusCode >= 500 || !requestPath.startsWith('/api')) {
      return;
    }

    const payloadKeys =
      req.body && typeof req.body === 'object'
        ? Object.keys(req.body)
            .filter((key) => !['password', 'oldPassword', 'newPassword', 'token'].includes(key))
            .slice(0, 20)
        : [];

    store.appendAuditLog({
      method: req.method,
      path: requestPath,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      user: {
        username: req.user?.username || 'anonymous',
        role: req.user?.role || 'unknown',
      },
      clientIp: req.ip,
      payloadKeys,
    });
  });

  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'finance-system-backend',
    mode: process.env.USE_REAL_DB === 'true' ? 'database' : 'local',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', authenticateToken, require('./routes/products'));
app.use('/api/customers', authenticateToken, require('./routes/customers'));
app.use('/api/suppliers', authenticateToken, require('./routes/suppliers'));
app.use('/api/sales', authenticateToken, require('./routes/sales'));
app.use('/api/inventory', authenticateToken, require('./routes/inventory'));
app.use('/api/purchases', authenticateToken, require('./routes/purchases'));
app.use('/api/finance', authenticateToken, require('./routes/finance'));
app.use('/api/reports', authenticateToken, require('./routes/reports'));
app.use('/api/system', authenticateToken, require('./routes/system'));
app.use('/api/data', authenticateToken, require('./routes/data'));
app.use('/api/print', authenticateToken, require('./routes/print'));
app.use('/api/accounts', authenticateToken, require('./routes/accounts'));
app.use('/api/warehouses', authenticateToken, require('./routes/warehouses'));

if (fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/uploads')) {
      return next();
    }
    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, bindHost, () => {
    console.log(`财务管理系统后端已启动: http://${bindHost}:${PORT}`);
  });

  if (autoBackupEnabled && process.env.USE_REAL_DB !== 'true') {
    setInterval(() => {
      try {
        const backup = store.createBackup('auto-scheduler');
        console.log(`自动备份完成: ${backup.fileName}`);
      } catch (error) {
        console.error('自动备份失败:', error.message);
      }
    }, autoBackupIntervalMinutes * 60 * 1000);
  }
}

module.exports = app;
