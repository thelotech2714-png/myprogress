import React from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, Wallet, QrCode } from 'lucide-react';
import { cn } from '../lib/utils';

export const FinancialManagement: React.FC = () => {
  return (
    <div className="card-standard p-4 sm:p-8 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sm:mb-12">
        <div>
           <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
              Gestão Financeira
           </h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Controle de receitas e planos</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
           <button className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/10">
              Relatório
           </button>
           <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">
              Taxas
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
         {[
            { label: 'Receita Líquida (Mês)', value: 'R$ 42.500', trend: '+15.2%', positive: true },
            { label: 'Inadimplência', value: 'R$ 1.250', trend: '-2.4%', positive: true },
            { label: 'Taxa de Retenção', value: '94.8%', trend: '+0.5%', positive: true }
         ].map((m, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
               <div className="flex items-end justify-between">
                  <h4 className="text-2xl font-black text-slate-900">{m.value}</h4>
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-bold",
                    m.positive ? "text-emerald-600" : "text-red-500"
                  )}>
                     {m.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                     {m.trend}
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="space-y-4">
         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Transações Recentes</h4>
         {[
            { user: 'João Silva', plan: 'Premium Anual', amount: 'R$ 1.200', date: 'Hoje, 14:20', status: 'completed', method: 'PIX' },
            { user: 'Maria Lima', plan: 'Basic Mensal', amount: 'R$ 150', date: 'Hoje, 12:45', status: 'pending', method: 'Cartão' },
            { user: 'Pedro Costa', plan: 'Pro Semestral', amount: 'R$ 750', date: 'Ontem', status: 'completed', method: 'PIX' },
         ].map((t, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    t.method === 'PIX' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                  )}>
                     {t.method === 'PIX' ? <QrCode className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-900">{t.user}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.plan} • {t.method}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{t.amount}</p>
                  <p className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em]",
                    t.status === 'completed' ? "text-emerald-500" : "text-amber-500"
                  )}>
                     {t.status === 'completed' ? 'SUCESSO' : 'PENDENTE'}
                  </p>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};
