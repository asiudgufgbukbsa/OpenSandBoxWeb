<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    @close="handleClose"
  >
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button :type="type" :loading="loading" @click="handleConfirm">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    message: string;
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    confirmText?: string;
    cancelText?: string;
    width?: string | number;
    closeOnClickModal?: boolean;
    loading?: boolean;
  }>(),
  {
    title: '确认操作',
    type: 'primary',
    confirmText: '确认',
    cancelText: '取消',
    width: '400px',
    closeOnClickModal: true,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
  }
);

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  visible.value = false;
  emit('cancel');
};

const handleClose = () => {
  emit('cancel');
};
</script>

<style scoped lang="scss">
.confirm-message {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
