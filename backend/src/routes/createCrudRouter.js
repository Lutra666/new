const express = require('express');
const store = require('../data/mockStore');

function createCrudRouter(resourceName, options = {}) {
  const router = express.Router();
  const blockedFields = new Set(['id', 'createdAt', 'updatedAt', 'password', 'password_hash']);

  const sanitizePayload = (payload) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return {};
    }

    const cleaned = {};
    Object.keys(payload).forEach((key) => {
      if (blockedFields.has(key)) {
        return;
      }
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      cleaned[key] = payload[key];
    });
    return cleaned;
  };

  router.get('/', (req, res) => {
    res.json({
      success: true,
      resource: resourceName,
      items: store.list(resourceName),
    });
  });

  router.post('/', (req, res) => {
    const created = store.create(resourceName, sanitizePayload(req.body));
    res.status(201).json({
      success: true,
      message: options.createMessage || '创建成功',
      item: created,
    });
  });

  router.put('/:id', (req, res) => {
    const updated = store.update(resourceName, req.params.id, sanitizePayload(req.body));

    if (!updated) {
      return res.status(404).json({ error: '记录不存在' });
    }

    res.json({
      success: true,
      message: options.updateMessage || '更新成功',
      item: updated,
    });
  });

  router.delete('/:id', (req, res) => {
    const removed = store.remove(resourceName, req.params.id);

    if (!removed) {
      return res.status(404).json({ error: '记录不存在' });
    }

    res.json({
      success: true,
      message: options.deleteMessage || '删除成功',
    });
  });

  return router;
}

module.exports = createCrudRouter;
