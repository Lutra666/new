const express = require('express');
const store = require('../data/mockStore');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    items: store.getDataTasks(),
  });
});

router.get('/backups', requireAdmin, (req, res) => {
  res.json({
    success: true,
    items: store.listBackups(),
  });
});

router.post('/backup', requireAdmin, (req, res) => {
  const backup = store.createBackup(req.user?.username || 'unknown');
  res.status(201).json({
    success: true,
    message: '备份创建成功',
    backup,
  });
});

router.post('/restore', requireAdmin, (req, res) => {
  const { fileName } = req.body || {};
  const result = store.restoreBackup(fileName);

  if (!result.ok) {
    return res.status(400).json({ error: result.error || '恢复失败' });
  }

  return res.json({
    success: true,
    message: '数据恢复成功，请刷新页面',
  });
});

module.exports = router;
