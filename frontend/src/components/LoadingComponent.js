import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function LoadingComponent({ text = '正在加载...' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 48, color: 'var(--brand, #4f46e5)' }} spin />}
        size="large"
      />
      <div style={{ marginTop: 24, fontSize: 16, color: 'var(--text-secondary, #6b6b75)' }}>
        {text}
      </div>
    </div>
  );
}

export default LoadingComponent;
