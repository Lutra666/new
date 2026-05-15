<template>
  <view class="cp-page">
    <up-form ref="formRef" :model="form" :rules="rules" labelPosition="top">
      <up-form-item label="当前密码" prop="oldPassword">
        <up-input
          v-model="form.oldPassword"
          type="password"
          placeholder="请输入当前密码"
          border="bottom"
        />
      </up-form-item>
      <up-form-item label="新密码" prop="newPassword">
        <up-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
          border="bottom"
        />
      </up-form-item>
      <up-form-item label="确认新密码" prop="confirmPassword">
        <up-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          border="bottom"
        />
      </up-form-item>
    </up-form>

    <view class="btn-wrap">
      <up-button
        type="primary"
        text="确认修改"
        :loading="submitting"
        @click="handleSubmit"
        customStyle="border-radius: 50rpx; height: 88rpx;"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { changePassword } from '@/api/auth';

const formRef = ref(null);
const submitting = ref(false);

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const rules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    uni.showToast({ title: '密码修改成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1500);
  } catch (err) {
    uni.showToast({ title: err.message || '修改失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.cp-page {
  min-height: 100vh;
  background: #fff;
  padding: 40rpx 32rpx;
}

.btn-wrap {
  padding: 48rpx 0;
}
</style>
