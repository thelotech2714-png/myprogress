import React, { useState } from 'react';
import { Search, Plus, Play, Info, Dumbbell, Zap, Target, BookOpen, X, ChevronRight } from 'lucide-react';
import { cn } from '../utils';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  videoUrl?: string;
  thumbnail?: string;
  description: string;
}

const exercises: Exercise[] = [
  {
    id: '1',
    name: 'Agachamento com Barra',
    category: 'Pernas',
    equipment: 'Barra Olímpica',
    level: 'Intermediário',
    videoUrl: 'https://www.youtube.com/embed/SW_C1A-rejs',
    description: 'Mantenha a coluna reta e os pés alinhados com os ombros.'
  },
  {
    id: '2',
    name: 'Supino Reto',
    category: 'Peito',
    equipment: 'Barra / Banco',
    level: 'Intermediário',
    videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw',
    description: 'Desça a barra até o peito de forma controlada.'
  },
  {
    id: '3',
    name: 'Remada Curvada',
    category: 'Costas',
    equipment: 'Barra',
    level: 'Avançado',
    videoUrl: 'https://www.youtube.com/embed/RQU8wZ6v_f0',
    description: 'Mantenha o core ativado e puxe em direção ao umbigo.'
  },
  {
    id: '4',
    name: 'Rosca Direta',
    category: 'Bíceps',
    equipment: 'Halteres',
    level: 'Iniciante',
    videoUrl: 'https://www.youtube.com/embed/lyUInN9Fm98',
    description: 'Não balance o corpo durante o movimento.'
  }
];

export const ExerciseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [exerciseList, setExerciseList] = useState<Exercise[]>(exercises);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    name: '',
    category: 'Peito',
    equipment: '',
    level: 'Iniciante',
    videoUrl: '',
    description: ''
  });

  const categories = ['All', 'Peito', 'Costas', 'Pernas', 'Bíceps', 'Tríceps', 'Ombros', 'Core'];

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const id = (exerciseList.length + 1).toString();
    const exerciseToAdd = { ...newExercise, id } as Exercise;
    setExerciseList([exerciseToAdd, ...exerciseList]);
    setIsAddModalOpen(false);
    setNewExercise({
      name: '',
      category: 'Peito',
      equipment: '',
      level: 'Iniciante',
      videoUrl: '',
      description: ''
    });
  };

  const filteredExercises = exerciseList.filter(ex => 
    (selectedCategory === 'All' || ex.category === selectedCategory) &&
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card-standard p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Biblioteca de Exercícios
           </h3>
           <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Busque e selecione para prescrição</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar exercício..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
           >
              <Plus className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
         {categories.map(cat => (
           <button 
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={cn(
               "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
               selectedCategory === cat 
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"
             )}
           >
             {cat === 'All' ? 'Todos' : cat}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {filteredExercises.map(ex => (
           <div key={ex.id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group bg-white">
              <div className="flex items-start gap-4">
                 <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <Dumbbell className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-slate-900">{ex.name}</h4>
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                         ex.level === 'Iniciante' ? "bg-emerald-100 text-emerald-600" :
                         ex.level === 'Intermediário' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                       )}>
                         {ex.level}
                       </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{ex.category} • {ex.equipment}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ex.description}</p>
                 </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                 {ex.videoUrl && (
                   <button 
                     onClick={() => setSelectedVideoUrl(ex.videoUrl!)}
                     className="flex-1 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                   >
                      <Play className="w-3 h-3 fill-slate-600" /> Vídeo
                   </button>
                 )}
                 <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Add Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  Novo Exercício
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Adicione à biblioteca</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                id="close-add-modal"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleAddExercise} className="p-6 space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome do Exercício</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                    placeholder="Ex: Agachamento Sumô"
                    value={newExercise.name}
                    onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                      value={newExercise.category}
                      onChange={e => setNewExercise({...newExercise, category: e.target.value})}
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                      value={newExercise.level}
                      onChange={e => setNewExercise({...newExercise, level: e.target.value as any})}
                    >
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equipamento</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                    placeholder="Ex: Halteres, Barra"
                    value={newExercise.equipment}
                    onChange={e => setNewExercise({...newExercise, equipment: e.target.value})}
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL do Vídeo (Youtube/Vimeo)</label>
                  <input 
                    required
                    type="url" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium border-blue-100"
                    placeholder="https://youtube.com/..."
                    value={newExercise.videoUrl}
                    onChange={e => setNewExercise({...newExercise, videoUrl: e.target.value})}
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição / Observações</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 font-medium min-h-[80px]"
                    placeholder="Explique a execução correta..."
                    value={newExercise.description}
                    onChange={e => setNewExercise({...newExercise, description: e.target.value})}
                  ></textarea>
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-[10px]"
                  >
                    Salvar Exercício
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideoUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setSelectedVideoUrl(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full">
               <iframe 
                 src={`${selectedVideoUrl}?origin=${window.location.origin}&rel=0`}
                 className="w-full h-full border-none"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
                 title="Execução do Exercício"
               ></iframe>
            </div>
            <div className="p-6 bg-white flex justify-between items-center">
               <div>
                  <h4 className="text-lg font-bold text-slate-900">Execução do Exercício</h4>
                  <a 
                    href={selectedVideoUrl.replace('embed/', 'watch?v=')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    Abrir no Youtube <ChevronRight className="w-3 h-3" />
                  </a>
               </div>
               <button 
                 onClick={() => setSelectedVideoUrl(null)}
                 className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
