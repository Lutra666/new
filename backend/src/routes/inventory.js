const express = require('express');
const createCrudRouter = require('./createCrudRouter');
const store = require('../data/mockStore');

const router = express.Router();

router.put('/adjust', (req, res) => {
  const { id, quantity } = req.body || {};
  const updated = store.update('inventory', id, { quantity });

  if (!updated) {
    return res.status(404).json({ error: '库存记录不存在' });
  }

  res.json({ success: true, message: '库存调整成功', item: updated });
});

router.post('/transfer', (req, res) => {
  res.json({
    success: true,
    message: '调拨记录已登记',
    transfer: {
      id: Date.now(),
      ...req.body,
    },
  });
});

router.use('/', createCrudRouter('inventory', { createMessage: '库存记录创建成功' }));

module.exports = router;
