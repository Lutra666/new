import React from 'react';
import OrderPage from '../components/OrderPage';

function SalesOrder() {
  return (
    <OrderPage
      resource="sales"
      partnerResource="customers"
      partnerLabel="客户"
      partnerField="customer"
      statusOptions={['已完成', '待收款', '待发货']}
      defaultStatus="待收款"
      orderPrefix="SO"
      title="销售订单"
      description="选择商品与数量自动计算订单金额，实现销售数据联动填充。"
      createBtnText="新增订单"
      searchPlaceholder="按订单号、客户、商品搜索"
      confirmDeleteText="确认删除该销售订单？"
      createSuccessMsg="销售订单创建成功"
      updateSuccessMsg="销售订单更新成功"
    />
  );
}

export default SalesOrder;
