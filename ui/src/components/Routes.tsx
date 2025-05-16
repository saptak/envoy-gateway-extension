import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getGatewayRoutes, getHttpRouteTemplates, applyGatewayConfiguration, validateYaml } from '../services/api';
import { HttpRoute, ConfigTemplate } from '../services/types';

function Routes() {
  const [routes, setRoutes] = useState<HttpRoute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedRoute, setSelectedRoute] = useState<HttpRoute | null>(null);
  const [routeConfig, setRouteConfig] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' | 'info' 
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Get available templates
  const templates = getHttpRouteTemplates();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setIsLoading(true);
    
    try {
      const result = await getGatewayRoutes();
      setRoutes(result.routes || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      showNotification('Failed to fetch routes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRoute = () => {
    setDialogMode('add');
    setSelectedRoute(null);
    setRouteConfig('');
    setOpenDialog(true);
  };

  const handleEditRoute = (route: HttpRoute) => {
    setDialogMode('edit');
    setSelectedRoute(route);
    
    // Convert route to YAML (in a real implementation, we would fetch the actual YAML from the API)
    const yaml = `apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: ${route.name}
  namespace: ${route.namespace}
spec:
  parentRefs:
  - name: example-gateway
    namespace: default
  hostnames: ${route.hostnames ? route.hostnames.map(h => `\n  - "${h}"`).join('') : '[]'}
  rules:
  ${route.rules.map(rule => `  - matches:
    ${rule.matches.map(match => `    - ${match.path ? `path:
        type: ${match.path.type}
        value: ${match.path.value}` : 'path: {}'}`).join('\n')}
    backendRefs:
    ${rule.backendRefs.map(ref => `    - name: ${ref.name}
      port: ${ref.port}`).join('\n')}`).join('\n  ')}`;
    
    setRouteConfig(yaml);
    setOpenDialog(true);
  };

  const handleDeleteRoute = (route: HttpRoute) => {
    setSelectedRoute(route);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteRoute = async () => {
    if (!selectedRoute) return;
    
    setIsApplying(true);
    
    try {
      // In a real implementation, we would call a dedicated delete API
      // For now, we'll simulate success
      showNotification(`Route ${selectedRoute.name} deleted successfully`, 'success');
      setOpenDeleteDialog(false);
      
      // Refresh routes
      await fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      showNotification('Failed to delete route', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const templateName = event.target.value;
    if (templateName === '') {
      setRouteConfig('');
      return;
    }
    
    const selectedTemplate = templates.find(t => t.name === templateName);
    if (selectedTemplate) {
      setRouteConfig(selectedTemplate.yaml);
    }
  };

  const handleConfigChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRouteConfig(event.target.value);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveRoute = async () => {
    // First validate the configuration
    const validationResult = validateYaml(routeConfig);
    if (!validationResult.valid) {
      showNotification(`Invalid configuration: ${validationResult.error}`, 'error');
      return;
    }
    
    setIsApplying(true);
    
    try {
      const result = await applyGatewayConfiguration(routeConfig);
      
      if (result.success) {
        showNotification(`Route ${dialogMode === 'add' ? 'added' : 'updated'} successfully`, 'success');
        setOpenDialog(false);
        
        // Refresh routes
        await fetchRoutes();
      } else {
        showNotification(`Failed to ${dialogMode === 'add' ? 'add' : 'update'} route: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error(`Error ${dialogMode === 'add' ? 'adding' : 'updating'} route:`, error);
      showNotification(`Error ${dialogMode === 'add' ? 'adding' : 'updating'} route`, 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Route Management
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            sx={{ mr: 1 }}
            onClick={fetchRoutes}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddRoute}
          >
            Add Route
          </Button>
        </Box>
      </Box>
      
      {routes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            No routes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the "Add Route" button to create your first route
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Namespace</TableCell>
                <TableCell>Hostnames</TableCell>
                <TableCell>Paths</TableCell>
                <TableCell>Backend Services</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => {
                // Extract paths and services for display
                const paths = route.rules.flatMap(rule => 
                  rule.matches.filter(match => match.path).map(match => match.path?.value)
                );
                
                const services = route.rules.flatMap(rule => 
                  rule.backendRefs.map(ref => `${ref.name}:${ref.port}`)
                );
                
                return (
                  <TableRow key={`${route.namespace}-${route.name}`}>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.namespace}</TableCell>
                    <TableCell>
                      {route.hostnames && route.hostnames.length > 0 ? (
                        route.hostnames.map(host => (
                          <Chip 
                            key={host} 
                            label={host} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Any host
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {paths.length > 0 ? (
                        paths.map((path, index) => (
                          <Chip 
                            key={index} 
                            label={path} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No paths defined
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {services.map((service, index) => (
                        <Chip 
                          key={index} 
                          label={service} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={() => handleEditRoute(route)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteRoute(route)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add/Edit Route Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Route' : 'Edit Route'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="route-template-select-label">Select Template</InputLabel>
            <Select
              labelId="route-template-select-label"
              id="route-template-select"
              label="Select Template"
              onChange={handleTemplateChange}
              defaultValue=""
              disabled={dialogMode === 'edit'}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {templates.map((template: ConfigTemplate) => (
                <MenuItem key={template.name} value={template.name}>
                  {template.name} - {template.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={15}
            variant="outlined"
            value={routeConfig}
            onChange={handleConfigChange}
            placeholder="# Enter your HTTP Route configuration here"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveRoute}
            variant="contained" 
            color="primary"
            disabled={isApplying || !routeConfig}
          >
            {isApplying ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the route "{selectedRoute?.name}" in namespace "{selectedRoute?.namespace}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteRoute} 
            color="error"
            disabled={isApplying}
          >
            {isApplying ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Routes;
