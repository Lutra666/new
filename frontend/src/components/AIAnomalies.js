import React, { useState } from 'react';
import { Button, Alert, Card, Typography, Space, Statistic, Row, Col, Tag, Empty } from 'antd';
import { AlertOutlined, ScanOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const severityConfig = {
  high: { color: 'red', label: '高危', icon: <AlertOutlined /> },
  medium: { color: 'orange', label: '警告', icon: <AlertOutlined /> },
  low: { color: 'blue', label: '提示', icon: <AlertOutlined /> },
};

function AIAnomalies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleDetect = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/ai/anomalies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '异常检测失败');
      }
      setResult(data);
    } catch (err) {
      setError(err.message || '异常检测失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const highCount = result?.anomalies?.filter((a) => a.severity === 'high').length || 0;
  const mediumCount = result?.anomalies?.filter((a) => a.severity === 'medium').length || 0;
  const lowCount = result?.anomalies?.filter((a) => a.severity === 'low').length || 0;

  return (
    <div>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        AI将扫描销售订单、采购订单、库存数据、应收账款等，自动识别异常情况并分级告警
      </Paragraph>

      <Button
        type="primary"
        size="large"
        icon={<ScanOutlined />}
        onClick={handleDetect}
        loading={loading}
        block
      >
        {loading ? 'AI正在扫描分析...' : '开始检测'}
      </Button>

      {error ? (
        <Alert type="error" showIcon message={error} style={{ marginTop: 16 }} />
      ) : null}

      {result ? (
        <div style={{ marginTop: 20 }}>
          <Card className="surface-card" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="扫描销售订单"
                  value={result.scannedRecords?.sales || 0}
                  suffix="笔"
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="扫描采购订单"
                  value={result.scannedRecords?.purchases || 0}
                  suffix="笔"
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="扫描商品"
                  value={result.scannedRecords?.products || 0}
                  suffix="个"
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="发现异常"
                  value={result.anomalies?.length || 0}
                  suffix="个"
                  valueStyle={{ color: highCount > 0 ? 'var(--accent-rose, #e11d48)' : mediumCount > 0 ? 'var(--accent-orange, #d97706)' : 'var(--brand, #4f46e5)' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 8 }}>
              <Space size={8}>
                {highCount > 0 ? <Tag color="red">高危 {highCount}</Tag> : null}
                {mediumCount > 0 ? <Tag color="orange">警告 {mediumCount}</Tag> : null}
                {lowCount > 0 ? <Tag color="blue">提示 {lowCount}</Tag> : null}
                {result.anomalies?.length === 0 ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>一切正常</Tag>
                ) : null}
              </Space>
            </div>
          </Card>

          {result.anomalies?.length === 0 ? (
            <Empty description="未发现异常，系统运行良好" />
          ) : (
            (result.anomalies || []).map((item, index) => {
              const cfg = severityConfig[item.severity] || severityConfig.low;
              return (
                <Alert
                  key={index}
                  type={item.severity === 'high' ? 'error' : item.severity === 'medium' ? 'warning' : 'info'}
                  showIcon
                  icon={cfg.icon}
                  message={
                    <Space>
                      <Tag color={cfg.color}>{cfg.label}</Tag>
                      <Text strong>{item.title}</Text>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph style={{ marginBottom: 8 }}>{item.description}</Paragraph>
                      {item.suggestion ? (
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                          建议：{item.suggestion}
                        </Paragraph>
                      ) : null}
                    </div>
                  }
                  style={{ marginBottom: 12 }}
                />
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

export default AIAnomalies;
