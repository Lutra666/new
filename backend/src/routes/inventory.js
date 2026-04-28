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
  const { productId, product, fromWarehouse, toWarehouse, quantity } = req.body || {};
  const qty = Number(quantity || 0);

  if (!product || !fromWarehouse || !toWarehouse) {
    return res.status(400).json({ error: '商品、源仓库和目标仓库不能为空' });
  }
  if (fromWarehouse === toWarehouse) {
    return res.status(400).json({ error: '源仓库和目标仓库不能相同' });
  }
  if (qty <= 0) {
    return res.status(400).json({ error: '调拨数量必须大于 0' });
  }

  const inventory = store.list('inventory');
  const sourceRecord = inventory.find(
    (item) => item.product === product && item.warehouse === fromWarehouse
  );

  if (!sourceRecord) {
    return res.status(404).json({ error: `源仓库中未找到商品「${product}」` });
  }
  if (Number(sourceRecord.quantity || 0) < qty) {
    return res.status(400).json({ error: `库存不足（当前 ${sourceRecord.quantity}，需调拨 ${qty}）` });
  }

  // 源仓库减量
  store.update('inventory', sourceRecord.id, {
    quantity: Number(sourceRecord.quantity || 0) - qty,
  });

  // 目标仓库增量（不存在则新建）
  const targetRecord = inventory.find(
    (item) => item.product === product && item.warehouse === toWarehouse
  );

  if (targetRecord) {
    store.update('inventory', targetRecord.id, {
      quantity: Number(targetRecord.quantity || 0) + qty,
    });
  } else {
    const seq = store.list('inventory').length + 1;
    store.create('inventory', {
      sku: sourceRecord.sku || `TR-${String(seq).padStart(4, '0')}`,
      product,
      warehouse: toWarehouse,
      quantity: qty,
      warning: sourceRecord.warning || 0,
    });
  }

  res.json({
    success: true,
    message: `已将 ${qty} 件「${product}」从 ${fromWarehouse} 调拨至 ${toWarehouse}`,
  });
});

router.use('/', createCrudRouter('inventory', { createMessage: '库存记录创建成功' }));

module.exports = router;
