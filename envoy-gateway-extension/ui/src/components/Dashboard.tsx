import React, { useState } from 'react';
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

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState('Not Installed');
  const [kubernetesEnabled, setKubernetesEnabled] = useState(true);

  const installEnvoyGateway = () => {
    setIsLoading(true);
    // This would call the backend API in the full implementation
    setTimeout(() => {
      setIsInstalled(true);
      setGatewayStatus('Running');
      setIsLoading(false);
    }, 1500);
  };

  const uninstallEnvoyGateway = () => {
    setIsLoading(true);
    // This would call the backend API in the full implementation
    setTimeout(() => {
      setIsInstalled(false);
      setGatewayStatus('Not Installed');
      setIsLoading(false);
    }, 1500);
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
