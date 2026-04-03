import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, List, Row, Statistic, Tag } from 'antd';
import PageHeader from '../components/PageHeader';
import { fetchResource } from '../services/api';

function Dashboard() {
  const [state, setState] = useState({ loading: true, error: '', reports: null, finance: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [reports, finance] = await Promise.all([fetchResource('reports'), fetchResource('finance')]);
        setState({ loading: false, error: '', reports, finance });
      } catch (error) {
        setState({ loading: false, error: error.response?.data?.error || '加载看板失败', reports: null, finance: null });
      }
    };

    load();
  }, []);

  const cards = state.reports?.cards || [];
  const transactions = state.finance?.transactions || [];

  return (
    <>
      <PageHeader
        title="经营看板"
        description="这里汇总了销售、利润、库存和资金数据，帮助你快速掌握经营状态。"
      />
      {state.error ? <Alert type="error" showIcon message={state.error} style={{ marginBottom: 16 }} /> : null}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {cards.map((card) => (
          <Card key={card.key} loading={state.loading} className="surface-card">
            <Statistic title={card.title} value={card.value} />
            <Tag color="blue" style={{ marginTop: 12 }}>
              {card.trend}
            </Tag>
          </Card>
        ))}
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="近期开票/收付流水" loading={state.loading} className="surface-card">
            <List
              dataSource={transactions}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.title} description={`${item.counterparty} · ${item.date}`} />
                  <Tag color={item.type === 'received' ? 'green' : 'orange'}>{item.amount}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统状态" loading={state.loading} className="surface-card">
            <List
              dataSource={[
                '默认账号 admin / admin123 可直接登录',
                '当前为正式版空数据初始化，请按业务实际录入',
                '已启用本地持久化、备份恢复与操作审计',
              ]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Dashboard;
