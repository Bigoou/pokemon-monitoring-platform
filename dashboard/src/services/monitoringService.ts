import { io, Socket } from 'socket.io-client';
import { AlertHistory, ServiceStatus } from '../types/monitoring';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/**
 * Monitoring service to handle WebSocket connection and alerts
 */
class MonitoringService {
  private socket: Socket | null = null;
  private statusListeners: ((status: ServiceStatus) => void)[] = [];
  private alertListeners: ((alert: AlertHistory) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private connectionAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Initialize the WebSocket connection
   * @param token Authentication token
   */
  connect(token: string): void {
    if (!token) {
      console.error('MonitoringService: Cannot connect without a token');
      return;
    }

    // Reset connection attempts on manual connect
    this.connectionAttempts = 0;

    if (this.socket) {
      console.log('MonitoringService: Disconnecting existing socket before reconnecting');
      this.socket.disconnect();
      this.socket = null;
    }

    try {
      console.log(`MonitoringService: Connecting to ${BACKEND_URL}`);
      this.socket = io(BACKEND_URL, {
        auth: { token },
        withCredentials: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000, // 10 seconds timeout
        reconnectionDelay: 1000, // Start with 1s delay
        reconnectionDelayMax: 5000 // Max 5s delay
      });

      this.socket.on('connect', () => {
        console.log('MonitoringService: Connected to monitoring service');
        this.connectionAttempts = 0;
        this.notifyConnectionListeners(true);
      });

      this.socket.on('connect_error', (error) => {
        this.connectionAttempts++;
        console.error(`MonitoringService: WebSocket connection error (attempt ${this.connectionAttempts}/${this.maxReconnectAttempts}):`, error.message);
        this.notifyConnectionListeners(false);
        
        // Si on dépasse le nombre max de tentatives, on arrête de réessayer
        if (this.connectionAttempts >= this.maxReconnectAttempts) {
          console.error('MonitoringService: Max reconnection attempts reached, giving up');
          if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
          }
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`MonitoringService: Disconnected from monitoring service. Reason: ${reason}`);
        this.notifyConnectionListeners(false);
      });

      this.socket.on('error', (error) => {
        console.error('MonitoringService: Socket error:', error);
        this.notifyConnectionListeners(false);
      });

      this.socket.on('statusUpdate', (status: ServiceStatus) => {
        console.log('MonitoringService: Received status update:', status);
        // Ensure status has the correct format
        const formattedStatus: ServiceStatus = {
          ...status,
          timestamp: status.timestamp || new Date().toISOString()
        };
        
        // Determine service status based on isUp and isHighLatency
        if (!formattedStatus.status) {
          if (!formattedStatus.isUp) {
            formattedStatus.status = 'DOWN';
          } else if (formattedStatus.isHighLatency) {
            formattedStatus.status = 'DEGRADED';
          } else {
            formattedStatus.status = 'UP';
          }
        }
        
        this.notifyStatusListeners(formattedStatus);
      });

      this.socket.on('alert', (alert: AlertHistory) => {
        console.log('MonitoringService: Received alert:', alert);
        // Ensure alert has the correct format
        const formattedAlert: AlertHistory = {
          ...alert,
          timestamp: alert.timestamp || new Date().toISOString()
        };
        
        this.notifyAlertListeners(formattedAlert);
      });

      console.log('MonitoringService: Connecting socket...');
      this.socket.connect();
    } catch (error) {
      console.error('MonitoringService: Error initializing socket:', error);
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('MonitoringService: Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Add a listener for status updates
   * @param listener Function to call when a status update is received
   */
  onStatusUpdate(listener: (status: ServiceStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  /**
   * Add a listener for alerts
   * @param listener Function to call when an alert is received
   */
  onAlert(listener: (alert: AlertHistory) => void): () => void {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== listener);
    };
  }

  /**
   * Add a listener for connection status changes
   * @param listener Function to call when connection status changes
   */
  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  private notifyStatusListeners(status: ServiceStatus): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('MonitoringService: Error in status listener:', error);
      }
    });
  }

  private notifyAlertListeners(alert: AlertHistory): void {
    this.alertListeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('MonitoringService: Error in alert listener:', error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('MonitoringService: Error in connection listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const monitoringService = new MonitoringService(); 