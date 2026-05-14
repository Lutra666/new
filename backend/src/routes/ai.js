const express = require('express');
const aiAnalyzer = require('../services/aiAnalyzer');

const router = express.Router();

function sendSseEvent(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function handleStreamError(res, error) {
  const message = aiAnalyzer.translateApiError(error);
  sendSseEvent(res, { type: 'error', content: message });
  res.end();
}

router.post('/query', async (req, res) => {
  const { question } = req.body || {};
  const acceptSse =
    req.headers.accept === 'text/event-stream' || String(req.query.stream) === 'true';

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, error: '请输入要查询的问题' });
  }

  if (!acceptSse) {
    try {
      const answer = await aiAnalyzer.queryData(question.trim());
      return res.json({ success: true, answer });
    } catch (error) {
      const message = aiAnalyzer.translateApiError(error);
      return res.status(500).json({ success: false, error: message });
    }
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    const stream = await aiAnalyzer.queryData(question.trim(), { stream: true });
    stream.on('text', (delta) => {
      sendSseEvent(res, { type: 'token', content: delta });
    });
    stream.on('end', () => {
      sendSseEvent(res, { type: 'done' });
      res.end();
    });
    stream.on('error', (error) => {
      handleStreamError(res, error);
    });
  } catch (error) {
    handleStreamError(res, error);
  }
});

router.post('/report', async (req, res) => {
  const { reportType = 'comprehensive' } = req.body || {};
  const validTypes = ['trend', 'forecast', 'risk', 'comprehensive'];
  if (!validTypes.includes(reportType)) {
    return res.status(400).json({
      success: false,
      error: `无效的报告类型，可选值: ${validTypes.join(', ')}`,
    });
  }

  try {
    const result = await aiAnalyzer.generateReport(reportType);
    return res.json({ success: true, ...result });
  } catch (error) {
    const message = aiAnalyzer.translateApiError(error);
    return res.status(500).json({ success: false, error: message });
  }
});

router.post('/anomalies', async (req, res) => {
  try {
    const result = await aiAnalyzer.detectAnomalies();
    return res.json({ success: true, ...result });
  } catch (error) {
    const message = aiAnalyzer.translateApiError(error);
    return res.status(500).json({ success: false, error: message });
  }
});

router.post('/advice', async (req, res) => {
  const { question = '', focus = 'general' } = req.body || {};
  const acceptSse =
    req.headers.accept === 'text/event-stream' || String(req.query.stream) === 'true';

  if (!acceptSse) {
    try {
      const answer = await aiAnalyzer.getAdvice(question.trim(), { focus });
      return res.json({ success: true, answer });
    } catch (error) {
      const message = aiAnalyzer.translateApiError(error);
      return res.status(500).json({ success: false, error: message });
    }
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    const stream = await aiAnalyzer.getAdvice(question.trim(), { stream: true, focus });
    stream.on('text', (delta) => {
      sendSseEvent(res, { type: 'token', content: delta });
    });
    stream.on('end', () => {
      sendSseEvent(res, { type: 'done' });
      res.end();
    });
    stream.on('error', (error) => {
      handleStreamError(res, error);
    });
  } catch (error) {
    handleStreamError(res, error);
  }
});

module.exports = router;
