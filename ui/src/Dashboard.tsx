import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  Paper, 
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  checkKubernetesStatus, 
  checkEnvoyGatewayStatus, 
  installEnvoyGateway, 
  uninstallEnvoyGateway 
} from './services/api';
import { KubernetesStatus, EnvoyGatewayStatus } from './services/types';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [kubernetesStatus, setKubernetesStatus] = useState<KubernetesStatus>({ enabled: false });
  const [gatewayStatus, setGatewayStatus] = useState<EnvoyGatewayStatus>({ installed: false });
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check Kubernetes and Envoy Gateway status when component mounts
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setIsLoading(true);
    
    try {
      // Check if Kubernetes is enabled
      const k8sStatus = await checkKubernetesStatus();
      setKubernetesStatus(k8sStatus);
      
      // If Kubernetes is enabled, check Envoy Gateway status
      if (k8sStatus.enabled) {
        const gwStatus = await checkEnvoyGatewayStatus();
        setGatewayStatus(gwStatus);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      showNotification('Failed to connect to backend service', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const result = await installEnvoyGateway();
      
      if (result.success) {
        showNotification('Envoy Gateway installation initiated', 'success');
        
        // Wait a bit for the installation to progress before checking status
        setTimeout(async () => {
          await fetchStatus();
          setIsInstalling(false);
        }, 5000);
      } else {
        showNotification(`Installation failed: ${result.error}`, 'error');
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('Error installing Envoy Gateway:', error);
      showNotification('Failed to install Envoy Gateway', 'error');
      setIsInstalling(false);
    }
  };

  const handleUninstall = async () => {
    setIsInstalling(true);
    
    try {
      const result = await uninstallEnvoyGateway();
      
      if (result.success) {
        showNotification('Envoy Gateway uninstallation initiated', 'success');
        
        // Wait a bit for the uninstallation to progress before checking status
        setTimeout(async () => {
          await fetchStatus();
          setIsInstalling(false);
        }, 3000);
      } else {
        showNotification(`Uninstallation failed: ${result.error}`, 'error');
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('Error uninstalling Envoy Gateway:', error);
      showNotification('Failed to uninstall Envoy Gateway', 'error');
      setIsInstalling(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleViewLogs = () => {
    // This would be implemented in a future phase
    showNotification('Log viewing functionality will be available in a future update', 'success');
  };

  const handleRestartGateway = () => {
    // This would be implemented in a future phase
    showNotification('Restart functionality will be available in a future update', 'success');
  };

  const handleCheckConfig = () => {
    // This would be implemented in a future phase
    showNotification('Configuration check functionality will be available in a future update', 'success');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!kubernetesStatus.enabled) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Kubernetes is not enabled in Docker Desktop
        </Typography>
        <Typography variant="body1">
          Please enable Kubernetes in Docker Desktop settings to use Envoy Gateway.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={fetchStatus}
        >
          Refresh Status
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Envoy Gateway Status
              </Typography>
              <Typography variant="body1" color={gatewayStatus.installed ? 'primary' : 'error'}>
                {gatewayStatus.installed ? 'Running' : 'Not Installed'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {!gatewayStatus.installed ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleInstall}
                    disabled={isInstalling}
                  >
                    {isInstalling ? 'Installing...' : 'Install Envoy Gateway'}
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleUninstall}
                    disabled={isInstalling}
                  >
                    {isInstalling ? 'Uninstalling...' : 'Uninstall Envoy Gateway'}
                  </Button>
                )}
                <Button 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                  onClick={fetchStatus}
                  disabled={isInstalling}
                >
                  Refresh Status
                </Button>
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
                disabled={!gatewayStatus.installed}
                onClick={handleViewLogs}
              >
                View Gateway Logs
              </Button>
              <Button 
                variant="outlined" 
                sx={{ mr: 1, mb: 1 }} 
                disabled={!gatewayStatus.installed}
                onClick={handleRestartGateway}
              >
                Restart Gateway
              </Button>
              <Button 
                variant="outlined" 
                sx={{ mr: 1, mb: 1 }} 
                disabled={!gatewayStatus.installed}
                onClick={handleCheckConfig}
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
                <strong>Status:</strong> {gatewayStatus.installed ? 'Running' : 'Not Installed'}
              </Typography>
              <Typography variant="body2">
                <strong>Version:</strong> {gatewayStatus.version || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Namespace:</strong> {gatewayStatus.namespace || 'N/A'}
              </Typography>
              {gatewayStatus.installed && (
                <>
                  <Typography variant="body2">
                    <strong>Replicas:</strong> {gatewayStatus.availableReplicas || 0}/{gatewayStatus.replicas || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Kubernetes Context:</strong> {kubernetesStatus.context || 'default'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
