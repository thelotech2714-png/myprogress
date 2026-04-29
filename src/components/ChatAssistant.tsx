import React, { useState } from 'react';
import { MessageSquare, Send, X, User, Sparkles, Loader2, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Olá! Sou seu assistente MyProgress IA. Como posso ajudar com seus treinos ou gestão hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Entendi! Estou analisando seus dados para fornecer a melhor recomendação sobre: ' + userMsg }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:bg-blue-500 hover:scale-110 transition-all z-50 group"
      >
        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
      </button>

      <div className={cn(
        "fixed bottom-28 right-8 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col z-50 transition-all duration-500 origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        <div className="p-4 bg-slate-900 rounded-t-3xl flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                 <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-white leading-none">Assistente IA</h4>
                 <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Online</span>
              </div>
           </div>
           <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-4 scrollbar-thin">
           {messages.map((m, i) => (
             <div key={i} className={cn(
               "flex",
               m.role === 'user' ? "justify-end" : "justify-start"
             )}>
                <div className={cn(
                  "max-w-[80%] p-3 text-sm font-medium",
                  m.role === 'user' 
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" 
                    : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none"
                )}>
                   {m.text}
                </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                   <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                   <span className="text-xs font-bold text-slate-400">Digitando...</span>
                </div>
             </div>
           )}
        </div>

        <div className="p-4 border-t border-slate-100">
           <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte qualquer coisa..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
              />
              <button 
                onClick={handleSend}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
              >
                 <Send className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>
    </>
  );
};
