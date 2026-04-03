import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Result, Button, Spin, message, Modal, Form, Input, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import { changePassword, getProfile } from './services/api';
import './App.css';

const { Content } = Layout;

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const SalesOrder = lazy(() => import('./pages/SalesOrder'));
const Customers = lazy(() => import('./pages/Customers'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Purchase = lazy(() => import('./pages/Purchase'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Finance = lazy(() => import('./pages/Finance'));
const Reports = lazy(() => import('./pages/Reports'));
const System = lazy(() => import('./pages/System'));
const Diagnostics = lazy(() => import('./pages/Diagnostics'));
const Data = lazy(() => import('./pages/Data'));
const PrintView = lazy(() => import('./pages/PrintView'));

// 加载组件
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column'
  }}>
    <Spin 
      indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} 
      size="large"
    />
    <div style={{ marginTop: 24, fontSize: 16, color: '#666' }}>
      正在加载财务管理系统...
    </div>
  </div>
);

// 错误边界组件
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
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
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
                <Button 
                  type="primary" 
                  onClick={() => window.location.reload()}
                >
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

// 私有路由组件
function PrivateRoute({ children, user }) {
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// 主应用内容组件
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developerMode, setDeveloperMode] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [forceChangeError, setForceChangeError] = useState('');
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const initSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token) {
          setLoading(false);
          return;
        }

        const profile = await getProfile();
        setUser(profile.user || (savedUser ? JSON.parse(savedUser) : null));
        setRequirePasswordChange(localStorage.getItem('requirePasswordChange') === '1');
        setDeveloperMode(localStorage.getItem('developerMode') === '1');
      } catch (err) {
        console.error('恢复用户状态失败:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('登录状态已失效，请重新登录');
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const handleLogin = (userData, options = {}) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    const needChange = Boolean(options.requirePasswordChange);
    setRequirePasswordChange(needChange);
    if (needChange) {
      localStorage.setItem('requirePasswordChange', '1');
    } else {
      localStorage.removeItem('requirePasswordChange');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('requirePasswordChange');
    setUser(null);
    setRequirePasswordChange(false);
    message.success('已退出登录');
  };

  const handleToggleDeveloperMode = (nextEnabled) => {
    setDeveloperMode(nextEnabled);
    if (nextEnabled) {
      localStorage.setItem('developerMode', '1');
      message.success('已进入开发者模式，可查看高级诊断与审计信息');
    } else {
      localStorage.removeItem('developerMode');
      message.success('已切换回用户模式');
    }
  };

  const handleForceChangePassword = async () => {
    try {
      setForceChangeError('');
      const values = await passwordForm.validateFields();
      setChangingPassword(true);
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      localStorage.removeItem('requirePasswordChange');
      setRequirePasswordChange(false);
      passwordForm.resetFields();
      message.success('密码修改成功，请重新登录');
      handleLogout();
    } catch (err) {
      if (err?.errorFields) {
        return;
      }
      setForceChangeError(err?.response?.data?.error || '修改密码失败，请稍后重试');
    } finally {
      setChangingPassword(false);
    }
  };

  // 如果还在加载中，显示加载界面
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} 
          size="large"
        />
        <div style={{ marginTop: 24, fontSize: 16, color: '#666' }}>
          正在初始化财务管理系统...
        </div>
      </div>
    );
  }

  // 如果有错误，显示错误界面
  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Result
            status="warning"
            title="初始化失败"
            subTitle={error}
            extra={[
              <Button 
                key="retry" 
                type="primary" 
                onClick={() => window.location.reload()}
              >
                重新加载
              </Button>,
              <Button 
                key="login" 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                重新登录
              </Button>
            ]}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        } 
      />
      
      <Route 
        path="/*" 
        element={
          <PrivateRoute user={user}>
            <>
              <MainLayout user={user} onLogout={handleLogout} developerMode={developerMode}>
                <Suspense fallback={<LoadingComponent />}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/sales" element={<SalesOrder />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/purchase" element={<Purchase />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route
                      path="/settings"
                      element={
                        <System
                          developerMode={developerMode}
                          onToggleDeveloperMode={handleToggleDeveloperMode}
                        />
                      }
                    />
                    <Route
                      path="/diagnostics"
                      element={developerMode ? <Diagnostics /> : <Navigate to="/dashboard" replace />}
                    />
                    <Route
                      path="/data"
                      element={<Data developerMode={developerMode} />}
                    />
                    <Route path="/print/:type/:id" element={<PrintView />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </MainLayout>
              <Modal
                open={requirePasswordChange}
                title="首次登录请先修改密码"
                closable={false}
                maskClosable={false}
                keyboard={false}
                okText="确认修改并重新登录"
                cancelButtonProps={{ style: { display: 'none' } }}
                okButtonProps={{ loading: changingPassword }}
                onOk={handleForceChangePassword}
              >
                <p style={{ marginBottom: 12, color: '#5d6992' }}>
                  为保证数据安全，默认密码账户必须先改密后再继续使用系统。
                </p>
                {forceChangeError ? (
                  <Alert
                    type="error"
                    showIcon
                    message={forceChangeError}
                    style={{ marginBottom: 12 }}
                  />
                ) : null}
                <Form form={passwordForm} layout="vertical">
                  <Form.Item
                    label="原密码"
                    name="oldPassword"
                    rules={[{ required: true, message: '请输入原密码' }]}
                  >
                    <Input.Password placeholder="请输入当前密码" />
                  </Form.Item>
                  <Form.Item
                    label="新密码"
                    name="newPassword"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 8, message: '至少 8 位' },
                      {
                        pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                        message: '需包含字母和数字',
                      },
                    ]}
                  >
                    <Input.Password placeholder="请输入新密码" />
                  </Form.Item>
                  <Form.Item
                    label="确认新密码"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '请再次输入新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的新密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="请再次输入新密码" />
                  </Form.Item>
                </Form>
              </Modal>
            </>
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    const onMove = (event) => {
      const x = `${(event.clientX / window.innerWidth) * 100}%`;
      const y = `${(event.clientY / window.innerHeight) * 100}%`;
      document.documentElement.style.setProperty('--mouse-x', x);
      document.documentElement.style.setProperty('--mouse-y', y);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2f7af8',
            colorInfo: '#26a69a',
            borderRadius: 16,
            colorBgLayout: '#eef4fb',
            colorBgContainer: '#ffffff',
            colorText: '#18243d',
          },
          components: {
            Card: {
              borderRadiusLG: 20,
            },
            Table: {
              headerBg: '#f2f6ff',
            },
            Button: {
              controlHeight: 40,
            },
          },
        }}
      >
        <Router>
          <AppContent />
        </Router>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
