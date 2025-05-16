import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { validateYaml, applyGatewayConfiguration, getGatewayTemplates } from '../services/api';
import { ConfigTemplate } from '../services/types';

function Configuration() {
  const [config, setConfig] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
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
  const templates = getGatewayTemplates();

  const handleConfigChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfig(event.target.value);
  };

  const handleTemplateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const templateName = event.target.value as string;
    if (templateName === '') {
      setConfig('');
      return;
    }
    
    const selectedTemplate = templates.find(t => t.name === templateName);
    if (selectedTemplate) {
      setConfig(selectedTemplate.yaml);
    }
  };

  const handleValidate = () => {
    setIsValidating(true);
    
    try {
      const result = validateYaml(config);
      
      if (result.valid) {
        showNotification('Configuration is valid', 'success');
      } else {
        showNotification(`Validation failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error validating configuration:', error);
      showNotification('Error validating configuration', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleApply = async () => {
    // First validate the configuration
    const validationResult = validateYaml(config);
    if (!validationResult.valid) {
      showNotification(`Invalid configuration: ${validationResult.error}`, 'error');
      return;
    }
    
    setIsApplying(true);
    
    try {
      const result = await applyGatewayConfiguration(config);
      
      if (result.success) {
        showNotification('Configuration applied successfully', 'success');
      } else {
        showNotification(`Failed to apply configuration: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error applying configuration:', error);
      showNotification('Error applying configuration', 'error');
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
      
      <Typography variant="h6" gutterBottom>
        Envoy Gateway Configuration
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="template-select-label">Select Template</InputLabel>
        <Select
          labelId="template-select-label"
          id="template-select"
          label="Select Template"
          onChange={handleTemplateChange}
          defaultValue=""
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
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          YAML Configuration Editor
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={15}
          variant="outlined"
          value={config}
          onChange={handleConfigChange}
          placeholder="# Enter your Envoy Gateway configuration here
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: Gateway
metadata:
  name: example-gateway
  namespace: default
spec:
  gatewayClassName: envoy-gateway
  listeners:
  - name: http
    port: 80
    protocol: HTTP"
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            sx={{ mr: 1 }}
            onClick={handleValidate}
            disabled={isValidating || !config}
          >
            {isValidating ? <CircularProgress size={24} /> : 'Validate'}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleApply}
            disabled={isApplying || !config}
          >
            {isApplying ? <CircularProgress size={24} /> : 'Apply Configuration'}
          </Button>
        </Box>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Use the editor above to create or modify your Envoy Gateway configuration. 
        You can select a template to get started or write your own configuration from scratch.
      </Typography>
    </Box>
  );
}

export default Configuration;
