<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    class="create-form"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="镜像" prop="image">
      <el-input
        v-model="form.image"
        placeholder="例如: python:3.11 或 nginx:latest"
      >
        <template #prepend>
          <el-icon><Picture /></el-icon>
        </template>
      </el-input>
      <div class="form-tip">
        输入 Docker 镜像名称，支持 Docker Hub 或私有镜像仓库
      </div>
    </el-form-item>

    <el-form-item label="名称" prop="name">
      <el-input
        v-model="form.name"
        placeholder="沙箱名称（可选）"
      />
    </el-form-item>

    <el-form-item label="入口命令" prop="entrypoint">
      <el-input
        v-model="form.entrypoint"
        placeholder="例如: python main.py 或 tail -f /dev/null"
      />
      <div class="form-tip">
        沙箱启动后执行的命令
      </div>
    </el-form-item>

    <el-form-item label="CPU限制">
      <el-select v-model="form.cpu" placeholder="选择CPU限制" allow-create filterable>
        <el-option
          v-for="cpu in DEFAULT_CPU_LIMITS"
          :key="cpu"
          :label="cpu"
          :value="cpu"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="内存限制">
      <el-select v-model="form.memory" placeholder="选择内存限制" allow-create filterable>
        <el-option
          v-for="mem in DEFAULT_MEMORY_LIMITS"
          :key="mem"
          :label="mem"
          :value="mem"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="超时时间">
      <el-select v-model="form.timeout" placeholder="选择超时时间">
        <el-option
          v-for="t in DEFAULT_TIMEOUTS"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
      <div class="form-tip">
        超时后沙箱将自动终止
      </div>
    </el-form-item>

    <el-collapse class="advanced-options">
      <el-collapse-item title="高级选项" name="advanced">
        <el-form-item label="环境变量">
          <div class="env-editor">
            <div
              v-for="(env, index) in form.envList"
              :key="index"
              class="env-item"
            >
              <el-input v-model="env.key" placeholder="KEY" class="env-key" />
              <span class="env-equal">=</span>
              <el-input v-model="env.value" placeholder="value" class="env-value" />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="form.envList.splice(index, 1)"
              />
            </div>
            <el-button type="primary" link @click="addEnv">
              <el-icon><Plus /></el-icon>
              添加环境变量
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="网络策略">
          <el-select v-model="form.networkDefaultAction" placeholder="默认策略">
            <el-option label="允许所有" value="allow" />
            <el-option label="拒绝所有" value="deny" />
          </el-select>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>

    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        <el-icon><Check /></el-icon>
        创建沙箱
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { Picture, Delete, Plus, Check, Refresh } from '@element-plus/icons-vue';
import type { CreateSandboxRequest } from '@/api/types';
import { DEFAULT_CPU_LIMITS, DEFAULT_MEMORY_LIMITS, DEFAULT_TIMEOUTS } from '@/utils/constants';
import { validators } from '@/utils/validators';

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', data: CreateSandboxRequest): void;
  (e: 'reset'): void;
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  image: '',
  name: '',
  entrypoint: 'tail -f /dev/null',
  cpu: '500m',
  memory: '512Mi',
  timeout: 3600 as number | undefined,
  envList: [] as { key: string; value: string }[],
  networkDefaultAction: 'allow' as 'allow' | 'deny',
});

const rules: FormRules = {
  image: [
    validators.required('请输入镜像名称'),
    validators.imageUri(),
  ],
  entrypoint: [
    validators.required('请输入入口命令'),
  ],
};

const addEnv = () => {
  form.envList.push({ key: '', value: '' });
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    const request: CreateSandboxRequest = {
      image: { uri: form.image },
      entrypoint: form.entrypoint.split(' '),
      resourceLimits: {
        cpu: form.cpu,
        memory: form.memory,
      },
      timeout: form.timeout,
      metadata: form.name ? { name: form.name } : undefined,
      env: form.envList.reduce((acc, env) => {
        if (env.key && env.value) {
          acc[env.key] = env.value;
        }
        return acc;
      }, {} as Record<string, string>),
      networkPolicy: form.networkDefaultAction !== 'allow' ? {
        defaultAction: form.networkDefaultAction,
      } : undefined,
    };
    emit('submit', request);
  } catch {
    // Validation failed
  }
};

const handleReset = () => {
  formRef.value?.resetFields();
  form.envList = [];
  form.networkDefaultAction = 'allow';
  emit('reset');
};
</script>

<style scoped lang="scss">
.create-form {
  max-width: 600px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.advanced-options {
  margin: 20px 0;
  border: none;

  :deep(.el-collapse-item__header) {
    border-bottom: none;
    color: #409eff;
    font-weight: 500;
  }
}

.env-editor {
  width: 100%;

  .env-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .env-key {
      width: 150px;
    }

    .env-equal {
      color: #909399;
    }

    .env-value {
      flex: 1;
    }
  }
}
</style>
