import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Tag, Typography, Space, Segmented } from 'antd';
import { BulbOutlined, RobotOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Paragraph } = Typography;

const focusOptions = [
  { value: 'general', label: '综合建议' },
  { value: 'purchasing', label: '采购建议' },
  { value: 'pricing', label: '定价策略' },
  { value: 'inventory', label: '库存优化' },
  { value: 'customer', label: '客户分析' },
];

const quickQuestions = {
  general: ['当前经营中有哪些可以改进的地方？'],
  purchasing: ['根据库存和销售情况，最近应该补充哪些商品？'],
  pricing: ['哪些商品的价格需要调整？'],
  inventory: ['哪些商品库存积压严重，应该如何处理？'],
  customer: ['哪些客户值得重点关注和维护？'],
};

function AIAdvice() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [focus, setFocus] = useState('general');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const appendMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content, key: Date.now() }]);
  };

  const updateLastAiMessage = (content) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === 'ai') {
        updated[updated.length - 1] = { ...last, content: last.content + content };
      }
      return updated;
    });
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    appendMessage('user', q);
    setInput('');
    setLoading(true);
    appendMessage('ai', '');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/ai/advice?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ question: q, focus }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'token') {
              updateLastAiMessage(event.content);
            } else if (event.type === 'error') {
              updateLastAiMessage('\n\n' + event.content);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch (error) {
      updateLastAiMessage('\n\n网络连接失败，请确认服务已启动');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 380px)', minHeight: 400 }}>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        选择关注领域，AI将结合当前数据提供针对性的经营建议
      </Paragraph>

      <Segmented
        options={focusOptions}
        value={focus}
        onChange={setFocus}
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 12 }}>
        <Space wrap size={[8, 8]}>
          {(quickQuestions[focus] || quickQuestions.general).map((q) => (
            <Tag
              key={q}
              style={{ cursor: 'pointer', padding: '4px 12px' }}
              color="green"
              onClick={() => setInput(q)}
            >
              {q}
            </Tag>
          ))}
        </Space>
      </div>

      <div
        ref={listRef}
        style={{ flex: 1, overflowY: 'auto', marginBottom: 16, padding: '0 8px' }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BulbOutlined style={{ fontSize: 40, marginBottom: 12, color: '#f4b75c' }} />
            <Paragraph type="secondary">
              选择关注领域后，输入你想了解的经营问题，AI将给出数据驱动的建议
            </Paragraph>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.key}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: msg.role === 'user' ? '#26a69a' : '#f0f2f5',
                  color: msg.role === 'user' ? '#fff' : '#18243d',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ marginBottom: 4, fontSize: 12, opacity: 0.7 }}>
                  {msg.role === 'user' ? (
                    <Space size={4}>
                      <UserOutlined /> 你
                    </Space>
                  ) : (
                    <Space size={4}>
                      <RobotOutlined /> AI助手
                    </Space>
                  )}
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={focus === 'purchasing' ? '例如：最近应该采购什么商品？为什么？' : '描述你的经营问题...'}
          rows={2}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          disabled={!input.trim()}
          style={{ height: 'auto' }}
        >
          提问
        </Button>
      </div>
    </div>
  );
}

export default AIAdvice;
