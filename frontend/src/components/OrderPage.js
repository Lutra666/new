import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Card, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Space, Table, Tag, message,
} from 'antd';
import { DeleteOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import PageHeader from './PageHeader';
import { createResource, deleteResource, fetchResource, updateResource } from '../services/api';

const toDateString = (date = new Date()) => date.toISOString().slice(0, 10);
const calcItemSubtotal = (item) => Number(item?.quantity || 0) * Number(item?.unitPrice || 0);
const calcTotal = (items) =>
  Array.isArray(items) ? items.reduce((sum, item) => sum + calcItemSubtotal(item), 0) : 0;

function OrderPage({
  resource,
  partnerResource,
  partnerLabel,
  partnerField,
  statusOptions,
  defaultStatus,
  orderPrefix,
  title,
  description,
  createBtnText,
  searchPlaceholder,
  confirmDeleteText,
  createSuccessMsg,
  updateSuccessMsg,
}) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const watchedItemsRaw = Form.useWatch('items', form);
  const watchedItems = useMemo(() => (Array.isArray(watchedItemsRaw) ? watchedItemsRaw : []), [watchedItemsRaw]);

  const partnerOptions = useMemo(
    () => (partners || []).map((item) => ({ label: item.name, value: item.name })).filter((item) => item.value),
    [partners]
  );

  const productOptions = useMemo(
    () =>
      (products || [])
        .map((item) => ({ label: item.name, value: item.id }))
        .filter((item) => item.value !== undefined && item.value !== null),
    [products]
  );

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [products]);

  const computedTotal = useMemo(() => calcTotal(watchedItems), [watchedItems]);

  const filteredOrders = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    if (!key) return orders;
    return orders.filter((item) => JSON.stringify(item).toLowerCase().includes(key));
  }, [orders, keyword]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [orderData, productsData, partnersData] = await Promise.all([
        fetchResource(resource),
        fetchResource('products'),
        fetchResource(partnerResource),
      ]);
      setOrders(orderData.items || []);
      setProducts(productsData.items || []);
      setPartners(partnersData.items || []);
    } catch (err) {
      setError(err?.response?.data?.error || `${title}数据加载失败`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      date: toDateString(),
      status: defaultStatus,
      items: [{ productId: undefined, productName: '', quantity: 1, unitPrice: 0 }],
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    const currentItems =
      Array.isArray(record.items) && record.items.length > 0
        ? record.items.map((item) => {
            const matched = products.find((entry) => entry.name === item.productName);
            return {
              productId: matched?.id,
              productName: item.productName,
              quantity: Number(item.quantity || 0),
              unitPrice: Number(item.unitPrice || 0),
            };
          })
        : [{ productId: undefined, productName: '', quantity: 1, unitPrice: 0 }];

    form.setFieldsValue({
      orderNo: record.orderNo,
      [partnerField]: record[partnerField],
      status: record.status,
      date: record.date,
      items: currentItems,
    });
    setModalOpen(true);
  };

  const handleProductChange = (rowIndex, productId) => {
    const rawItems = form.getFieldValue('items') || [];
    const nextItems = rawItems.map((item, index) => {
      if (index !== rowIndex) return item;
      const product = productMap.get(String(productId));
      return { ...item, productId, productName: product?.name || '', unitPrice: Number(product?.price || item.unitPrice || 0) };
    });
    form.setFieldsValue({ items: nextItems });
  };

  const handleDelete = async (id) => {
    try {
      await deleteResource(resource, id);
      message.success('删除成功');
      await loadAll();
    } catch (err) {
      message.error(err?.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const normalizedItems = (values.items || [])
        .map((item) => ({ productName: item.productName, quantity: Number(item.quantity || 0), unitPrice: Number(item.unitPrice || 0) }))
        .filter((item) => item.productName && item.quantity > 0);

      if (normalizedItems.length === 0) {
        message.warning('请至少选择一个商品并填写数量');
        return;
      }

      const payload = {
        orderNo: values.orderNo,
        [partnerField]: values[partnerField],
        status: values.status,
        date: values.date,
        amount: calcTotal(normalizedItems),
        items: normalizedItems,
      };

      setSubmitting(true);
      if (editingRecord?.id) {
        await updateResource(resource, editingRecord.id, payload);
        message.success(updateSuccessMsg);
      } else {
        await createResource(resource, payload);
        message.success(createSuccessMsg);
      }
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.error || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: partnerLabel, dataIndex: partnerField, key: partnerField, width: 160 },
    {
      title: '商品明细', key: 'items',
      render: (_, record) => {
        const items = Array.isArray(record.items) ? record.items : [];
        return items.length === 0 ? '-' : items.map((item) => `${item.productName} x ${item.quantity}`).join('；');
      },
    },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 120, render: (value) => Number(value || 0).toLocaleString() },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (value) => <Tag color="blue">{value}</Tag> },
    { title: '日期', dataIndex: 'date', key: 'date', width: 130 },
    {
      title: '操作', key: 'actions', width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>编辑</Button>
          <Popconfirm title={confirmDeleteText} okText="删除" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={title} description={description} extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>{createBtnText}</Button>
          <Button icon={<ReloadOutlined />} onClick={loadAll} loading={loading}>刷新</Button>
        </Space>
      } />
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
      <Card className="surface-card">
        <div className="table-toolbar">
          <Input.Search allowClear placeholder={searchPlaceholder} value={keyword}
            onChange={(event) => setKeyword(event.target.value)} style={{ maxWidth: 360 }} />
          <Tag color="processing">当前记录 {filteredOrders.length} 条</Tag>
        </div>
        <Table rowKey="id" columns={columns} dataSource={filteredOrders} loading={loading}
          pagination={{ pageSize: 8 }} scroll={{ x: 980 }}
          locale={{ emptyText: `暂无${title}，请点击"${createBtnText}"` }} />
      </Card>

      <Modal title={editingRecord ? `编辑${title}` : `新增${title}`} open={modalOpen}
        onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={submitting} width={860} destroyOnClose>
        <Form form={form} layout="vertical">
          <Space size={12} style={{ width: '100%' }} align="start">
            <Form.Item label="订单号" name="orderNo" style={{ flex: 1 }} rules={[{ required: true, message: '请输入订单号' }]}>
              <Input placeholder={`例如：${orderPrefix}-202604-001`} />
            </Form.Item>
            <Form.Item label={partnerLabel} name={partnerField} style={{ flex: 1 }} rules={[{ required: true, message: `请选择${partnerLabel}` }]}>
              <Select showSearch options={partnerOptions} placeholder={`搜索并选择${partnerLabel}`}
                optionFilterProp="label" notFoundContent={`暂无${partnerLabel}，请先到${partnerLabel}管理新增`} />
            </Form.Item>
          </Space>
          <Space size={12} style={{ width: '100%' }} align="start">
            <Form.Item label="状态" name="status" style={{ flex: 1 }} rules={[{ required: true, message: '请选择状态' }]}>
              <Select options={statusOptions.map((item) => ({ label: item, value: item }))} />
            </Form.Item>
            <Form.Item label="日期" name="date" style={{ flex: 1 }} rules={[{ required: true, message: '请输入日期' }]}>
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </Space>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 10, fontWeight: 600 }}>商品明细</div>
                {fields.map((field, index) => {
                  const row = watchedItems[index] || {};
                  return (
                    <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 10, width: '100%' }}>
                      <Form.Item {...field} label={index === 0 ? '商品' : ''} name={[field.name, 'productId']} style={{ width: 240 }}
                        rules={[{ required: true, message: '请选择商品' }]}>
                        <Select showSearch options={productOptions} placeholder="搜索商品" optionFilterProp="label"
                          onChange={(value) => handleProductChange(index, value)} notFoundContent="暂无商品，请先到商品管理新增" />
                      </Form.Item>
                      <Form.Item name={[field.name, 'productName']} hidden><Input /></Form.Item>
                      <Form.Item {...field} label={index === 0 ? '数量' : ''} name={[field.name, 'quantity']} style={{ width: 110 }}
                        rules={[{ required: true, message: '数量' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item {...field} label={index === 0 ? '单价' : ''} name={[field.name, 'unitPrice']} style={{ width: 130 }}
                        rules={[{ required: true, message: '单价' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label={index === 0 ? '小计' : ''} style={{ width: 120 }}>
                        <Input value={Number(calcItemSubtotal(row) || 0).toLocaleString()} readOnly />
                      </Form.Item>
                      <Button type="text" danger icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)} disabled={fields.length <= 1} />
                    </Space>
                  );
                })}
                <Button type="dashed" icon={<PlusOutlined />}
                  onClick={() => add({ productId: undefined, productName: '', quantity: 1, unitPrice: 0 })}>
                  添加商品行
                </Button>
              </>
            )}
          </Form.List>
          <div style={{ marginTop: 16, textAlign: 'right', fontWeight: 600 }}>
            订单合计：{Number(computedTotal || 0).toLocaleString()}
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default OrderPage;
