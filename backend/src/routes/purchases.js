const express = require('express');
const store = require('../data/mockStore');

const router = express.Router();

const toNum = (value) => Number(value || 0);

const normalizeItems = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => ({
      productName: item?.productName || item?.product || '',
      quantity: Math.max(0, toNum(item?.quantity)),
      unitPrice: Math.max(0, toNum(item?.unitPrice)),
    }))
    .filter((item) => item.productName && item.quantity > 0);

const calcAmount = (items) =>
  normalizeItems(items).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

const toQtyMap = (items) => {
  const map = new Map();
  normalizeItems(items).forEach((item) => {
    map.set(item.productName, (map.get(item.productName) || 0) + item.quantity);
  });
  return map;
};

const mergeDiffMap = (beforeMap, afterMap) => {
  const names = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const diffMap = new Map();
  names.forEach((name) => {
    const diff = (afterMap.get(name) || 0) - (beforeMap.get(name) || 0);
    if (diff !== 0) {
      diffMap.set(name, diff);
    }
  });
  return diffMap;
};

const upsertInventory = (productName, delta) => {
  if (!productName || delta === 0) {
    return;
  }
  const inventory = store.list('inventory');
  const record = inventory.find((item) => item.product === productName);

  if (!record) {
    if (delta <= 0) {
      return;
    }
    const seq = store.list('inventory').length + 1;
    store.create('inventory', {
      sku: `AUTO-${String(seq).padStart(4, '0')}`,
      product: productName,
      warehouse: '主仓',
      quantity: delta,
      warning: 0,
    });
    return;
  }

  const nextQty = Math.max(0, toNum(record.quantity) + toNum(delta));
  store.update('inventory', record.id, { quantity: nextQty });
};

const applyInventoryDelta = (deltaMap) => {
  deltaMap.forEach((delta, productName) => {
    upsertInventory(productName, delta);
  });
};

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
  applyInventoryDelta(deltaMap);

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

  const updated = store.update('purchases', id, {
    ...existing,
    ...payload,
    amount: nextAmount,
    items: nextItems,
  });

  const oldMap = toQtyMap(existing.items);
  const newMap = toQtyMap(nextItems);
  const diffMap = mergeDiffMap(oldMap, newMap);
  applyInventoryDelta(diffMap);

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
  applyInventoryDelta(rollbackMap);

  return res.json({
    success: true,
    message: '删除成功',
  });
});

module.exports = router;
