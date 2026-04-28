const express = require('express');
const os = require('os');
const store = require('../data/mockStore');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    system: store.getSystemInfo(),
  });
});

router.get('/diagnostics', requireAdmin, (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());

  res.json({
    success: true,
    diagnostics: {
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${os.platform()} ${os.release()}`,
      arch: os.arch(),
      processId: process.pid,
      uptimeSeconds,
      memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
      },
      runtime: {
        env: process.env.NODE_ENV || 'development',
        mode: process.env.USE_REAL_DB === 'true' ? 'database' : 'local',
        port: Number(process.env.PORT || 3001),
      },
      user: {
        username: req.user?.username || 'unknown',
        role: req.user?.role || 'unknown',
      },
    },
  });
});

router.get('/audit-logs', requireAdmin, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 1000);
  res.json({
    success: true,
    items: store.listAuditLogs(limit),
  });
});

module.exports = router;
