import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border-4 border-slate-900 p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-600" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Opa! Algo quebrou.</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Ocorreu um erro inesperado no sistema. Nossa equipe técnica (IA) já foi notificada silenciosamente.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                Recarregar App
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Home className="w-4 h-4" />
                Voltar ao Início
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-rose-600 font-bold mb-1 uppercase">Debug Info:</p>
                <code className="text-[10px] font-mono text-slate-600 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
