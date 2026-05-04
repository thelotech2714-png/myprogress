import React, { useState } from 'react';
import { Utensils, Sparkles, Loader2, Save, X, Apple } from 'lucide-react';
import { cn } from '../utils';
import { optimizeDiet } from '../services/geminiService';

export const DietSection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [dietText, setDietText] = useState("Café: Ovos e abacate\nAlmoço: Frango, arroz integral e brócolis\nPré-treino: Banana com aveia\nJantar: Peixe com salada");
  const [tempDiet, setTempDiet] = useState(dietText);
  const [goals, setGoals] = useState("Ganho de massa muscular e performance em corrida.");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  const handleSave = () => {
    setDietText(tempDiet);
    setIsEditing(false);
    setAiSuggestions(null);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const suggestion = await optimizeDiet(dietText, goals);
      setAiSuggestions(suggestion);
    } catch (error) {
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="card-standard p-8 bg-white border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans leading-none">Plano Alimentar</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sincronizado com Performance</p>
          </div>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-emerald-600 text-xs font-bold hover:underline uppercase tracking-widest"
          >
            Editar Dieta
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSave}
              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sua Dieta Atual</span>
          </div>
          {isEditing ? (
            <textarea 
              value={tempDiet}
              onChange={(e) => setTempDiet(e.target.value)}
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none font-medium"
              placeholder="Descreva sua dieta aqui..."
            />
          ) : (
            <div className="w-full min-h-48 p-5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-sm whitespace-pre-wrap leading-relaxed font-medium">
              {dietText}
            </div>
          )}
        </div>

        <div className="space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Otimização IA</span>
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing || isEditing}
              className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-30"
            >
              {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Melhorar com IA
            </button>
          </div>

          <div className={cn(
            "w-full min-h-48 p-5 rounded-xl border border-indigo-100 transition-all duration-500",
            aiSuggestions ? "bg-indigo-50/50" : "bg-slate-50/50 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8"
          )}>
            {aiSuggestions ? (
              <div className="prose prose-sm max-w-none text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                {aiSuggestions}
              </div>
            ) : (
              <>
                <Apple className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-xs text-slate-400 font-medium">Clique em "Melhorar com IA" para receber sugestões personalizadas baseadas nos seus objetivos.</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100">
         <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próxima refeição sugerida em 2h: Snack de Proteína + Hidratação</p>
         </div>
      </div>
    </div>
  );
};
