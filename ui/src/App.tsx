import React, { useState } from 'react';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import Dashboard from './Dashboard';
import Configuration from './components/Configuration';
import Routes from './components/Routes';
import Monitoring from './components/Monitoring';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Envoy Gateway Manager
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="envoy gateway tabs">
            <Tab label="Dashboard" />
            <Tab label="Configuration" />
            <Tab label="Routes" />
            <Tab label="Monitoring" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Dashboard />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Configuration />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Routes />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Monitoring />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App;
