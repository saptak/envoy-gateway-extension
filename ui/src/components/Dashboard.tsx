import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  Paper, 
  Typography 
} from '@mui/material';
import { createDockerDesktopClient } from '@docker/docker-extension-api-client';

// Initialize Docker Desktop client
const client = createDockerDesktopClient();

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState('Not Installed');
  const [kubernetesEnabled, setKubernetesEnabled] = useState(false);

  useEffect(() => {
    // Check if Kubernetes is enabled
    checkKubernetesStatus();
    
    // Check if Envoy Gateway is installed
    checkEnvoyGatewayStatus();
  }, []);

  const checkKubernetesStatus = async () => {
    try {
      const result = await client.docker.cli.exec('info', ['--format', '{{.Kubernetes.Context}}']);
      setKubernetesEnabled(result.stdout.trim() !== '');
    } catch (error) {
      console.error('Error checking Kubernetes status:', error);
      setKubernetesEnabled(false);
    }
    setIsLoading(false);
  };

  const checkEnvoyGatewayStatus = async () => {
    if (!kubernetesEnabled) return;
    
    try {
      const result = await client.docker.cli.exec('kubectl', ['get', 'deployment', '-n', 'envoy-gateway-system', 'envoy-gateway']);
      setIsInstalled(result.stdout.includes('envoy-gateway'));
      setGatewayStatus(result.stdout.includes('envoy-gateway') ? 'Running' : 'Not Installed');
    } catch (error) {
      console.error('Error checking Envoy Gateway status:', error);
      setIsInstalled(false);
      setGatewayStatus('Not Installed');
    }
  };

  const installEnvoyGateway = async () => {
    setIsLoading(true);
    try {
      // Install Envoy Gateway using kubectl
      await client.docker.cli.exec('kubectl', ['apply', '-f', 'https://github.com/envoyproxy/gateway/releases/download/v0.3.0/install.yaml']);
      
      // Wait for the installation to complete
      setTimeout(() => {
        checkEnvoyGatewayStatus();
        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.error('Error installing Envoy Gateway:', error);
      setIsLoading(false);
    }
  };

  const uninstallEnvoyGateway = async () => {
    setIsLoading(true);
    try {
      // Uninstall Envoy Gateway using kubectl
      await client.docker.cli.exec('kubectl', ['delete', '-f', 'https://github.com/envoyproxy/gateway/releases/download/v0.3.0/install.yaml']);
      
      // Wait for the uninstallation to complete
      setTimeout(() => {
        checkEnvoyGatewayStatus();
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Error uninstalling Envoy Gateway:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!kubernetesEnabled) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Kubernetes is not enabled in Docker Desktop
        </Typography>
        <Typography variant="body1">
          Please enable Kubernetes in Docker Desktop settings to use Envoy Gateway.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Envoy Gateway Status
              </Typography>
              <Typography variant="body1" color={gatewayStatus === 'Running' ? 'primary' : 'error'}>
                {gatewayStatus}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {!isInstalled ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={installEnvoyGateway}
                    disabled={isLoading}
                  >
                    Install Envoy Gateway
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={uninstallEnvoyGateway}
                    disabled={isLoading}
                  >
                    Uninstall Envoy Gateway
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mr: 1, mb: 1 }} 
                disabled={!isInstalled}
              >
                View Gateway Logs
              </Button>
              <Button 
                variant="outlined" 
                sx={{ mr: 1, mb: 1 }} 
                disabled={!isInstalled}
              >
                Restart Gateway
              </Button>
              <Button 
                variant="outlined" 
                sx={{ mr: 1, mb: 1 }} 
                disabled={!isInstalled}
              >
                Check Configuration
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gateway Information
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {gatewayStatus}
              </Typography>
              <Typography variant="body2">
                <strong>Version:</strong> {isInstalled ? 'v0.3.0' : 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Namespace:</strong> {isInstalled ? 'envoy-gateway-system' : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
