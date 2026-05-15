import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin, Table, Tag } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchResource } from '../services/api';

function PrintView() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchResource(`print/${type}/${id}`);
        setState({ loading: false, error: '', data: data.printable });
      } catch (error) {
        setState({ loading: false, error: error.response?.data?.error || '打印数据获取失败', data: null });
      }
    };

    load();
  }, [id, type]);

  if (state.loading) {
    return <Spin fullscreen tip="正在准备打印数据..." />;
  }

  const d = state.data || {};
  const items = d.items || [];
  const itemColumns = [
    { title: '商品名称', dataIndex: 'productName', key: 'productName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (v) => Number(v || 0).toLocaleString() },
    { title: '小计', key: 'subtotal', width: 120, render: (_, r) => (Number(r.quantity || 0) * Number(r.unitPrice || 0)).toLocaleString() },
  ];

  return (
    <div className="print-card">
      {state.error ? <Alert showIcon type="error" message={state.error} style={{ marginBottom: 16 }} /> : null}
      <Card bordered={false} className="surface-card">
        <Descriptions title="打印预览" column={2} bordered size="small">
          <Descriptions.Item label="单据类型">
            <Tag color="blue">{d.typeLabel || type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="单据编号">{d.orderNo || id}</Descriptions.Item>
          <Descriptions.Item label="往来方">{d.partner}</Descriptions.Item>
          <Descriptions.Item label="单据状态">
            <Tag color={d.status === '已完成' ? 'green' : d.status === '待收款' ? 'orange' : 'default'}>{d.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="日期">{d.date}</Descriptions.Item>
          <Descriptions.Item label="金额">{Number(d.amount || 0).toLocaleString()} 元</Descriptions.Item>
        </Descriptions>

        {items.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Table
              rowKey="productName"
              columns={itemColumns}
              dataSource={items}
              pagination={false}
              bordered
              size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <strong>合计金额</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <strong>{Number(d.amount || 0).toLocaleString()} 元</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        )}

        <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="生成时间">{d.generatedAt ? new Date(d.generatedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
        </Descriptions>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => window.print()}>打印</Button>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </Space>
      </Card>
    </div>
  );
}

export default PrintView;
