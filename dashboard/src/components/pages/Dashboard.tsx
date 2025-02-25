import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ServiceStatus, AlertHistory } from '../../types/monitoring';
import { StatusCard } from '../monitoring/StatusCard';
import { ResponseTimeChart } from '../monitoring/ResponseTimeChart';
import { AlertList } from '../monitoring/AlertList';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/**
 * Main dashboard page component
 * Displays real-time monitoring information
 */
export const Dashboard = () => {
  const { getAuthToken } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<ServiceStatus>({
    isUp: true,
    responseTime: 0,
    timestamp: new Date().toISOString(),
  });
  const [statusHistory, setStatusHistory] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);

  useEffect(() => {
    const token = getAuthToken();
    
    if (!token) {
      console.error('No authentication token available');
      return;
    }
    
    const socket = io(BACKEND_URL, {
      auth: { token },
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

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
  }, [getAuthToken]);

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