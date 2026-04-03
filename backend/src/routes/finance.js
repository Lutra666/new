const express = require('express');
const store = require('../data/mockStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    ...store.getFinanceSummary(),
  });
});

router.post('/received', (req, res) => {
  const item = store.addFinanceTransaction('received', req.body || {});
  res.status(201).json({ success: true, message: '收款单创建成功', item });
});

router.post('/paid', (req, res) => {
  const item = store.addFinanceTransaction('paid', req.body || {});
  res.status(201).json({ success: true, message: '付款单创建成功', item });
});

module.exports = router;
