'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TemperatureHistory } from '@/lib/hooks';

interface TemperatureChartProps {
  data: TemperatureHistory[];
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = data.map(item => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    temperature: item.temperature,
    fullDate: format(new Date(item.timestamp), 'MMM dd, HH:mm:ss'),
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.time === label);
              return item ? item.fullDate : label;
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
