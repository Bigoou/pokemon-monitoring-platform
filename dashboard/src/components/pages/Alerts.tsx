import { useMonitoring } from '../../hooks/useMonitoring';
import { AlertList } from '../AlertList';

/**
 * Page d'alertes qui affiche l'historique des alertes
 */
export const Alerts = () => {
  const { alerts, isConnected, reconnect } = useMonitoring();

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
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {alerts.length === 0 ? (
          <p className="text-gray-500">Aucune alerte n'a été enregistrée.</p>
        ) : (
          <AlertList alerts={alerts} />
        )}
      </div>
    </div>
  );
}; 