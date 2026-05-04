import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Award,
  Package,
  CircleDollarSign,
  Info,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils';

interface Plan {
  id?: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  active: boolean;
}

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [features, setFeatures] = useState<string[]>(['']);
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await firebaseService.getPlans();
      if (data && data.length > 0) {
        setPlans(data as Plan[]);
      } else {
        await firebaseService.seedInitialPlans();
        const seeded = await firebaseService.getPlans();
        setPlans(seeded as Plan[]);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice(0);
    setFeatures(['']);
    setActive(true);
    setEditingPlan(null);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setFeatures(plan.features.length > 0 ? plan.features : ['']);
    setActive(plan.active);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures.length > 0 ? newFeatures : ['']);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const planData = {
        id: editingPlan?.id,
        name,
        price: Number(price),
        currency: 'BRL',
        features: features.filter(f => f.trim() !== ''),
        active
      };
      await firebaseService.savePlan(planData);
      await loadPlans();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving plan:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      await firebaseService.savePlan({ ...plan, active: !plan.active });
      await loadPlans();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Carregando planos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Assinaturas</h1>
          <p className="text-slate-500 mt-1">Configure os planos e benefícios para os instrutores.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-white rounded-3xl border p-8 flex flex-col relative overflow-hidden transition-all",
              plan.active ? "border-slate-100 shadow-sm" : "border-slate-200 bg-slate-50 opacity-75 grayscale"
            )}
          >
            {!plan.active && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Inativo
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">R$ {plan.price.toFixed(2)}</span>
                <span className="text-slate-400 text-sm font-medium">/ mês</span>
              </div>
            </div>

            <div className="space-y-3 flex-grow mb-8">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                  <span className="text-slate-600 text-sm font-medium leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleEdit(plan)}
                className="flex-1 py-3 bg-slate-50 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button 
                onClick={() => toggleActive(plan)}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  plan.active 
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100" 
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                )}
              >
                {plan.active ? (
                  <>
                    <X className="w-4 h-4" />
                    Pausar
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Ativar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal / Slide-over for Plan Config */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 px-1">Nome do Plano</label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Plano Intermediário"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 px-1">Preço Mensal (R$)</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</div>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-bold text-slate-700">Benefícios inclusos</label>
                      <button 
                        type="button"
                        onClick={handleAddFeature}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar
                      </button>
                    </div>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(idx, e.target.value)}
                            placeholder="Descreva o benefício..."
                            className="flex-grow px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input 
                      type="checkbox"
                      id="plan-active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="plan-active" className="text-sm font-bold text-slate-700 cursor-pointer">
                      Plano ativo para novas contratações
                    </label>
                  </div>

                  <button 
                    disabled={saving}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200/50 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plans;
