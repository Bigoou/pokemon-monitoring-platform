/**
 * Service status information
 */
export interface ServiceStatus {
  isUp: boolean;
  responseTime: number;
  timestamp: string;
  isHighLatency?: boolean;
  error?: string;
  status?: 'UP' | 'DOWN' | 'DEGRADED';
}

/**
 * Alert history entry
 */
export interface AlertHistory {
  type: 'error' | 'warning' | 'status_change' | 'high_latency';
  message: string;
  timestamp: string;
  details?: {
    status?: 'UP' | 'DOWN' | 'DEGRADED';
    responseTime?: number;
    error?: string;
    [key: string]: any;
  };
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  interval: string;
  requestTimeout: number;
  serviceUrl: string;
  thresholds: {
    responseTime: number;
    errorCount: number;
  };
} 