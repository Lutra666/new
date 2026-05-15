<template>
  <view class="detail-page">
    <app-loading-skeleton v-if="loading" :count="2" />

    <template v-else-if="product">
      <view class="detail-header">
        <text class="detail-name">{{ product.name }}</text>
        <up-tag :text="product.category" type="info" size="small" />
      </view>

      <view class="detail-card">
        <view class="price-row">
          <text class="price-label">单价</text>
          <amount-display :value="product.price" size="lg" />
        </view>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">库存</text>
            <text class="info-value">{{ product.stock }}{{ product.unit }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">单位</text>
            <text class="info-value">{{ product.unit || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">分类</text>
            <text class="info-value">{{ product.category || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ formatDate(product.createdAt) }}</text>
          </view>
        </view>
      </view>

      <view class="actions">
        <up-button type="primary" text="编辑" plain @click="showEdit = true" />
        <up-button type="error" text="删除" plain @click="showDel = true" />
      </view>

      <!-- 编辑弹窗 -->
      <up-popup :show="showEdit" mode="bottom" round="16" @close="showEdit = false">
        <view class="popup-wrap">
          <text class="popup-title">编辑商品</text>
          <up-form ref="editFormRef" :model="editForm" :rules="editRules" labelPosition="top">
            <up-form-item label="商品名称" prop="name" required>
              <up-input v-model="editForm.name" border="bottom" />
            </up-form-item>
            <up-form-item label="分类" prop="category">
              <up-input v-model="editForm.category" border="bottom" />
            </up-form-item>
            <up-form-item label="单价" prop="price" required>
              <up-input v-model="editForm.price" type="digit" border="bottom" />
            </up-form-item>
            <up-form-item label="单位" prop="unit">
              <up-input v-model="editForm.unit" border="bottom" />
            </up-form-item>
          </up-form>
          <up-button type="primary" text="保存" :loading="saving" @click="handleSave"
            customStyle="margin-top: 24rpx; border-radius: 50rpx;" />
        </view>
      </up-popup>

      <up-modal
        :show="showDel"
        title="删除确认"
        :content="'确定删除「' + product.name + '」吗？'"
        showCancelButton
        @confirm="handleDelete"
        @cancel="showDel = false"
      />
    </template>

    <app-empty-state
      v-if="!loading && !product"
      text="商品不存在或加载失败"
      showRetry
      @retry="loadProduct"
    />
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchProducts, updateProduct, deleteProduct } from '@/api/products';
import { formatCurrency, formatDate } from '@/utils/index';

const product = ref(null);
const loading = ref(true);
const showEdit = ref(false);
const showDel = ref(false);
const saving = ref(false);
const editForm = reactive({ name: '', category: '', price: '', unit: '' });
const editFormRef = ref(null);
let productId = null;

const editRules = {
  name: { type: 'string', required: true, message: '请输入商品名称', trigger: ['blur'] },
  price: { type: 'string', required: true, message: '请输入单价', trigger: ['blur'] },
};

const loadProduct = async () => {
  loading.value = true;
  try {
    const res = await fetchProducts();
    const list = res.items || res;
    product.value = list.find((p) => String(p.id) === String(productId));
    if (product.value) {
      Object.assign(editForm, {
        name: product.value.name,
        category: product.value.category,
        price: String(product.value.price),
        unit: product.value.unit,
      });
    }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

onLoad(async (options) => {
  productId = options.id;
  await loadProduct();
});

onPullDownRefresh(async () => {
  await loadProduct();
  uni.stopPullDownRefresh();
});

const handleSave = async () => {
  try {
    await editFormRef.value.validate();
  } catch {
    return;
  }

  saving.value = true;
  try {
    const updated = await updateProduct(product.value.id, {
      ...editForm,
      price: Number(editForm.price),
    });
    product.value = updated.item || { ...product.value, ...editForm, price: Number(editForm.price) };
    showEdit.value = false;
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  try {
    await deleteProduct(product.value.id);
    showDel.value = false;
    uni.showToast({ title: '已删除', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch {
    // handled by interceptor
  }
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 24rpx;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.detail-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #18243d;
}

.detail-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f5f6fa;
  margin-bottom: 24rpx;
}

.price-label {
  font-size: 28rpx;
  color: #8b9bb5;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
}

.info-item {
  width: 50%;
  margin-bottom: 20rpx;
}

.info-label {
  display: block;
  font-size: 24rpx;
  color: #8b9bb5;
  margin-bottom: 4rpx;
}

.info-value {
  font-size: 28rpx;
  color: #18243d;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.popup-wrap {
  padding: 32rpx 24rpx;
  padding-bottom: 120rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #18243d;
  margin-bottom: 24rpx;
  display: block;
}
</style>
