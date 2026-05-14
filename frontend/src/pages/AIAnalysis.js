import React, { useState } from 'react';
import { Tabs, Alert } from 'antd';
import { RobotOutlined, FileTextOutlined, AlertOutlined, BulbOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import AIChat from '../components/AIChat';
import AIReport from '../components/AIReport';
import AIAnomalies from '../components/AIAnomalies';
import AIAdvice from '../components/AIAdvice';

function AIAnalysis() {
  const [activeTab, setActiveTab] = useState('query');

  const tabItems = [
    {
      key: 'query',
      label: (
        <span>
          <RobotOutlined />
          智能问答
        </span>
      ),
      children: <AIChat />,
    },
    {
      key: 'report',
      label: (
        <span>
          <FileTextOutlined />
          智能报告
        </span>
      ),
      children: <AIReport />,
    },
    {
      key: 'anomalies',
      label: (
        <span>
          <AlertOutlined />
          异常检测
        </span>
      ),
      children: <AIAnomalies />,
    },
    {
      key: 'advice',
      label: (
        <span>
          <BulbOutlined />
          经营建议
        </span>
      ),
      children: <AIAdvice />,
    },
  ];

  return (
    <>
      <PageHeader
        title="AI 智能分析"
        description="基于Claude AI的财务数据分析助手，支持自然语言查询、智能报告生成、异常检测和经营建议"
      />
      <Alert
        type="info"
        showIcon
        message="AI分析基于当前系统中的实际业务数据，分析结果仅供参考，请结合实际情况做出经营决策。"
        style={{ marginBottom: 16 }}
      />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        className="surface-card"
        style={{ padding: '0 16px 16px' }}
      />
    </>
  );
}

export default AIAnalysis;
