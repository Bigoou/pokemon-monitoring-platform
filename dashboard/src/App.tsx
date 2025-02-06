import { useEffect, useState } from 'react';

import { ServiceStatus, AlertHistory, MonitoringConfig } from '../../service-monitoring/dashboard/src/types/monitoring';
import io from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { Dashboard } from './components/pages/Dashboard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket = io(BACKEND_URL);

// Pages
const Services = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h1 className="text-2xl font-bold mb-6">Services</h1>
    <p>Page des services en construction...</p>
  </div>
);

const Alerts = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h1 className="text-2xl font-bold mb-6">Alertes</h1>
    <p>Page des alertes en construction...</p>
  </div>
);

const Settings = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
    <p>Page des paramètres en construction...</p>
  </div>
);

function App() {
  const [currentStatus, setCurrentStatus] = useState<ServiceStatus>({
    isUp: true,
    responseTime: 0,
    timestamp: new Date().toISOString(),
  });
  const [statusHistory, setStatusHistory] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);
  const [config, setConfig] = useState<MonitoringConfig>({
    interval: '*/1 * * * *',
    requestTimeout: 5000,
    serviceUrl: 'http://localhost:3000/cards',
    thresholds: {
      responseTime: 1000,
      errorCount: 2,
    },
  });

  useEffect(() => {
    socket.on('statusUpdate', (status: ServiceStatus) => {
      setCurrentStatus(status);
      setStatusHistory(prev => [...prev.slice(-50), status]);
    });

    socket.on('alert', (alert: AlertHistory) => {
      setAlerts(prev => [...prev.slice(-100), alert]);
    });

    socket.on('config', (newConfig: MonitoringConfig) => {
      setConfig(newConfig);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleConfigUpdate = async (newConfig: MonitoringConfig) => {
    try {
      const response = await fetch(`${BACKEND_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to update config');
      }

      setConfig(newConfig);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App; 