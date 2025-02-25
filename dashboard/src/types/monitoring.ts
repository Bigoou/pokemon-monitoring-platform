/**
 * Service status information
 */
export interface ServiceStatus {
  isUp: boolean;
  responseTime: number;
  timestamp: string;
  isHighLatency?: boolean;
  error?: string;
}

/**
 * Alert history entry
 */
export interface AlertHistory {
  type: 'error' | 'warning';
  message: string;
  timestamp: string;
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