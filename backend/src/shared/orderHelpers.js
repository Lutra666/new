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

// mergeDiffMap 用于订单编辑时计算新旧商品数量的差异
// direction = -1 用于销售（旧数量 - 新数量，正值表示需归还库存）
// direction = 1  用于采购（新数量 - 旧数量，正值表示需额外入库）
const mergeDiffMap = (beforeMap, afterMap, direction = 1) => {
  const names = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const diffMap = new Map();
  names.forEach((name) => {
    const diff = direction > 0
      ? (afterMap.get(name) || 0) - (beforeMap.get(name) || 0)
      : (beforeMap.get(name) || 0) - (afterMap.get(name) || 0);
    if (diff !== 0) {
      diffMap.set(name, diff);
    }
  });
  return diffMap;
};

// 销售订单的库存更新：仅更新已有库存记录，不会自动创建
const applySalesInventoryDelta = (store, deltaMap) => {
  const inventory = store.list('inventory');
  deltaMap.forEach((delta, productName) => {
    const record = inventory.find((item) => item.product === productName);
    if (!record) return;
    const nextQty = Math.max(0, toNum(record.quantity) + toNum(delta));
    store.update('inventory', record.id, { quantity: nextQty });
  });
};

// 检查销售出库时库存是否充足
const checkInventorySufficient = (store, deltaMap) => {
  const inventory = store.list('inventory');
  const shortages = [];
  deltaMap.forEach((delta, productName) => {
    if (delta >= 0) return;
    const record = inventory.find((item) => item.product === productName);
    const currentQty = record ? toNum(record.quantity) : 0;
    const needed = Math.abs(delta);
    if (currentQty < needed) {
      shortages.push({ product: productName, available: currentQty, needed });
    }
  });
  return shortages;
};

// 采购订单的库存更新：自动为新产品创建库存记录
const applyPurchaseInventoryDelta = (store, deltaMap) => {
  const inventory = store.list('inventory');
  deltaMap.forEach((delta, productName) => {
    if (delta === 0) return;
    const record = inventory.find((item) => item.product === productName);

    if (!record) {
      if (delta <= 0) return;
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
  });
};

module.exports = {
  toNum,
  normalizeItems,
  calcAmount,
  toQtyMap,
  mergeDiffMap,
  applySalesInventoryDelta,
  applyPurchaseInventoryDelta,
  checkInventorySufficient,
};
