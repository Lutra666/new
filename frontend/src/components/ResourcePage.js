import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import PageHeader from './PageHeader';
import { createResource, deleteResource, fetchResource, updateResource } from '../services/api';
import { formatFieldLabel, getEditableFieldKeys, getFieldConfig, resourceMeta } from '../config/resourceMeta';

function renderValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (typeof value === 'string' && /已|待|成功|启用/.test(value)) {
    return <Tag color="blue">{value}</Tag>;
  }

  return value;
}

function makeColumns(resource, keys) {
  return keys.map((key) => ({
    title: formatFieldLabel(resource, key),
    dataIndex: key,
    key,
    render: renderValue,
  }));
}

function renderFormControl(fieldConfig, fieldKey, lookupOptionsMap, currentRecord) {
  if (fieldConfig.type === 'number') {
    return <InputNumber style={{ width: '100%' }} min={fieldConfig.min ?? 0} />;
  }

  if (fieldConfig.type === 'lookup') {
    const rawOptions = lookupOptionsMap[fieldKey] || [];
    const currentValue = currentRecord?.[fieldKey];
    const options = [...rawOptions];

    if (currentValue && !options.some((item) => item.value === currentValue)) {
      options.unshift({ label: `${currentValue}（历史值）`, value: currentValue });
    }

    return (
      <Select
        showSearch
        allowClear
        options={options}
        optionFilterProp="label"
        placeholder={`可搜索并选择${fieldConfig.lookup?.label || '已有数据'}`}
        notFoundContent="暂无可用数据，请先在基础资料中新增"
      />
    );
  }

  if (fieldConfig.type === 'select') {
    const options = (fieldConfig.options || []).map((item) => ({ label: item, value: item }));
    return <Select options={options} />;
  }

  return <Input />;
}

function ResourcePage({ resource, title, description, editable = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [lookupOptionsMap, setLookupOptionsMap] = useState({});
  const [form] = Form.useForm();

  const loadResource = async (targetResource) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchResource(targetResource);
      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || '数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadResource(resource);
    };

    run();
  }, [resource]);

  useEffect(() => {
    const loadLookups = async () => {
      const fieldConfigMap = resourceMeta[resource]?.fields || {};
      const lookupEntries = Object.entries(fieldConfigMap).filter(
        ([, config]) => config.type === 'lookup' && config.lookup?.resource
      );

      if (lookupEntries.length === 0) {
        setLookupOptionsMap({});
        return;
      }

      try {
        const pairs = await Promise.all(
          lookupEntries.map(async ([fieldKey, config]) => {
            const targetResource = config.lookup.resource;
            const valueKey = config.lookup.valueKey || 'name';
            const labelKey = config.lookup.labelKey || valueKey;
            const response = await fetchResource(targetResource);
            const sourceItems = Array.isArray(response.items) ? response.items : [];
            const unique = new Map();

            sourceItems.forEach((item) => {
              const value = item?.[valueKey];
              if (value === null || value === undefined || value === '') {
                return;
              }
              if (!unique.has(String(value))) {
                unique.set(String(value), {
                  value,
                  label: String(item?.[labelKey] ?? value),
                });
              }
            });

            return [fieldKey, Array.from(unique.values())];
          })
        );

        setLookupOptionsMap(Object.fromEntries(pairs));
      } catch (err) {
        setLookupOptionsMap({});
      }
    };

    loadLookups();
  }, [resource]);

  const filteredItems = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(keyword.trim().toLowerCase())
  );

  const sample = items[0] || {};
  const fieldKeys = getEditableFieldKeys(resource, sample);
  const displayKeys = items.length > 0 ? Object.keys(items[0]) : fieldKeys;

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteResource(resource, id);
      message.success('删除成功');
      await loadResource(resource);
    } catch (err) {}
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingRecord?.id) {
        await updateResource(resource, editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createResource(resource, values);
        message.success('创建成功');
      }

      setModalOpen(false);
      await loadResource(resource);
    } catch (err) {
      if (err?.errorFields) {
        return;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = makeColumns(resource, displayKeys);

  if (editable) {
    columns.push({
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该记录？" onConfirm={() => handleDelete(record.id)} okText="删除" cancelText="取消">
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        extra={
          <Space>
            {editable ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                新增
              </Button>
            ) : null}
            <Button icon={<ReloadOutlined />} onClick={() => loadResource(resource)}>
              刷新
            </Button>
          </Space>
        }
      />
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} action={<Button size="small" onClick={() => loadResource(resource)}>重试</Button>} /> : null}
      <Card className="surface-card">
        <div className="table-toolbar">
          <Input.Search
            allowClear
            placeholder="输入关键词过滤当前列表"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ maxWidth: 320 }}
          />
          <Space>
            <Tag color="processing">当前记录 {filteredItems.length} 条</Tag>
          </Space>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: `暂无${title}，请点击"新增"添加` }}
          scroll={{ x: true }}
        />
      </Card>
      <Modal
        title={editingRecord ? `编辑${title}` : `新增${title}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {fieldKeys.map((key) => (
            <Form.Item
              key={key}
              name={key}
              label={formatFieldLabel(resource, key)}
              rules={[
                {
                  required: getFieldConfig(resource, key).required !== false,
                  message: `请填写${formatFieldLabel(resource, key)}`,
                },
              ]}
            >
              {renderFormControl(getFieldConfig(resource, key), key, lookupOptionsMap, editingRecord)}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
}

export default ResourcePage;
