const express = require('express');
const store = require('../data/mockStore');

const router = express.Router();
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '仅管理员可访问该功能' });
  }
  return next();
};

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
