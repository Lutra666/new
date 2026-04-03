const express = require('express');
const store = require('../data/mockStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    ...store.getReportSummary(),
  });
});

module.exports = router;
