import React, { useState } from 'react';
import { Timer, MapPin, Zap, TrendingUp, Calendar, ArrowRight, Share2, Check } from 'lucide-react';
import { cn } from '../utils';

interface ActivityProps {
  distance: string;
  pace: string;
  time: string;
  date: string;
  elevation: string;
  type?: 'Morning Run' | 'Night Run' | 'Trail Run';
}

export const RunningActivity: React.FC<ActivityProps> = ({ 
  distance, 
  pace, 
  time, 
  date, 
  elevation,
  type = 'Morning Run'
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const summary = `🏃‍♂️ Minha atividade no MyProgress!\n✨ Tipo: ${type}\n📏 Distância: ${distance}km\n⏱️ Tempo: ${time}\n⚡ Pace: ${pace}/km\n⛰️ Ganho: ${elevation}m\n📅 ${date}\n#MyProgress #Running #Performance`;
    
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-200 transition-all group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center rounded-xl font-bold">
                <Zap className="w-5 h-5 fill-orange-600" />
             </div>
             <div>
                <h4 className="font-bold text-slate-900 leading-none">{type}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                   <Calendar className="w-3 h-3" />
                   {date}
                </div>
             </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                copied ? "bg-emerald-50 text-emerald-600" : "hover:bg-slate-50 text-slate-400 hover:text-orange-600"
              )}
            >
               {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
               {copied && "Copiado!"}
            </button>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
               <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distância</span>
             <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{distance}<span className="text-xs ml-0.5 text-slate-400">km</span></p>
          </div>
          <div className="space-y-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pace</span>
             <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{pace}<span className="text-xs ml-0.5 text-slate-400">/km</span></p>
          </div>
          <div className="space-y-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo</span>
             <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{time}</p>
          </div>
        </div>

        <div className="h-24 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100 flex items-center justify-center">
           {/* Mock Path Drawing */}
           <svg className="w-full h-full p-4 text-orange-500 opacity-40" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path 
                d="M10,20 Q20,5 30,25 T50,15 T70,30 T90,10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="animate-[draw_2s_ease-out]"
              />
           </svg>
           <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-100">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {elevation}m de Ganho
           </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
         <div className="flex -space-x-2">
            {[1,2].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=run-${i}`} alt="user" />
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
               +3
            </div>
         </div>
         <span className="text-[10px] font-bold text-slate-400 uppercase">Ver Atividade</span>
      </div>
    </div>
  );
};
