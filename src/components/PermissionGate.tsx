import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Camera, MapPin, Bell, ChevronRight, Loader2, Settings } from 'lucide-react';
import { permissionService } from '../services/permissionService';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

interface PermissionGateProps {
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'missing' | 'granted' | 'denied'>('checking');
  const [isMobile, setIsMobile] = useState(false);

  const check = useCallback(async () => {
    const info = await Device.getInfo();
    const mobile = info.platform !== 'web';
    setIsMobile(mobile);

    if (!mobile) {
      setStatus('granted');
      return;
    }

    const granted = await permissionService.checkAllPermissions();
    setStatus(granted ? 'granted' : 'missing');
  }, []);

  useEffect(() => {
    check();

    // Listen for app state changes (user coming back from settings)
    const setupListener = async () => {
      const listener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          check();
        }
      });
      return listener;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then(l => l.remove());
    };
  }, [check]);

  const handleRequest = async () => {
    setStatus('checking');
    const success = await permissionService.requestAllPermissions();
    if (success) {
      setStatus('granted');
    } else {
      // If still missing after request, it means user probably denied permanently
      setStatus('denied');
    }
  };

  const handleOpenSettings = async () => {
    await permissionService.openSettings();
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium tracking-tight">Validando segurança nativa...</p>
      </div>
    );
  }

  if ((status === 'missing' || status === 'denied') && isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {status === 'denied' ? 'Acesso Necessário' : 'Permissões de Acesso'}
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {status === 'denied' 
              ? 'Parece que as permissões foram desativadas. Para continuar usando os recursos de treino e GPS, você precisa habilitá-las nas configurações.'
              : 'Para que o app funcione perfeitamente no seu Android, precisamos de algumas permissões essenciais.'}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Camera className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Câmera</p>
                <p className="text-xs text-slate-500">Fotos de evolução e treinos.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">GPS</p>
                <p className="text-xs text-slate-500">Localização em tempo real.</p>
              </div>
            </div>
          </div>

          {status === 'denied' ? (
            <button 
              onClick={handleOpenSettings}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
            >
              <Settings className="w-5 h-5" />
              Abrir Configurações
            </button>
          ) : (
            <button 
              onClick={handleRequest}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-blue-200/50 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
            >
              Configurar Agora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
