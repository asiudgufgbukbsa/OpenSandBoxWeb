import type { SandboxState } from '@/api/types';

export const SANDBOX_STATES: SandboxState[] = [
  'Pending',
  'Running',
  'Pausing',
  'Paused',
  'Stopping',
  'Terminated',
  'Failed',
];

export const STATE_COLORS: Record<SandboxState, string> = {
  Pending: 'warning',
  Running: 'success',
  Pausing: 'warning',
  Paused: 'info',
  Stopping: 'danger',
  Terminated: '',
  Failed: 'danger',
};

export const STATE_LABELS: Record<SandboxState, string> = {
  Pending: '创建中',
  Running: '运行中',
  Pausing: '暂停中',
  Paused: '已暂停',
  Stopping: '停止中',
  Terminated: '已终止',
  Failed: '失败',
};

export const DEFAULT_CPU_LIMITS = ['100m', '250m', '500m', '1000m', '2000m', '4000m'];
export const DEFAULT_MEMORY_LIMITS = ['128Mi', '256Mi', '512Mi', '1Gi', '2Gi', '4Gi', '8Gi'];
export const DEFAULT_TIMEOUTS = [
  { label: '10分钟', value: 600 },
  { label: '30分钟', value: 1800 },
  { label: '1小时', value: 3600 },
  { label: '2小时', value: 7200 },
  { label: '6小时', value: 21600 },
  { label: '12小时', value: 43200 },
  { label: '24小时', value: 86400 },
];

export const API_BASE_URL = import.meta.env.VITE_LIFECYCLE_API || '/api/lifecycle';
export const EXECD_BASE_URL = import.meta.env.VITE_EXECD_API || '/api/execd';

export function getStateColor(state: SandboxState): string {
  return STATE_COLORS[state] || '';
}

export function getStateLabel(state: SandboxState): string {
  return STATE_LABELS[state] || state;
}
