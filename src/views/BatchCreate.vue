<template>
  <div class="batch-create">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-page-header @back="$router.back()">
            <template #content>
              <span class="title">批量创建沙箱</span>
            </template>
          </el-page-header>
        </div>
      </template>

      <el-steps :active="currentStep" finish-status="success" align-center class="steps">
        <el-step title="配置" />
        <el-step title="预览" />
        <el-step title="创建" />
      </el-steps>

      <!-- Step 1: Config Input -->
      <div v-show="currentStep === 0" class="step-content">
        <el-tabs v-model="inputMode">
          <el-tab-pane label="JSON导入" name="import">
            <el-upload
              drag
              :auto-upload="false"
              accept=".json,.yaml,.yml"
              :on-change="handleFileUpload"
              :show-file-list="false"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 JSON 或 YAML 格式的配置文件
                </div>
              </template>
            </el-upload>

            <div class="json-editor">
              <div class="editor-header">
                <span>或直接输入JSON配置</span>
                <el-button size="small" @click="addSampleConfig">添加示例</el-button>
              </div>
              <el-input
                v-model="jsonInput"
                type="textarea"
                :rows="10"
                placeholder='[
  {
    "image": { "uri": "python:3.11" },
    "entrypoint": ["tail", "-f", "/dev/null"],
    "resourceLimits": { "cpu": "500m", "memory": "512Mi" },
    "timeout": 3600
  }
]'
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="手动添加" name="manual">
            <div class="manual-add">
              <el-button type="primary" @click="addManualItem">
                <el-icon><Plus /></el-icon>
                添加沙箱
              </el-button>
            </div>

            <el-table :data="manualItems" style="width: 100%">
              <el-table-column type="index" width="50" />
              <el-table-column prop="image" label="镜像" min-width="150">
                <template #default="{ row }">
                  <el-input v-model="row.image" placeholder="python:3.11" />
                </template>
              </el-table-column>
              <el-table-column prop="name" label="名称" width="120">
                <template #default="{ row }">
                  <el-input v-model="row.name" placeholder="可选" />
                </template>
              </el-table-column>
              <el-table-column prop="cpu" label="CPU" width="100">
                <template #default="{ row }">
                  <el-input v-model="row.cpu" placeholder="500m" />
                </template>
              </el-table-column>
              <el-table-column prop="memory" label="内存" width="100">
                <template #default="{ row }">
                  <el-input v-model="row.memory" placeholder="512Mi" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                  <el-button type="danger" link @click="manualItems.splice($index, 1)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- Step 2: Preview -->
      <div v-show="currentStep === 1" class="step-content">
        <el-alert
          v-if="parseError"
          :title="parseError"
          type="error"
          show-icon
          class="parse-error"
        />
        <el-table v-else :data="previewItems" max-height="400">
          <el-table-column type="index" width="50" />
          <el-table-column prop="image" label="镜像" min-width="150" />
          <el-table-column prop="name" label="名称" width="120" />
          <el-table-column label="资源" width="150">
            <template #default="{ row }">
              {{ row.cpu || '默认' }} / {{ row.memory || '默认' }}
            </template>
          </el-table-column>
          <el-table-column prop="timeout" label="超时" width="100">
            <template #default="{ row }">
              {{ row.timeout ? formatDuration(row.timeout) : '默认' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" link @click="previewItems.splice($index, 1)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="preview-summary">
          共 <strong>{{ previewItems.length }}</strong> 个沙箱待创建
        </div>
      </div>

      <!-- Step 3: Creation Progress -->
      <div v-show="currentStep === 2" class="step-content">
        <el-progress
          :percentage="progressPercent"
          :status="progressStatus"
        />

        <div class="creation-results">
          <div
            v-for="(result, index) in creationResults"
            :key="index"
            class="result-item"
            :class="{ success: result.success, failed: !result.success }"
          >
            <el-icon v-if="result.success" class="icon-success"><CircleCheck /></el-icon>
            <el-icon v-else class="icon-failed"><CircleClose /></el-icon>
            <span class="image">{{ result.image }}</span>
            <span v-if="result.success" class="sandbox-id">{{ result.sandboxId }}</span>
            <span v-else class="error-message">{{ result.error }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="step-navigation">
        <el-button
          v-if="currentStep > 0"
          @click="currentStep--"
          :disabled="creating"
        >
          上一步
        </el-button>
        <el-button
          v-if="currentStep < 2"
          type="primary"
          @click="handleNext"
          :disabled="!canProceed"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 2 && !creating"
          type="success"
          @click="handleFinish"
        >
          完成
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UploadFilled, Plus, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useSandboxStore, useNotificationStore } from '@/stores';
import { formatDuration } from '@/utils/format';
import type { CreateSandboxRequest } from '@/api/types';

interface PreviewItem {
  image: string;
  name?: string;
  cpu?: string;
  memory?: string;
  timeout?: number;
  entrypoint?: string;
}

interface CreationResult {
  image: string;
  success: boolean;
  sandboxId?: string;
  error?: string;
}

const router = useRouter();
const sandboxStore = useSandboxStore();
const notification = useNotificationStore();

const currentStep = ref(0);
const inputMode = ref<'import' | 'manual'>('import');
const jsonInput = ref('');
const manualItems = ref<PreviewItem[]>([]);
const previewItems = ref<PreviewItem[]>([]);
const creationResults = ref<CreationResult[]>([]);
const creating = ref(false);
const parseError = ref('');

const progressPercent = computed(() => {
  if (previewItems.value.length === 0) return 0;
  return Math.round((creationResults.value.length / previewItems.value.length) * 100);
});

const progressStatus = computed(() => {
  if (!creating.value && creationResults.value.length === previewItems.value.length) {
    const hasFailed = creationResults.value.some((r) => !r.success);
    return hasFailed ? 'warning' : 'success';
  }
  return '';
});

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    if (inputMode.value === 'import') {
      return jsonInput.value.trim().length > 0;
    } else {
      return manualItems.value.length > 0;
    }
  }
  if (currentStep.value === 1) {
    return previewItems.value.length > 0;
  }
  return true;
});

