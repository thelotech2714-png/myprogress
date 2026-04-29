import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Dumbbell, 
  Home, 
  Package, 
  CheckCircle2, 
  Clock,
  Flame,
  Zap,
  ChevronRight,
  ChevronLeft,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  sessionType: 'Aquecimento' | 'Treino' | 'Cardio' | 'Finisher';
  duration: number; // in seconds
  reps?: string;
  series?: string;
  calories: number;
  category: string;
  image: string;
}

const ALL_EXERCISES: Exercise[] = [
  // --- INICIANTE ---
  {
    id: 'ini-1',
    name: 'Corda ou Polichinelos',
    description: 'Aquecimento cardiovascular leve para preparar o corpo.',
    equipment: ['Peso corporal'],
    level: 'Iniciante',
    sessionType: 'Aquecimento',
    duration: 120,
    reps: 'Tempo',
    calories: 20,
    category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1533682805518-48d1f5b8cd3a?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-2',
    name: 'Mobilidade Articular',
    description: 'Movimentos circulares controlados para ombros, quadril e tornozelos.',
    equipment: ['Peso corporal'],
    level: 'Iniciante',
    sessionType: 'Aquecimento',
    duration: 120,
    reps: 'Contínuo',
    calories: 5,
    category: 'Mobilidade',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-treino-1',
    name: 'Agachamento Livre',
    description: 'Mantenha o peito erguido e desça até as coxas ficarem paralelas ao chão.',
    equipment: ['Peso corporal'],
    level: 'Iniciante',
    sessionType: 'Treino',
    duration: 60,
    series: '3x12',
    reps: '12 reps',
    calories: 15,
    category: 'Pernas',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2158?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-treino-2',
    name: 'Flexão com Joelhos',
    description: 'Apoie os joelhos no colchonete. Mantenha o corpo em linha reta e desça o peito.',
    equipment: ['Peso corporal', 'Colchonete'],
    level: 'Iniciante',
    sessionType: 'Treino',
    duration: 45,
    series: '3x10',
    reps: '10 reps',
    calories: 12,
    category: 'Peito',
    image: 'https://images.unsplash.com/photo-1598971639058-aba3c394314c?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-treino-3',
    name: 'Remada com Faixa',
    description: 'Prenda a faixa em um local firme e puxe os cotovelos para trás, contraindo as costas.',
    equipment: ['Faixa elástica'],
    level: 'Iniciante',
    sessionType: 'Treino',
    duration: 50,
    series: '3x12',
    reps: '12 reps',
    calories: 10,
    category: 'Costas',
    image: 'https://images.unsplash.com/photo-1517130591127-93a9cc3e6154?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-treino-4',
    name: 'Elevação Pélvica',
    description: 'Deitado no colchonete, levante o quadril contraindo bem os glúteos.',
    equipment: ['Peso corporal', 'Colchonete'],
    level: 'Iniciante',
    sessionType: 'Treino',
    duration: 45,
    series: '3x15',
    reps: '15 reps',
    calories: 12,
    category: 'Glúteos',
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-treino-5',
    name: 'Desenvolvimento com Halteres',
    description: 'Empurre os halteres acima da cabeça mantendo as costas retas.',
    equipment: ['Halteres'],
    level: 'Iniciante',
    sessionType: 'Treino',
    duration: 50,
    series: '3x12',
    reps: '12 reps',
    calories: 15,
    category: 'Ombros',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7471b?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-treino-6',
    name: 'Prancha',
    description: 'Mantenha o corpo reto e o abdômen contraído.',
    equipment: ['Peso corporal', 'Colchonete'],
    level: 'Iniciante',
    sessionType: 'Treino',
    duration: 20,
    series: '3x',
    reps: '20s',
    calories: 10,
    category: 'Core',
    image: 'https://images.unsplash.com/photo-1566241142559-40e1bfc26cb4?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ini-cardio-1',
    name: 'Corda Final',
    description: 'Fechamento com alta intensidade.',
    equipment: ['Corda'],
    level: 'Iniciante',
    sessionType: 'Cardio',
    duration: 60,
    series: '3x',
    reps: '1 min',
    calories: 30,
    category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=800&auto=format&fit=crop&q=60'
  },

  // --- INTERMEDIÁRIO ---
  {
    id: 'int-1',
    name: 'Corda Concentrada',
    description: 'Aquecimento cardio focado em ritmo.',
    equipment: ['Corda'],
    level: 'Intermediário',
    sessionType: 'Aquecimento',
    duration: 180,
    reps: '3 min',
    calories: 40,
    category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1533682805518-48d1f5b8cd3a?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-treino-1',
    name: 'Agachamento Goblet',
    description: 'Segure o kettlebell junto ao peito e agache controladamente.',
    equipment: ['Kettlebell'],
    level: 'Intermediário',
    sessionType: 'Treino',
    duration: 60,
    series: '4x12',
    reps: '12 reps',
    calories: 25,
    category: 'Pernas',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-treino-2',
    name: 'Flexão Tradicional',
    description: 'Corpo em linha reta, desça o peito e empurre o chão.',
    equipment: ['Peso corporal'],
    level: 'Intermediário',
    sessionType: 'Treino',
    duration: 50,
    series: '4x12',
    reps: '12 reps',
    calories: 20,
    category: 'Peito',
    image: 'https://images.unsplash.com/photo-1598971639058-aba3c394314c?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-treino-3',
    name: 'Remada Unilateral',
    description: 'Puxe o halter em direção ao quadril, mantendo as costas estabilizadas.',
    equipment: ['Halteres'],
    level: 'Intermediário',
    sessionType: 'Treino',
    duration: 45,
    series: '4x10',
    reps: '10/lado',
    calories: 18,
    category: 'Costas',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7471b?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-treino-4',
    name: 'Afundo com Halteres',
    description: 'Dê um passo à frente segurando os halteres ao lado do corpo.',
    equipment: ['Halteres'],
    level: 'Intermediário',
    sessionType: 'Treino',
    duration: 60,
    series: '3x12',
    reps: '12/perna',
    calories: 28,
    category: 'Pernas',
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-treino-5',
    name: 'Desenvolvimento Militar',
    description: 'Em pé, empurre os halteres explosivamente e desça controlado.',
    equipment: ['Halteres'],
    level: 'Intermediário',
    sessionType: 'Treino',
    duration: 50,
    series: '4x10',
    reps: '10 reps',
    calories: 22,
    category: 'Ombros',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c64b5cc5?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-treino-6',
    name: 'Barra Fixa Negativa',
    description: 'Pule para o topo da barra e desça o mais lento possível.',
    equipment: ['Barra fixa'],
    level: 'Intermediário',
    sessionType: 'Treino',
    duration: 40,
    series: '3x6-8',
    reps: '6-8 reps',
    calories: 25,
    category: 'Costas',
    image: 'https://images.unsplash.com/photo-1596357399117-edddff3044a5?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-treino-7',
    name: 'Prancha Lateral',
    description: 'Apoie o cotovelo e mantenha o quadril elevado.',
    equipment: ['Peso corporal', 'Colchonete'],
    level: 'Intermediário',
    sessionType: 'Treino',
    duration: 30,
    series: '3x',
    reps: '30s/lado',
    calories: 12,
    category: 'Core',
    image: 'https://images.unsplash.com/photo-1566241142559-40e1bfc26cb4?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'int-finisher-1',
    name: 'Burpees Finisher',
    description: 'Finalize o treino com rounds de corda e burpees.',
    equipment: ['Peso corporal', 'Corda'],
    level: 'Intermediário',
    sessionType: 'Finisher',
    duration: 180,
    series: '5 rounds',
    reps: '30s corda/10 burpees',
    calories: 60,
    category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c64b5cc5?w=800&auto=format&fit=crop&q=60'
  },

  // --- AVANÇADO ---
  {
    id: 'adv-1',
    name: 'Corda Intensa',
    description: 'Aquecimento cardio de alta performance.',
    equipment: ['Corda'],
    level: 'Avançado',
    sessionType: 'Aquecimento',
    duration: 300,
    reps: '5 min',
    calories: 60,
    category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1533682805518-48d1f5b8cd3a?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-1',
    name: 'Agachamento Avançado',
    description: 'Use halteres pesados ou kettlebells para sobrecarga.',
    equipment: ['Halteres', 'Kettlebell'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 60,
    series: '5x10',
    reps: '10 reps',
    calories: 40,
    category: 'Pernas',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2158?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-2',
    name: 'Flexão Declinada',
    description: 'Pés no banco para focar na parte superior do peito.',
    equipment: ['Peso corporal', 'Banco'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 50,
    series: '4x15',
    reps: '15 reps',
    calories: 30,
    category: 'Peito',
    image: 'https://images.unsplash.com/photo-1598971639058-aba3c394314c?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-3',
    name: 'Barra Fixa',
    description: 'Puxadas completas com foco em amplitude.',
    equipment: ['Barra fixa'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 60,
    series: '4x',
    reps: 'Máximo reps',
    calories: 35,
    category: 'Costas',
    image: 'https://images.unsplash.com/photo-1598971639058-aba3c394314c?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-4',
    name: 'Terra com Kettlebell',
    description: 'Levante o peso do chão mantendo a coluna neutra.',
    equipment: ['Kettlebell'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 60,
    series: '4x12',
    reps: '12 reps',
    calories: 45,
    category: 'Posterior',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-5',
    name: 'Afundo Búlgaro',
    description: 'Uma perna apoiada no banco atrás, desça o joelho em direção ao chão.',
    equipment: ['Halteres', 'Banco'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 60,
    series: '4x10',
    reps: '10/perna',
    calories: 38,
    category: 'Pernas',
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-6',
    name: 'Remada Curvada',
    description: 'Tronco inclinado, puxe os halteres em direção ao abdômen.',
    equipment: ['Halteres'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 60,
    series: '4x12',
    reps: '12 reps',
    calories: 30,
    category: 'Costas',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7471b?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-7',
    name: 'Swing Explosivo',
    description: 'Potência máxima saindo do quadril com o kettlebell.',
    equipment: ['Kettlebell'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 50,
    series: '4x20',
    reps: '20 reps',
    calories: 50,
    category: 'Posterior',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-8',
    name: 'Prancha Toque Ombro',
    description: 'Na posição de prancha alta, toque o ombro oposto alternadamente.',
    equipment: ['Peso corporal'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 30,
    series: '4x',
    reps: '30s',
    calories: 15,
    category: 'Core',
    image: 'https://images.unsplash.com/photo-1566241142559-40e1bfc26cb4?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-treino-9',
    name: 'Abdominal Infra',
    description: 'Deitado no colchonete, eleve as pernas estendidas e desça sem tocar o chão.',
    equipment: ['Peso corporal', 'Colchonete'],
    level: 'Avançado',
    sessionType: 'Treino',
    duration: 45,
    series: '4x20',
    reps: '20 reps',
    calories: 18,
    category: 'Core',
    image: 'https://images.unsplash.com/photo-1566241142559-40e1bfc26cb4?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'adv-hiit-1',
    name: 'HIIT Final',
    description: 'Rounds de corda intensa e descanso curto.',
    equipment: ['Corda'],
    level: 'Avançado',
    sessionType: 'Cardio',
    duration: 240,
    series: '8 rounds',
    reps: '20s on / 10s off',
    calories: 80,
    category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1533682805518-48d1f5b8cd3a?w=800&auto=format&fit=crop&q=60'
  }
];

const LEVEL_OPTIONS = ['Iniciante', 'Intermediário', 'Avançado'] as const;
const EQUIPMENT_OPTIONS = [
  'Peso corporal', 
  'Halteres', 
  'Kettlebell', 
  'Faixa elástica', 
  'Corda', 
  'Banco', 
  'Barra fixa', 
  'Colchonete'
];

export const HomeWorkout: React.FC = () => {
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('workoutPoints');
    return saved ? parseInt(saved, 10) : 0;
  });

  const getLevelFromPoints = (pts: number): typeof LEVEL_OPTIONS[number] => {
    if (pts >= 2500) return 'Avançado';
    if (pts >= 1000) return 'Intermediário';
    return 'Iniciante';
  };

  const getPointsToNextLevel = (pts: number) => {
    if (pts < 1000) return { next: 1000, current: pts, label: 'Intermediário' };
    if (pts < 2500) return { next: 2500, current: pts, label: 'Avançado' };
    return { next: null, current: pts, label: 'Master' };
  };

  const level = getLevelFromPoints(points);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Peso corporal']);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStartedWorkout, setHasStartedWorkout] = useState(false);

  // Save points to localStorage when they change
  useEffect(() => {
    localStorage.setItem('workoutPoints', points.toString());
  }, [points]);

  // Filter exercises by level and equipment
  const filteredExercises = ALL_EXERCISES.filter(ex => {
    const levelMatch = ex.level === level;
    const equipmentMatch = ex.equipment.every(eq => selectedEquipment.includes(eq));
    return levelMatch && equipmentMatch;
  });

  const currentExercise = filteredExercises[currentExerciseIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (filteredExercises.length > 0 && !hasStartedWorkout) {
      setTimeLeft(filteredExercises[0].duration);
    }
  }, [filteredExercises, hasStartedWorkout]);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleExerciseComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  const handleExerciseComplete = () => {
    if (!currentExercise) return;

    if (!completedExercises.includes(currentExercise.id)) {
      setCompletedExercises(prev => [...prev, currentExercise.id]);
      setTotalCalories(prev => prev + currentExercise.calories);
      
      // Award points
      let ptsToAdd = 25; // Default for Treino
      if (currentExercise.sessionType === 'Aquecimento') ptsToAdd = 10;
      if (currentExercise.sessionType === 'Cardio' || currentExercise.sessionType === 'Finisher') ptsToAdd = 50;
      setPoints(prev => prev + ptsToAdd);
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    setIsActive(false);
    setIsPaused(true);
    
    if (completedExercises.length + 1 === filteredExercises.length) {
      setIsFinished(true);
    } else {
      setTimeout(() => {
        if (!isFinished) nextExercise();
      }, 2000);
    }
  };

  const toggleTimer = () => {
    if (!hasStartedWorkout) setHasStartedWorkout(true);
    setIsActive(true);
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    if (!currentExercise) return;
    setTimeLeft(currentExercise.duration);
    setIsActive(false);
    setIsPaused(true);
  };

  const nextExercise = () => {
    const nextIndex = (currentExerciseIndex + 1) % filteredExercises.length;
    setCurrentExerciseIndex(nextIndex);
    setTimeLeft(filteredExercises[nextIndex].duration);
    setIsActive(false);
    setIsPaused(true);
  };

  const prevExercise = () => {
    const prevIndex = (currentExerciseIndex - 1 + filteredExercises.length) % filteredExercises.length;
    setCurrentExerciseIndex(prevIndex);
    setTimeLeft(filteredExercises[prevIndex].duration);
    setIsActive(false);
    setIsPaused(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleEquipment = (eq: string) => {
    if (selectedEquipment.includes(eq)) {
      if (selectedEquipment.length > 1) {
        setSelectedEquipment(prev => prev.filter(item => item !== eq));
      }
    } else {
      setSelectedEquipment(prev => [...prev, eq]);
    }
    setHasStartedWorkout(false);
    setCurrentExerciseIndex(0);
    setCompletedExercises([]);
    setTotalCalories(0);
    setIsFinished(false);
  };

  const progress = getPointsToNextLevel(points);

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in duration-700">
         <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-12 h-12" />
         </div>
         <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4">Treino Concluído!</h2>
         <p className="text-slate-500 font-bold mb-4 max-w-sm uppercase tracking-widest text-xs">Você dominou o ambiente e transformou sua casa em uma academia.</p>
         
         <div className="bg-indigo-50 px-6 py-4 rounded-2xl mb-12 border border-indigo-100 flex items-center gap-4">
            <Zap className="w-6 h-6 text-indigo-600" />
            <div className="text-left">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total de Pontos d'Evolução</p>
              <h4 className="text-xl font-black text-indigo-900 tracking-tight">{points} XP</h4>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-12">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
               <Flame className="w-6 h-6 text-orange-500 mx-auto mb-3" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queima estimada</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">{totalCalories} kcal</h4>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
               <Zap className="w-6 h-6 text-indigo-500 mx-auto mb-3" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exercícios</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">{filteredExercises.length}</h4>
            </div>
         </div>

         <button 
           onClick={() => window.location.reload()}
           className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
         >
           Fazer Novo Treino
         </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* Progression Status Header */}
      <div className="card-standard p-6 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                  <Zap className={cn(
                    "w-8 h-8",
                    level === 'Iniciante' ? "text-slate-400" :
                    level === 'Intermediário' ? "text-amber-400" : "text-indigo-400"
                  )} />
               </div>
               <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Status de Evolução</h3>
                  <h4 className="text-3xl font-black italic tracking-tighter uppercase">{level}</h4>
               </div>
            </div>

            <div className="flex-1 max-w-md">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progresso de Nível: {points} XP</span>
                  {progress.next && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Próximo: {progress.label}</span>
                  )}
               </div>
               <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  {progress.next ? (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(points / progress.next) * 100}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  )}
               </div>
               <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                 {progress.next ? `Faltam ${progress.next - points} pontos para o nível ${progress.label}` : 'Nível Máximo Atingido!'}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Flame className="w-4 h-4 text-orange-500 mb-2" />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Kcal Hoje</p>
                  <p className="text-lg font-black">{totalCalories}</p>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sessão</p>
                  <p className="text-lg font-black">{completedExercises.length}/{filteredExercises.length}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Configuration Section */}
      {!hasStartedWorkout && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="lg:col-span-4 space-y-6">
            <div className="card-standard p-6 bg-white shadow-lg shadow-slate-200/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-indigo-600" />
                Equipamentos Disponíveis
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Selecione o que você possui em casa para adaptar o treino</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center text-center leading-tight min-h-[60px]",
                      selectedEquipment.includes(eq)
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredExercises.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">Nenhum exercício encontrado</h3>
          <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">Seu nível atual ({level}) pode exigir equipamentos específicos. Tente selecionar mais itens acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Exercise List Sidebar */}
          <div className="lg:col-span-4 card-standard p-4 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/50 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black italic tracking-tight uppercase flex items-center gap-3">
                 <Home className="w-6 h-6 text-indigo-600" />
                 Estrutura do Treino
              </h3>
              <span className={cn(
                "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest",
                level === 'Iniciante' ? "bg-slate-100 text-slate-600" :
                level === 'Intermediário' ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
              )}>
                {level}
              </span>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {['Aquecimento', 'Treino', 'Cardio', 'Finisher'].map(type => {
                const typeExercises = filteredExercises.filter(ex => ex.sessionType === type);
                if (typeExercises.length === 0) return null;

                return (
                  <div key={type} className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{type}</h5>
                    {typeExercises.map((ex) => {
                      const idx = filteredExercises.findIndex(f => f.id === ex.id);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => {
                            setCurrentExerciseIndex(idx);
                            setTimeLeft(ex.duration);
                            setIsActive(false);
                            setIsPaused(true);
                            setHasStartedWorkout(true);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                            currentExerciseIndex === idx 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                              : "bg-slate-50 border-slate-100 text-slate-900 hover:border-indigo-200 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-4 text-left">
                            <span className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black",
                              currentExerciseIndex === idx ? "bg-white/20" : "bg-white shadow-sm"
                            )}>
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="text-sm font-bold truncate max-w-[150px]">{ex.name}</h5>
                              <p className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                currentExerciseIndex === idx ? "text-indigo-200" : "text-slate-400"
                              )}>
                                {ex.series || ex.category} • {ex.duration}s
                              </p>
                            </div>
                          </div>
                          {completedExercises.includes(ex.id) && (
                            <CheckCircle2 className={cn("w-5 h-5", currentExerciseIndex === idx ? "text-white" : "text-emerald-500")} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
               <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-amber-500" />
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Regras de Evolução</h5>
               </div>
               <ul className="text-[10px] text-slate-500 font-bold space-y-2 uppercase tracking-widest">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Aquecimento: +10 XP</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Treino: +25 XP</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Cardio/Finisher: +50 XP</li>
               </ul>
            </div>
          </div>

          {/* Active Exercise Display */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            <div className="card-standard overflow-hidden border-none shadow-2xl shadow-indigo-500/10 bg-white">
              <div className="relative aspect-video">
                <img 
                  src={currentExercise?.image} 
                  alt={currentExercise?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-4">
                   <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                      {currentExercise?.sessionType}
                   </span>
                   <span className={cn(
                     "px-3 py-1 backdrop-blur-md rounded-full text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest border",
                     level === 'Iniciante' ? "bg-slate-600/80 border-slate-400/50" :
                     level === 'Intermediário' ? "bg-amber-600/80 border-amber-400/50" : "bg-indigo-600/80 border-indigo-400/50"
                   )}>
                      {level}
                   </span>
                </div>
   
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                   <div className="flex items-center gap-3 mb-2">
                     {currentExercise?.equipment.map((eq, i) => (
                       <span key={i} className="text-[9px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                         <Dumbbell className="w-3 h-3" /> {eq}
                       </span>
                     ))}
                   </div>
                   <h2 className="text-xl sm:text-3xl font-black text-white italic tracking-tight uppercase mb-1">{currentExercise?.name}</h2>
                   <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">{currentExercise?.description}</p>
                </div>
              </div>
   
              <div className="p-4 sm:p-8">
                <div className="flex flex-col items-center gap-8">
                  {/* Timer Display */}
                  <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray="283"
                        strokeDashoffset={283 * (1 - timeLeft / (currentExercise?.duration || 1))}
                        className={cn(
                          "text-indigo-600 transition-all duration-1000 ease-linear",
                          timeLeft === 0 && isActive && "text-emerald-500",
                          !isActive && "text-indigo-300"
                        )}
                        style={{ strokeDasharray: '283%' }} // Fallback approximation
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter">
                        {formatTime(timeLeft)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">DURAÇÃO</span>
                    </div>
                  </div>
  
                  {/* Stats & Actions */}
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-8 pb-4">
                    <div className="flex gap-10">
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Execução</p>
                          <p className="text-2xl font-black text-slate-900">{currentExercise?.series || currentExercise?.reps || "Tempo"}</p>
                       </div>
                       <div className="w-px h-12 bg-slate-100 hidden sm:block" />
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">XP Estimado</p>
                          <p className="text-lg font-black text-indigo-600 uppercase mt-1">
                            +{currentExercise?.sessionType === 'Aquecimento' ? 10 : currentExercise?.sessionType === 'Treino' ? 25 : 50}
                          </p>
                       </div>
                    </div>
  
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={prevExercise}
                        className="p-5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                        title="Anterior"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      
                      <div className="flex flex-col items-center gap-2">
                        <button 
                          onClick={toggleTimer}
                          className={cn(
                            "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative group overflow-hidden",
                            isPaused 
                              ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/40" 
                              : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/40"
                          )}
                        >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          <div className="relative z-10 flex flex-col items-center">
                            {isPaused ? <Play className="w-10 h-10 fill-white" /> : <Pause className="w-10 h-10 fill-white" />}
                            <span className="text-[10px] font-black mt-1 uppercase tracking-widest">
                              {isPaused ? 'Iniciar' : 'Pausar'}
                            </span>
                          </div>
                        </button>
                      </div>
  
                      <button 
                        onClick={nextExercise}
                        className="p-5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                        title="Próximo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={resetTimer}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-900 transition-all">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest">Reiniciar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                  <Zap className="w-6 h-6" />
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Evolução Inteligente</h5>
                  <p className="text-xs text-amber-800/80 leading-relaxed font-medium">Você está treinando no nível {level}. Conclua este treino para acumular XP e desbloquear o próximo nível de intensidade. Faltam apenas {progress.next ? progress.next - points : 0} pontos!</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
