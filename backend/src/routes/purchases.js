const express = require('express');
const store = require('../data/mockStore');
const {
  toNum,
  normalizeItems,
  calcAmount,
  toQtyMap,
  mergeDiffMap,
  applyPurchaseInventoryDelta,
} = require('../shared/orderHelpers');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    resource: 'purchases',
    items: store.list('purchases'),
  });
});

router.post('/', (req, res) => {
  const payload = req.body || {};
  const items = normalizeItems(payload.items);
  const amount = items.length > 0 ? calcAmount(items) : Math.max(0, toNum(payload.amount));

  const created = store.create('purchases', {
    orderNo: payload.orderNo,
    supplier: payload.supplier,
    status: payload.status || '待付款',
    date: payload.date,
    amount,
    items,
  });

  const deltaMap = new Map();
  items.forEach((item) => {
    deltaMap.set(item.productName, (deltaMap.get(item.productName) || 0) + item.quantity);
  });
  applyPurchaseInventoryDelta(store, deltaMap);

  res.status(201).json({
    success: true,
    message: '采购订单创建成功',
    item: created,
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const payload = req.body || {};
  const existing = store.list('purchases').find((item) => String(item.id) === String(id));
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
  const diffMap = mergeDiffMap(oldMap, newMap, 1);

  const updated = store.update('purchases', id, {
    ...existing,
    ...payload,
    amount: nextAmount,
    items: nextItems,
  });

  applyPurchaseInventoryDelta(store, diffMap);

  return res.json({
    success: true,
    message: '采购订单更新成功',
    item: updated,
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const existing = store.list('purchases').find((item) => String(item.id) === String(id));
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const removed = store.remove('purchases', id);
  if (!removed) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const rollbackMap = toQtyMap(existing.items);
  rollbackMap.forEach((qty, productName) => rollbackMap.set(productName, -qty));
  applyPurchaseInventoryDelta(store, rollbackMap);

  return res.json({
    success: true,
    message: '删除成功',
  });
});

module.exports = router;
