import { useMonitoring } from '../../hooks/useMonitoring';
import { StatusCard } from '../monitoring/StatusCard';
import { ResponseTimeChart } from '../monitoring/ResponseTimeChart';
import { AlertList } from '../monitoring/AlertList';

/**
 * Main dashboard page component
 * Displays real-time monitoring information
 */
export const Dashboard = () => {
  const { currentStatus, statusHistory, alerts, isConnected, reconnect } = useMonitoring();

  return (
    <div className="space-y-6">
      {!isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">Attention</p>
              <p>La connexion au service de monitoring est interrompue. Les données peuvent ne pas être à jour.</p>
            </div>
            <button 
              onClick={reconnect}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Reconnecter
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusCard status={currentStatus} />
        <ResponseTimeChart data={statusHistory} />
      </div>
      <AlertList alerts={alerts} />
    </div>
  );
}; 