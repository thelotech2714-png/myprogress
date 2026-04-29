import React from 'react';
import { Award, Trophy, Medal, Crown, TrendingUp, ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface RankUser {
  id: string;
  name: string;
  points: number;
  rank: number;
  isMe?: boolean;
}

const rankingData: RankUser[] = [
  { id: '1', name: 'Ricardo Santos', points: 12450, rank: 1 },
  { id: '2', name: 'Juliana Lima', points: 11200, rank: 2 },
  { id: '3', name: 'Bruno Alves', points: 10800, rank: 3 },
  { id: '4', name: 'Usuário Demo', points: 9500, rank: 4, isMe: true },
  { id: '5', name: 'Carla Pereira', points: 8900, rank: 5 },
];

export const RankingSection: React.FC = () => {
  return (
    <div className="card-standard p-8 bg-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
            Ranking Mensal
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acumule pontos treinando e correndo</p>
        </div>
        <div className="flex bg-slate-50 border border-slate-200 px-3 py-1 rounded-full gap-2 items-center">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temporada 04</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
         {rankingData.map((user) => (
           <div 
             key={user.id} 
             className={cn(
               "flex items-center justify-between p-4 rounded-2xl border transition-all",
               user.isMe ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-slate-50 border-slate-100"
             )}
           >
              <div className="flex items-center gap-4">
                 <div className={cn(
                   "w-10 h-10 rounded-full flex items-center justify-center font-black text-xs",
                   user.rank === 1 ? "bg-amber-100 text-amber-600 border border-amber-200" :
                   user.rank === 2 ? "bg-slate-100 text-slate-600 border border-slate-200" :
                   user.rank === 3 ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-white text-slate-400"
                 )}>
                    {user.rank === 1 ? <Crown className="w-5 h-5" /> : user.rank}
                 </div>
                 <div>
                    <h4 className={cn("text-sm font-bold", user.isMe ? "text-amber-900" : "text-slate-800")}>
                      {user.name} {user.isMe && "(Você)"}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.points.toLocaleString()} pts</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                       <ArrowUp className="w-2.5 h-2.5" /> 12%
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Growth</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 text-white border-none relative overflow-hidden">
         <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-amber-500/20 to-transparent pointer-events-none" />
         <div className="relative z-10">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
               <Award className="w-4 h-4" /> Próxima Conquista
            </h4>
            <p className="font-bold text-lg mb-4">Mestre da Constância</p>
            <div className="flex items-end justify-between mb-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Faltam 5 treinos seguidos</span>
               <span className="text-xs font-black">15 / 20</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-amber-400 rounded-full" style={{ width: '75%' }}></div>
            </div>
         </div>
      </div>
    </div>
  );
};
