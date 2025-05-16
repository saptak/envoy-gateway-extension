import React from 'react';
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
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Mock data for routes
const mockRoutes = [
  {
    id: 1,
    name: 'api-route',
    path: '/api/*',
    service: 'api-service',
    port: 8080,
    status: 'Active'
  },
  {
    id: 2,
    name: 'web-route',
    path: '/',
    service: 'web-frontend',
    port: 80,
    status: 'Active'
  },
  {
    id: 3,
    name: 'admin-route',
    path: '/admin/*',
    service: 'admin-service',
    port: 8081,
    status: 'Inactive'
  }
];

function Routes() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Route Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Route
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Port</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRoutes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>{route.name}</TableCell>
                <TableCell>{route.path}</TableCell>
                <TableCell>{route.service}</TableCell>
                <TableCell>{route.port}</TableCell>
                <TableCell>
                  <Chip 
                    label={route.status} 
                    color={route.status === 'Active' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" sx={{ mr: 1 }}>Edit</Button>
                  <Button size="small" color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Note: This is a mockup with sample data. In the full implementation, this would display actual routes from your Envoy Gateway configuration.
      </Typography>
    </Box>
  );
}

export default Routes;
