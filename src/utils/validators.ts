import type { FormItemRule } from 'element-plus';

export const validators = {
  required: (message = '此字段为必填项'): FormItemRule => ({
    required: true,
    message,
    trigger: 'blur',
  }),

  imageUri: (): FormItemRule => ({
    validator: (_rule, value, callback) => {
      if (!value) {
        callback(new Error('镜像URI为必填项'));
        return;
      }
      // Basic image URI validation (docker image format)
      // Format: [registry/][namespace/]name[:tag]
      const imageRegex = /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(:[a-z0-9._-]+)?$/i;
      if (!imageRegex.test(value)) {
        callback(new Error('无效的镜像URI格式'));
        return;
      }
      callback();
    },
    trigger: 'blur',
  }),

  cpuLimit: (): FormItemRule => ({
    validator: (_rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      // CPU format: number or number+m (millicores)
      const cpuRegex = /^\d+m?$/;
      if (!cpuRegex.test(value)) {
        callback(new Error('无效的CPU格式 (例如: 500m 或 1)'));
        return;
      }
      callback();
    },
    trigger: 'blur',
  }),

  memoryLimit: (): FormItemRule => ({
    validator: (_rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      // Memory format: number + Ki, Mi, Gi, Ti
      const memRegex = /^\d+(Ki|Mi|Gi|Ti)?$/;
      if (!memRegex.test(value)) {
        callback(new Error('无效的内存格式 (例如: 512Mi)'));
        return;
      }
      callback();
    },
    trigger: 'blur',
  }),

  positiveNumber: (field: string): FormItemRule => ({
    validator: (_rule, value, callback) => {
      if (value !== undefined && value !== null && value <= 0) {
        callback(new Error(`${field}必须为正数`));
        return;
      }
      callback();
    },
    trigger: 'blur',
  }),

  timeout: (): FormItemRule => ({
    validator: (_rule, value, callback) => {
      if (value !== undefined && value !== null) {
        if (value < 60) {
          callback(new Error('超时时间不能少于60秒'));
          return;
        }
        if (value > 86400) {
          callback(new Error('超时时间不能超过24小时(86400秒)'));
          return;
        }
      }
      callback();
    },
    trigger: 'blur',
  }),
};
