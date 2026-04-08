<template>
  <div class="settings">
    <el-card shadow="never">
      <template #header>
        <span>设置</span>
      </template>

      <el-form label-width="120px" class="settings-form">
        <el-form-item label="API Key">
          <el-input
            v-model="apiKey"
            type="password"
            placeholder="输入 OpenSandbox API Key"
            show-password
          />
          <div class="form-tip">
            用于访问 OpenSandbox Lifecycle API 的认证密钥
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveApiKey">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <h3>API 端点配置</h3>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="Lifecycle API">
          {{ lifecycleUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="Execd API">
          {{ execdUrl }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3>关于</h3>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="版本">
          1.0.0
        </el-descriptions-item>
        <el-descriptions-item label="项目地址">
          <el-link href="https://github.com/alibaba/OpenSandbox" target="_blank">
            https://github.com/alibaba/OpenSandbox
          </el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getApiKey, setApiKey } from '@/api';

const apiKey = ref('');
const lifecycleUrl = import.meta.env.VITE_LIFECYCLE_API || '/api/lifecycle';
const execdUrl = import.meta.env.VITE_EXECD_API || '/api/execd';

onMounted(() => {
  apiKey.value = getApiKey();
});

const saveApiKey = () => {
  setApiKey(apiKey.value);
  ElMessage.success('设置已保存');
};
</script>

<style scoped lang="scss">
.settings {
  max-width: 600px;

  h3 {
    margin-bottom: 16px;
    color: #303133;
  }

  .settings-form {
    max-width: 400px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  :deep(.el-divider) {
    margin: 24px 0;
  }
}
</style>
