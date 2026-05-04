import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  FileText, 
  Clock, 
  Award,
  MoreHorizontal,
  ChevronRight,
  Zap,
  TrendingUp,
  BookOpen,
  Dumbbell,
  Settings,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Activity,
  X,
  Camera,
  Droplets,
  Home,
  MessageSquare,
  Users
} from 'lucide-react';
import { cn } from '../utils';
import { xpUseCase } from '../domain/useCases/xpUseCase';
import { firebaseService } from '../services/firebaseService';

import { RunningActivity } from '../components/RunningActivity';
import { RunningTracker } from '../components/RunningTracker';
import { DietSection } from '../components/DietSection';
import { StudentWorkout } from '../components/StudentWorkout';
import { RankingSection } from '../components/RankingSection';
import { StudentBooking } from '../components/StudentBooking';
import { PoseDetectionCamera } from '../components/PoseDetectionCamera';
import { WaterTracker } from '../components/WaterTracker';
import { HomeWorkout } from '../components/HomeWorkout';

import { auth, db } from '../services/firebase';
import { onSnapshot, collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { useAuthStore, useProfileStore } from '../store/useStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { profile, setProfile } = useProfileStore();
  const [aiTip, setAiTip] = useState("Carregando sua dica personalizada...");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const levelInfo = xpUseCase.calculateLevel(profile?.points || 0);

  const stats = [
    { label: 'Pontos Totais', value: profile?.points?.toLocaleString() || '0', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Treinos Realizados', value: '12', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Level Atual', value: levelInfo.level.toString(), icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'XP para Próximo', value: (levelInfo.xpForNext - levelInfo.xpInLevel).toLocaleString(), icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const fetchAiTip = async () => {
    if (!profile) return;
    setIsGenerating(true);
    setAiTip("Nossa IA está analisando seu desempenho para criar uma orientação exclusiva...");
    try {
      const tip = await wellnessUseCase.getPersonalizedTip(profile);
      setAiTip(tip);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const [isFullStatsOpen, setIsFullStatsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isHomeWorkoutOpen, setIsHomeWorkoutOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressPhotos, setProgressPhotos] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchProgressPhotos = async () => {
    if (auth.currentUser) {
      const photos = await firebaseService.getProgressPhotos(auth.currentUser.uid);
      setProgressPhotos(photos || []);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    
    setUploadingPhoto(true);
    try {
      // Simulate file upload by converting to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Check size roughly
        if (base64String.length > 800000) {
           alert('A imagem é muito grande. Por favor escolha uma foto menor que 500KB.');
           setUploadingPhoto(false);
           return;
        }
        await firebaseService.saveProgressPhoto(auth.currentUser!.uid, base64String, type);
        await fetchProgressPhotos();
        alert('Foto salva com sucesso!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    fetchAiTip();
    fetchProgressPhotos();
    
    if (user) {
      // Real-time listener for profile (points, etc)
      const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        }
      });

      const q = query(
        collection(db, 'messages'), 
        where('toId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Error fetching messages:", error);
      });
      return () => {
        unsubscribe();
        unsubProfile();
      };
    }
  }, [user]);

  const handleProfilePhotoUpdate = async () => {
    try {
      const info = await Device.getInfo();
      if (info.platform === 'web') {
        document.getElementById('profile-photo-input')?.click();
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'base64',
        width: 500,
        height: 500
      });

      if (image.base64String && user) {
        const photoBase64 = `data:image/${image.format};base64,${image.base64String}`;
        await firebaseService.updateUserProfile(user.uid, { photoURL: photoBase64 });
      }
    } catch (err) {
      console.error('Error taking photo:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div 
              className="w-16 h-16 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-lg cursor-pointer"
              onClick={handleProfilePhotoUpdate}
            >
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Users className="w-8 h-8" />
                </div>
              )}
            </div>
            <label 
              onClick={handleProfilePhotoUpdate}
              className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-all"
            >
              <Camera className="w-3 h-3" />
              <input 
                id="profile-photo-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const base64 = reader.result as string;
                    if (base64.length > 800000) return alert('Foto muito grande.');
                    await firebaseService.updateUserProfile(user.uid, { photoURL: base64 });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Olá, {profile?.name || user?.email?.split('@')[0] || 'Atleta'}!</h1>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-widest">Lvl {levelInfo.level}</span>
                <div className="flex-1 w-32 sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000" 
                    style={{ width: `${levelInfo.progress}%` }} 
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-400 tabular-nums uppercase">{levelInfo.xpInLevel.toLocaleString()} / {levelInfo.xpForNext.toLocaleString()} XP</span>
              </div>
              <p className="text-slate-500 text-sm">Próximo nível em {(levelInfo.xpForNext - levelInfo.xpInLevel).toLocaleString()} pontos.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsProgressModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-tight flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            <Camera className="w-4 h-4" />
            Antes e Depois
          </button>
          {messages.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-2xl animate-bounce">
               <MessageSquare className="w-4 h-4 text-blue-600" />
               <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Nova mensagem</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-standard p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Messages from Instructor */}
      {messages.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Últimas Mensagens do Instrutor
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {messages.map(msg => (
                <div key={msg.id} className="p-6 bg-white border-2 border-blue-100 rounded-3xl shadow-lg shadow-blue-500/5">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{msg.fromName}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{msg.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                   </div>
                   <p className="text-sm font-medium text-slate-700 leading-relaxed">{msg.content}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* AI Intelligence Center */}
      <div className="card-standard p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white border-none shadow-xl shadow-indigo-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-500/20 p-2 rounded-lg">
                   <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">MyProgress AI Insight</h3>
             </div>
             
             <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent rounded-full opacity-50" />
                <p className="text-lg md:text-xl font-medium leading-relaxed italic text-slate-100 pl-4">
                  "{aiTip}"
                </p>
             </div>

             <div className="flex flex-wrap gap-4 mt-8">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Foco: Performance Híbrida</span>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                   <TrendingUp className="w-3 h-3 text-blue-400" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sugestão: Priorizar Descanso</span>
                </div>
             </div>
          </div>

          <div className="shrink-0">
             <button 
               onClick={fetchAiTip}
               disabled={isGenerating}
               className="button-primary bg-indigo-600 hover:bg-indigo-500 border-none px-8 py-4 rounded-2xl flex items-center gap-3 group disabled:opacity-50"
             >
               {isGenerating ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
               )}
               <span className="text-sm font-bold tracking-tight">Nova Orientação</span>
             </button>
          </div>
        </div>
      </div>

      {/* Quick Access Grid - Under MyProgress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <button 
           onClick={() => setIsWaterModalOpen(true)}
           className="group relative overflow-hidden card-standard p-1 border-none shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 text-left"
         >
            <div className="bg-white p-6 rounded-[calc(2rem-4px)] flex items-center justify-between h-full">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative">
                     <div className="absolute inset-0 bg-blue-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity" />
                     <Droplets className="w-8 h-8 fill-blue-600" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">Hidratação</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gerenciar consumo</p>
                  </div>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <ArrowRight className="w-5 h-5" />
               </div>
            </div>
         </button>

         <button 
           onClick={() => setIsBookingModalOpen(true)}
           className="group relative overflow-hidden card-standard p-1 border-none shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 text-left"
         >
            <div className="bg-white p-6 rounded-[calc(2rem-4px)] flex items-center justify-between h-full">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative">
                     <div className="absolute inset-0 bg-purple-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity" />
                     <Clock className="w-8 h-8 fill-purple-600" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">Agenda</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Marcar sessões</p>
                  </div>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                  <ArrowRight className="w-5 h-5" />
               </div>
            </div>
         </button>

         <button 
           onClick={() => setIsHomeWorkoutOpen(true)}
           className="group relative overflow-hidden card-standard p-1 border-none shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 text-left"
         >
            <div className="bg-white p-6 rounded-[calc(2rem-4px)] flex items-center justify-between h-full">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative">
                     <div className="absolute inset-0 bg-indigo-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity" />
                     <Home className="w-8 h-8 fill-indigo-600" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">Treino em Casa</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Peso do corpo e objetos</p>
                  </div>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  <ArrowRight className="w-5 h-5" />
               </div>
            </div>
         </button>
      </div>

      {/* Running Tracker Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600 fill-orange-600" />
                Sessão de Corrida Ativa
             </h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Tempo Real</span>
          </div>
          <RunningTracker />
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Award className="w-5 h-5 text-blue-600 fill-blue-600" />
                 Conquistas e Ranking
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Social</span>
           </div>
           <RankingSection />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Dumbbell className="w-5 h-5 text-blue-600 fill-blue-600" />
                 Meu Plano de Treino
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Musculação</span>
           </div>
           <StudentWorkout />
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                  <Camera className="w-5 h-5 text-white" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900">Treinar com IA Vision</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contador de reps e correção em tempo real</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-200">Beta Labs</span>
            </div>
         </div>
         
         <div className="card-standard overflow-hidden border-none shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
               <div className="lg:col-span-3">
                  <PoseDetectionCamera />
               </div>
               <div className="p-6 md:p-8 bg-slate-50 flex flex-col justify-between">
                  <div>
                     <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Instruções</h4>
                     <ul className="space-y-4">
                        {[
                           "Fique a 2-3 metros da câmera",
                           "Certifique-se de que todo o seu corpo está visível",
                           "Use roupas que contrastem com o fundo",
                           "Aguarde o feedback da IA para validar a repetição"
                        ].map((step, i) => (
                           <li key={i} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black">{i+1}</span>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">{step}</p>
                           </li>
                        ))}
                     </ul>
                  </div>
                  
                  <div className="mt-8 p-6 bg-indigo-600 rounded-2xl text-white">
                     <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Dica de Performance</p>
                     <p className="text-xs font-bold leading-relaxed">O modelo Thunder (Thunder Pose) é otimizado para precisão, ideal para detectar ângulos de agachamento.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-indigo-600" />
               Aulas em Destaque
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Conteúdo</span>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for featured classes if needed, or just removed the old booking */}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="card-standard p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-900 font-sans">Atividades de Corrida</h3>
                 <button 
                   onClick={() => setIsHistoryOpen(true)}
                   className="text-orange-600 text-xs font-bold hover:underline flex items-center gap-1 uppercase tracking-widest"
                 >
                    Ver Detalhes 
                    <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <RunningActivity 
                    distance="10.4"
                    pace="5:12"
                    time="54:12"
                    date="Hoje às 07:12"
                    elevation="120"
                    type="Morning Run"
                 />
                 <RunningActivity 
                    distance="5.2"
                    pace="4:58"
                    time="25:52"
                    date="Ontem às 18:30"
                    elevation="45"
                    type="Night Run"
                 />
              </div>
           </div>

           <DietSection />
        </div>

        <div className="card-standard p-8 bg-slate-900 text-white border-none">
           <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-slate-400 border-b border-white/10 pb-4">Desempenho Semanal</h3>
           <div className="space-y-6">
              {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="w-px h-12 bg-white/20" />
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-slate-300">Tarefa {i}</span>
                          <span className="text-[10px] font-bold text-emerald-400">APROVADO</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }}></div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           <button 
             onClick={() => setIsFullStatsOpen(true)}
             className="w-full mt-12 py-4 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 uppercase tracking-widest"
           >
             Estatísticas Completas
           </button>
        </div>
      </div>
      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Histórico de Atividades
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Suas últimas corridas</p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                id="close-history-modal"
              >
                <X className="w-5 h-5 sm:w-6 s:m-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
              {[
                { date: 'Hoje, 07:12', title: 'Morning Run', dist: '10.4km', pace: '5:12/km', time: '54:12' },
                { date: 'Ontem, 18:30', title: 'Night Run', dist: '5.2km', pace: '4:58/km', time: '25:52' },
                { date: '25 Abr, 06:45', title: 'Trail Training', dist: '12.8km', pace: '6:05/km', time: '1:18:12' },
                { date: '23 Abr, 19:15', title: 'Intervalado', dist: '8.0km', pace: '4:30/km', time: '36:00' },
                { date: '21 Abr, 07:00', title: 'Longão de Terça', dist: '21.1km', pace: '5:45/km', time: '2:01:15' },
              ].map((run, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-orange-100 transition-all bg-slate-50/50">
                  <div className="flex items-center gap-2 sm:gap-4 truncate">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 text-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-orange-600" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{run.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{run.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-8 ml-2">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-black text-slate-900">{run.dist}</p>
                      <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Dist.</p>
                    </div>
                    <div className="text-right hidden xs:block">
                      <p className="text-xs sm:text-sm font-black text-slate-900">{run.pace}</p>
                      <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Pace</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-black text-slate-900">{run.time}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Tempo</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Water Tracker Modal (New Page Feel) */}
      {isWaterModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[5000] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:h-auto md:max-w-4xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 duration-500 max-h-[95vh]">
            <div className="p-4 sm:p-8 bg-blue-600 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3 sm:gap-4">
                  <button 
                    onClick={() => setIsWaterModalOpen(false)}
                    className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl hidden md:flex items-center justify-center backdrop-blur-md">
                    <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-3xl font-black italic tracking-tight uppercase">Hidratação</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em]">Página de Controle Diário</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 sm:gap-4">
                 <button 
                   onClick={() => setIsWaterModalOpen(false)}
                   className="hidden md:flex items-center gap-2 px-4 sm:px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
                 </button>
                 <button 
                   onClick={() => setIsWaterModalOpen(false)}
                   className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all"
                 >
                   <X className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar flex flex-col items-center">
               <div className="w-full max-w-lg pb-12 md:pb-0">
                  <WaterTracker standalone={false} />
               </div>
            </div>


          </div>
        </div>
      )}

      {/* Booking Modal (New Page Feel) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[5000] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:h-[90vh] md:max-w-5xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-6 md:p-8 bg-purple-600 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3 sm:gap-4">
                  <button 
                    onClick={() => setIsBookingModalOpen(false)}
                    className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="w-10 sm:w-14 h-10 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl hidden md:flex items-center justify-center backdrop-blur-md">
                    <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-3xl font-black italic tracking-tight uppercase">Agenda</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-purple-100 uppercase tracking-[0.2em]">Página de Reservas de Aula</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 sm:gap-4">
                 <button 
                   onClick={() => setIsBookingModalOpen(false)}
                   className="hidden md:flex items-center gap-2 px-4 sm:px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
                 </button>
                 <button 
                   onClick={() => setIsBookingModalOpen(false)}
                   className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all"
                 >
                   <X className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-12 custom-scrollbar">
               <StudentBooking />
            </div>


          </div>
        </div>
      )}
      {/* Home Workout Modal */}
      {isHomeWorkoutOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[5000] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:h-[95vh] md:max-w-6xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-6 md:p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3 sm:gap-4">
                  <button 
                    onClick={() => setIsHomeWorkoutOpen(false)}
                    className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="w-10 sm:w-14 h-10 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl hidden md:flex items-center justify-center backdrop-blur-md">
                    <Home className="w-6 sm:w-8 h-6 sm:h-8 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-3xl font-black italic tracking-tight uppercase">Treino em Casa</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-indigo-100 uppercase tracking-[0.2em]">Peso do corpo e objetos</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 sm:gap-4">
                 <button 
                   onClick={() => setIsHomeWorkoutOpen(false)}
                   className="hidden md:flex items-center gap-2 px-4 sm:px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
                 </button>
                 <button 
                   onClick={() => setIsHomeWorkoutOpen(false)}
                   className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all"
                 >
                   <X className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-12 custom-scrollbar">
               <HomeWorkout />
            </div>
          </div>
        </div>
      )}

      {/* Progress Photos Modal */}
      {isProgressModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[5000] flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 max-h-[90vh]">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Evolução: Antes e Depois</h3>
                  <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest bg-white/10 inline-block px-3 py-1 rounded-full mt-1">Acompanhe seus resultados visuais</p>
               </div>
               <button onClick={() => setIsProgressModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Before Section */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-4 h-4 text-indigo-600" />
                           Fotos "Antes"
                        </h4>
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer hover:underline">
                           Adicionar Foto
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} />
                        </label>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {progressPhotos.filter(p => p.type === 'before').length === 0 ? (
                          <div className="col-span-2 aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                             <Camera className="w-8 h-8 mb-2 opacity-20" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma foto</p>
                          </div>
                        ) : (
                          progressPhotos.filter(p => p.type === 'before').map(photo => (
                            <div key={`${photo.id}-before`} className="group relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                               <img src={photo.url} className="w-full h-full object-cover" alt="Before" />
                               <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                  <p className="text-[8px] font-bold text-white uppercase tracking-widest">{photo.date?.toDate?.()?.toLocaleDateString()}</p>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>

                  {/* After Section */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <Zap className="w-4 h-4 text-emerald-600" />
                           Fotos "Depois"
                        </h4>
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest cursor-pointer hover:underline">
                           Adicionar Foto
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} />
                        </label>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {progressPhotos.filter(p => p.type === 'after').length === 0 ? (
                          <div className="col-span-2 aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                             <Camera className="w-8 h-8 mb-2 opacity-20" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma foto</p>
                          </div>
                        ) : (
                          progressPhotos.filter(p => p.type === 'after').map(photo => (
                            <div key={`${photo.id}-after`} className="group relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                               <img src={photo.url} className="w-full h-full object-cover" alt="After" />
                               <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                  <p className="text-[8px] font-bold text-white uppercase tracking-widest">{photo.date?.toDate?.()?.toLocaleDateString()}</p>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button 
                 onClick={() => setIsProgressModalOpen(false)}
                 className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
               >
                 Fechar Galeria
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Stats Modal */}
      {isFullStatsOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[6000] flex items-center justify-center p-4">
           <div className="bg-slate-50 w-full max-w-5xl h-full md:h-[90vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-500">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                       <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tight italic">Estatísticas Completas</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relatório Detalhado de Performance</p>
                    </div>
                 </div>
                 <button onClick={() => setIsFullStatsOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                 {/* Top Charts */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                       <div className="flex justify-between items-center mb-8">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Volume Semanal (KG)</h4>
                          <Zap className="w-4 h-4 text-orange-500" />
                       </div>
                       <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={[
                                { day: 'Seg', volume: 1200 },
                                { day: 'Ter', volume: 2100 },
                                { day: 'Qua', volume: 1800 },
                                { day: 'Qui', volume: 2400 },
                                { day: 'Sex', volume: 1100 },
                                { day: 'Sáb', volume: 2900 },
                                { day: 'Dom', volume: 800 },
                             ]}>
                                <defs>
                                   <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                <RechartsTooltip 
                                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                   labelStyle={{ fontWeight: 'black', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                       <div className="flex justify-between items-center mb-8">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Frequência Mensal</h4>
                          <Activity className="w-4 h-4 text-emerald-500" />
                       </div>
                       <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={[
                                { week: 'Semana 1', treinos: 5 },
                                { week: 'Semana 2', treinos: 4 },
                                { week: 'Semana 3', treinos: 6 },
                                { week: 'Semana 4', treinos: 5 },
                             ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                <RechartsTooltip 
                                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                   cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="treinos" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>

                 {/* Detailed Metrics List */}
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Evolução de Cargas (Principais)</h4>
                    <div className="space-y-6">
                       {[
                          { name: 'Supino Reto', initial: '40kg', current: '75kg', evolution: '+87%', color: 'blue' },
                          { name: 'Agachamento Livre', initial: '50kg', current: '110kg', evolution: '+120%', color: 'emerald' },
                          { name: 'Puxada Frontal', initial: '35kg', current: '60kg', evolution: '+71%', color: 'orange' },
                          { name: 'Leg Press 45', initial: '120kg', current: '240kg', evolution: '+100%', color: 'purple' },
                       ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                             <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center font-black`}>
                                   {item.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Início: {item.initial}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-lg font-black text-slate-900">{item.current}</p>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{item.evolution}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="p-8 bg-white border-t border-slate-100 flex justify-end">
                 <button 
                   onClick={() => setIsFullStatsOpen(false)}
                   className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]"
                 >
                   Fechar Relatório
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
