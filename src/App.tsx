/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole } from './types/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { cn } from './utils';
import { 
  Clock, 
  AlertCircle, 
  Loader2, 
} from 'lucide-react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseService } from './services/firebaseService';
import { useAuthStore } from './store/useStore';

import { AnimatePresence } from 'framer-motion';

// Capacitor Imports
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';

import { PermissionGate } from './components/PermissionGate';

import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for performance
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
const PlansPage = lazy(() => import('./pages/admin/Plans'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard').then(m => ({ default: m.InstructorDashboard })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentManagement = lazy(() => import('./components/StudentManagement').then(m => ({ default: m.StudentManagement })));
const ChatAssistant = lazy(() => import('./components/ChatAssistant').then(m => ({ default: m.ChatAssistant })));

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium tracking-tight">Carregando portal...</p>
    </div>
  </div>
);

export default function App() {
  const { user, setUser, isLoading, setLoading, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await firebaseService.getUserProfile(fbUser.uid);
          if (profile) {
            const email = fbUser.email?.toLowerCase() || '';
            let finalRole: UserRole;
            const admins = ['thelo.tech2714@gmail.com', 'jeferson.executiva.net@gmail.com'];

            if (admins.includes(email)) {
              finalRole = UserRole.ADMIN;
            } else {
              const profileRole = (profile.role || '').toLowerCase();
              if (profileRole === 'admin') finalRole = UserRole.ADMIN;
              else if (profileRole === 'instructor') finalRole = UserRole.INSTRUCTOR;
              else finalRole = UserRole.STUDENT;
            }

            setUser({
              id: fbUser.uid,
              name: profile.name || email.split('@')[0] || 'Usuário',
              email: email,
              role: finalRole,
              status: (profile.status || 'active') as 'active' | 'pending' | 'blocked'
            });
          } else {
            logout();
            if (window.location.pathname !== '/login') {
              await auth.signOut();
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) return <LoadingScreen />;

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
              ? 'Recebemos seu cadastro! Nossa equipe administrativa está validando seu pagamento PIX para liberar seu acesso.' 
              : 'Detectamos uma irregularidade em sua assinatura. Entre em contato com o suporte.'}
          </p>

          <div className="space-y-3">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
              Verificar Status
            </button>
            <button onClick={() => auth.signOut()} className="w-full py-4 bg-white text-slate-400 font-bold rounded-xl border border-slate-100">
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PermissionGate>
        <Suspense fallback={<LoadingScreen />}>
          <div className="relative">
            <AnimatePresence mode="wait">
              <Routes key={location.pathname} location={location}>
                <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route path="/admin/*" element={
                  <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
                    <DashboardLayout userRole={UserRole.ADMIN}>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="plans" element={<PlansPage />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/instructor/*" element={
                  <ProtectedRoute user={user} allowedRoles={[UserRole.INSTRUCTOR]}>
                    <DashboardLayout userRole={UserRole.INSTRUCTOR}>
                      <Routes>
                        <Route index element={<InstructorDashboard />} />
                        <Route path="students" element={<StudentManagement />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/student/*" element={
                  <ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}>
                    <DashboardLayout userRole={UserRole.STUDENT}>
                      <Routes>
                        <Route index element={<StudentDashboard />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/unauthorized" element={
                  <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <h1 className="text-4xl font-bold text-red-600">403</h1>
                    <button onClick={() => logout()} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Voltar</button>
                  </div>
                } />
              </Routes>
            </AnimatePresence>
            <ChatAssistant />
          </div>
        </Suspense>
      </PermissionGate>
    </ErrorBoundary>
  );
}

