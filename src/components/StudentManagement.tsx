import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Mail,
  Calendar,
  Filter,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Student {
  id: string;
  name: string;
  email: string;
  plan: 'Mensal' | 'Trimestral' | 'Anual';
  status: 'Ativo' | 'Inativo';
  joinDate: string;
  phone?: string;
  lastVisit?: string;
}

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    plan: 'Mensal',
    status: 'Ativo',
    phone: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('myprogress_students_data');
    if (stored) {
      setStudents(JSON.parse(stored));
    } else {
      // Seed initial data from registered emails if available
      const registeredEmails = JSON.parse(localStorage.getItem('myprogress_registered_students') || '[]');
      const initialData: Student[] = registeredEmails.map((email: string, i: number) => ({
        id: (i + 1).toString(),
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        plan: 'Mensal',
        status: 'Ativo',
        joinDate: new Date().toISOString().split('T')[0],
        phone: '(11) 99999-9999',
        lastVisit: 'Hoje'
      }));
      setStudents(initialData);
      localStorage.setItem('myprogress_students_data', JSON.stringify(initialData));
    }
  }, []);

  const saveToStorage = (data: Student[]) => {
    localStorage.setItem('myprogress_students_data', JSON.stringify(data));
    setStudents(data);
    
    // Sync back to registered_students emails for backward compatibility with dashboard access checks
    const emails = data.map(s => s.email);
    localStorage.setItem('myprogress_registered_students', JSON.stringify(emails));
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        plan: 'Mensal',
        status: 'Ativo',
        phone: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const updated = students.map(s => s.id === editingStudent.id ? { ...s, ...formData } as Student : s);
      saveToStorage(updated);
    } else {
      const newStudent: Student = {
        ...(formData as Student),
        id: Math.random().toString(36).substring(7),
        joinDate: new Date().toISOString().split('T')[0],
        lastVisit: 'Nunca'
      };
      saveToStorage([newStudent, ...students]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este aluno?')) {
      const updated = students.filter(s => s.id !== id);
      saveToStorage(updated);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Gestão de Alunos
          </h2>
          <p className="text-slate-500 font-medium text-sm">Gerencie o acesso, planos e informações dos seus atletas.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Aluno
        </button>
      </div>

      <div className="card-standard bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
           <div className="relative flex-1 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
             <input 
               type="text" 
               placeholder="Buscar por nome ou e-mail..."
               className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all font-medium text-sm"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex gap-2">
              <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
                <Filter className="w-4 h-4" />
              </button>
              <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 Total: <span className="text-slate-900">{students.length}</span>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresso</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        student.plan === 'Anual' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        student.plan === 'Trimestral' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-slate-50 text-slate-600 border-slate-100"
                      )}>
                        {student.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", student.status === 'Ativo' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                        <span className={cn("text-xs font-bold", student.status === 'Ativo' ? "text-emerald-600" : "text-slate-400")}>
                          {student.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {student.joinDate}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(student)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium">Nenhum aluno encontrado para "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {editingStudent ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                  {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Preencha as informações do atleta</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                id="close-student-modal"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail de Acesso</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                      value={formData.plan}
                      onChange={e => setFormData({...formData, plan: e.target.value as any})}
                    >
                      <option value="Mensal">Mensal</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                    <div className="flex gap-2">
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, status: 'Ativo'})}
                         className={cn(
                           "flex-1 py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                           formData.status === 'Ativo' ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-white border-slate-200 text-slate-400"
                         )}
                       >
                         Ativo
                       </button>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, status: 'Inativo'})}
                         className={cn(
                           "flex-1 py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                           formData.status === 'Inativo' ? "bg-red-50 border-red-500 text-red-600" : "bg-white border-slate-200 text-slate-400"
                         )}
                       >
                         Inativo
                       </button>
                    </div>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telefone (Opcional)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-[10px]"
                  >
                    {editingStudent ? 'Atualizar Aluno' : 'Salvar Aluno'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
