import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { Dashboard } from './components/pages/Dashboard';
import { Login } from './components/pages/Login';
import { AuthSuccess } from './components/pages/AuthSuccess';
import { Unauthorized } from './components/pages/Unauthorized';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertHistory, MonitoringConfig, ServiceStatus } from './types/monitoring';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Pages de base
const Services = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h1 className="text-2xl font-bold mb-6">Services</h1>
    <p>Page des services en construction...</p>
  </div>
);

const Alerts = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h1 className="text-2xl font-bold mb-6">Alertes</h1>
    <p>Page des alertes en construction...</p>
  </div>
);

// Composant de paramètres qui utilise l'API avec JWT
const SettingsContent = () => {
  const { getAuthToken } = useAuth();
  const [config, setConfig] = useState<MonitoringConfig>({
    interval: '*/1 * * * *',
    requestTimeout: 5000,
    serviceUrl: 'http://localhost:3000/cards',
    thresholds: {
      responseTime: 1000,
      errorCount: 2,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch(`${BACKEND_URL}/config`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const data = await response.json();
        setConfig(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        setLoading(false);
      }
    };

    fetchConfig();
  }, [getAuthToken]);

  const handleConfigUpdate = async (newConfig: MonitoringConfig) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${BACKEND_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to update config');
      }

      const data = await response.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      <p>Configuration actuelle :</p>
      <pre className="bg-gray-100 p-4 rounded mt-2 mb-4">
        {JSON.stringify(config, null, 2)}
      </pre>
      <button
        onClick={() => handleConfigUpdate({
          ...config,
          requestTimeout: config.requestTimeout + 1000
        })}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Augmenter le timeout
      </button>
    </div>
  );
};

// Wrapper pour les paramètres
const Settings = () => (
  <SettingsContent />
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute>
              <MainLayout>
                <Services />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <MainLayout>
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 