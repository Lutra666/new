const express = require('express');
const store = require('../data/mockStore');

const router = express.Router();

router.get('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const resourceMap = { sales: 'sales', purchase: 'purchases' };
    const resource = resourceMap[type];

    if (!resource) {
      return res.status(400).json({ error: '不支持的单据类型' });
    }

    const items = store.list(resource);
    const order = items.find((item) => String(item.id) === String(id));

    if (!order) {
      return res.status(404).json({ error: '单据不存在' });
    }

    res.json({
      success: true,
      printable: {
        type,
        typeLabel: type === 'sales' ? '销售单' : '采购单',
        orderNo: order.orderNo,
        id: order.id,
        date: order.date,
        status: order.status,
        amount: order.amount,
        partner: order.customer || order.supplier || '-',
        items: order.items || [],
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('打印数据获取失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
