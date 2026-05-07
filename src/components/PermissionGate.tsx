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
    try {
      // Check if user already skipped this before
      const hasSkipped = localStorage.getItem('permissions_skipped');
      if (hasSkipped === 'true') {
        setStatus('granted');
        return;
      }

      const info = await Device.getInfo();
      const mobile = info.platform !== 'web';
      setIsMobile(mobile);

      // If on web (Vercel), always grant immediately
      if (!mobile) {
        setStatus('granted');
        return;
      }

      // On mobile, try a quick check
      const granted = await permissionService.checkAllPermissions();
      
      if (granted) {
        setStatus('granted');
      } else {
        setStatus('missing');
      }
    } catch (error) {
      console.error('Initial permission check failed:', error);
      setStatus('granted'); 
    }
  }, []);

  useEffect(() => {
    // Safety check: if after 1 second it's still checking, force granted
    const safetyTimeout = setTimeout(() => {
      if (status === 'checking') {
        setStatus('granted');
      }
    }, 1000);

    check();

    // Listen for app state changes (user coming back from settings)
    const setupListener = async () => {
      try {
        const listener = await App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            check();
          }
        });
        return listener;
      } catch (e) {
        console.error('Failed to setup App state listener:', e);
        return { remove: () => {} };
      }
    };

    const listenerPromise = setupListener();

    return () => {
      clearTimeout(safetyTimeout);
      listenerPromise.then(l => l.remove());
    };
  }, [check, status]);

  const handleSkip = () => {
    localStorage.setItem('permissions_skipped', 'true');
    setStatus('granted');
  };

  const handlePermissoes = async () => {
    setStatus('checking');
    try {
      console.log('Iniciando solicitação de permissões...');
      // Set a timeout to avoid hanging forever
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Permission request timed out')), 10000)
      );
      
      const success = await Promise.race([
        permissionService.requestAllPermissions(),
        timeoutPromise
      ]) as boolean;
      
      if (success) {
        console.log('Todas as permissões concedidas!');
        setStatus('granted');
      } else {
        console.log('Permissões negadas pelo usuário.');
        setStatus('missing'); // Stay on missing but user can skip
      }
    } catch (error) {
      console.error('Erro ao processar permissões:', error);
      setStatus('granted'); // Fallback on error to unblock user
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

          {status === 'missing' || status === 'denied' ? (
            <div className="space-y-3">
              {status === 'denied' ? (
                <button 
                  onClick={handleOpenSettings}
                  id="btn-settings"
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                >
                  <Settings className="w-5 h-5" />
                  Abrir Configurações
                </button>
              ) : (
                <button 
                  onClick={handlePermissoes}
                  id="btn-permissions"
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-blue-200/50 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                >
                  Configurar Agora
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              
              <button 
                onClick={handleSkip}
                id="btn-skip"
                className="w-full py-4 bg-white text-slate-400 font-medium rounded-2xl border border-transparent hover:text-slate-600 transition-all"
              >
                Continuar sem as permissões
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
