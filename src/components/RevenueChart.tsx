import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

export const RevenueChart: React.FC = () => {
  return (
    <div className="h-[300px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#888' }} 
            dy={10}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000', 
              border: 'none', 
              borderRadius: '0px',
              padding: '10px'
            }}
            itemStyle={{ color: '#C2FF00', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
            labelStyle={{ color: '#fff', marginBottom: '4px', fontWeight: 700, fontSize: '10px' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#000" 
            strokeWidth={4} 
            fill="#C2FF00" 
            fillOpacity={1} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
