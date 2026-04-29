import React, { useState } from 'react';
import { Ruler, Activity, Users, FileText, Clipboard, TrendingDown, Target } from 'lucide-react';
import { cn } from '../lib/utils';

export const PhysicalAssessment: React.FC = () => {
  const [metrics, setMetrics] = useState({
    weight: 80,
    height: 1.80,
    fatPercentage: 18,
    muscleMass: 40,
    chest: 100,
    waist: 85,
    hips: 95,
    thigh: 55,
    arm: 35
  });

  const bmi = metrics.weight / (metrics.height * metrics.height);

  return (
    <div className="card-standard p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-emerald-600" />
            Avaliação Antropométrica
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dados de composição corporal do aluno</p>
        </div>
        <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IMC</p>
           <p className="text-xl font-black text-slate-900">{bmi.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Gordura Corporal</p>
            <div className="flex items-end gap-1">
               <h4 className="text-3xl font-black text-slate-800">{metrics.fatPercentage}%</h4>
               <span className="text-[10px] font-bold text-emerald-600 mb-1">(-2% vs anterior)</span>
            </div>
            <div className="mt-4 w-full h-1.5 bg-emerald-200 rounded-full">
               <div className="h-full bg-emerald-600 rounded-full" style={{ width: '18%' }}></div>
            </div>
         </div>

         <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Massa Muscular</p>
            <div className="flex items-end gap-1">
               <h4 className="text-3xl font-black text-slate-800">{metrics.muscleMass}kg</h4>
               <span className="text-[10px] font-bold text-blue-600 mb-1">(+1.2kg vs anterior)</span>
            </div>
            <div className="mt-4 w-full h-1.5 bg-blue-200 rounded-full">
               <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
            </div>
         </div>

         <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Peso Total</p>
            <div className="flex items-end gap-1">
               <h4 className="text-3xl font-black text-slate-800">{metrics.weight}kg</h4>
               <span className="text-[10px] font-bold text-amber-600 mb-1">Atleta Pro</span>
            </div>
            <div className="mt-4 w-full h-1.5 bg-amber-200 rounded-full">
               <div className="h-full bg-amber-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
         </div>
      </div>

      <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Medidas (cm)</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
               { label: 'Tórax', value: metrics.chest },
               { label: 'Cintura', value: metrics.waist },
               { label: 'Quadril', value: metrics.hips },
               { label: 'Coxa', value: metrics.thigh },
               { label: 'Braço', value: metrics.arm },
               { label: 'Panturrilha', value: 38 },
               { label: 'Abdominal', value: 82 },
               { label: 'Ombros', value: 115 }
            ].map((m, i) => (
               <div key={i} className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
                  <span className="text-lg font-black text-slate-800">{m.value}cm</span>
               </div>
            ))}
         </div>
      </div>

      <div className="mt-8 flex gap-3">
         <button className="flex-1 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-tighter rounded-xl hover:bg-slate-800 transition-all">
            Salvar Nova Avaliação
         </button>
         <button className="px-6 py-4 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-tighter rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
            <FileText className="w-4 h-4" /> PDF
         </button>
      </div>
    </div>
  );
};
