import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Loader2,
  Zap,
  DollarSign,
  Wallet,
  Activity,
  Calendar,
  Trophy,
  Target,
  X,
  MessageSquare,
  Send,
  Bell,
  Headphones
} from 'lucide-react';
import { cn } from '../lib/utils';
import { generateInstructorInsights } from '../services/geminiService';
import { FinancialChart } from '../components/FinancialChart';
import { RunningActivity } from '../components/RunningActivity';
import { firebaseService } from '../services/firebaseService';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const earningsData = [
  { name: 'Jan', value: 3200 },
  { name: 'Fev', value: 3800 },
  { name: 'Mar', value: 3500 },
  { name: 'Abr', value: 4100 },
  { name: 'Mai', value: 4250 },
  { name: 'Jun', value: 4800 },
];

import { ExerciseLibrary } from '../components/ExerciseLibrary';
import { PhysicalAssessment } from '../components/PhysicalAssessment';
import { CalendarManagement } from '../components/CalendarManagement';

interface Student {
  id: string;
  name: string;
  email: string;
  plan: 'Mensal' | 'Trimestral' | 'Anual';
  status: 'Ativo' | 'Inativo';
  joinDate: string;
}

export const InstructorDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    activeRate: "92%",
    pendingTasks: 4
  });
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState({
    engagementInsight: "Recuperando dados de engajamento...",
    riskAlert: "Analisando riscos de evasão..."
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showFinancialStatement, setShowFinancialStatement] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [selectedChatStudent, setSelectedChatStudent] = useState<Student | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [sendingSupport, setSendingSupport] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
    photoURL: auth.currentUser?.photoURL || ''
  });

  const stats = [
    { label: 'Total de Alunos', value: '48', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Saldo Atual', value: 'R$ 4.250', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Km Médio Alunos', value: '82', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Alertas Pendentes', value: metrics.pendingTasks.toString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setAiInsights({
      engagementInsight: "Analisando métricas de engajamento...",
      riskAlert: "Processando dados de risco..."
    });
    try {
      const data = await generateInstructorInsights({
        className: "React Avançado",
        studentsCount: 48,
        activeRate: metrics.activeRate,
        pendingTasks: metrics.pendingTasks
      });
      setAiInsights(data);
      console.log("AI Insights updated successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');

  useEffect(() => {
    // Fetch students from Firestore
    const fetchStudents = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, 'students'), where('instructorId', '==', auth.currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const students = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.data().email?.split('@')[0] || 'Aluno',
            email: doc.data().email || '',
            plan: doc.data().plan || 'Mensal',
            status: doc.data().status === 'active' ? 'Ativo' : 'Inativo',
            joinDate: doc.data().createdAt?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0]
          })) as Student[];
          setRegisteredStudents(students);
          localStorage.setItem('myprogress_students_data', JSON.stringify(students));
        }, (error) => {
          console.error("Error fetching students:", error);
        });
        return unsubscribe;
      }
    };

    let unsubStudents: (() => void) | undefined;
    
    fetchStudents().then(unsub => {
      unsubStudents = unsub;
    });

    handleGenerateAI();

    // Listen for Instructor Notifications and Messages
    if (auth.currentUser) {
      const qNotifs = query(
        collection(db, 'notifications'), 
        where('toId', '==', auth.currentUser.uid), 
        orderBy('createdAt', 'desc'), 
        limit(5)
      );
      const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Error fetching notifications:", error);
      });

      const qMsgs = query(
        collection(db, 'messages'),
        where('toId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Error fetching messages:", error);
      });

      return () => {
        unsubNotifs();
        unsubMsgs();
        if (unsubStudents) unsubStudents();
      };
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsGenerating(true);
    try {
      await firebaseService.updateUserProfile(auth.currentUser.uid, {
        name: profileData.name,
        photoURL: profileData.photoURL
      });
      setIsEditingProfile(false);
      alert('Perfil atualizado com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar perfil.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail || !auth.currentUser) return;
    
    setIsGenerating(true);
    try {
      if (registeredStudents.some(s => s.email === newStudentEmail)) {
        alert('Aluno já cadastrado!');
        return;
      }
      
      const instructorId = auth.currentUser.uid;
      const studentName = newStudentEmail.split('@')[0];
      
      // Save to Firestore
      await firebaseService.registerStudent(instructorId, {
        email: newStudentEmail,
        name: studentName,
        plan: 'Mensal'
      });
      
      setNewStudentEmail('');
      alert('Aluno matriculado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao matricular aluno.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSendingSupport(true);
    try {
      const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Instrutor';
      await firebaseService.sendMessage('admin', userName, supportMessage, 'support');
      setSupportMessage('');
      setShowSupportModal(false);
      alert('Mensagem enviada ao suporte!');
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar mensagem.');
    } finally {
      setSendingSupport(false);
    }
  };

  const handleSendMessageToStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatStudent || !chatMessage.trim()) return;
    try {
      const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Instrutor';
      await firebaseService.sendMessage(selectedChatStudent.id, userName, chatMessage, 'chat');
      setChatMessage('');
      setSelectedChatStudent(null);
      alert('Mensagem enviada ao aluno!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveStudent = (id: string) => {
    const updated = registeredStudents.filter(s => s.id !== id);
    setRegisteredStudents(updated);
    localStorage.setItem('myprogress_students_data', JSON.stringify(updated));
    localStorage.setItem('myprogress_registered_students', JSON.stringify(updated.map(s => s.email)));
  };

  const handleExportStudents = () => {
    if (registeredStudents.length === 0) return;
    const headers = ['Nome', 'Email', 'Plano', 'Status', 'Data de Adesão'];
    const csvRows = [
      headers.join(','),
      ...registeredStudents.map(s => [
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.plan}"`,
        `"${s.status}"`,
        `"${s.joinDate}"`
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `meus_alunos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFinance = () => {
    const transactions = [
      { desc: 'Mensalidade Aluno - Ana Luiza', val: '180,00', date: '28 Abr', type: 'Crédito' },
      { desc: 'Mensalidade Aluno - Bruno Silva', val: '180,00', date: '27 Abr', type: 'Crédito' },
      { desc: 'Saque para Conta Bancária', val: '-1500,00', date: '25 Abr', type: 'Débito' },
      { desc: 'Plano Anual - Mariana Santos', val: '1800,00', date: '22 Abr', type: 'Crédito' },
      { desc: 'Bônus Performance Março', val: '450,00', date: '10 Abr', type: 'Crédito' },
      { desc: 'Mensalidade Aluno - Carlos Ed.', val: '180,00', date: '08 Abr', type: 'Crédito' },
    ];
    const headers = ['Descrição', 'Valor', 'Data', 'Tipo'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(tx => [
        `"${tx.desc}"`,
        `"${tx.val}"`,
        `"${tx.date}"`,
        `"${tx.type}"`
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `extrato_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);

  const handleSaveWorkout = async () => {
    if (!selectedStudent || !auth.currentUser) return;
    
    // Find student ID by name (this is a bit hacky, but the state only has 'name')
    // Actually, registeredStudents has the ID
    const student = registeredStudents.find(s => s.name === selectedStudent);
    if (!student) {
      alert('Aluno não encontrado para salvar treino.');
      return;
    }

    setIsGenerating(true);
    try {
      // Map exercises to the format expected by StudentWorkout
      const workoutData = {
        A: selectedExercises.map((ex, i) => ({
          id: ex.id,
          name: ex.name,
          sets: 4,
          reps: '10-12',
          load: 'A ajustar',
          rest: '60s',
          done: false,
          videoUrl: ex.videoUrl || '#'
        })),
        B: [],
        C: []
      };

      await firebaseService.saveStudentWorkout(student.id, workoutData);
      alert('Treino salvo e enviado para o aluno!');
      setSelectedExercises([]);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar treino.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAISuggestion = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    try {
      // Simulate AI generation by taking some exercises from the library
      // In a real app, this would use Gemini
      const suggestedExercises = [
         { id: '1', name: 'Agachamento com Barra', videoUrl: 'https://www.youtube.com/embed/SW_C1A-rejs' },
         { id: '2', name: 'Supino Reto', videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw' },
         { id: '3', name: 'Remada Curvada', videoUrl: 'https://www.youtube.com/embed/RQU8wZ6v_f0' }
      ];
      setSelectedExercises(suggestedExercises);
      alert('Sugestão de treino gerada! Revise abaixo e salve.');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
           <div className="relative">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                 {auth.currentUser?.photoURL ? (
                   <img src={auth.currentUser.photoURL} alt="Instructor" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Users className="w-8 h-8" />
                   </div>
                 )}
              </div>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all"
              >
                 <Zap className="w-3 h-3" />
              </button>
           </div>
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Portal do Instrutor</h1>
             <p className="text-slate-500">Olá, {auth.currentUser?.displayName || 'Instrutor'}. Gerencie suas aulas.</p>
           </div>
        </div>
        <div className="flex bg-slate-50 p-2 rounded-xl border border-slate-200 gap-2">
           <button 
             onClick={() => setShowSupportModal(true)}
             className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-2"
           >
             <Headphones className="w-3 h-3" />
             Suporte
           </button>
           <button 
             onClick={() => setMetrics(m => ({ ...m, pendingTasks: Math.max(0, m.pendingTasks - 1) }))}
             className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50"
           >
             - Alertas
           </button>
           <button 
             onClick={() => setMetrics(m => ({ ...m, pendingTasks: m.pendingTasks + 1 }))}
             className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50"
           >
             + Alertas
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-standard p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="card-standard p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-900 font-sans">Monitoramento de Atletas</h3>
                 <button 
                    onClick={() => setShowDetailedReport(true)}
                    className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1 uppercase tracking-widest"
                 >
                    Relatório Detalhado
                    <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                 <div className="space-y-4">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Top Performance - Ana Luiza</p>
                    <RunningActivity 
                        distance="12.8"
                        pace="4:45"
                        time="1:00:12"
                        date="Hoje às 06:15"
                        elevation="150"
                        type="Morning Run"
                    />
                 </div>
                 <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Recuperação - Bruno Silva</p>
                    <RunningActivity 
                        distance="4.2"
                        pace="6:30"
                        time="27:20"
                        date="Ontem às 19:00"
                        elevation="20"
                        type="Trail Run"
                    />
                 </div>
              </div>
           </div>

           <div className="card-standard p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-900 font-sans">Ganhos e Performance</h3>
                 <button 
                   onClick={() => setShowFinancialStatement(true)}
                   className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1 uppercase tracking-widest"
                 >
                    Extrato Completo 
                    <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                 {[
                   { label: 'Aulas Dadas', value: '32', target: '40' },
                   { label: 'Horas Totais', value: '64h', target: '80h' },
                   { label: 'Bônus Mensal', value: 'R$ 450', target: 'R$ 500' }
                 ].map((metric, i) => (
                   <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{metric.label}</p>
                      <div className="flex justify-between items-end">
                         <h4 className="text-lg sm:text-xl font-bold text-slate-800">{metric.value}</h4>
                         <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">Meta: {metric.target}</span>
                      </div>
                      <div className="mt-3 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <FinancialChart 
             data={earningsData} 
             title="Evolução de Ganhos" 
             color="#10b981" 
           />

            <div className="card-standard p-8">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900 font-sans">Gestão de Alunos</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{registeredStudents.length} Ativos</span>
                    <div className="w-px h-3 bg-slate-200" />
                    <button 
                      onClick={handleExportStudents}
                      className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      Exportar Lista
                    </button>
                  </div>
               </div>
               
               <form onSubmit={handleRegisterStudent} className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="flex-1 relative">
                    <input 
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="E-mail do novo aluno..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Matricular Aluno
                  </button>
               </form>
 
               <div className="space-y-4">
                  {registeredStudents.length > 0 ? (
                    registeredStudents.map((student) => (
                      <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:border-slate-200 gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center font-black text-lg shadow-sm">
                               {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{student.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Plano {student.plan}</span>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    student.status === 'Ativo' ? "text-emerald-500" : "text-amber-500"
                                  )}>
                                    {student.status === 'Ativo' ? 'Acesso Liberado' : 'Acesso Bloqueado'}
                                  </span>
                                </div>
                             </div>
                         </div>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => setSelectedChatStudent(student)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Enviar Mensagem"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                const updated = registeredStudents.map(s => s.id === student.id ? { ...s, status: s.status === 'Ativo' ? 'Inativo' : 'Ativo' } : s);
                                setRegisteredStudents(updated as any);
                                localStorage.setItem('myprogress_students_data', JSON.stringify(updated));
                              }}
                              className={cn(
                                "flex-1 sm:flex-none px-4 py-2 border text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest",
                                student.status === 'Ativo' ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                              )}
                            >
                               {student.status === 'Ativo' ? 'Bloquear' : 'Liberar'}
                            </button>
                            <button 
                              onClick={() => handleRemoveStudent(student.id)}
                              className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Remover Aluno"
                            >
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                       <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                       <p className="text-sm text-slate-400 font-medium italic">Matricule seu primeiro aluno para começar.</p>
                    </div>
                  )}
               </div>
            </div>

           <div className="card-standard p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 font-sans">Próximas Avaliações</h3>
              <div className="space-y-4">
                 {registeredStudents.slice(0, 3).map((student, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all gap-4">
                       <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-center min-w-[60px] sm:min-w-16">
                             <p className="text-[8px] sm:text-xs font-bold text-emerald-600 uppercase mb-1">Avaliação</p>
                             <p className="text-xl sm:text-2xl font-black text-slate-900">1{i+2}/Mai</p>
                          </div>
                          <div className="h-10 w-px bg-slate-100 hidden xs:block" />
                          <div>
                             <p className="font-bold text-slate-800 text-base sm:text-lg leading-tight">Bioimpedância & Medidas</p>
                             <div className="flex items-center gap-3 mt-1 text-slate-500 font-medium text-[10px] sm:text-xs">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {student.name}</span>
                             </div>
                          </div>
                       </div>
                       <button className="w-full sm:w-auto px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-lg text-xs hover:bg-emerald-600 hover:text-white transition-all">Iniciar PDF</button>
                    </div>
                 ))}
              </div>
           </div>

           {selectedStudent && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 px-2">
                   <div className="w-2 h-8 bg-blue-600 rounded-full" />
                   <h2 className="text-xl font-black text-slate-900">Gestão Individual: {selectedStudent}</h2>
                </div>
                
                <PhysicalAssessment />
                <ExerciseLibrary />
                
                <div className="card-standard p-8 bg-slate-900 text-white border-none">
                   <div className="flex items-center gap-3 mb-6">
                      <Zap className="w-6 h-6 text-blue-400 fill-blue-400" />
                      <h3 className="text-lg font-bold">Prescrição Inteligente (IA)</h3>
                   </div>
                   {selectedExercises.length > 0 && (
                      <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                         <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Treino Sugerido:</p>
                         <div className="flex flex-wrap gap-2">
                            {selectedExercises.map(ex => (
                               <span key={ex.id} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold border border-white/5 uppercase tracking-tight">{ex.name}</span>
                            ))}
                         </div>
                         <button 
                           onClick={handleSaveWorkout}
                           disabled={isGenerating}
                           className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                         >
                            {isGenerating ? 'Salvando...' : 'Confirmar e Enviar Treino'}
                         </button>
                      </div>
                   )}
                   <p className="text-slate-400 text-sm leading-relaxed mb-8">
                      Clique abaixo para que a IA gere uma sugestão de progressão de carga e novos exercícios baseados no histórico de {selectedStudent}.
                   </p>
                   <button 
                     onClick={handleGenerateAISuggestion}
                     disabled={isGenerating}
                     className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                   >
                     <Zap className="w-4 h-4" /> {isGenerating ? 'Analisando...' : 'Gerar Sugestão de Treino A/B/C'}
                   </button>
                </div>
             </div>
           )}

           <div className="card-standard p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Próximas Aulas (Centros)</h3>
              <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="text-center min-w-16">
                            <p className="text-xs font-bold text-blue-600 uppercase">Seg</p>
                            <p className="text-2xl font-black text-slate-900">0{i+4}</p>
                         </div>
                         <div className="h-10 w-px bg-slate-100" />
                         <div>
                            <p className="font-bold text-slate-800 text-lg">Desenvolvimento em React</p>
                            <div className="flex items-center gap-3 mt-1 text-slate-500 font-medium text-xs">
                               <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 24 Alunos</span>
                               <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Módulo 03</span>
                            </div>
                         </div>
                      </div>
                      <button className="px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-lg text-xs hover:bg-blue-600 hover:text-white transition-all">Iniciar Aula</button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <CalendarManagement />

           <div className="card-standard p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-blue-600/30">
              <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-blue-100">Dicas da IA</h3>
              <div className="space-y-6">
                 <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-sm font-bold mb-2 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-emerald-400" />
                       Insight de Engajamento
                    </p>
                    <p className="text-xs text-blue-50 leading-relaxed font-medium">
                       {aiInsights.engagementInsight}
                    </p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-sm font-bold mb-2 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4 text-amber-400" />
                       Alerta de Risco
                    </p>
                    <p className="text-xs text-blue-50 leading-relaxed font-medium">
                       {aiInsights.riskAlert}
                    </p>
                 </div>
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full mt-12 py-4 bg-white text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Atualizar Insights de IA'
                )}
              </button>
           </div>
        </div>
      </div>

      {showDetailedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-5xl h-full sm:h-auto sm:max-h-[95vh] rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-4 sm:p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black italic tracking-tight">RELATÓRIO DETALHADO</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Análise de Performance • Abril 2024</p>
                  </div>
               </div>
               <button 
                 onClick={() => setShowDetailedReport(false)}
                 className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all"
               >
                 <X className="w-5 h-5 sm:w-6 s:m-6" />
               </button>
            </div>
            
            <div className="overflow-y-auto p-4 sm:p-8 space-y-8 custom-scrollbar">
               <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: 'Volume Total', value: '1.240 km', sub: '+12% vs Março', icon: Activity, color: 'text-blue-600' },
                    { label: 'Treinos Concluídos', value: '412', sub: '94% de adesão', icon: CheckCircle2, color: 'text-emerald-600' },
                    { label: 'Pace Médio Geral', value: '5:12 /km', sub: '-15s melhora', icon: Zap, color: 'text-orange-600' },
                    { label: 'Pras de Recordes', value: '28', sub: 'Novos RPs batidos', icon: Trophy, color: 'text-amber-600' }
                  ].map((stat, i) => (
                    <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                       <div className="flex items-center gap-3 mb-4">
                          <stat.icon className={cn("w-4 h-4", stat.color)} />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                       </div>
                       <h4 className="text-xl font-black text-slate-900">{stat.value}</h4>
                       <p className="text-[10px] font-bold text-slate-500 mt-1">{stat.sub}</p>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Tendência de Performance (Últimos 30 dias)
                     </h4>
                     <div className="h-64 bg-slate-50 rounded-3xl border border-slate-100 flex items-end justify-between p-6 gap-2">
                        {[45, 60, 48, 72, 85, 65, 90, 80, 95, 100].map((h, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <div 
                                className="w-full bg-blue-500 rounded-lg transition-all hover:bg-blue-600 shadow-lg shadow-blue-500/10"
                                style={{ height: `${h}%` }}
                              />
                              <span className="text-[8px] font-bold text-slate-400">D{i+1}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        Status de Objetivos da Turma
                     </h4>
                     <div className="space-y-4">
                        {[
                          { name: 'Meia Maratona (Maio)', progress: 75, count: 12 },
                          { name: 'Redução de BF% (Q2)', progress: 40, count: 24 },
                          { name: 'Melhora no VO2 Max', progress: 90, count: 18 },
                          { name: 'Manutenção de Ritmo', progress: 65, count: 8 }
                        ].map((goal, i) => (
                           <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                              <div className="flex justify-between items-center mb-2">
                                 <p className="text-sm font-bold text-slate-800">{goal.name}</p>
                                 <span className="text-[10px] font-black text-slate-400">{goal.count} Alunos</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                 <div 
                                   className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"
                                   style={{ width: `${goal.progress}%` }}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Users className="w-4 h-4 text-orange-500" /> 
                     Ranking de Engajamento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {['Ana Luiza', 'Carlos Eduardo', 'Mariana Santos'].map((name, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-blue-200 transition-all">
                           <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs italic">
                              #{i+1}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Score: {98 - (i*3)} XP</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Última atualização: Hoje 10:45</span>
               </div>
               <button 
                 onClick={() => window.print()}
                 className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
               >
                 Exportar PDF
               </button>
            </div>
          </div>
        </div>
      )}

      {showFinancialStatement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[95vh] rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-4 sm:p-8 bg-emerald-600 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase">EXTRATO FINANCEIRO</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-emerald-100 uppercase tracking-[0.2em]">Histórico de Transações • 2024</p>
                  </div>
               </div>
               <button 
                 onClick={() => setShowFinancialStatement(false)}
                 className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all"
               >
                 <X className="w-5 h-5 sm:w-6 s:m-6" />
               </button>
            </div>
            
            <div className="overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar">
               <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4">
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Saldo Protegido</p>
                     <h4 className="text-2xl font-black text-slate-900">R$ 4.250,00</h4>
                  </div>
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Mensal</p>
                     <h4 className="text-2xl font-black text-slate-900">R$ 3.820,00</h4>
                  </div>
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recebido</p>
                     <h4 className="text-2xl font-black text-slate-900">R$ 22.450,00</h4>
                  </div>
               </div>

               <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Transações Recentes</h4>
                  {[
                    { desc: 'Mensalidade Aluno - Ana Luiza', val: '+ R$ 180,00', date: '28 Abr', type: 'in' },
                    { desc: 'Mensalidade Aluno - Bruno Silva', val: '+ R$ 180,00', date: '27 Abr', type: 'in' },
                    { desc: 'Saque para Conta Bancária', val: '- R$ 1.500,00', date: '25 Abr', type: 'out' },
                    { desc: 'Plano Anual - Mariana Santos', val: '+ R$ 1.800,00', date: '22 Abr', type: 'in' },
                    { desc: 'Bônus Performance Março', val: '+ R$ 450,00', date: '10 Abr', type: 'in' },
                    { desc: 'Mensalidade Aluno - Carlos Ed.', val: '+ R$ 180,00', date: '08 Abr', type: 'in' },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            tx.type === 'in' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}>
                             {tx.type === 'in' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800">{tx.desc}</p>
                             <p className="text-[10px] font-medium text-slate-400">{tx.date} • Confirmado</p>
                          </div>
                       </div>
                       <p className={cn(
                         "text-sm font-black italic",
                         tx.type === 'in' ? "text-emerald-600" : "text-red-500"
                       )}>
                         {tx.val}
                       </p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visualizando últimos 30 dias</p>
               <div className="flex gap-3">
                 <button 
                   onClick={handleExportFinance}
                   className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all font-sans"
                 >
                   Exportar CSV
                 </button>
                 <button 
                   onClick={() => setShowFinancialStatement(false)}
                   className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all font-sans"
                 >
                   Fechar
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Suporte ao Admin</h3>
               </div>
               <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-white">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
               {messages.length > 0 && (
                 <div className="space-y-4 mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Respostas do Suporte</p>
                    <div className="space-y-3">
                      {messages.map(msg => (
                        <div key={msg.id} className="p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl shadow-sm">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{msg.fromName}</span>
                              <span className="text-[9px] text-slate-400 font-bold">{msg.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                           </div>
                           <p className="text-sm font-medium text-slate-700 leading-relaxed">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               <div className="space-y-4">
                 <p className="text-sm text-slate-500 font-medium ml-1">Descreva seu problema ou solicitação abaixo:</p>
                 <form onSubmit={handleSendSupport} className="space-y-4">
                    <textarea 
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Como podemos ajudar?"
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium h-32 resize-none text-sm transition-all shadow-inner"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={sendingSupport}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                      {sendingSupport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar Mensagem
                    </button>
                 </form>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Message Modal */}
      {selectedChatStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                  {selectedChatStudent.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mensagem para {selectedChatStudent.name}</h3>
              </div>
              <button onClick={() => setSelectedChatStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSendMessageToStudent} className="space-y-4">
              <textarea 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium h-32 resize-none text-sm"
                required
              />
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                <Send className="w-4 h-4" />
                Enviar para Aluno
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[5000] flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
               <h3 className="text-2xl font-black uppercase tracking-tight italic">Meu Perfil</h3>
               <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
               <div className="flex justify-center">
                  <div className="relative group">
                     <div className="w-32 h-32 bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                        {profileData.photoURL ? (
                          <img src={profileData.photoURL} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Users className="w-12 h-12" />
                          </div>
                        )}
                     </div>
                     <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-blue-700 transition-all border-4 border-white">
                        <Zap className="w-5 h-5" />
                        <input 
                           type="file" 
                           className="hidden" 
                           accept="image/*"
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onloadend = () => {
                                 const base64 = reader.result as string;
                                 if (base64.length > 800000) return alert('Imagem muito grande.');
                                 setProfileData(prev => ({ ...prev, photoURL: base64 }));
                               };
                               reader.readAsDataURL(file);
                             }
                           }}
                        />
                     </label>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                     <input 
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 outline-none text-sm font-bold transition-all"
                        placeholder="Seu nome..."
                        required
                     />
                  </div>
                  <div className="space-y-1.5 opacity-60">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail (Não editável)</label>
                     <input 
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none text-sm font-bold cursor-not-allowed"
                     />
                  </div>
               </div>

               <button 
                 type="submit"
                 disabled={isGenerating}
                 className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
               >
                 {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                 Salvar Alterações
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notifications (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.filter(n => !n.read).map(notif => (
          <div key={notif.id} className="pointer-events-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-right-8 duration-300 max-w-xs transition-all hover:scale-105">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{notif.title}</p>
                <p className="text-xs font-medium line-clamp-2">{notif.message}</p>
              </div>
            </div>
            <button 
              onClick={() => firebaseService.markNotificationRead(notif.id)}
              className="p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
