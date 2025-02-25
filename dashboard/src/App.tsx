import { useEffect, useState } from 'react';

import io from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { Dashboard } from './components/pages/Dashboard';
import { Login } from './components/pages/Login';
import { AuthSuccess } from './components/pages/AuthSuccess';
import { Unauthorized } from './components/pages/Unauthorized';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AlertHistory, MonitoringConfig, ServiceStatus } from './types/monitoring';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const socket = io(BACKEND_URL);

// Pages de base
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute>
              <MainLayout>
                <Services />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <MainLayout>
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 