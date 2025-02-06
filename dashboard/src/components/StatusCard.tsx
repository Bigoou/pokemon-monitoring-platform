import React from 'react';
import { ServiceStatus } from '../types/monitoring';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface StatusCardProps {
  status: ServiceStatus;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  const getStatusIcon = () => {
    if (!status.isUp) {
      return <XCircleIcon className="h-12 w-12 text-red-500" />;
    }
    if (status.isHighLatency) {
      return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />;
    }
    return <CheckCircleIcon className="h-12 w-12 text-green-500" />;
  };

  const getStatusText = () => {
    if (!status.isUp) return 'Hors service';
    if (status.isHighLatency) return 'Latence élevée';
    return 'Opérationnel';
  };

  const getStatusColor = () => {
    if (!status.isUp) return 'bg-red-100 border-red-500';
    if (status.isHighLatency) return 'bg-yellow-100 border-yellow-500';
    return 'bg-green-100 border-green-500';
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center space-x-4">
        {getStatusIcon()}
        <div>
          <h2 className="text-2xl font-bold">{getStatusText()}</h2>
          <p className="text-gray-600">
            Temps de réponse: {status.isUp ? `${status.responseTime}ms` : 'N/A'}
          </p>
          {status.error && (
            <p className="text-red-600 mt-2">
              Erreur: {status.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 