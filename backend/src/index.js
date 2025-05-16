const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

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
app.get('/api/kubernetes/status', (req, res) => {
  exec('kubectl config current-context', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        enabled: false, 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      enabled: true, 
      context: stdout.trim() 
    });
  });
});

// Check if Envoy Gateway is installed
app.get('/api/envoy-gateway/status', (req, res) => {
  exec('kubectl get deployment -n envoy-gateway-system envoy-gateway -o json', (error, stdout, stderr) => {
    if (error) {
      return res.status(200).json({ 
        installed: false 
      });
    }
    
    try {
      const data = JSON.parse(stdout);
      const status = {
        installed: true,
        name: data.metadata.name,
        namespace: data.metadata.namespace,
        replicas: data.spec.replicas,
        availableReplicas: data.status.availableReplicas || 0,
        version: data.metadata.labels.version || 'unknown'
      };
      
      return res.status(200).json(status);
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Failed to parse Envoy Gateway status' 
      });
    }
  });
});

// Install Envoy Gateway
app.post('/api/envoy-gateway/install', (req, res) => {
  exec('kubectl apply -f https://github.com/envoyproxy/gateway/releases/download/v0.3.0/install.yaml', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Envoy Gateway installation initiated' 
    });
  });
});

// Uninstall Envoy Gateway
app.post('/api/envoy-gateway/uninstall', (req, res) => {
  exec('kubectl delete -f https://github.com/envoyproxy/gateway/releases/download/v0.3.0/install.yaml', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Envoy Gateway uninstallation initiated' 
    });
  });
});

// Get Gateway routes
app.get('/api/envoy-gateway/routes', (req, res) => {
  exec('kubectl get httproutes -A -o json', (error, stdout, stderr) => {
    if (error) {
      return res.status(200).json({ 
        routes: [] 
      });
    }
    
    try {
      const data = JSON.parse(stdout);
      const routes = data.items.map(item => ({
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        hostnames: item.spec.hostnames || [],
        rules: item.spec.rules || []
      }));
      
      return res.status(200).json({ routes });
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Failed to parse routes' 
      });
    }
  });
});

// Apply configuration
app.post('/api/envoy-gateway/apply', (req, res) => {
  const { config } = req.body;
  
  if (!config) {
    return res.status(400).json({ 
      success: false, 
      error: 'No configuration provided' 
    });
  }
  
  // Create a temporary file with the configuration
  const tempFile = path.join('/tmp', `envoy-config-${Date.now()}.yaml`);
  
  try {
    fs.writeFileSync(tempFile, config);
    
    // Apply the configuration using kubectl
    exec(`kubectl apply -f ${tempFile}`, (error, stdout, stderr) => {
      // Clean up the temporary file
      fs.unlinkSync(tempFile);
      
      if (error) {
        return res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Configuration applied successfully',
        details: stdout
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
