import React from 'react';
import ResourcePage from '../components/ResourcePage';

export default function Inventory() {
  return <ResourcePage resource="inventory" title="库存中心" description="当前可查看库存记录，后端已预留库存调整与调拨接口。" />;
}