const handleFileUpload = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    jsonInput.value = e.target?.result as string;
  };
  reader.readAsText(file.raw);
};

const addSampleConfig = () => {
  jsonInput.value = JSON.stringify(
    [
      {
        image: { uri: 'python:3.11' },
        entrypoint: ['tail', '-f', '/dev/null'],
        resourceLimits: { cpu: '500m', memory: '512Mi' },
        timeout: 3600,
        metadata: { name: 'python-sandbox-1' },
      },
      {
        image: { uri: 'nginx:latest' },
        entrypoint: ['nginx', '-g', 'daemon off;'],
        resourceLimits: { cpu: '250m', memory: '256Mi' },
        timeout: 7200,
        metadata: { name: 'nginx-sandbox-1' },
      },
    ],
    null,
    2
  );
};

const addManualItem = () => {
  manualItems.value.push({
    image: '',
    name: '',
    cpu: '500m',
    memory: '512Mi',
    timeout: 3600,
  });
};

const handleNext = async () => {
  if (currentStep.value === 0) {
    // Parse and validate
    parseError.value = '';

    try {
      if (inputMode.value === 'import') {
        const parsed = JSON.parse(jsonInput.value);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        previewItems.value = items.map((item: any) => ({
          image: item.image?.uri || item.image,
          name: item.metadata?.name,
          cpu: item.resourceLimits?.cpu,
          memory: item.resourceLimits?.memory,
          timeout: item.timeout,
          entrypoint: item.entrypoint?.join(' '),
        }));
      } else {
        previewItems.value = [...manualItems.value];
      }
    } catch {
      parseError.value = 'JSON解析失败，请检查格式';
      return;
    }
  }

  if (currentStep.value === 1) {
    // Start creation
    await startCreation();
  }

  currentStep.value++;
};

const startCreation = async () => {
  creating.value = true;
  creationResults.value = [];

  const requests: CreateSandboxRequest[] = previewItems.value.map((item) => ({
    image: { uri: item.image },
    entrypoint: item.entrypoint?.split(' ') || ['tail', '-f', '/dev/null'],
    resourceLimits: {
      cpu: item.cpu || '500m',
      memory: item.memory || '512Mi',
    },
    timeout: item.timeout,
    metadata: item.name ? { name: item.name } : undefined,
  }));

  for (const request of requests) {
    try {
      const response = await sandboxStore.createSandbox(request);
      creationResults.value.push({
        image: request.image.uri,
        success: true,
        sandboxId: response.id,
      });
    } catch (error: any) {
      creationResults.value.push({
        image: request.image.uri,
        success: false,
        error: error.response?.data?.message || error.message || '创建失败',
      });
    }
  }

  creating.value = false;

  const successCount = creationResults.value.filter((r) => r.success).length;
  notification.success(
    '批量创建完成',
    `成功创建 ${successCount}/${previewItems.value.length} 个沙箱`
  );
};

const handleFinish = () => {
  router.push('/sandboxes');
};
</script>

<style scoped lang="scss">
.batch-create {
  .card-header {
    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .steps {
    margin: 20px 0 40px;
  }

  .step-content {
    min-height: 300px;
    padding: 20px 0;
  }

  .json-editor {
    margin-top: 20px;

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      color: #606266;
    }
  }

  .manual-add {
    margin-bottom: 20px;
  }

  .parse-error {
    margin-bottom: 20px;
  }

  .preview-summary {
    margin-top: 16px;
    text-align: center;
    color: #606266;
  }

  .creation-results {
    margin-top: 20px;
    max-height: 400px;
    overflow-y: auto;

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 4px;
      background: #f5f7fa;

      &.success {
        background: #f0f9eb;
      }

      &.failed {
        background: #fef0f0;
      }

      .icon-success {
        color: #67c23a;
        font-size: 18px;
      }

      .icon-failed {
        color: #f56c6c;
        font-size: 18px;
      }

      .image {
        font-weight: 500;
      }

      .sandbox-id {
        font-family: monospace;
        font-size: 12px;
        color: #67c23a;
      }

      .error-message {
        color: #f56c6c;
        font-size: 12px;
      }
    }
  }

  .step-navigation {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 30px;
  }
}
</style>
