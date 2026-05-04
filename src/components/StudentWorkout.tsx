import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ChevronRight, Play, Dumbbell, Clock, Zap, Target, ChevronDown, ChevronUp, X, Timer, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { auth } from '../services/firebase';
import { firebaseService } from '../services/firebaseService';

interface Exercise {
  id: string;
  name: string;
  sets: string | number;
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
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWorkout = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const workout = await firebaseService.getStudentWorkout(auth.currentUser.uid);
        if (workout) {
          setAllWorkouts(workout);
        }
      } catch (error) {
        console.error("Error fetching workout:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkout();
  }, []);

  // Execution Mode States
  const [isExecutionMode, setIsExecutionMode] = useState(false);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exerciseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Rest Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restTimer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restTimer > 0]);

  // Total Workout Timer Effect
  useEffect(() => {
    if (isExecutionMode && !isFinished) {
      workoutTimerRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    }
    return () => { if (workoutTimerRef.current) clearInterval(workoutTimerRef.current); };
  }, [isExecutionMode, isFinished]);

  // Exercise Timer Effect
  useEffect(() => {
    if (isExerciseActive && !isFinished) {
      exerciseTimerRef.current = setInterval(() => {
        setExerciseTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
    }
    return () => { if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current); };
  }, [isExerciseActive, isFinished]);

  const formatWorkoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exercises = allWorkouts[activeWorkout] || [];

  const startRest = (seconds: string) => {
    const sec = parseInt(seconds.replace('s', '')) || 60;
    setRestTimer(sec);
    setIsTimerRunning(true);
  };

  const toggleDone = (id: string) => {
    setAllWorkouts(prev => ({
      ...prev,
      [activeWorkout]: prev[activeWorkout].map(ex => 
        ex.id === id ? { ...ex, done: !ex.done } : ex
      )
    }));
  };

  const progress = (exercises.filter(ex => ex.done).length / exercises.length) * 100;

  const handleFinish = async () => {
    if (progress < 100) {
      if (!confirm('Você ainda não completou todos os exercícios. Deseja finalizar mesmo assim?')) return;
    }
    
    setIsFinished(true);

    if (auth.currentUser) {
      try {
         await firebaseService.saveWorkoutSession(auth.currentUser.uid, {
            workoutId: activeWorkout,
            duration: totalTime,
            exercisesCount: exercises.length,
            date: new Date()
         });
      } catch (err) {
         console.error("Erro ao salvar sessão:", err);
      }
    }
  };

  const startExecution = () => {
    setIsFinished(false);
    setIsExecutionMode(true);
    setCurrentExIndex(0);
    setTotalTime(0);
    setExerciseTimer(0);
    setIsExerciseActive(false);
  };

  if (loading) {
    return (
      <div className="card-standard p-12 bg-white text-center flex flex-col items-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando seu treino personalizado...</p>
      </div>
    );
  }

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
              <p className="text-lg font-black text-slate-900">{formatWorkoutTime(totalTime)}</p>
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
           onClick={startExecution}
           disabled={exercises.length === 0}
           className="flex-1 py-4 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            <Play className="w-5 h-5 fill-current" />
            {exercises.length === 0 ? 'Sem exercícios' : 'Iniciar Treino'}
         </button>
         <button 
           onClick={handleFinish}
           className="flex-1 py-4 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10"
         >
            Finalizar Treino
         </button>
      </div>

      {/* Execution Mode Fullscreenish Overlay */}
      {isExecutionMode && (
        <div className="fixed inset-0 bg-white z-[7000] flex flex-col animate-in slide-in-from-bottom-full duration-500">
           <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Dumbbell className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Treino {activeWorkout} em Execução</h3>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foco e Intensidade Máxima</p>
                       <div className="flex items-center gap-2 bg-blue-500 px-3 py-1 rounded-lg border border-blue-400/50">
                          <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
                          <p className="text-sm font-black text-white tabular-nums leading-none">{formatWorkoutTime(totalTime)}</p>
                       </div>
                    </div>
                 </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExecutionMode(false);
                  setIsTimerRunning(false);
                  setIsExerciseActive(false);
                  setRestTimer(0);
                }} 
                className="p-4 bg-white/10 hover:bg-red-500 text-white rounded-2xl transition-all group relative z-[7001]"
                title="Sair do Treino"
              >
                 <X className="w-6 h-6 group-hover:scale-110 transition-transform pointer-events-none" />
              </button>
           </div>

           <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 p-6 md:p-12 overflow-y-auto flex flex-col items-center">
                 <div className="w-full max-w-2xl space-y-8">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-4">
                       <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-500" 
                            style={{ width: `${((currentExIndex + 1) / exercises.length) * 100}%` }} 
                          />
                       </div>
                       <span className="text-sm font-black text-slate-400">{currentExIndex + 1} / {exercises.length}</span>
                    </div>

                    {/* Current Exercise Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-8 md:p-12 text-center shadow-xl shadow-slate-200/50">
                       <div className="flex justify-center mb-6">
                          <div className="relative">
                             <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-10 animate-pulse" />
                             <h4 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tight relative break-words">
                                {exercises.length > 0 ? exercises[currentExIndex]?.name : 'Carregando Exercício...'}
                             </h4>
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="p-4 bg-white rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Séries</p>
                             <p className="text-2xl font-black text-slate-900">{exercises[currentExIndex]?.sets || '-'}</p>
                          </div>
                          <div className="p-4 bg-white rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reps</p>
                             <p className="text-2xl font-black text-slate-900">{exercises[currentExIndex]?.reps || '-'}</p>
                          </div>
                          <div className="p-4 bg-white rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carga</p>
                             <p className="text-2xl font-black text-blue-600">{exercises[currentExIndex]?.load || '-'}</p>
                          </div>
                       </div>

                       {/* Exercise Activity Timer */}
                       {isExerciseActive && (
                        <div className="mb-8 p-6 bg-blue-50 rounded-3xl border-2 border-blue-200 animate-in zoom-in duration-300">
                           <div className="flex items-center justify-center gap-4">
                              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                                 <Play className="w-6 h-6 text-white fill-white animate-pulse" />
                              </div>
                              <div className="text-left">
                                 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Tempo de Execução</p>
                                 <p className="text-4xl font-black text-slate-900 tabular-nums leading-none">{exerciseTimer}s</p>
                              </div>
                           </div>
                        </div>
                       )}

                       <div className="flex flex-col md:flex-row gap-4">
                          <button 
                            onClick={() => {
                              if (!isExerciseActive) {
                                setExerciseTimer(0);
                                setIsExerciseActive(true);
                                setIsTimerRunning(false);
                                setRestTimer(0);
                              } else {
                                setIsExerciseActive(false);
                              }
                            }}
                            className={cn(
                              "flex-1 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl",
                              isExerciseActive ? "bg-blue-600 text-white shadow-blue-600/20" : "bg-white text-blue-600 border-2 border-blue-600 shadow-blue-600/5 hover:bg-blue-50"
                            )}
                          >
                             <Play className={cn("w-5 h-5", isExerciseActive ? "fill-white" : "fill-current")} />
                             {isExerciseActive ? "Finalizar Série" : "Iniciar Série"}
                          </button>

                          <button 
                            onClick={() => {
                               startRest(exercises[currentExIndex]?.rest || '60s');
                               setIsExerciseActive(false);
                            }}
                            className={cn(
                              "flex-1 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl",
                              isTimerRunning ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800"
                            )}
                          >
                             <Timer className={cn("w-5 h-5", isTimerRunning && "animate-spin")} />
                             {isTimerRunning ? `Descansando (${restTimer}s)` : `Marcar Descanso`}
                          </button>
                       </div>

                       <button 
                          onClick={() => {
                             if (exercises[currentExIndex]) toggleDone(exercises[currentExIndex].id);
                             setIsExerciseActive(false);
                             setIsTimerRunning(false);
                             setRestTimer(0);
                             if (currentExIndex < exercises.length - 1) {
                                setCurrentExIndex(prev => prev + 1);
                                setExerciseTimer(0);
                             } else {
                                setIsExecutionMode(false);
                                setIsFinished(true);
                             }
                          }}
                          className="w-full mt-4 py-6 bg-slate-100 text-slate-800 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                       >
                          <CheckCircle2 className="w-5 h-5" />
                          Próximo Exercício
                       </button>
                    </div>

                    {/* Rest Timer Overlay (If active) */}
                    {restTimer > 0 && (
                      <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white flex items-center justify-between animate-in zoom-in duration-300 shadow-2xl shadow-blue-600/30">
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                               <Timer className="w-8 h-8 animate-pulse" />
                            </div>
                            <div>
                               <h5 className="text-2xl font-black italic uppercase tracking-tight">Tempo de Descanso</h5>
                               <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Recupere-se para a próxima série</p>
                            </div>
                         </div>
                         <div className="text-5xl font-black tabular-nums">{restTimer}s</div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8">
                       <button 
                         disabled={currentExIndex === 0}
                         onClick={() => setCurrentExIndex(prev => prev - 1)}
                         className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] disabled:opacity-30"
                       >
                          <ArrowLeft className="w-4 h-4" /> Anterior
                       </button>

                       <div className="flex gap-4">
                          <button 
                            onClick={() => {
                              const url = exercises[currentExIndex].videoUrl;
                              if (url && url !== '#') setSelectedVideoUrl(url);
                              else alert('Vídeo não disponível');
                            }}
                            className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            title="Ver vídeo"
                          >
                             <Play className="w-4 h-4 fill-current" />
                             <span className="text-[10px] font-bold uppercase">Ver</span>
                          </button>

                          <button 
                            onClick={() => setIsExerciseActive(!isExerciseActive)}
                            className={cn(
                              "w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl relative",
                              isExerciseActive 
                                ? "bg-blue-600 text-white shadow-blue-500/30 scale-110" 
                                : "bg-white text-slate-900 border-2 border-slate-100 shadow-slate-200/50 hover:border-blue-200"
                            )}
                          >
                             {isExerciseActive ? (
                               <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 bg-white rounded-full animate-ping mb-1" />
                                  <span className="text-lg font-black tabular-nums">{exerciseTimer}s</span>
                               </div>
                             ) : (
                               <Play className="w-8 h-8 fill-current ml-1" />
                             )}
                          </button>
                       </div>

                       <button 
                         disabled={currentExIndex === exercises.length - 1}
                         onClick={() => setCurrentExIndex(prev => prev + 1)}
                         className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] disabled:opacity-30"
                       >
                          Próximo <ArrowRight className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

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
