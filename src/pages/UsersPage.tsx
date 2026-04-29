import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Shield, 
  GraduationCap, 
  User,
  Loader2,
  Mail,
  MoreVertical
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { cn } from '../lib/utils';
import { UserRole } from '../types/auth';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'blocked' | 'pending';
  lastLogin?: any;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await firebaseService.getAllUsers();
      setUsers((data as UserProfile[]) || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    setActionLoading(uid);
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await firebaseService.updateUserStatus(uid, newStatus);
      await fetchUsers();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) || 
      user.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'instructor': return <GraduationCap className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return "bg-purple-100 text-purple-600 border-purple-200";
      case 'instructor': return "bg-blue-100 text-blue-600 border-blue-200";
      default: return "bg-blue-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Gerenciamento de Usuários</h1>
          <p className="text-slate-500 font-medium">Controle de acesso e monitoramento de perfis de toda a plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="card-standard p-6 md:h-fit space-y-6">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesquisar</label>
             <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="Nome ou e-mail..."
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtrar por Perfil</label>
             <div className="flex flex-col gap-2">
                {[
                  { id: 'all', label: 'Todos', icon: Users },
                  { id: 'admin', label: 'Administradores', icon: Shield },
                  { id: 'instructor', label: 'Instrutores', icon: GraduationCap },
                  { id: 'student', label: 'Alunos', icon: User },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRoleFilter(f.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                      roleFilter === f.id 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-100" 
                        : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    <f.icon className="w-4 h-4" />
                    {f.label}
                  </button>
                ))}
             </div>
           </div>
        </div>

        {/* Users List */}
        <div className="md:col-span-3 space-y-4">
           {loading ? (
             <div className="card-standard p-20 flex flex-col items-center justify-center">
               <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
               <p className="text-slate-500 font-bold">Buscando usuários...</p>
             </div>
           ) : filteredUsers.length === 0 ? (
             <div className="card-standard p-20 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">Nenhum resultado</h3>
               <p className="text-slate-500">Tente ajustar sua busca ou filtros.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
               {filteredUsers.map((user) => (
                 <div key={user.uid} className="card-standard p-5 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shrink-0">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-900 truncate uppercase tracking-tight">{user.name || 'Sem Nome'}</h4>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            getRoleColor(user.role)
                          )}>
                            {user.role}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                       <div className="text-right hidden md:block">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Status</p>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            user.status === 'active' ? "text-emerald-500" : "text-red-500"
                          )}>
                            {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                          </span>
                       </div>

                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleStatus(user.uid, user.status)}
                            disabled={actionLoading === user.uid}
                            className={cn(
                              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border",
                              user.status === 'active' 
                                ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white" 
                                : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white"
                            )}
                          >
                            {actionLoading === user.uid ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (user.status === 'active' ? 'Bloquear' : 'Ativar')}
                          </button>
                          
                          <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                             <MoreVertical className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
