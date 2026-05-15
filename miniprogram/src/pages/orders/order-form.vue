<template>
  <view class="form-page">
    <scroll-view scroll-y class="form-scroll">
      <!-- 订单基本信息 -->
      <view class="form-card">
        <text class="card-title">订单信息</text>

        <view class="form-item">
          <text class="form-label">订单号</text>
          <up-input v-model="form.orderNo" placeholder="自动生成" border="bottom" disabled />
        </view>

        <view class="form-item">
          <text class="form-label">{{ type === 'sales' ? '客户' : '供应商' }}</text>
          <lookup-picker
            v-model="form.counterparty"
            :list="partyList"
            labelKey="name"
            valueKey="name"
            :placeholder="type === 'sales' ? '选择客户' : '选择供应商'"
            :title="type === 'sales' ? '选择客户' : '选择供应商'"
          />
        </view>

        <view class="form-item">
          <text class="form-label">日期</text>
          <up-input v-model="form.date" placeholder="YYYY-MM-DD" border="bottom" />
        </view>

        <view class="form-item">
          <text class="form-label">状态</text>
          <view class="status-select">
            <up-tag
              v-for="s in statusOptions"
              :key="s"
              :text="s"
              :type="form.status === s ? 'primary' : 'info'"
              :plain="form.status !== s"
              size="small"
              @click="form.status = s"
              customStyle="margin-right: 12rpx;"
            />
          </view>
        </view>
      </view>

      <!-- 订单明细 -->
      <view class="form-card">
        <order-items-editor
          v-model="form.items"
          :productList="productList"
        />
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bottom-total">
        <text class="total-label">合计</text>
        <text class="total-value">¥{{ formatCurrency(totalAmount) }}</text>
      </view>
      <up-button
        type="primary"
        :text="isEdit ? '保存修改' : '创建订单'"
        :loading="submitting"
        @click="handleSubmit"
        customStyle="border-radius: 50rpx; min-width: 180rpx;"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {
  fetchSales, fetchPurchases,
  createSalesOrder, updateSalesOrder,
  createPurchaseOrder, updatePurchaseOrder,
} from '@/api/orders';
import { fetchProducts } from '@/api/products';
import { fetchCustomers } from '@/api/customers';
import { fetchSuppliers } from '@/api/suppliers';
import { formatCurrency } from '@/utils/index';
import lookupPicker from '@/components/lookup-picker.vue';
import orderItemsEditor from '@/components/order-items-editor.vue';

const type = ref('sales');
const isEdit = ref(false);
const editId = ref(null);
const submitting = ref(false);
const productList = ref([]);
const partyList = ref([]);

const statusOptions = computed(() =>
  type.value === 'sales'
    ? ['待收款', '待发货', '已完成', '待审核']
    : ['待付款', '待审核', '已入库']
);

const form = reactive({
  orderNo: '',
  counterparty: '',
  date: new Date().toISOString().slice(0, 10),
  status: '',
  items: [],
});

const totalAmount = computed(() =>
  form.items.reduce((sum, row) => sum + (+row.quantity || 0) * (+row.unitPrice || 0), 0)
);

const generateOrderNo = (t) => {
  const now = new Date();
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = t === 'sales' ? 'SO' : 'PO';
  const seq = String(Math.floor(Math.random() * 900 + 100));
  return `${prefix}-${d}-${seq}`;
};

onLoad(async (options) => {
  type.value = options.type || 'sales';
  form.status = statusOptions.value[0];

  uni.showLoading({ title: '加载中...', mask: true });
  try {
    const prods = await fetchProducts();
    productList.value = prods.items || prods;

    if (type.value === 'sales') {
      const res = await fetchCustomers();
      partyList.value = res.items || res;
    } else {
      const res = await fetchSuppliers();
      partyList.value = res.items || res;
    }

    if (options.id) {
      isEdit.value = true;
      editId.value = options.id;
      const fetcher = type.value === 'sales' ? fetchSales : fetchPurchases;
      const res = await fetcher();
      const list = res.items || res;
      const existing = list.find((o) => String(o.id) === String(options.id));
      if (existing) {
        form.orderNo = existing.orderNo;
        form.counterparty = existing.customer || existing.supplier;
        form.date = existing.date;
        form.status = existing.status;
        form.items = (existing.items || []).map((i) => ({
          ...i,
          quantity: String(i.quantity),
          unitPrice: String(i.unitPrice),
        }));
      }
    } else {
      form.orderNo = generateOrderNo(type.value);
    }
    uni.hideLoading();
  } catch {
    uni.hideLoading();
    uni.showToast({ title: '加载失败，请返回重试', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
  }
});

const handleSubmit = async () => {
  if (!form.counterparty) {
    uni.showToast({ title: '请选择' + (type.value === 'sales' ? '客户' : '供应商'), icon: 'none' });
    return;
  }
  if (form.items.length === 0) {
    uni.showToast({ title: '请添加订单明细', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    const data = {
      orderNo: form.orderNo,
      [type.value === 'sales' ? 'customer' : 'supplier']: form.counterparty,
      date: form.date,
      status: form.status,
      amount: totalAmount.value,
      items: form.items.map((i) => ({
        productName: i.productName,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };

    if (isEdit.value) {
      const updater = type.value === 'sales' ? updateSalesOrder : updatePurchaseOrder;
      await updater(editId.value, data);
    } else {
      const creator = type.value === 'sales' ? createSalesOrder : createPurchaseOrder;
      await creator(data);
    }

    uni.showToast({ title: isEdit.value ? '保存成功' : '创建成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch (err) {
    if (err.message && err.message.includes('库存不足')) {
      uni.showToast({ title: err.message, icon: 'none', duration: 3000 });
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.form-page {
  min-height: 100vh;
  background: #f5f6fa;
}

.form-scroll {
  height: calc(100vh - 200rpx);
  padding: 24rpx;
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
}

.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #18243d;
  margin-bottom: 16rpx;
  display: block;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 26rpx;
  color: #8b9bb5;
  margin-bottom: 4rpx;
}

.status-select {
  display: flex;
  padding: 12rpx 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.06);
}

.bottom-total {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.total-label {
  font-size: 24rpx;
  color: #8b9bb5;
}

.total-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #e74c3c;
}
</style>
