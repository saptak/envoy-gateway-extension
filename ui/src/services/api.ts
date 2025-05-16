/**
 * API service for communicating with the backend
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Check if Kubernetes is enabled
 */
export const checkKubernetesStatus = async (): Promise<{ enabled: boolean; context?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kubernetes/status`);
    return await response.json();
  } catch (error) {
    console.error('Error checking Kubernetes status:', error);
    return { enabled: false, error: 'Failed to connect to backend service' };
  }
};

/**
 * Check if Envoy Gateway is installed
 */
export const checkEnvoyGatewayStatus = async (): Promise<{ 
  installed: boolean; 
  name?: string;
  namespace?: string;
  replicas?: number;
  availableReplicas?: number;
  version?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/envoy-gateway/status`);
    return await response.json();
  } catch (error) {
    console.error('Error checking Envoy Gateway status:', error);
    return { installed: false, error: 'Failed to connect to backend service' };
  }
};

/**
 * Install Envoy Gateway
 */
export const installEnvoyGateway = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/envoy-gateway/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error installing Envoy Gateway:', error);
    return { success: false, error: 'Failed to connect to backend service' };
  }
};

/**
 * Uninstall Envoy Gateway
 */
export const uninstallEnvoyGateway = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/envoy-gateway/uninstall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error uninstalling Envoy Gateway:', error);
    return { success: false, error: 'Failed to connect to backend service' };
  }
};

/**
 * Get Gateway routes
 */
export const getGatewayRoutes = async (): Promise<{ 
  routes: Array<{
    name: string;
    namespace: string;
    hostnames?: string[];
    rules: any[];
  }>;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/envoy-gateway/routes`);
    return await response.json();
  } catch (error) {
    console.error('Error getting Gateway routes:', error);
    return { routes: [], error: 'Failed to connect to backend service' };
  }
};

/**
 * Apply Gateway configuration
 */
export const applyGatewayConfiguration = async (config: string): Promise<{ 
  success: boolean; 
  message?: string; 
  details?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/envoy-gateway/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error applying Gateway configuration:', error);
    return { success: false, error: 'Failed to connect to backend service' };
  }
};

/**
 * Validate YAML configuration
 */
export const validateYaml = (yaml: string): { valid: boolean; error?: string } => {
  try {
    // This is a simple validation that just checks if the YAML is valid syntax
    // In a real implementation, we would send this to the backend for validation
    if (!yaml || yaml.trim() === '') {
      return { valid: false, error: 'Configuration cannot be empty' };
    }
    
    // Check for required fields (very basic validation)
    if (!yaml.includes('apiVersion:') || !yaml.includes('kind:') || !yaml.includes('metadata:')) {
      return { valid: false, error: 'Missing required fields (apiVersion, kind, or metadata)' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error validating YAML:', error);
    return { valid: false, error: 'Invalid YAML format' };
  }
};

/**
 * Get Gateway template configurations
 */
export const getGatewayTemplates = (): Array<{ name: string; description: string; yaml: string }> => {
  return [
    {
      name: 'Basic HTTP Gateway',
      description: 'Simple HTTP gateway on port 80',
      yaml: `apiVersion: gateway.networking.k8s.io/v1alpha2
kind: Gateway
metadata:
  name: example-gateway
  namespace: default
spec:
  gatewayClassName: envoy-gateway
  listeners:
  - name: http
    port: 80
    protocol: HTTP`,
    },
    {
      name: 'HTTPS Gateway',
      description: 'HTTPS gateway with TLS termination',
      yaml: `apiVersion: gateway.networking.k8s.io/v1alpha2
kind: Gateway
metadata:
  name: example-https-gateway
  namespace: default
spec:
  gatewayClassName: envoy-gateway
  listeners:
  - name: https
    port: 443
    protocol: HTTPS
    tls:
      mode: Terminate
      certificateRefs:
      - name: example-cert
        namespace: default`,
    },
    {
      name: 'Multi-port Gateway',
      description: 'Gateway with multiple ports (HTTP and HTTPS)',
      yaml: `apiVersion: gateway.networking.k8s.io/v1alpha2
kind: Gateway
metadata:
  name: multi-port-gateway
  namespace: default
spec:
  gatewayClassName: envoy-gateway
  listeners:
  - name: http
    port: 80
    protocol: HTTP
  - name: https
    port: 443
    protocol: HTTPS
    tls:
      mode: Terminate
      certificateRefs:
      - name: example-cert
        namespace: default`,
    },
  ];
};

/**
 * Get HTTP route templates
 */
export const getHttpRouteTemplates = (): Array<{ name: string; description: string; yaml: string }> => {
  return [
    {
      name: 'Basic HTTP Route',
      description: 'Simple HTTP route to a backend service',
      yaml: `apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: example-route
  namespace: default
spec:
  parentRefs:
  - name: example-gateway
    namespace: default
  hostnames:
  - "example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: example-service
      port: 8080`,
    },
    {
      name: 'Path-based Routing',
      description: 'Route different paths to different services',
      yaml: `apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: path-based-route
  namespace: default
spec:
  parentRefs:
  - name: example-gateway
    namespace: default
  hostnames:
  - "example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /api
    backendRefs:
    - name: api-service
      port: 8080
  - matches:
    - path:
        type: PathPrefix
        value: /admin
    backendRefs:
    - name: admin-service
      port: 8081`,
    },
    {
      name: 'Header-based Routing',
      description: 'Route based on HTTP headers',
      yaml: `apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: header-based-route
  namespace: default
spec:
  parentRefs:
  - name: example-gateway
    namespace: default
  hostnames:
  - "example.com"
  rules:
  - matches:
    - headers:
      - name: "version"
        value: "v1"
    backendRefs:
    - name: service-v1
      port: 8080
  - matches:
    - headers:
      - name: "version"
        value: "v2"
    backendRefs:
    - name: service-v2
      port: 8080`,
    },
  ];
};
