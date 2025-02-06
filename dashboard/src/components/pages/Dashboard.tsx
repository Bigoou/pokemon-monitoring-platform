import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ServiceStatus, AlertHistory } from '../../types/monitoring';
import { StatusCard } from '../monitoring/StatusCard';
import { ResponseTimeChart } from '../monitoring/ResponseTimeChart';
import { AlertList } from '../monitoring/AlertList';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Main dashboard page component
 * Displays real-time monitoring information
 */
export const Dashboard = () => {
  const [currentStatus, setCurrentStatus] = useState<ServiceStatus>({
    isUp: true,
    responseTime: 0,
    timestamp: new Date().toISOString(),
  });
  const [statusHistory, setStatusHistory] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);

  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on('statusUpdate', (status: ServiceStatus) => {
      setCurrentStatus(status);
      setStatusHistory(prev => [...prev.slice(-50), status]);
    });

    socket.on('alert', (alert: AlertHistory) => {
      setAlerts(prev => [...prev.slice(-10), alert]);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusCard status={currentStatus} />
        <ResponseTimeChart data={statusHistory} />
      </div>
      <AlertList alerts={alerts} />
    </div>
  );
}; 