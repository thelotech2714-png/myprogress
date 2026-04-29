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

interface FinancialChartProps {
  data: { name: string; value: number }[];
  color?: string;
  title?: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ 
  data, 
  color = "#2563eb", 
  title = "Receita Mensal" 
}) => {
  return (
    <div className="card-standard p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-900 font-sans">{title}</h3>
        <select className="text-xs font-bold text-slate-400 bg-slate-50 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-100 outline-none">
          <option>Últimos 6 Meses</option>
          <option>Ano Atual</option>
        </select>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} 
              dy={15}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #f1f5f9', 
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ color: color, fontWeight: 700, fontSize: '12px' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 600, fontSize: '11px' }}
              formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Valor']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
