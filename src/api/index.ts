import axios from 'axios';
import type { AxiosError } from 'axios';
import { ElMessage } from 'element-plus';
import type { ErrorResponse } from './types';

// Configuration - Only Lifecycle API is needed
// Execd endpoints are dynamically obtained per sandbox via GET /sandboxes/{id}/endpoints/44772
const LIFECYCLE_BASE_URL = import.meta.env.VITE_LIFECYCLE_API || 'http://localhost:8080/v1';

// API Key storage key
const API_KEY_STORAGE_KEY = 'opensandbox_api_key';

// Get API key from storage
export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

// Set API key to storage
export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

// Clear API key from storage
export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

// Create axios instance for Lifecycle API
export const lifecycleApi = axios.create({
  baseURL: LIFECYCLE_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth header
lifecycleApi.interceptors.request.use(
  (config) => {
    const apiKey = getApiKey();
    if (apiKey && config.headers) {
      config.headers['OPEN-SANDBOX-API-KEY'] = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
const handleApiError = (error: AxiosError<ErrorResponse>) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    const message = data?.message || 'An error occurred';

    switch (status) {
      case 401:
        ElMessage.error('需要认证，请在设置中配置 API Key');
        break;
      case 403:
        ElMessage.error('权限不足');
        break;
      case 404:
        ElMessage.error('资源不存在');
        break;
      case 409:
        ElMessage.error(message || '状态冲突');
        break;
      case 500:
        ElMessage.error('服务器错误，请稍后重试');
        break;
      default:
        ElMessage.error(message);
    }
  } else if (error.request) {
    ElMessage.error('网络错误，请检查连接');
  }

  return Promise.reject(error);
};

lifecycleApi.interceptors.response.use(
  (response) => response,
  handleApiError
);
