import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, Users, BookOpen, School, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types/auth';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseService } from '../services/firebaseService';

interface LoginPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  const roles = [
    { id: UserRole.ADMIN, label: 'Administrador', icon: Shield, desc: 'Gestão central de instrutores e controle financeiro do sistema.' },
    { id: UserRole.INSTRUCTOR, label: 'Instrutor', icon: Users, desc: 'Entrega de currículo e métricas de sucesso dos alunos.' },
    { id: UserRole.STUDENT, label: 'Aluno', icon: BookOpen, desc: 'Acesso às aulas, materiais e acompanhamento de progresso.' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check Profile and Status
      const profile = await firebaseService.getUserProfile(user.uid);
      
      if (!profile) {
        // Special case for the system owner if profile wasn't created yet for some reason
        if (email.toLowerCase() === 'thelo.tech2714@gmail.com') {
          await firebaseService.createUserProfile(user.uid, {
            email: email.toLowerCase(),
            name: 'Dono do Sistema',
            role: 'admin',
            status: 'active'
          });
          onLogin(selectedRole, email);
          return;
        }
        throw new Error('Perfil do usuário não encontrado no sistema.');
      }

      const userRole = (profile.role || '').toLowerCase();
      const targetRole = selectedRole.toLowerCase();

      // Verify role (admins can access any role view for testing)
      if (userRole !== targetRole && userRole !== 'admin') {
        throw new Error(`Seu perfil é de "${userRole}", mas você está tentando acessar como "${targetRole}".`);
      }

      // Check account status for non-admins
      if (profile.role !== 'admin') {
        if (profile.status === 'pending') {
          throw new Error('Sua conta ainda está pendente de aprovação. Verifique se o pagamento PIX foi realizado.');
        }
        if (profile.status === 'blocked') {
          throw new Error('Sua conta foi suspensa por motivos de segurança ou falta de pagamento.');
        }
      }

      // 3. Success -> Notify App and Navigate (App handled by onLogin for now)
      onLogin(selectedRole, email);
    } catch (err: any) {
      let msg = err.message || 'Falha na autenticação.';
      
      if (err.code === 'auth/network-request-failed') {
        msg = 'Erro de rede: Não foi possível conectar aos servidores Firebase. Verifique sua conexão com a internet ou se seu navegador/rede bloqueia o domínio Google.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Sua conta foi bloqueada temporariamente devido a muitas tentativas. Tente novamente mais tarde.';
      }

      setError(msg);
      console.error('Firebase Auth Error:', err.code, err.message);
      auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        {/* Left Side: Branding */}
        <div className="bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white text-blue-600 flex items-center justify-center rounded-xl font-bold text-xl">
                M
              </div>
              <span className="text-xl font-bold tracking-tight">MYPROGRESS</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              Educação que <br />
              <span className="text-blue-200">transforma</span> vidas.
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Acompanhe seu progresso, gerencie suas turmas e alcance seus objetivos com nossa plataforma integrada.
            </p>
          </div>
          
          <div className="relative z-10 pt-12 border-t border-blue-500/50">
             <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-blue-100">+2.4k usuários ativos</span>
             </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Right Side: Form */}
        <div className="p-6 md:p-12 lg:p-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo</h2>
            <p className="text-slate-500">Selecione seu perfil para acessar o portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-shake">
                {error}
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 text-left transition-all group",
                    selectedRole === role.id 
                      ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-600/10" 
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <role.icon className={cn("w-5 h-5 mb-2 transition-colors", selectedRole === role.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <div className="space-y-0.5">
                    <span className={cn("font-bold text-sm block transition-colors", selectedRole === role.id ? "text-blue-600" : "text-slate-900")}>
                      {role.label}
                    </span>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {role.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                required
              />
              <div className="relative">
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  required
                />
                <div className="mt-2 flex justify-end items-center gap-2">
                  {resetLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                  {resetSuccess ? (
                    <div className="flex flex-col items-end animate-in fade-in zoom-in duration-300">
                      <span className="text-[10px] font-bold text-emerald-600">
                        ✓ E-mail enviado!
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">
                        Verifique também sua caixa de spam.
                      </span>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={async () => {
                        if (!email) {
                          setError('Por favor, insira o seu e-mail acima para recuperar a senha.');
                          return;
                        }
                        try {
                          setResetLoading(true);
                          setError('');
                          await firebaseService.resetPassword(email);
                          setResetSuccess('check');
                          setTimeout(() => setResetSuccess(''), 10000); // Clear after 10s
                        } catch (err: any) {
                          console.error("Reset password error:", err);
                          let msg = 'Erro ao enviar e-mail de recuperação.';
                          if (err.code === 'auth/user-not-found') msg = 'Nenhum usuário encontrado com este e-mail.';
                          if (err.code === 'auth/invalid-email') msg = 'E-mail inválido.';
                          setError(msg);
                        } finally {
                          setResetLoading(false);
                        }
                      }}
                      disabled={resetLoading}
                      className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Esqueci minha senha
                    </button>
                    )}
                </div>
              </div>
            </div>

             {error && (
               <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl animate-in fade-in slide-in-from-top-2">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 <p className="text-xs font-bold">{error}</p>
               </div>
             )}

             <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Acessar Portal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-slate-500 text-sm">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  className="text-blue-600 font-bold hover:underline"
                  onClick={() => navigate('/signup')}
                >
                  Se inscreva como instrutor
                </button>
              </p>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400">
            <span className="text-xs">© 2024 Myprogress Systems</span>
            <div className="flex gap-4">
               <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Ajuda</span>
               <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Privacidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
