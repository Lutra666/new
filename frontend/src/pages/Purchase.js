import React from 'react';
import OrderPage from '../components/OrderPage';

function Purchase() {
  return (
    <OrderPage
      resource="purchases"
      partnerResource="suppliers"
      partnerLabel="供应商"
      partnerField="supplier"
      statusOptions={['已入库', '待付款', '待审核']}
      defaultStatus="待审核"
      orderPrefix="PO"
      title="采购管理"
      description="按商品与数量联动计算采购金额，并自动联动库存入库。"
      createBtnText="新增采购"
      searchPlaceholder="按订单号、供应商、商品搜索"
      confirmDeleteText="确认删除该采购订单？"
      createSuccessMsg="采购订单创建成功"
      updateSuccessMsg="采购订单更新成功"
    />
  );
}

export default Purchase;
