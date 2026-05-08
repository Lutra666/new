const express = require('express');
const store = require('../data/mockStore');
const {
  toNum,
  normalizeItems,
  calcAmount,
  toQtyMap,
  mergeDiffMap,
  applySalesInventoryDelta,
  checkInventorySufficient,
} = require('../shared/orderHelpers');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    resource: 'sales',
    items: store.list('sales'),
  });
});

router.post('/', (req, res) => {
  const payload = req.body || {};
  const items = normalizeItems(payload.items);
  const amount = items.length > 0 ? calcAmount(items) : Math.max(0, toNum(payload.amount));

  const deltaMap = new Map();
  items.forEach((item) => {
    deltaMap.set(item.productName, (deltaMap.get(item.productName) || 0) - item.quantity);
  });

  const shortages = checkInventorySufficient(store, deltaMap);
  if (shortages.length > 0) {
    return res.status(400).json({
      error: '库存不足，无法创建销售订单',
      shortages: shortages.map((s) => `${s.product}（需 ${s.needed}，库存 ${s.available}）`),
    });
  }

  const created = store.create('sales', {
    orderNo: payload.orderNo,
    customer: payload.customer,
    status: payload.status || '待收款',
    date: payload.date,
    amount,
    items,
  });

  applySalesInventoryDelta(store, deltaMap);

  res.status(201).json({
    success: true,
    message: '销售订单创建成功',
    item: created,
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const payload = req.body || {};
  const existing = store.list('sales').find((item) => String(item.id) === String(id));
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const nextItems = payload.items ? normalizeItems(payload.items) : normalizeItems(existing.items);
  const nextAmount =
    payload.items || typeof payload.amount === 'undefined'
      ? calcAmount(nextItems)
      : Math.max(0, toNum(payload.amount));

  const oldMap = toQtyMap(existing.items);
  const newMap = toQtyMap(nextItems);
  const diffMap = mergeDiffMap(oldMap, newMap, -1);

  const shortages = checkInventorySufficient(store, diffMap);
  if (shortages.length > 0) {
    return res.status(400).json({
      error: '库存不足，无法更新销售订单',
      shortages: shortages.map((s) => `${s.product}（需 ${s.needed}，库存 ${s.available}）`),
    });
  }

  const updated = store.update('sales', id, {
    ...existing,
    ...payload,
    amount: nextAmount,
    items: nextItems,
  });

  applySalesInventoryDelta(store, diffMap);

  return res.json({
    success: true,
    message: '销售订单更新成功',
    item: updated,
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const existing = store.list('sales').find((item) => String(item.id) === String(id));
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const removed = store.remove('sales', id);
  if (!removed) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const rollbackMap = toQtyMap(existing.items);
  applySalesInventoryDelta(store, rollbackMap);

  return res.json({
    success: true,
    message: '删除成功',
  });
});

module.exports = router;
