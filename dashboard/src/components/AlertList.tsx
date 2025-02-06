import React from 'react';
import { AlertHistory } from '../types/monitoring';
import {
  ExclamationCircleIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface AlertListProps {
  alerts: AlertHistory[];
}

export const AlertList: React.FC<AlertListProps> = ({ alerts }) => {
  const getAlertIcon = (type: AlertHistory['type']) => {
    switch (type) {
      case 'status_change':
        return <BoltIcon className="h-6 w-6 text-blue-500" />;
      case 'high_latency':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
    }
  };

  const getAlertColor = (type: AlertHistory['type']) => {
    switch (type) {
      case 'status_change':
        return 'border-blue-200 bg-blue-50';
      case 'high_latency':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-xl font-bold mb-4">Historique des alertes</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
                {alert.details && (
                  <pre className="mt-2 text-sm bg-white p-2 rounded">
                    {JSON.stringify(alert.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 