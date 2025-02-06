import React, { useEffect, useState } from 'react';
import { StatusCard } from '../components/StatusCard';
import { ResponseTimeChart } from '../components/ResponseTimeChart';
import { AlertList } from '../components/AlertList';
import { ConfigPanel } from '../components/ConfigPanel';
import { ServiceStatus, AlertHistory, MonitoringConfig } from './monitoring';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket = io(BACKEND_URL);

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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Monitoring
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <StatusCard status={currentStatus} />
            <ResponseTimeChart data={statusHistory} />
          </div>
          <div className="space-y-6">
            <ConfigPanel config={config} onUpdate={handleConfigUpdate} />
            <AlertList alerts={alerts} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 