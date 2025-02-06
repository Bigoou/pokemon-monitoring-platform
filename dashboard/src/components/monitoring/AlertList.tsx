import { AlertHistory } from '../../types/monitoring';

/**
 * Props for the AlertList component
 */
interface AlertListProps {
  alerts: AlertHistory[];
}

/**
 * Component that displays a list of recent alerts
 */
export const AlertList = ({ alerts }: AlertListProps) => {
  const getAlertStyle = (type: AlertHistory['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Alertes Récentes</h2>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune alerte récente</p>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 border rounded ${getAlertStyle(alert.type)}`}
            >
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm mt-1 opacity-75">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 