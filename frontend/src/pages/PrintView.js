import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin } from 'antd';
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

  return (
    <div className="print-card">
      {state.error ? <Alert showIcon type="error" message={state.error} style={{ marginBottom: 16 }} /> : null}
      <Card bordered={false} className="surface-card">
        <Descriptions title="打印预览" column={1}>
          <Descriptions.Item label="单据类型">{state.data?.type || type}</Descriptions.Item>
          <Descriptions.Item label="单据编号">{state.data?.id || id}</Descriptions.Item>
          <Descriptions.Item label="生成时间">{state.data?.generatedAt || '-'}</Descriptions.Item>
        </Descriptions>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => window.print()}>
            打印
          </Button>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </Space>
      </Card>
    </div>
  );
}

export default PrintView;
