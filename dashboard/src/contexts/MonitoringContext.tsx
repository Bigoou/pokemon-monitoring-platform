import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { monitoringService } from '../services/monitoringService';
import { AlertHistory, ServiceStatus } from '../types/monitoring';
import { useAuth } from './AuthContext';

interface MonitoringContextType {
  isConnected: boolean;
  currentStatus: ServiceStatus;
  statusHistory: ServiceStatus[];
  alerts: AlertHistory[];
  reconnect: () => void;
}

const defaultContext: MonitoringContextType = {
  isConnected: false,
  currentStatus: {
    isUp: true,
    responseTime: 0,
    timestamp: new Date().toISOString(),
    status: 'UP'
  },
  statusHistory: [],
  alerts: [],
  reconnect: () => {}
};

const MonitoringContext = createContext<MonitoringContextType>(defaultContext);

/**
 * Provider component for monitoring context
 */
export const MonitoringProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getAuthToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ServiceStatus>(defaultContext.currentStatus);
  const [statusHistory, setStatusHistory] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);
  
  // Fonction pour gérer les changements de statut
  const handleStatusUpdate = useCallback((status: ServiceStatus) => {
    setCurrentStatus(prevStatus => {
      // Générer une alerte si le statut a changé
      if (status.status && prevStatus.status && status.status !== prevStatus.status) {
        const statusAlert: AlertHistory = {
          type: 'status_change',
          message: `Service status changed to ${status.status}`,
          timestamp: new Date().toISOString(),
          details: {
            status: status.status,
            responseTime: status.responseTime,
            previousStatus: prevStatus.status
          }
        };
        setAlerts(prev => [...prev.slice(-100), statusAlert]);
      }
      return status;
    });
    
    setStatusHistory(prev => [...prev.slice(-50), status]);
  }, []);
  
  // Fonction pour se connecter au service de monitoring
  const connectToMonitoring = useCallback(() => {
    console.log('Connecting to monitoring service...');
    const token = getAuthToken();
    
    if (!token) {
      console.error('No authentication token available');
      return;
    }
    
    // Déconnecter d'abord si déjà connecté
    monitoringService.disconnect();
    
    // Connect to the monitoring service
    monitoringService.connect(token);
    
    // Set up listeners
    const connectionUnsubscribe = monitoringService.onConnectionChange(setIsConnected);
    const statusUnsubscribe = monitoringService.onStatusUpdate(handleStatusUpdate);
    const alertUnsubscribe = monitoringService.onAlert((alert) => {
      setAlerts(prev => [...prev.slice(-100), alert]);
    });
    
    // Clean up on unmount or reconnect
    return () => {
      connectionUnsubscribe();
      statusUnsubscribe();
      alertUnsubscribe();
    };
  }, [getAuthToken, handleStatusUpdate]);
  
  // Fonction pour se reconnecter manuellement
  const reconnect = useCallback(() => {
    console.log('Manual reconnection requested');
    connectToMonitoring();
  }, [connectToMonitoring]);
  
  // Établir la connexion initiale
  useEffect(() => {
    const cleanup = connectToMonitoring();
    return () => {
      if (cleanup) {
        cleanup();
      }
      monitoringService.disconnect();
    };
  }, [connectToMonitoring]);
  
  // Tenter de se reconnecter automatiquement en cas de déconnexion
  useEffect(() => {
    if (!isConnected) {
      const reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect automatically...');
        connectToMonitoring();
      }, 5000); // Tenter de se reconnecter après 5 secondes
      
      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, connectToMonitoring]);
  
  const contextValue: MonitoringContextType = {
    isConnected,
    currentStatus,
    statusHistory,
    alerts,
    reconnect
  };

  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  );
};

/**
 * Hook to use the monitoring context
 */
export const useMonitoring = () => useContext(MonitoringContext); 