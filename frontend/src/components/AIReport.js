import React, { useState } from 'react';
import { Button, Card, Radio, Space, Typography, Alert } from 'antd';
import { FileTextOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Paragraph, Title, Text } = Typography;

const reportTypes = [
  { value: 'trend', label: '趋势分析', desc: '收入、支出、利润、库存变化趋势' },
  { value: 'forecast', label: '预测分析', desc: '基于历史数据的收入与支出预测' },
  { value: 'risk', label: '风险预警', desc: '应收、库存、现金流风险评估' },
  { value: 'comprehensive', label: '综合分析', desc: '完整的经营分析报告（推荐）' },
];

function AIReport() {
  const [reportType, setReportType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setReport(null);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/ai/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportType }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '报告生成失败');
      }
      setReport(data);
    } catch (err) {
      setError(err.message || '报告生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        选择报告类型，AI将基于当前业务数据自动生成分析报告
      </Paragraph>

      <Radio.Group
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        style={{ width: '100%', marginBottom: 20 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {reportTypes.map((rt) => (
            <Card
              key={rt.value}
              size="small"
              hoverable
              style={{
                cursor: 'pointer',
                border: reportType === rt.value ? '2px solid var(--brand, #4f46e5)' : undefined,
                marginBottom: 8,
              }}
              onClick={() => setReportType(rt.value)}
            >
              <Radio value={rt.value}>
                <Text strong>{rt.label}</Text>
              </Radio>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {rt.desc}
              </Text>
            </Card>
          ))}
        </Space>
      </Radio.Group>

      <Button
        type="primary"
        size="large"
        icon={<ThunderboltOutlined />}
        onClick={handleGenerate}
        loading={loading}
        block
      >
        {loading ? 'AI正在生成报告...' : '生成报告'}
      </Button>

      {error ? (
        <Alert type="error" showIcon message={error} style={{ marginTop: 16 }} />
      ) : null}

      {report ? (
        <Card
          className="surface-card"
          style={{ marginTop: 20 }}
          title={
            <Space>
              <FileTextOutlined />
              <span>{reportTypes.find((t) => t.value === report.reportType)?.label || '报告'}</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                生成时间：{new Date(report.generatedAt).toLocaleString('zh-CN')}
              </Text>
            </Space>
          }
        >
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 14 }}>
            {report.report.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <Title key={i} level={3} style={{ marginTop: 16 }}>{line.replace('## ', '')}</Title>;
              }
              if (line.startsWith('### ')) {
                return <Title key={i} level={4} style={{ marginTop: 12 }}>{line.replace('### ', '')}</Title>;
              }
              if (line.startsWith('- ') || line.match(/^\d+\./)) {
                return <Paragraph key={i} style={{ paddingLeft: 16, marginBottom: 4 }}>{line}</Paragraph>;
              }
              if (line.trim() === '') {
                return <div key={i} style={{ height: 8 }} />;
              }
              return <Paragraph key={i} style={{ marginBottom: 4 }}>{line}</Paragraph>;
            })}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default AIReport;
