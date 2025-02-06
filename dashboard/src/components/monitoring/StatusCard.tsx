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
  const statusClass = status.isUp
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';

  const statusText = status.isUp ? 'En ligne' : 'Hors ligne';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">État du Service</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
            {statusText}
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
      </div>
    </div>
  );
}; 