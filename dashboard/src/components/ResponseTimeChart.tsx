import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ServiceStatus } from '../types/monitoring';

interface ResponseTimeChartProps {
  data: ServiceStatus[];
}

export const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({ data }) => {
  const chartData = data.map(status => ({
    timestamp: new Date(status.timestamp).toLocaleTimeString(),
    responseTime: status.isUp ? status.responseTime : null,
  }));

  return (
    <div className="h-80 w-full bg-white p-4 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Temps de réponse</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="responseTime"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 