import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Tag, Typography, Space } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const quickQuestions = [
  '上个月销售总额是多少？',
  '哪个客户消费最多？',
  '哪些商品库存不足？',
  '当前的应收账款情况如何？',
  '本月利润大概多少？',
];

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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
      const response = await fetch('/api/ai/query?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ question: q }),
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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 340px)', minHeight: 400 }}>
      <div
        ref={listRef}
        style={{ flex: 1, overflowY: 'auto', marginBottom: 16, padding: '0 8px' }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <RobotOutlined style={{ fontSize: 48, marginBottom: 16, color: '#b0b8c8' }} />
            <Paragraph type="secondary">我是你的AI财务分析助手，可以回答关于经营数据的问题</Paragraph>
            <Space wrap size={[8, 8]} style={{ justifyContent: 'center' }}>
              {quickQuestions.map((q) => (
                <Tag
                  key={q}
                  style={{ cursor: 'pointer', padding: '4px 12px' }}
                  color="blue"
                  onClick={() => setInput(q)}
                >
                  {q}
                </Tag>
              ))}
            </Space>
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
                  background: msg.role === 'user' ? '#2f7af8' : '#f0f2f5',
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
        {loading && messages[messages.length - 1]?.content === '' && (
          <Text type="secondary" style={{ paddingLeft: 16 }}>
            AI正在思考...
          </Text>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你关心的财务问题，按 Enter 发送..."
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
          发送
        </Button>
      </div>
    </div>
  );
}

export default AIChat;
