import { ServiceStatus } from '../../types/monitoring';

/**
 * Props for the StatusCard component
 */
interface StatusCardProps {
  status: ServiceStatus;
}

/**
 * Component that displays the current status of the service
 */
export const StatusCard = ({ status }: StatusCardProps) => {
  const getStatusClass = () => {
    if (status.status === 'DOWN' || !status.isUp) {
      return 'bg-red-100 text-red-800';
    } else if (status.status === 'DEGRADED' || status.isHighLatency) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = () => {
    if (status.status === 'DOWN' || !status.isUp) {
      return 'Hors service';
    } else if (status.status === 'DEGRADED' || status.isHighLatency) {
      return 'Dégradé';
    } else {
      return 'Opérationnel';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">État du Service</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Temps de réponse</span>
          <span className="font-medium">{status.responseTime} ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Dernière vérification</span>
          <span className="text-sm text-gray-500">
            {new Date(status.timestamp).toLocaleString()}
          </span>
        </div>
        {status.error && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Erreur</span>
            <span className="text-sm text-red-500">{status.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 