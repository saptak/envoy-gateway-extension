/**
 * Type definitions for the API
 */

export interface KubernetesStatus {
  enabled: boolean;
  context?: string;
  error?: string;
}

export interface EnvoyGatewayStatus {
  installed: boolean;
  name?: string;
  namespace?: string;
  replicas?: number;
  availableReplicas?: number;
  version?: string;
  error?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface HttpRule {
  matches: Array<{
    path?: {
      type: string;
      value: string;
    };
    headers?: Array<{
      name: string;
      value: string;
    }>;
  }>;
  backendRefs: Array<{
    name: string;
    port: number;
  }>;
}

export interface HttpRoute {
  name: string;
  namespace: string;
  hostnames?: string[];
  rules: HttpRule[];
}

export interface RoutesResponse {
  routes: HttpRoute[];
  error?: string;
}

export interface ConfigTemplate {
  name: string;
  description: string;
  yaml: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
