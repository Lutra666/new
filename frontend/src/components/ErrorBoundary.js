import React from 'react';
import { Layout, Result, Button } from 'antd';

const { Content } = Layout;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout style={{ minHeight: '100vh' }}>
          <Content style={{ padding: '50px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Result
              status="500"
              title="500"
              subTitle="抱歉，系统遇到了一些问题，请稍后重试。"
              extra={
                <Button type="primary" onClick={() => window.location.reload()}>
                  重新加载
                </Button>
              }
            />
          </Content>
        </Layout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
