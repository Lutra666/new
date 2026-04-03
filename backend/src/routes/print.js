const express = require('express');

const router = express.Router();

router.get('/:type/:id', (req, res) => {
  res.json({
    success: true,
    printable: {
      type: req.params.type,
      id: req.params.id,
      generatedAt: new Date().toISOString(),
    },
  });
});

module.exports = router;
