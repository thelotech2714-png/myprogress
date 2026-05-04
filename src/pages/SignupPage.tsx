import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, User, Mail, Lock, Phone, CreditCard, QrCode, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseService } from '../services/firebaseService';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    plan: ''
  });

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '49',
      features: ['Até 10 alunos', 'Gestão de treinos', 'Materiais básicos']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '99',
      features: ['Alunos ilimitados', 'Insights IA Básicos', 'Relatórios mensais'],
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '199',
      features: ['Insights IA Avançados', 'Suporte prioritário', 'Gestão financeira completa']
    }
  ];

  const handleNextStep = () => setStep(step + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create User with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // 2. Create User Profile in Firestore
      await firebaseService.createUserProfile(user.uid, {
        email: formData.email,
        name: formData.name,
        role: 'instructor'
      });
      
      // 3. Register Instructor Details
      await firebaseService.registerInstructor(user.uid, {
        phone: formData.phone,
        plan: formData.plan
      });
      
      setStep(4); // Go to payment instruction
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step >= i ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-400"
              )}>
                {step > i ? <Check className="w-5 h-5" /> : i}
              </div>
              {i < 4 && (
                <div className={cn(
                  "w-12 h-[2px]",
                  step > i ? "bg-blue-600" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 min-h-[600px] md:h-[600px]">
            <div className="md:col-span-2 bg-[#0F172A] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Check className="text-white w-6 h-6" />
                  </div>
                  <span className="text-xl font-black tracking-tighter uppercase italic">MyProgress</span>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">Escolha seu futuro como instrutor.</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Junte-se a centenas de profissionais que transformaram a forma como gerenciam seus alunos.
                </p>
              </div>

              <div className="relative">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-slate-400 mb-2 font-medium">"A melhor ferramenta para escalar minha assessoria esportiva."</p>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">— Treinador Marcos</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 p-6 sm:p-12">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Dados Pessoais</h3>
                  <p className="text-slate-500 text-sm mb-8">Conte-nos um pouco sobre você.</p>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Nome Completo"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder="E-mail"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Telefone"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleNextStep}
                    disabled={!formData.name || !formData.email || !formData.phone}
                    className="w-full mt-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    Próximo Passo
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Crie sua Senha</h3>
                  <p className="text-slate-500 text-sm mb-8">Sua conta será protegida por criptografia de ponta.</p>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        placeholder="Senha"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleNextStep}
                    disabled={!formData.password}
                    className="w-full mt-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    Escolher Plano
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Escolha seu Plano</h3>
                  <p className="text-slate-500 text-sm mb-6">Selecione a melhor opção para seu momento.</p>
                  
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFormData({...formData, plan: p.id})}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-left transition-all relative group",
                          formData.plan === p.id 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "bg-white border-slate-200 text-slate-900 hover:border-blue-200"
                        )}
                      >
                        {p.popular && (
                          <span className="absolute -top-2 -right-2 bg-amber-400 text-[#0F172A] text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-[#0F172A]">
                            RECOMENDADO
                          </span>
                        )}
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{p.name}</span>
                          <span className={cn("text-lg font-black", formData.plan === p.id ? "text-white" : "text-blue-600")}>
                            R$ {p.price}<span className="text-[10px] font-medium opacity-60">/mês</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {p.features.map((f, i) => (
                             <span key={i} className={cn("text-[9px] font-bold uppercase tracking-tight flex items-center gap-1", formData.plan === p.id ? "text-blue-100" : "text-slate-400")}>
                                <Check className="w-2 h-2" /> {f}
                             </span>
                           ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in zoom-in">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleSubmit}
                    disabled={!formData.plan || loading}
                    className="w-full mt-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Finalizar Cadastro
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right duration-500 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Quase lá!</h3>
                  <p className="text-slate-500 text-sm mb-8">
                    Realize o pagamento via PIX para liberar seu acesso. O administrador liberar seu acesso em até 24h úteis após o pagamento.
                  </p>
                  
                  <div className="w-48 h-48 bg-slate-100 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 mb-6">
                     <QrCode className="w-24 h-24 text-slate-300" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 italic">QR CODE PIX</span>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl w-full">
                    <p className="text-xs text-blue-800 font-bold mb-1">CHAVE PIX (CELULAR):</p>
                    <p className="text-lg font-black text-blue-600">(71) 98456-6306</p>
                    <p className="text-[9px] text-blue-400 uppercase tracking-widest mt-2">Valor do plano: R$ {plans.find(p => p.id === formData.plan)?.price},00</p>
                  </div>

                  <button 
                    onClick={() => navigate('/login')}
                    className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600"
                  >
                    Voltar para o Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
