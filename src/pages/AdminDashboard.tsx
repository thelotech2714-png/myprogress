import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle,
  MoreVertical,
  ArrowRight,
  Check,
  X,
  Plus,
  CreditCard,
  Loader2,
  Search,
  Filter,
  Bell,
  MessageSquare,
  Send
} from 'lucide-react';
import { cn } from '../utils';
import { FinancialChart } from '../components/FinancialChart';
import { FinancialManagement } from '../components/FinancialManagement';
import { firebaseService } from '../services/firebaseService';
import { db, auth } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface PendingApproval {
  id: string;
  instructorId: string;
  plan: string;
  status: string;
  createdAt: any;
  instructorName?: string;
  instructorEmail?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

interface Message {
  id: string;
  fromId: string;
  fromName: string;
  content: string;
  createdAt: any;
  type: string;
}

const stats = [
  { label: 'Total de Receita', value: 'R$ 145.280', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Alunos Ativos', value: '12.480', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Ticket Médio', value: 'R$ 850', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Alertas Financeiros', value: '3', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const revenueData = [
  { name: 'Jan', value: 95000 },
  { name: 'Fev', value: 102000 },
  { name: 'Mar', value: 115000 },
  { name: 'Abr', value: 128000 },
  { name: 'Mai', value: 135000 },
  { name: 'Jun', value: 145280 },
];

export const AdminDashboard: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [supportMessages, setSupportMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Premium'
  });
  const [editingInstructor, setEditingInstructor] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insData, plansData] = await Promise.all([
        firebaseService.getInstructors(),
        firebaseService.getPlans()
      ]);
      setInstructors(insData as any || []);
      setPlans(plansData?.filter((p: any) => p.active) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;
    setActionLoading(editingInstructor.uid);
    try {
      await firebaseService.updateUserProfile(editingInstructor.uid, {
        name: editingInstructor.name,
        photoURL: editingInstructor.photoURL
      });
      // Also update plan/phone in instructors collection
      await firebaseService.updateInstructorProfile(editingInstructor.uid, {
        phone: editingInstructor.phone,
        plan: editingInstructor.plan
      });
      setEditingInstructor(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar instrutor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('creating');
    try {
      const password = Math.random().toString(36).slice(-8);
      const tempUid = `instr_${Date.now()}`;
      
      await firebaseService.createUserProfile(tempUid, {
        email: newInstructor.email.toLowerCase(),
        name: newInstructor.name,
        role: 'instructor',
        status: 'active'
      });
      
      await firebaseService.registerInstructor(tempUid, {
        phone: newInstructor.phone,
        plan: newInstructor.plan,
        paymentStatus: 'approved'
      });

      setTempPassword(password);
      setNewInstructor({ name: '', email: '', phone: '', plan: 'Premium' });
      await fetchData();
    } catch (error) {
      console.error("Error creating instructor:", error);
      alert('Erro ao cadastrar instrutor.');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for Pending Approvals
    const qApprovals = query(collection(db, 'payment_approvals'), where('status', '==', 'pending'));
    const unsubApprovals = onSnapshot(qApprovals, (snapshot) => {
      setPendingApprovals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PendingApproval[]);
    });

    // Listen for Admin Notifications
    const qNotifs = query(collection(db, 'notifications'), where('toId', '==', 'admin'), orderBy('createdAt', 'desc'), limit(10));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[]);
    });

    // Listen for Support Messages
    const qMsgs = query(collection(db, 'messages'), where('toId', '==', 'admin'), orderBy('createdAt', 'desc'), limit(10));
    const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
      setSupportMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]);
    });

    return () => {
      unsubApprovals();
      unsubNotifs();
      unsubMsgs();
    };
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await firebaseService.approveInstructor(id);
    } catch (error) {
      console.error("Error approving instructor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await firebaseService.markNotificationRead(id);
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    setActionLoading(uid);
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await firebaseService.updateUserStatus(uid, newStatus);
      await fetchData();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const [replyMessage, setReplyMessage] = useState('');
  const [selectedReplyMsg, setSelectedReplyMsg] = useState<Message | null>(null);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReplyMsg || !replyMessage.trim()) return;
    try {
      await firebaseService.sendMessage(selectedReplyMsg.fromId, 'Administrador', replyMessage, 'chat');
      await firebaseService.createNotification(selectedReplyMsg.fromId, 'Resposta do Suporte', 'O administrador respondeu sua mensagem de suporte.');
      setReplyMessage('');
      setSelectedReplyMsg(null);
      alert('Resposta enviada!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportData = () => {
    if (instructors.length === 0) return;
    
    const headers = ['Nome', 'Email', 'Status', 'Criado Em'];
    const csvRows = [
      headers.join(','),
      ...instructors.map(ins => [
        `"${ins.name || ''}"`,
        `"${ins.email || ''}"`,
        `"${ins.status || ''}"`,
        `"${ins.createdAt?.toDate?.()?.toLocaleDateString() || ''}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `instrutores_base_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Gestão Administrativa</h1>
          <p className="text-slate-500 font-medium">Controle total de instrutores, pagamentos e usuários.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => { setShowAddInstructor(true); setTempPassword(null); }}
             className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all uppercase tracking-tight text-xs shadow-lg shadow-blue-200 flex items-center gap-2"
           >
             <Plus className="w-4 h-4" />
             Novo Instrutor
           </button>
           <button 
             onClick={handleExportData}
             className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all uppercase tracking-tight text-xs shadow-lg shadow-slate-200"
           >
             Exportar Dados
           </button>
        </div>
      </div>

      {showAddInstructor && (
        <div className="card-standard p-8 border-2 border-blue-200 bg-blue-50/30 animate-in slide-in-from-top-4 duration-300">
           {tempPassword ? (
             <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase mb-2">Sucesso!</h3>
                <p className="text-slate-500 mb-6 font-medium">Forneça as informações abaixo para o instrutor acessar:</p>
                <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 inline-block text-left mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail Cadastrado</p>
                  <p className="font-mono text-lg font-bold text-slate-900 mb-4">{newInstructor.email}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Senha Temporária</p>
                  <p className="font-mono text-lg font-bold text-blue-600 tracking-widest bg-blue-50 p-2 rounded">{tempPassword}</p>
                </div>
                <div>
                   <button 
                    onClick={() => setShowAddInstructor(false)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                   >
                    Concluir e Fechar
                   </button>
                </div>
             </div>
           ) : (
             <>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cadastrar Novo Instrutor</h3>
                 <button onClick={() => setShowAddInstructor(false)} className="text-slate-400 hover:text-slate-600">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               <form onSubmit={handleCreateInstructor} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      type="text" 
                      value={newInstructor.name}
                      onChange={(e) => setNewInstructor({...newInstructor, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      placeholder="Nome do Instrutor"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                      type="email" 
                      value={newInstructor.email}
                      onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      placeholder="email@instrutor.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                    <input 
                       type="text" 
                       value={newInstructor.phone}
                       onChange={(e) => setNewInstructor({...newInstructor, phone: e.target.value})}
                       className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                       placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plano</label>
                    <select 
                      value={newInstructor.plan}
                      onChange={(e) => setNewInstructor({...newInstructor, plan: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    >
                      {plans.length > 0 ? (
                        plans.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Basic">Basic</option>
                          <option value="Premium">Premium</option>
                          <option value="Enterprise">Enterprise</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                    <button 
                      type="button"
                      onClick={() => setShowAddInstructor(false)}
                      className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={actionLoading === 'creating'}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                    >
                      {actionLoading === 'creating' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cadastro'}
                    </button>
                  </div>
               </form>
             </>
           )}
        </div>
      )}

      {/* Grid for Alertas and Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics and Lists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Notifications & Pending Approvals Bar */}
          {(notifications.length > 0 || pendingApprovals.length > 0) && (
            <div className="flex flex-col gap-4">
              {notifications.filter(n => !n.read).map(notif => (
                <div key={notif.id} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">{notif.title}</p>
                      <p className="text-sm font-medium">{notif.message}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {pendingApprovals.map((ins) => (
                <div key={ins.id} className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight">Pagamento Pendente: {ins.instructorName || ins.id}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Plano {ins.plan} aguardando liberação</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleApprove(ins.id)}
                      disabled={!!actionLoading}
                      className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading === ins.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4" />}
                      Aprovar
                    </button>
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.slice(0, 2).map((stat) => (
              <div key={stat.label} className="card-standard p-8 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-4 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <FinancialChart 
            data={revenueData} 
            title="Performance Financeira" 
            color="#2563eb" 
          />
          
          <div className="card-standard p-8">
             <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Instrutores na Base</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gestão de profissionais ativos</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instructors.slice(0, 4).map((ins) => (
                  <div key={ins.uid} className="p-6 rounded-3xl border border-slate-100 bg-white hover:border-blue-200 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                                   {ins.photoURL ? (
                                     <img src={ins.photoURL} alt={ins.name} className="w-full h-full object-cover" />
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Users className="w-6 h-6" />
                                     </div>
                                   )}
                                </div>
                                <div>
                                   <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ins.name || 'Sem Nome'}</h4>
                                   <p className="text-[10px] font-medium text-slate-400">{ins.email}</p>
                                </div>
                             </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                         <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                            ins.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                          )}>
                            {ins.status === 'active' ? 'Ativo' : 'Bloqueado'}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                const details = await firebaseService.getInstructorDetails(ins.uid);
                                setEditingInstructor({
                                  ...ins,
                                  phone: details?.phone || '',
                                  plan: details?.plan || 'Premium'
                                });
                              }}
                              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(ins.uid, ins.status)}
                              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:underline"
                            >
                              {ins.status === 'active' ? 'Bloquear' : 'Ativar'}
                            </button>
                          </div>
                      </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Messages and Feed */}
        <div className="space-y-8">
           {/* Support Messages Panel */}
           <div className="card-standard p-8 bg-slate-900 text-white border-slate-800 shadow-2xl shadow-slate-200">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Suporte ao Instrutor</h3>
                 </div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              </div>

              <div className="space-y-6">
                 {supportMessages.length === 0 ? (
                   <p className="text-slate-500 text-sm italic font-medium">Nenhuma mensagem recente.</p>
                 ) : (
                   supportMessages.map(msg => (
                     <div key={msg.id} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{msg.fromName}</span>
                           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            {msg.createdAt?.toDate?.() ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Nov'}
                           </span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed">{msg.content}</p>
                        <div className="mt-4 flex justify-end">
                           <button 
                             onClick={() => setSelectedReplyMsg(msg)}
                             className="text-[10px] font-black text-white px-3 py-1.5 bg-blue-600 rounded-lg uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50"
                           >
                              Responder
                              <Send className="w-3 h-3" />
                           </button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* Stats Small cards */}
           <div className="space-y-6">
              {stats.slice(2).map((stat) => (
                <div key={stat.label} className="card-standard p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           {/* Activity Feed */}
           <div className="card-standard p-8">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Atividade de Acesso</h3>
              <div className="space-y-6">
                 {instructors.map((ins, i) => (
                   <div key={ins.uid + i} className="flex gap-4">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">
                          <span className="text-blue-600">Instrutor {ins.name}</span> realizou acesso administrativo.
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hoje às {10 + i}:{i * 5}</p>
                      </div>
                   </div>
                 )).slice(0, 5)}
              </div>
           </div>
        </div>
      </div>
      {/* Reply Modal */}
      {selectedReplyMsg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Responder Suporte</h3>
               <button onClick={() => setSelectedReplyMsg(null)} className="text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl mb-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mensagem de {selectedReplyMsg.fromName}</p>
               <p className="text-sm font-medium text-slate-600">{selectedReplyMsg.content}</p>
            </div>
            <form onSubmit={handleSendReply} className="space-y-4">
               <textarea 
                 value={replyMessage}
                 onChange={(e) => setReplyMessage(e.target.value)}
                 placeholder="Sua resposta..."
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium h-32 resize-none text-sm"
                 required
               />
               <button 
                 type="submit"
                 className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
               >
                 <Send className="w-4 h-4" />
                 Enviar Resposta
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Instructor Modal */}
      {editingInstructor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Editar Instrutor</h3>
               <button onClick={() => setEditingInstructor(null)} className="text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <form onSubmit={handleUpdateInstructor} className="space-y-4">
               <div className="flex justify-center mb-6">
                  <div className="relative group">
                     <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner">
                        {editingInstructor.photoURL ? (
                          <img src={editingInstructor.photoURL} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Users className="w-8 h-8" />
                          </div>
                        )}
                     </div>
                     <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-all">
                        <Plus className="w-4 h-4" />
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
                                setEditingInstructor({...editingInstructor, photoURL: base64});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                     </label>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                  <input 
                    type="text" 
                    value={editingInstructor.name}
                    onChange={(e) => setEditingInstructor({...editingInstructor, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    required
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                  <input 
                    type="text" 
                    value={editingInstructor.phone}
                    onChange={(e) => setEditingInstructor({...editingInstructor, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                  />
               </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plano</label>
                  <select 
                    value={editingInstructor.plan}
                    onChange={(e) => setEditingInstructor({...editingInstructor, plan: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                  >
                    {plans.length > 0 ? (
                      plans.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                        <option value="Enterprise">Enterprise</option>
                      </>
                    )}
                  </select>
               </div>
               <button 
                 type="submit"
                 disabled={!!actionLoading}
                 className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4"
               >
                 {actionLoading === editingInstructor.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                 Salvar Alterações
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
