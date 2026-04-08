// ==================== Sandbox Types ====================

export type SandboxState =
  | 'Pending'
  | 'Running'
  | 'Pausing'
  | 'Paused'
  | 'Stopping'
  | 'Terminated'
  | 'Failed';

export interface SandboxStatus {
  state: SandboxState;
  reason?: string;
  message?: string;
  lastTransitionAt?: string;
}

export interface ImageRef {
  uri: string;
  auth?: {
    username: string;
    password: string;
  };
}

export interface ResourceLimits {
  cpu?: string;      // e.g., "500m"
  memory?: string;   // e.g., "512Mi"
  gpu?: string;      // e.g., "1"
}

export interface NetworkPolicyRule {
  action: 'allow' | 'deny';
  target: string;
}

export interface NetworkPolicy {
  defaultAction: 'allow' | 'deny';
  egress?: NetworkPolicyRule[];
}

export interface Volume {
  name: string;
  mountPath: string;
  readOnly?: boolean;
  subPath?: string;
  host?: { path: string };
  pvc?: { claimName: string };
}

export interface Sandbox {
  id: string;
  image: ImageRef;
  status: SandboxStatus;
  metadata?: Record<string, string>;
  entrypoint: string[];
  env?: Record<string, string>;
  resourceLimits?: ResourceLimits;
  networkPolicy?: NetworkPolicy;
  volumes?: Volume[];
  timeout?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==================== API Request/Response Types ====================

export interface CreateSandboxRequest {
  image: ImageRef;
  timeout?: number | null;
  resourceLimits: ResourceLimits;
  entrypoint: string[];
  env?: Record<string, string>;
  metadata?: Record<string, string>;
  networkPolicy?: NetworkPolicy;
  volumes?: Volume[];
  extensions?: Record<string, string>;
}

export interface CreateSandboxResponse {
  id: string;
  status: SandboxStatus;
  metadata?: Record<string, string>;
  expiresAt?: string;
  createdAt: string;
  entrypoint: string[];
}

export interface ListSandboxesParams {
  state?: SandboxState | SandboxState[];
  metadata?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ListSandboxesResponse {
  items: Sandbox[];
  pagination: PaginationInfo;
}

export interface RenewExpirationRequest {
  expiresAt: string;  // ISO 8601 datetime string
}

export interface RenewExpirationResponse {
  expiresAt: string;
}

export interface Endpoint {
  endpoint: string;
  headers?: Record<string, string>;
}

export interface ErrorResponse {
  code: string;
  message: string;
}

// ==================== Metrics Types ====================

export interface Metrics {
  cpu_count: number;
  cpu_used_pct: number;
  mem_total_mib: number;
  mem_used_mib: number;
  timestamp: number;
}

export interface MetricsHistoryPoint {
  timestamp: number;
  cpu: number;
  memory: number;
}

// ==================== UI State Types ====================

export interface FilterState {
  state?: SandboxState;
  search?: string;
  metadata?: Record<string, string>;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ==================== Form Types ====================

export interface BatchCreateItem {
  id: string;
  image: string;
  name?: string;
  timeout?: number;
  cpu?: string;
  memory?: string;
  entrypoint?: string;
  env?: Record<string, string>;
  metadata?: Record<string, string>;
}

export interface BatchCreateResult {
  item: BatchCreateItem;
  success: boolean;
  sandboxId?: string;
  error?: string;
}

// ==================== SSE Event Types ====================

export interface SSEMetricsEvent {
  type: 'metrics' | 'error' | 'connected';
  data?: Metrics;
  error?: string;
}
