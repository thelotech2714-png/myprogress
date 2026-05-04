import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight, Plus, CheckCircle2, UserPlus, Trash2 } from 'lucide-react';
import { cn } from '../utils';

interface TimeSlot {
  id: string;
  time: string;
  status: 'available' | 'booked';
  studentName?: string;
  type?: string;
}

export const CalendarManagement: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(27);
  const [slots, setSlots] = useState<Record<number, TimeSlot[]>>({
    27: [
      { id: '1', time: '08:00', status: 'booked', studentName: 'Ana Luiza', type: 'Avaliação Física' },
      { id: '2', time: '09:00', status: 'available' },
      { id: '3', time: '10:30', status: 'booked', studentName: 'Bruno Silva', type: 'Consultoria Online' },
      { id: '4', time: '14:00', status: 'booked', studentName: 'Carla Pereira', type: 'Presencial' },
      { id: '5', time: '16:00', status: 'available' },
    ],
    28: [
      { id: '6', time: '08:00', status: 'available' },
      { id: '7', time: '09:00', status: 'available' },
    ]
  });

  const days = [
    { day: 26, name: 'DOM', events: 0 },
    { day: 27, name: 'SEG', events: 3 },
    { day: 28, name: 'TER', events: 2 },
    { day: 29, name: 'QUA', events: 0 },
    { day: 30, name: 'QUI', events: 0 },
    { day: 1, name: 'SEX', events: 0 },
    { day: 2, name: 'SAB', events: 0 },
  ];

  const toggleSlotStatus = (day: number, slotId: string) => {
    setSlots(prev => {
      const daySlots = [...(prev[day] || [])];
      const index = daySlots.findIndex(s => s.id === slotId);
      if (index !== -1) {
        const slot = daySlots[index];
        daySlots[index] = {
          ...slot,
          status: slot.status === 'available' ? 'booked' : 'available',
          studentName: slot.status === 'available' ? 'Reserva Manual' : undefined
        };
      }
      return { ...prev, [day]: daySlots };
    });
  };

  const addSlot = (day: number) => {
    const time = prompt('Horário (ex: 15:00)');
    if (!time) return;
    
    setSlots(prev => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        { id: Math.random().toString(36).substring(2, 11), time, status: 'available' as 'available' | 'booked' }
      ].sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  return (
    <div className="card-standard p-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Gestão de Horários
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Libere horários para seus alunos</p>
        </div>
        <button 
          onClick={() => addSlot(selectedDay)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
        >
          <Plus className="w-4 h-4" /> Abrir Horário
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
         {days.map((d, i) => (
           <div 
             key={i} 
             onClick={() => setSelectedDay(d.day)}
             className={cn(
               "p-3 rounded-2xl flex flex-col items-center border transition-all cursor-pointer",
               selectedDay === d.day ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-100"
             )}
           >
              <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{d.name}</span>
              <span className="text-lg font-black">{d.day}</span>
              {(slots[d.day]?.length || 0) > 0 && (
                <div className={cn("w-1 h-1 rounded-full mt-2", selectedDay === d.day ? "bg-white" : "bg-blue-600")} />
              )}
           </div>
         ))}
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Horários para {selectedDay} de Abril
            </h4>
         </div>

         {(slots[selectedDay] || []).length === 0 ? (
           <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-400">Nenhum horário definido para este dia</p>
           </div>
         ) : (
           slots[selectedDay].map((slot) => (
              <div 
                key={slot.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  slot.status === 'booked' ? "bg-slate-50 border-slate-100" : "bg-blue-50/50 border-blue-100 shadow-sm"
                )}
              >
                 <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                       <p className="text-lg font-black text-slate-900">{slot.time}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                       {slot.status === 'booked' ? (
                          <>
                             <p className="text-sm font-bold text-slate-800">{slot.type || 'Aula Individual'}</p>
                             <p className="text-[10px] font-medium text-slate-500">{slot.studentName}</p>
                          </>
                       ) : (
                          <>
                             <p className="text-sm font-bold text-blue-600">Disponível na Agenda</p>
                             <p className="text-[10px] font-medium text-blue-400 uppercase tracking-widest">Livre para alunos</p>
                          </>
                       )}
                    </div>
                 </div>
                 <div className="flex gap-2">
                    {slot.status === 'available' && (
                      <button 
                        onClick={() => toggleSlotStatus(selectedDay, slot.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-blue-700"
                      >
                         Reservar
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           ))
         )}
      </div>
    </div>
  );
};
