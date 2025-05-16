import React from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

function Configuration() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Envoy Gateway Configuration
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          YAML Configuration Editor
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={15}
          variant="outlined"
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
          <Button variant="outlined" sx={{ mr: 1 }}>
            Validate
          </Button>
          <Button variant="contained" color="primary">
            Apply Configuration
          </Button>
        </Box>
      </Paper>
      <Typography variant="body2" color="text.secondary">
        Note: This is a basic configuration editor. In the full implementation, this would include syntax highlighting, validation, and template selection.
      </Typography>
    </Box>
  );
}

export default Configuration;
