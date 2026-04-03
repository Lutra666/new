import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Statistic, Table } from 'antd';
import PageHeader from '../components/PageHeader';
import { fetchResource } from '../services/api';

function Reports() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchResource('reports');
        setState({ loading: false, error: '', data });
      } catch (error) {
        setState({ loading: false, error: error.response?.data?.error || '报表数据加载失败', data: null });
      }
    };

    load();
  }, []);

  return (
    <>
      <PageHeader title="报表中心" description="当前是演示报表，后续可对接真实统计 SQL 或 BI 逻辑。" />
      {state.error ? <Alert type="error" showIcon message={state.error} style={{ marginBottom: 16 }} /> : null}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {(state.data?.cards || []).map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.key}>
            <Card loading={state.loading} className="surface-card">
              <Statistic title={card.title} value={card.value} suffix={card.trend} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="重点商品" className="surface-card">
        <Table
          rowKey="id"
          columns={[
            { title: '商品', dataIndex: 'name', key: 'name' },
            { title: '分类', dataIndex: 'category', key: 'category' },
            { title: '价格', dataIndex: 'price', key: 'price' },
            { title: '库存', dataIndex: 'stock', key: 'stock' },
          ]}
          dataSource={state.data?.topProducts || []}
          pagination={false}
          loading={state.loading}
        />
      </Card>
    </>
  );
}

export default Reports;
