import React, { useState } from 'react';
import { MonitoringConfig } from '../types/monitoring';

interface ConfigPanelProps {
  config: MonitoringConfig;
  onUpdate: (config: MonitoringConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('thresholds.')
        ? {
            ...prev.thresholds,
            [name.split('.')[1]]: parseInt(value, 10),
          }
        : value,
    }));
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Configuration</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Modifier
          </button>
        </div>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Intervalle:</span> {config.interval}
          </p>
          <p>
            <span className="font-medium">Timeout:</span> {config.requestTimeout}ms
          </p>
          <p>
            <span className="font-medium">URL:</span> {config.serviceUrl}
          </p>
          <p>
            <span className="font-medium">Seuil de latence:</span>{' '}
            {config.thresholds.responseTime}ms
          </p>
          <p>
            <span className="font-medium">Erreurs consécutives:</span>{' '}
            {config.thresholds.errorCount}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-xl font-bold mb-4">Modifier la configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Intervalle CRON
          </label>
          <input
            type="text"
            name="interval"
            value={formData.interval}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Timeout (ms)
          </label>
          <input
            type="number"
            name="requestTimeout"
            value={formData.requestTimeout}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL du service
          </label>
          <input
            type="text"
            name="serviceUrl"
            value={formData.serviceUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Seuil de latence (ms)
          </label>
          <input
            type="number"
            name="thresholds.responseTime"
            value={formData.thresholds.responseTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Erreurs consécutives
          </label>
          <input
            type="number"
            name="thresholds.errorCount"
            value={formData.thresholds.errorCount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}; 