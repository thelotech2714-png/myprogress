import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { cn } from '../utils';

interface AvailableSlot {
  id: string;
  day: number;
  time: string;
  instructor: string;
}

const mockAvailableSlots: AvailableSlot[] = [
  { id: '1', day: 27, time: '09:00', instructor: 'Prof. Ricardo' },
  { id: '2', day: 27, time: '16:00', instructor: 'Prof. Ricardo' },
  { id: '3', day: 28, time: '08:00', instructor: 'Prof. Ricardo' },
  { id: '4', day: 28, time: '09:00', instructor: 'Prof. Ricardo' },
  { id: '5', day: 29, time: '10:00', instructor: 'Prof. Ricardo' },
];

export const StudentBooking: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(27);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const days = [
    { day: 26, name: 'DOM' },
    { day: 27, name: 'SEG' },
    { day: 28, name: 'TER' },
    { day: 29, name: 'QUA' },
    { day: 30, name: 'QUI' },
    { day: 1, name: 'SEX' },
    { day: 2, name: 'SAB' },
  ];

  const handleBook = (id: string) => {
    if (bookedSlots.includes(id)) return;
    setBookedSlots(prev => [...prev, id]);
  };

  const filteredSlots = mockAvailableSlots.filter(s => s.day === selectedDay);

  return (
    <div className="card-standard p-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            Agenda de Aulas
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Escolha um horário liberado pelo instrutor</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
              <ChevronLeft className="w-4 h-4" />
           </button>
           <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
              <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
         {days.map((d, i) => {
           const hasSlots = mockAvailableSlots.some(s => s.day === d.day);
           return (
             <button 
               key={i} 
               onClick={() => setSelectedDay(d.day)}
               className={cn(
                 "min-w-[60px] p-3 rounded-2xl flex flex-col items-center border transition-all",
                 selectedDay === d.day 
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-100"
               )}
             >
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{d.name}</span>
                <span className="text-lg font-black">{d.day}</span>
                {hasSlots && <div className={cn("w-1 h-1 rounded-full mt-2", selectedDay === d.day ? "bg-white" : "bg-blue-600")} />}
             </button>
           );
         })}
      </div>

      <div className="space-y-4">
         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
           Horários disponíveis em {selectedDay} de Abril
         </h4>

         {filteredSlots.length === 0 ? (
           <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-400">Nenhum horário disponível para este dia</p>
           </div>
         ) : (
           filteredSlots.map((slot) => {
             const isBooked = bookedSlots.includes(slot.id);
             return (
               <div 
                 key={slot.id} 
                 className={cn(
                   "flex items-center justify-between p-5 rounded-2xl border transition-all",
                   isBooked ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100 hover:border-blue-200 shadow-sm"
                 )}
               >
                  <div className="flex items-center gap-6">
                     <div className="text-center">
                        <p className="text-2xl font-black text-slate-900 leading-none">{slot.time}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Horário</p>
                     </div>
                     <div className="h-10 w-px bg-slate-100" />
                     <div>
                        <p className="font-bold text-slate-800">{slot.instructor}</p>
                        <p className="text-[10px] font-medium text-slate-500">Mentoria Individual • 50 min</p>
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => handleBook(slot.id)}
                    disabled={isBooked}
                    className={cn(
                      "px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      isBooked 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/10"
                    )}
                  >
                     {isBooked ? (
                       <>
                         <CheckCircle2 className="w-4 h-4" /> Na Agenda
                       </>
                     ) : 'Reservar Vaga'}
                  </button>
               </div>
             );
           })
         )}
      </div>

      <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
               <Clock className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-sm font-bold text-slate-900 mb-1">Políticas da Agenda</h4>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                 Cancelamentos devem ser feitos com no mínimo 12h de antecedência. 
                 Vagas liberadas pelo instrutor são preenchidas por ordem de reserva.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
