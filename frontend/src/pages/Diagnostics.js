import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Descriptions, Row, Statistic, Tag } from 'antd';
import PageHeader from '../components/PageHeader';
import { fetchResource } from '../services/api';

function Diagnostics() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchResource('system/diagnostics');
        setState({ loading: false, error: '', data: response.diagnostics });
      } catch (error) {
        setState({
          loading: false,
          error: error.response?.data?.error || '运行诊断加载失败',
          data: null,
        });
      }
    };

    load();
  }, []);

  const diagnostics = state.data;

  return (
    <>
      <PageHeader title="运行诊断" description="实时查看服务进程、运行模式、内存占用和当前会话信息。" />
      {state.error ? <Alert showIcon type="error" message={state.error} style={{ marginBottom: 16 }} /> : null}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card className="surface-card" loading={state.loading}>
            <Statistic title="服务运行时长" value={diagnostics?.uptimeSeconds || 0} suffix="秒" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card" loading={state.loading}>
            <Statistic title="堆内存使用" value={Math.floor((diagnostics?.memory?.heapUsed || 0) / 1024 / 1024)} suffix="MB" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card" loading={state.loading}>
            <Statistic title="进程编号" value={diagnostics?.processId || 0} />
          </Card>
        </Col>
      </Row>
      <Card className="surface-card" loading={state.loading}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="服务器时间">{diagnostics?.serverTime || '-'}</Descriptions.Item>
          <Descriptions.Item label="Node.js 版本">{diagnostics?.nodeVersion || '-'}</Descriptions.Item>
          <Descriptions.Item label="系统平台">{diagnostics?.platform || '-'}</Descriptions.Item>
          <Descriptions.Item label="架构">{diagnostics?.arch || '-'}</Descriptions.Item>
          <Descriptions.Item label="运行环境">{diagnostics?.runtime?.env || '-'}</Descriptions.Item>
          <Descriptions.Item label="数据模式">
            <Tag color={diagnostics?.runtime?.mode === 'database' ? 'gold' : 'blue'}>
              {diagnostics?.runtime?.mode || '-'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="监听端口">{diagnostics?.runtime?.port || '-'}</Descriptions.Item>
          <Descriptions.Item label="当前用户">
            {diagnostics?.user?.username || '-'} / {diagnostics?.user?.role || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
}

export default Diagnostics;
