import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Plus, 
  Minus, 
  Bell, 
  BellOff, 
  Settings,
  CircleAlert as AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

interface WaterTrackerProps {
  onBack?: () => void;
  standalone?: boolean;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ onBack, standalone = true }) => {
  const [amount, setAmount] = useState(0);
  const [goal, setGoal] = useState(2500); // ml
  const [cupSize, setCupSize] = useState(250); // ml
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [lastNotification, setLastNotification] = useState<number | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  // Load from local storage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`water_tracker_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      setAmount(data.amount || 0);
      setGoal(data.goal || 2500);
    }
    
    const settings = localStorage.getItem('water_tracker_settings');
    if (settings) {
      const { CupSize, reminders } = JSON.parse(settings);
      if (CupSize) setCupSize(CupSize);
      if (reminders !== undefined) setRemindersEnabled(reminders);
    }

    if ('Notification' in window && Notification.permission === 'denied') {
      setPermissionError(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`water_tracker_${today}`, JSON.stringify({ amount, goal }));
    localStorage.setItem('water_tracker_settings', JSON.stringify({ CupSize: cupSize, reminders: remindersEnabled }));
  }, [amount, goal, cupSize, remindersEnabled]);

  // Reminder Logic (Mocked for browser context)
  useEffect(() => {
    if (!remindersEnabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Remind every 1 hour (3600000 ms) if goal not met
      if (amount < goal && (!lastNotification || now - lastNotification > 3600000)) {
        if ('Notification' in window && Notification.permission === 'granted') {
             new Notification('Hora de beber água!', {
               body: `Você já bebeu ${amount}ml de sua meta de ${goal}ml. Vamos hidratar?`,
               icon: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png'
             });
             setLastNotification(now);
        } else {
           // Fallback for browsers that don't support notifications or permission not granted
           console.log('Reminder: Time to drink water!');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [remindersEnabled, amount, goal, lastNotification]);

  const handleAdd = () => setAmount(prev => Math.min(prev + cupSize, 10000));
  const handleRemove = () => setAmount(prev => Math.max(prev - cupSize, 0));

  const progress = Math.min((amount / goal) * 100, 100);

  const toggleReminders = () => {
    const nextState = !remindersEnabled;
    if (nextState && 'Notification' in window) {
      if (Notification.permission === 'denied') {
        setPermissionError(true);
        return;
      }
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setRemindersEnabled(true);
          setPermissionError(false);
        } else if (permission === 'denied') {
          setRemindersEnabled(false);
          setPermissionError(true);
        }
      });
    } else {
      setRemindersEnabled(nextState);
    }
  };

  return (
    <div className={cn(
      standalone ? "card-standard p-6 bg-white border-none shadow-xl shadow-slate-200/50" : "w-full",
      "relative"
    )}>
      {permissionError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
           <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
           <div>
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Notificações Bloqueadas</p>
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                Você negou a permissão de notificações. Habilite-as nas configurações do seu navegador para receber lembretes de hidratação.
              </p>
           </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
            <Droplets className="w-6 h-6 fill-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 italic uppercase tracking-tight">HIDRATAÇÃO</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contador Diário Diário</p>
          </div>
        </div>
        <button 
          onClick={toggleReminders}
          className={cn(
            "p-3 rounded-xl transition-all shadow-sm flex items-center gap-2",
            remindersEnabled ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
          )}
        >
          {remindersEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {remindersEnabled ? 'Lembretes ON' : 'Lembretes OFF'}
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90">
                <circle
                    cx="96"
                    cy="96"
                    r="84"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-50"
                />
                <circle
                    cx="96"
                    cy="96"
                    r="84"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={527.7}
                    strokeDashoffset={527.7 - (527.7 * progress) / 100}
                    className="text-blue-500 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{amount}<span className="text-xs font-bold text-slate-400 ml-1 italic">ml</span></h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Meta: {goal}ml</p>
            </div>

            {/* Float Bubbles effect */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="absolute top-10 -left-4 w-6 h-6 bg-blue-300/10 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button 
           onClick={handleRemove}
           className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center group"
        >
          <Minus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button 
           onClick={handleAdd}
           className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-50">
         <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-3 h-3" /> Configurações
            </h4>
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tamanho do Copo</p>
                <select 
                   value={cupSize}
                   onChange={(e) => setCupSize(Number(e.target.value))}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-200"
                >
                    <option value={100}>100ml</option>
                    <option value={200}>200ml</option>
                    <option value={250}>250ml</option>
                    <option value={300}>300ml</option>
                    <option value={500}>500ml</option>
                </select>
            </div>
            <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Meta Diária</p>
                <select 
                   value={goal}
                   onChange={(e) => setGoal(Number(e.target.value))}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-200"
                >
                    <option value={1500}>1.5 Litros</option>
                    <option value={2000}>2.0 Litros</option>
                    <option value={2500}>2.5 Litros</option>
                    <option value={3000}>3.0 Litros</option>
                    <option value={4000}>4.0 Litros</option>
                </select>
            </div>
         </div>
      </div>

      {amount >= goal && (
        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-500">
            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase tracking-widest">Meta de hidratação batida! Continue assim.</p>
        </div>
      )}
    </div>
  );
};
