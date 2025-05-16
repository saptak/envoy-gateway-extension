import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';

function Monitoring() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gateway Monitoring
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Traffic Overview
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Traffic visualization will be displayed here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Request Statistics
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2">Requests/sec</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">0ms</Typography>
                  <Typography variant="body2">Avg. Latency</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">0%</Typography>
                  <Typography variant="body2">Error Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recent Logs
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="No logs available" 
                    secondary="Logs will appear here when Envoy Gateway is running"
                  />
                </ListItem>
                <Divider />
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Note: This is a mockup of the monitoring dashboard. In the full implementation, this would display real-time metrics and logs from your Envoy Gateway instance.
      </Typography>
    </Box>
  );
}

export default Monitoring;
