import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Play, Dumbbell, Clock, Zap, Target, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  load: string;
  rest: string;
  done: boolean;
  videoUrl: string;
}

const initialWorkoutsState: Record<'A' | 'B' | 'C', Exercise[]> = {
  A: [
    { id: '1', name: 'Supino Reto', sets: 4, reps: '10-12', load: '60kg', rest: '60s', done: false, videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw' },
    { id: '2', name: 'Crucifixo Inclinado', sets: 3, reps: '12', load: '15kg', rest: '45s', done: false, videoUrl: 'https://www.youtube.com/embed/8XDN57z_93Q' },
    { id: '3', name: 'Desenvolvimento Militar', sets: 4, reps: '8-10', load: '30kg', rest: '90s', done: false, videoUrl: 'https://www.youtube.com/embed/2yjwxtZ_V7M' },
    { id: '4', name: 'Elevação Lateral', sets: 3, reps: '15', load: '10kg', rest: '45s', done: false, videoUrl: 'https://www.youtube.com/embed/PvStA323Wos' },
    { id: '5', name: 'Tríceps Corda', sets: 4, reps: '12-15', load: '25kg', rest: '45s', done: false, videoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME' },
  ],
  B: [
    { id: '6', name: 'Agachamento Livre', sets: 4, reps: '10', load: '80kg', rest: '120s', done: false, videoUrl: 'https://www.youtube.com/embed/SW_C1A-rejs' },
    { id: '7', name: 'Leg Press 45', sets: 3, reps: '12', load: '160kg', rest: '60s', done: false, videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ' },
    { id: '8', name: 'Extensora', sets: 4, reps: '15', load: '40kg', rest: '45s', done: false, videoUrl: 'https://www.youtube.com/embed/YyvSfVlvPoQ' },
    { id: '9', name: 'Stiff', sets: 3, reps: '12', load: '50kg', rest: '60s', done: false, videoUrl: 'https://www.youtube.com/embed/fTiaI60Lq94' },
    { id: '10', name: 'Panturrilha Gêmeos', sets: 4, reps: '20', load: '60kg', rest: '30s', done: false, videoUrl: 'https://www.youtube.com/embed/M_V6Zz-K3vM' },
  ],
  C: [
    { id: '11', name: 'Puxada Frontal', sets: 4, reps: '10-12', load: '50kg', rest: '60s', done: false, videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc' },
    { id: '12', name: 'Remada Curvada', sets: 3, reps: '12', load: '40kg', rest: '60s', done: false, videoUrl: 'https://www.youtube.com/embed/RQU8wZ6v_f0' },
    { id: '13', name: 'Rosca Direta', sets: 4, reps: '10', load: '30kg', rest: '60s', done: false, videoUrl: 'https://www.youtube.com/embed/lyUInN9Fm98' },
    { id: '14', name: 'Rosca Martelo', sets: 3, reps: '12', load: '12kg', rest: '45s', done: false, videoUrl: 'https://www.youtube.com/embed/7jqi2q8_9nE' },
    { id: '15', name: 'Plancha Abdominal', sets: 3, reps: '45s', load: 'BW', rest: '30s', done: false, videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw' },
  ]
};

export const StudentWorkout: React.FC = () => {
  const [activeWorkout, setActiveWorkout] = useState<'A' | 'B' | 'C'>('A');
  const [allWorkouts, setAllWorkouts] = useState(initialWorkoutsState);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const exercises = allWorkouts[activeWorkout];

  const toggleDone = (id: string) => {
    setAllWorkouts(prev => ({
      ...prev,
      [activeWorkout]: prev[activeWorkout].map(ex => 
        ex.id === id ? { ...ex, done: !ex.done } : ex
      )
    }));
  };

  const progress = (exercises.filter(ex => ex.done).length / exercises.length) * 100;

  const handleFinish = () => {
    if (progress < 100) {
      if (!confirm('Você ainda não completou todos os exercícios. Deseja finalizar mesmo assim?')) return;
    }
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <div className="card-standard p-12 bg-white text-center flex flex-col items-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Treino Finalizado!</h3>
        <p className="text-slate-500 mb-8 max-w-sm">Parabéns pelo esforço! Seu desempenho foi registrado e somará pontos no ranking.</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
           <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duração</p>
              <p className="text-lg font-black text-slate-900">54min</p>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volume</p>
              <p className="text-lg font-black text-slate-900">4.2t</p>
           </div>
        </div>
        <button 
          onClick={() => setIsFinished(false)}
          className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="card-standard p-8 bg-white overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Treino {activeWorkout}: {
                  activeWorkout === 'A' ? 'Membros Superiores' :
                  activeWorkout === 'B' ? 'Inferiores & Core' :
                  'Costas & Bíceps'
                }
              </h3>
           </div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foco em Hipertrofia • 60-90 min</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
           {['A', 'B', 'C'].map((type) => (
             <button 
               key={type}
               onClick={() => setActiveWorkout(type as any)}
               className={cn(
                 "px-4 py-2 rounded-lg text-xs font-black transition-all",
                 activeWorkout === type ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
               )}
             >
               Treino {type}
             </button>
           ))}
        </div>
      </div>

      <div className="mb-8">
         <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progresso do Treino</span>
            <span className="text-sm font-black text-blue-600">{Math.round(progress)}%</span>
         </div>
         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
         </div>
      </div>

      <div className="space-y-4">
         {exercises.map((ex) => (
           <div 
             key={ex.id} 
             className={cn(
               "p-5 rounded-2xl border transition-all flex items-center justify-between group",
               ex.done ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 hover:border-blue-200"
             )}
           >
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => toggleDone(ex.id)}
                   className={cn(
                     "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                     ex.done ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-300 border border-slate-200 hover:border-blue-400 hover:text-blue-500"
                   )}
                 >
                    {ex.done ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-3 h-3 rounded-full bg-transparent border-2 border-current" />}
                 </button>
                 <div>
                    <h4 className={cn("font-bold text-slate-900", ex.done && "line-through text-slate-400")}>{ex.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded leading-none">{ex.sets} x {ex.reps}</span>
                       <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded leading-none">{ex.load}</span>
                       <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.rest}</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => ex.videoUrl && ex.videoUrl !== '#' ? setSelectedVideoUrl(ex.videoUrl) : alert('Vídeo de execução não disponível')}
                   className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                 >
                    <Play className="w-4 h-4 fill-current" />
                 </button>
                 <button className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Zap className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
         <button 
           onClick={handleFinish}
           className="flex-1 py-4 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10"
         >
            Finalizar Treino
         </button>
      </div>

      {/* Video Modal */}
      {selectedVideoUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[6000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setSelectedVideoUrl(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full">
               <iframe 
                 src={`${selectedVideoUrl}?origin=${window.location.origin}&rel=0`}
                 className="w-full h-full border-none"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
                 title="Treinamento"
               ></iframe>
            </div>
            <div className="p-6 bg-white flex justify-between items-center">
               <div>
                  <h4 className="text-lg font-bold text-slate-900">Execução do Exercício</h4>
                  <a 
                    href={selectedVideoUrl.replace('embed/', 'watch?v=')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    Abrir no Youtube <ChevronRight className="w-3 h-3" />
                  </a>
               </div>
               <button 
                 onClick={() => setSelectedVideoUrl(null)}
                 className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
