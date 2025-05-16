/**
 * Kubernetes API service
 */
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

/**
 * Check if Kubernetes is enabled
 */
const checkKubernetesStatus = async () => {
  try {
    const { stdout } = await execAsync('kubectl config current-context');
    return { 
      enabled: true, 
      context: stdout.trim() 
    };
  } catch (error) {
    console.error('Error checking Kubernetes status:', error);
    return { 
      enabled: false, 
      error: error.message 
    };
  }
};

/**
 * Get Kubernetes namespaces
 */
const getNamespaces = async () => {
  try {
    const { stdout } = await execAsync('kubectl get namespaces -o json');
    const data = JSON.parse(stdout);
    return data.items.map(item => item.metadata.name);
  } catch (error) {
    console.error('Error getting namespaces:', error);
    throw error;
  }
};

/**
 * Get Kubernetes services in a namespace
 */
const getServices = async (namespace = 'default') => {
  try {
    const { stdout } = await execAsync(`kubectl get services -n ${namespace} -o json`);
    const data = JSON.parse(stdout);
    return data.items.map(item => ({
      name: item.metadata.name,
      namespace: item.metadata.namespace,
      clusterIP: item.spec.clusterIP,
      ports: item.spec.ports,
      type: item.spec.type
    }));
  } catch (error) {
    console.error(`Error getting services in namespace ${namespace}:`, error);
    throw error;
  }
};

/**
 * Apply Kubernetes YAML configuration
 */
const applyConfiguration = async (yamlConfig) => {
  try {
    // Create a temporary file with the configuration
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join('/tmp', `k8s-config-${Date.now()}.yaml`);
    
    fs.writeFileSync(tempFile, yamlConfig);
    
    // Apply the configuration
    const { stdout, stderr } = await execAsync(`kubectl apply -f ${tempFile}`);
    
    // Clean up the temporary file
    fs.unlinkSync(tempFile);
    
    return {
      success: true,
      message: 'Configuration applied successfully',
      details: stdout
    };
  } catch (error) {
    console.error('Error applying configuration:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete Kubernetes resource
 */
const deleteResource = async (kind, name, namespace = 'default') => {
  try {
    const { stdout, stderr } = await execAsync(`kubectl delete ${kind} ${name} -n ${namespace}`);
    return {
      success: true,
      message: `${kind} ${name} deleted successfully`,
      details: stdout
    };
  } catch (error) {
    console.error(`Error deleting ${kind} ${name}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  checkKubernetesStatus,
  getNamespaces,
  getServices,
  applyConfiguration,
  deleteResource
};
