const express = require('express');
const cors = require('cors');
const k8s = require('./api/kubernetes');
const envoyGateway = require('./api/envoy-gateway');
const validation = require('./api/validation');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get Kubernetes status
app.get('/api/kubernetes/status', async (req, res) => {
  try {
    const status = await k8s.checkKubernetesStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error checking Kubernetes status:', error);
    res.status(500).json({ 
      enabled: false, 
      error: error.message 
    });
  }
});

// Get Kubernetes namespaces
app.get('/api/kubernetes/namespaces', async (req, res) => {
  try {
    const namespaces = await k8s.getNamespaces();
    res.status(200).json({ namespaces });
  } catch (error) {
    console.error('Error getting namespaces:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Get Kubernetes services
app.get('/api/kubernetes/services', async (req, res) => {
  try {
    const namespace = req.query.namespace || 'default';
    const services = await k8s.getServices(namespace);
    res.status(200).json({ services });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Check if Envoy Gateway is installed
app.get('/api/envoy-gateway/status', async (req, res) => {
  try {
    const status = await envoyGateway.checkEnvoyGatewayStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error checking Envoy Gateway status:', error);
    res.status(500).json({ 
      installed: false,
      error: error.message 
    });
  }
});

// Install Envoy Gateway
app.post('/api/envoy-gateway/install', async (req, res) => {
  try {
    const result = await envoyGateway.installEnvoyGateway();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error installing Envoy Gateway:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Uninstall Envoy Gateway
app.post('/api/envoy-gateway/uninstall', async (req, res) => {
  try {
    const result = await envoyGateway.uninstallEnvoyGateway();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error uninstalling Envoy Gateway:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get Gateway routes
app.get('/api/envoy-gateway/routes', async (req, res) => {
  try {
    const result = await envoyGateway.getGatewayRoutes();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting Gateway routes:', error);
    res.status(500).json({ 
      routes: [],
      error: error.message 
    });
  }
});

// Get Gateway configuration
app.get('/api/envoy-gateway/configuration', async (req, res) => {
  try {
    const name = req.query.name || 'example-gateway';
    const namespace = req.query.namespace || 'default';
    const result = await envoyGateway.getGatewayConfiguration(name, namespace);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting Gateway configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Apply Gateway configuration
app.post('/api/envoy-gateway/apply', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ 
        success: false, 
        error: 'No configuration provided' 
      });
    }
    
    // Validate the configuration
    const validationResult = validation.validateGatewayConfig(config);
    if (!validationResult.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validationResult.error 
      });
    }
    
    const result = await envoyGateway.applyGatewayConfiguration(config);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error applying Gateway configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete Gateway route
app.delete('/api/envoy-gateway/routes/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const result = await envoyGateway.deleteGatewayRoute(name, namespace);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting Gateway route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get Gateway logs
app.get('/api/envoy-gateway/logs', async (req, res) => {
  try {
    const podName = req.query.pod;
    const namespace = req.query.namespace || 'envoy-gateway-system';
    const tailLines = req.query.tail || 100;
    const result = await envoyGateway.getGatewayLogs(podName, namespace, tailLines);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting Gateway logs:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Restart Gateway
app.post('/api/envoy-gateway/restart', async (req, res) => {
  try {
    const result = await envoyGateway.restartGateway();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error restarting Gateway:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Validate YAML configuration
app.post('/api/validation/yaml', (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ 
        valid: false, 
        error: 'No configuration provided' 
      });
    }
    
    const result = validation.validateGatewayConfig(config);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error validating YAML:', error);
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
