import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Camera,
  Check,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserRole } from '../types/auth';
import { auth } from '../lib/firebase';
import { firebaseService } from '../services/firebaseService';
import { notificationService } from '../services/notificationService';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}

const navItems = {
  [UserRole.ADMIN]: [
    { label: 'Visão Geral', icon: LayoutDashboard, href: '/admin' },
    { label: 'Usuários', icon: Users, href: '/admin/users' },
    { label: 'Configurações', icon: Settings, href: '/admin/settings' },
  ],
  [UserRole.INSTRUCTOR]: [
    { label: 'Visão Geral', icon: LayoutDashboard, href: '/instructor' },
    { label: 'Meus Estudantes', icon: Users, href: '/instructor/students' },
  ],
  [UserRole.STUDENT]: [
    { label: 'Meu Progresso', icon: LayoutDashboard, href: '/student' },
  ],
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const items = navItems[userRole] || [];

  useEffect(() => {
    const initFCM = async () => {
      // Small delay to ensure auth is fully ready
      setTimeout(async () => {
        if (auth.currentUser) {
          await notificationService.requestPermission();
          
          notificationService.onMessageListener().then((payload: any) => {
            console.log('Foreground message:', payload);
          });
        }
      }, 2000);
    };

    initFCM();

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const profile = await firebaseService.getUserProfile(auth.currentUser.uid);
        setUserData(profile);
      }
    };

    fetchUser();

    // Notifications listener
    let unsubscribe: () => void;
    if (auth.currentUser) {
      const recipientId = userRole === UserRole.ADMIN ? 'admin' : auth.currentUser.uid;
      firebaseService.getNotifications(recipientId, (data) => {
        setNotifications(data);
      }).then(unsub => {
        if (unsub) unsubscribe = unsub;
      });
    }

    return () => unsubscribe?.();
  }, [userRole]);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem('myprogress_user');
    window.location.href = '/login';
  };

  const currentRoleLabel = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.INSTRUCTOR]: 'Instrutor',
    [UserRole.STUDENT]: 'Aluno',
  }[userRole];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleUpdatePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (base64.length > 800000) {
          alert('Imagem muito grande. Limite: 500KB');
          setUploading(false);
          return;
        }
        await firebaseService.updateUserProfile(auth.currentUser!.uid, { photoURL: base64 });
        setUserData({ ...userData, photoURL: base64 });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[50] lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[60] flex flex-col lg:hidden border-r border-slate-200"
            >
              <div className="p-6 flex items-center justify-between h-20 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20">
                    M
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-900 uppercase">MyProgress</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-6 space-y-1">
                {items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link 
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                        isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                      <span className="font-semibold text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl transition-all text-slate-500 hover:bg-red-50 hover:text-red-600 group"
                >
                  <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
                  <span className="font-semibold text-sm">Sair do Sistema</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 hidden lg:flex flex-col z-20 sticky top-0 h-screen",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-center h-20 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20">
              M
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight text-slate-900 uppercase">MyProgress</span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link 
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                {isSidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl transition-all text-slate-500 hover:bg-red-50 hover:text-red-600 group",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
            {isSidebarOpen && <span className="font-semibold text-sm">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 lg:hidden rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
            >
               <Menu className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hidden lg:block rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="h-6 md:h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-slate-400 hidden xs:inline">Portal do</span>
                <span className="font-bold text-blue-600">{currentRoleLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 relative rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                  >
                    <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                      <h4 className="font-bold text-xs uppercase tracking-widest">Notificações</h4>
                      <button 
                        onClick={async () => {
                          const recipientId = userRole === UserRole.ADMIN ? 'admin' : auth.currentUser?.uid;
                          if (recipientId) await firebaseService.markAllNotificationsRead(recipientId);
                        }}
                        className="text-[10px] uppercase font-black text-blue-400 hover:text-blue-300"
                      >
                        Marcar todas
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={async () => {
                              await firebaseService.markNotificationRead(notif.id);
                            }}
                            className={cn(
                              "p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50",
                              !notif.read && "bg-blue-50/50"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="text-sm font-bold text-slate-900 pr-4">{notif.title}</h5>
                              {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1" />}
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 font-black uppercase mt-2 block tracking-widest">
                              {notif.createdAt?.toDate?.()?.toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 md:h-8 w-px bg-slate-200 mx-1 md:mx-2" />
            
            {/* User Profile */}
            <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 group cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-all">
                  {userData?.name || 'Carregando...'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-wider">Online</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-100 border border-blue-200 overflow-hidden ring-2 ring-slate-50 group-hover:ring-blue-100 transition-all">
                 {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.email}&backgroundColor=b6e3f4`} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                 )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                   <h3 className="text-xl font-black uppercase tracking-tight italic">Meu Perfil</h3>
                   <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="p-8 space-y-8">
                   <div className="flex flex-col items-center">
                      <div className="relative group mb-4">
                         <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner ring-4 ring-slate-100">
                            {uploading ? (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                              </div>
                            ) : userData?.photoURL ? (
                              <img src={userData.photoURL} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.email}`} className="w-full h-full object-cover" alt="Avatar" />
                            )}
                         </div>
                         <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-blue-700 transition-all border-4 border-white">
                            <Camera className="w-5 h-5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpdatePhoto} />
                         </label>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{userData?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{auth.currentUser?.email}</p>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status da Conta</p>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-sm font-bold text-slate-900">{userData?.status === 'active' ? 'Ativo' : 'Pendente'}</span>
                         </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo de Acesso</p>
                         <p className="text-sm font-bold text-slate-900 uppercase">{currentRoleLabel}</p>
                      </div>
                   </div>

                   <button 
                     onClick={handleLogout}
                     className="w-full py-5 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                   >
                     <LogOut className="w-4 h-4" />
                     Sair do Sistema
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

