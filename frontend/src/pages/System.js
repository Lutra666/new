import React, { useEffect, useState } from 'react';
import { Alert, Card, Descriptions, List, Switch, Tag, Typography } from 'antd';
import PageHeader from '../components/PageHeader';
import { fetchResource } from '../services/api';

const { Text } = Typography;

function System({ developerMode = false, onToggleDeveloperMode }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchResource('system');
        setState({ loading: false, error: '', data: data.system });
      } catch (error) {
        setState({ loading: false, error: error.response?.data?.error || '系统信息加载失败', data: null });
      }
    };

    load();
  }, []);

  return (
    <>
      <PageHeader title="系统设置" description="管理系统状态与模式切换，默认展示对业务用户友好的简洁信息。" />
      {state.error ? <Alert type="error" showIcon message={state.error} style={{ marginBottom: 16 }} /> : null}
      <Card loading={state.loading} className="surface-card">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="系统名称">{state.data?.appName}</Descriptions.Item>
          <Descriptions.Item label="版本">{state.data?.version}</Descriptions.Item>
          <Descriptions.Item label="当前界面模式">
            <Tag color={developerMode ? 'gold' : 'blue'}>{developerMode ? '开发者模式' : '用户模式'}</Tag>
          </Descriptions.Item>
          {developerMode ? (
            <Descriptions.Item label="运行模式">
              <Tag color="blue">{state.data?.mode}</Tag>
            </Descriptions.Item>
          ) : null}
        </Descriptions>
        <List
          header={developerMode ? '已启用能力（完整）' : '已启用能力'}
          style={{ marginTop: 20 }}
          dataSource={
            developerMode
              ? state.data?.features || []
              : ['业务数据管理', '订单联动计算', '本地备份与恢复', '账户安全保护']
          }
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
        <div style={{ marginTop: 20, padding: 14, border: '1px solid #d8e3f1', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <Text strong>开发者模式</Text>
              <div>
                <Text type="secondary">
                  开启后显示运行诊断、审计等技术信息；关闭后保持简洁业务界面。
                </Text>
              </div>
            </div>
            <Switch checked={developerMode} onChange={onToggleDeveloperMode} />
          </div>
        </div>
      </Card>
    </>
  );
}

export default System;
