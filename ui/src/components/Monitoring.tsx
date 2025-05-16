import React, { useState, useEffect } from 'react';
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
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Mock data for metrics
const mockMetrics = {
  requestsPerSecond: 42,
  averageLatency: 125,
  errorRate: 2.5,
  totalRequests: 12345,
  statusCodes: {
    '200': 10982,
    '404': 321,
    '500': 42
  }
};

// Mock data for logs
const mockLogs = [
  {
    timestamp: '2025-05-16T14:32:15.123Z',
    level: 'INFO',
    message: 'Request processed successfully: GET /api/products'
  },
  {
    timestamp: '2025-05-16T14:32:14.987Z',
    level: 'INFO',
    message: 'Request processed successfully: GET /api/categories'
  },
  {
    timestamp: '2025-05-16T14:32:10.543Z',
    level: 'WARN',
    message: 'Slow response detected: GET /api/products/details took 1.2s'
  },
  {
    timestamp: '2025-05-16T14:32:05.321Z',
    level: 'ERROR',
    message: 'Failed to process request: POST /api/orders - Service unavailable'
  },
  {
    timestamp: '2025-05-16T14:31:58.765Z',
    level: 'INFO',
    message: 'Request processed successfully: GET /api/user/profile'
  }
];

function Monitoring() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState(mockMetrics);
  const [logs, setLogs] = useState(mockLogs);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [logLevel, setLogLevel] = useState<string>('all');

  useEffect(() => {
    // In a real implementation, we would fetch metrics and logs based on the selected time range
    fetchMetricsAndLogs();
  }, [timeRange]);

  const fetchMetricsAndLogs = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real implementation, we would fetch actual metrics and logs
      setMetrics(mockMetrics);
      
      // Filter logs based on selected level
      if (logLevel === 'all') {
        setLogs(mockLogs);
      } else {
        setLogs(mockLogs.filter(log => log.level === logLevel.toUpperCase()));
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleLogLevelChange = (event: SelectChangeEvent) => {
    setLogLevel(event.target.value);
    
    // Filter logs based on selected level
    if (event.target.value === 'all') {
      setLogs(mockLogs);
    } else {
      setLogs(mockLogs.filter(log => log.level === (event.target.value).toUpperCase()));
    }
  };

  const handleRefresh = () => {
    fetchMetricsAndLogs();
  };

  const getLogItemColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'error.main';
      case 'WARN':
        return 'warning.main';
      case 'INFO':
        return 'info.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Gateway Monitoring
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="time-range-select-label">Time Range</InputLabel>
            <Select
              labelId="time-range-select-label"
              id="time-range-select"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="15m">Last 15 minutes</MenuItem>
              <MenuItem value="1h">Last hour</MenuItem>
              <MenuItem value="6h">Last 6 hours</MenuItem>
              <MenuItem value="24h">Last 24 hours</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Traffic Overview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">{metrics.requestsPerSecond}</Typography>
                    <Typography variant="body2">Requests/sec</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">{metrics.averageLatency}ms</Typography>
                    <Typography variant="body2">Avg. Latency</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">{metrics.errorRate}%</Typography>
                    <Typography variant="body2">Error Rate</Typography>
                  </Box>
                </Box>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Alert severity="info" sx={{ width: '100%' }}>
                    Traffic visualization will be available in a future update
                  </Alert>
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
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    <strong>Total Requests:</strong> {metrics.totalRequests}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Status Codes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1, bgcolor: 'success.light', color: 'white', textAlign: 'center' }}>
                      <Typography variant="h6">{metrics.statusCodes['200']}</Typography>
                      <Typography variant="body2">200 OK</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1, bgcolor: 'warning.light', color: 'white', textAlign: 'center' }}>
                      <Typography variant="h6">{metrics.statusCodes['404']}</Typography>
                      <Typography variant="body2">404 Not Found</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1, bgcolor: 'error.light', color: 'white', textAlign: 'center' }}>
                      <Typography variant="h6">{metrics.statusCodes['500']}</Typography>
                      <Typography variant="body2">500 Error</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Paper>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Recent Logs
                  </Typography>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="log-level-select-label">Log Level</InputLabel>
                    <Select
                      labelId="log-level-select-label"
                      id="log-level-select"
                      value={logLevel}
                      label="Log Level"
                      onChange={handleLogLevelChange}
                    >
                      <MenuItem value="all">All Levels</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                      <MenuItem value="warn">Warning</MenuItem>
                      <MenuItem value="error">Error</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {logs.length > 0 ? (
                  <List>
                    {logs.map((log, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ mr: 2 }}
                                >
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 'bold', 
                                    color: getLogItemColor(log.level),
                                    mr: 2
                                  }}
                                >
                                  [{log.level}]
                                </Typography>
                                <Typography variant="body1">
                                  {log.message}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < logs.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No logs matching the selected filter
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Note: This is a mockup of the monitoring dashboard with sample data. In the full implementation, this would display real-time metrics and logs from your Envoy Gateway instance.
      </Typography>
    </Box>
  );
}

export default Monitoring;
