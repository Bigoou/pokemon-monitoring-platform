import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ServiceStatus } from '../../types/monitoring';

/**
 * Props for the ResponseTimeChart component
 */
interface ResponseTimeChartProps {
  data: ServiceStatus[];
}

/**
 * Component that displays a line chart of service response times
 */
export const ResponseTimeChart = ({ data }: ResponseTimeChartProps) => {
  const formattedData = data.map(status => ({
    ...status,
    time: new Date(status.timestamp).toLocaleTimeString(),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Temps de Réponse</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'ms', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="Temps de réponse"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 