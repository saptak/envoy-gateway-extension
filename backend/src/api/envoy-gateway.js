/**
 * Envoy Gateway API service
 */
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const k8s = require('./kubernetes');

// Envoy Gateway release version
const ENVOY_GATEWAY_VERSION = 'v0.3.0';
const ENVOY_GATEWAY_INSTALL_URL = `https://github.com/envoyproxy/gateway/releases/download/${ENVOY_GATEWAY_VERSION}/install.yaml`;

/**
 * Check if Envoy Gateway is installed
 */
const checkEnvoyGatewayStatus = async () => {
  try {
    const { stdout } = await execAsync('kubectl get deployment -n envoy-gateway-system envoy-gateway -o json');
    const data = JSON.parse(stdout);
    
    return {
      installed: true,
      name: data.metadata.name,
      namespace: data.metadata.namespace,
      replicas: data.spec.replicas,
      availableReplicas: data.status.availableReplicas || 0,
      version: data.metadata.labels.version || ENVOY_GATEWAY_VERSION
    };
  } catch (error) {
    console.error('Error checking Envoy Gateway status:', error);
    return { installed: false };
  }
};

/**
 * Install Envoy Gateway
 */
const installEnvoyGateway = async () => {
  try {
    const { stdout, stderr } = await execAsync(`kubectl apply -f ${ENVOY_GATEWAY_INSTALL_URL}`);
    return {
      success: true,
      message: 'Envoy Gateway installation initiated',
      details: stdout
    };
  } catch (error) {
    console.error('Error installing Envoy Gateway:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Uninstall Envoy Gateway
 */
const uninstallEnvoyGateway = async () => {
  try {
    const { stdout, stderr } = await execAsync(`kubectl delete -f ${ENVOY_GATEWAY_INSTALL_URL}`);
    return {
      success: true,
      message: 'Envoy Gateway uninstallation initiated',
      details: stdout
    };
  } catch (error) {
    console.error('Error uninstalling Envoy Gateway:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get Gateway routes
 */
const getGatewayRoutes = async () => {
  try {
    const { stdout } = await execAsync('kubectl get httproutes -A -o json');
    const data = JSON.parse(stdout);
    
    const routes = data.items.map(item => ({
      name: item.metadata.name,
      namespace: item.metadata.namespace,
      hostnames: item.spec.hostnames || [],
      rules: item.spec.rules || []
    }));
    
    return { routes };
  } catch (error) {
    console.error('Error getting Gateway routes:', error);
    return { routes: [] };
  }
};

/**
 * Get Gateway configuration
 */
const getGatewayConfiguration = async (name, namespace = 'default') => {
  try {
    const { stdout } = await execAsync(`kubectl get gateway ${name} -n ${namespace} -o yaml`);
    return {
      success: true,
      config: stdout
    };
  } catch (error) {
    console.error(`Error getting Gateway configuration for ${name}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Apply Gateway configuration
 */
const applyGatewayConfiguration = async (config) => {
  return await k8s.applyConfiguration(config);
};

/**
 * Delete Gateway route
 */
const deleteGatewayRoute = async (name, namespace = 'default') => {
  return await k8s.deleteResource('httproute', name, namespace);
};

/**
 * Get Gateway logs
 */
const getGatewayLogs = async (podName = null, namespace = 'envoy-gateway-system', tailLines = 100) => {
  try {
    // If no pod name is provided, get the first Envoy Gateway pod
    if (!podName) {
      const { stdout } = await execAsync(`kubectl get pods -n ${namespace} -l app=envoy-gateway -o jsonpath='{.items[0].metadata.name}'`);
      podName = stdout.trim();
    }
    
    const { stdout } = await execAsync(`kubectl logs ${podName} -n ${namespace} --tail=${tailLines}`);
    return {
      success: true,
      logs: stdout.split('\n')
    };
  } catch (error) {
    console.error('Error getting Gateway logs:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Restart Gateway
 */
const restartGateway = async () => {
  try {
    const { stdout } = await execAsync('kubectl rollout restart deployment -n envoy-gateway-system envoy-gateway');
    return {
      success: true,
      message: 'Envoy Gateway restart initiated',
      details: stdout
    };
  } catch (error) {
    console.error('Error restarting Envoy Gateway:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  checkEnvoyGatewayStatus,
  installEnvoyGateway,
  uninstallEnvoyGateway,
  getGatewayRoutes,
  getGatewayConfiguration,
  applyGatewayConfiguration,
  deleteGatewayRoute,
  getGatewayLogs,
  restartGateway
};
