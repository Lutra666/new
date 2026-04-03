import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, List, Row, Statistic, Tag } from 'antd';
import PageHeader from '../components/PageHeader';
import { fetchResource } from '../services/api';

function Finance() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchResource('finance');
        setState({ loading: false, error: '', data });
      } catch (error) {
        setState({ loading: false, error: error.response?.data?.error || '财务数据加载失败', data: null });
      }
    };

    load();
  }, []);

  return (
    <>
      <PageHeader title="财务中心" description="收款、付款、应收、应付和账户余额都可以从这里继续扩展。" />
      {state.error ? <Alert type="error" showIcon message={state.error} style={{ marginBottom: 16 }} /> : null}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card loading={state.loading} className="surface-card">
            <Statistic title="应收账款" value={state.data?.receivable || 0} suffix="元" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={state.loading} className="surface-card">
            <Statistic title="应付账款" value={state.data?.payable || 0} suffix="元" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={state.loading} className="surface-card">
            <Statistic title="账户余额" value={state.data?.cashBalance || 0} suffix="元" />
          </Card>
        </Col>
      </Row>
      <Card title="收付流水" loading={state.loading} className="surface-card">
        <List
          dataSource={state.data?.transactions || []}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={`${item.counterparty} · ${item.date}`} />
              <Tag color={item.type === 'received' ? 'green' : 'volcano'}>{item.amount} 元</Tag>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
}

export default Finance;
