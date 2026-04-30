/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole, User } from './types/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { cn } from './lib/utils';
import { 
  Clock, 
  AlertCircle, 
  Loader2, 
  Activity, 
  X, 
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  BookOpen
} from 'lucide-react';
import { SignupPage } from './pages/SignupPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UsersPage } from './pages/UsersPage';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentManagement } from './components/StudentManagement';
import { ChatAssistant } from './components/ChatAssistant';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseService } from './services/firebaseService';

import { AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Timeout fallback for loading state
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth check timed out, forcing loading to false');
        setIsLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await firebaseService.getUserProfile(fbUser.uid);
          if (profile) {
            const email = fbUser.email?.toLowerCase() || '';
            
            // Hardcoded overrides for reliability during testing
            let finalRole: UserRole;
            const admins = ['thelo.tech2714@gmail.com', 'jeferson.executiva.net@gmail.com'];

            if (admins.includes(email)) {
              finalRole = UserRole.ADMIN;
            } else {
              // Fallback to database profile or student
              const profileRole = (profile.role || '').toLowerCase();
              if (profileRole === 'admin') finalRole = UserRole.ADMIN;
              else if (profileRole === 'instructor') finalRole = UserRole.INSTRUCTOR;
              else finalRole = UserRole.STUDENT;
            }

            console.log(`Auth Update: User ${email} assigned role ${finalRole}`);

            setUser({
              id: fbUser.uid,
              name: profile.name || email.split('@')[0] || 'Usuário',
              email: email,
              role: finalRole,
              status: (profile.status || 'active') as 'active' | 'pending' | 'blocked'
            });
          } else {
            console.warn('No profile found for logged in user:', fbUser.uid);
            // If it's one of our test accounts, we'll let it stay null so LoginPage can offer to fix it
            setUser(null);
            // If the user was just redirected and has no profile, sign them out to be safe
            // but only if they are not in the login page
            if (window.location.pathname !== '/login') {
              await auth.signOut();
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogin = (role: UserRole, email: string) => {
    // Note: handleLogin in LoginPage already sets the fbUser via firebase auth
    // The onAuthStateChanged listener above will pick it up and set the App's user state
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium tracking-tight">Carregando portal...</p>
        </div>
      </div>
    );
  }

  // Feedback Screen for Pending/Blocked users
  if (user && (user.status === 'pending' || user.status === 'blocked')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className={cn(
            "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6",
            user.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
          )}>
            {user.status === 'pending' ? <Clock className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">
            {user.status === 'pending' ? 'Conta em Análise' : 'Conta Suspensa'}
          </h2>
          
          <p className="text-slate-600 mb-8 leading-relaxed font-medium">
            {user.status === 'pending' 
              ? 'Recebemos seu cadastro! Nossa equipe administrativa está validando seu pagamento PIX para liberar seu acesso. Isso costuma levar alguns minutos.' 
              : 'Detectamos uma irregularidade ou falta de pagamento em sua assinatura. Entre em contato com o suporte para regularizar sua situação.'}
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              Verificar Status Agora
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="w-full py-4 bg-white text-slate-400 font-bold rounded-xl hover:text-slate-600 transition-all border border-slate-100"
            >
              Sair da Conta
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ID: {user.id.substring(0, 8)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <div key={location.pathname}>
          <Routes location={location}>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to={`/${user.role.toLowerCase()}`} replace /> : <LoginPage onLogin={handleLogin} />} 
            />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
                <DashboardLayout userRole={UserRole.ADMIN}>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="settings" element={<div className="bg-white p-8 rounded-2xl border border-slate-200">Configurações do Sistema</div>} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes */}
          <Route
            path="/instructor/*"
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.INSTRUCTOR]}>
                <DashboardLayout userRole={UserRole.INSTRUCTOR}>
                  <Routes>
                    <Route index element={<InstructorDashboard />} />
                    <Route path="students" element={<StudentManagement />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}>
                <DashboardLayout userRole={UserRole.STUDENT}>
                  <Routes>
                    <Route index element={<StudentDashboard />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <h1 className="text-4xl font-bold text-red-600">403</h1>
              <p className="text-slate-600 mt-2 text-center">Desculpe, você não tem permissão para acessar esta página.</p>
              <button 
                onClick={() => setUser(null)}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
              >
                Voltar ao Início
              </button>
            </div>
          } />
        </Routes>
      </div>
    </AnimatePresence>
    <ChatAssistant />
  </div>
);
}

