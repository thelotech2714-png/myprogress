import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import { Camera, RefreshCw, AlertCircle, CheckCircle2, Play, Pause } from 'lucide-react';
import { cn } from '../utils';

import { permissionService } from '../services/permissionService';

interface PoseDetectionCameraProps {
  exerciseType?: 'squat' | 'bicep_curl' | 'pushup' | 'jumping_jack';
  onRepChange?: (reps: number) => void;
  onFeedback?: (message: string) => void;
}

export const PoseDetectionCamera: React.FC<PoseDetectionCameraProps> = ({ 
  exerciseType = 'squat',
  onRepChange,
  onFeedback 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState<string>("Posicione-se em frente à câmera");
  const [isActive, setIsActive] = useState(false);
  
  // State for counting logic
  const stageRef = useRef<'down' | 'up'>('up');

  const setupCamera = async () => {
    if (!videoRef.current) return;
    try {
      setError(null);
      
      const granted = await permissionService.requestCamera();
      if (!granted) {
        setError("Permissão de câmera negada. Habilite o acesso nas configurações do Android.");
        setIsActive(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      return new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = () => resolve(videoRef.current);
      });
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Permissão de câmera negada. Habilite o acesso para usar a IA Vision.");
      } else {
        setError("Não foi possível acessar a câmera. Verifique se outro app a está usando.");
      }
      setIsActive(false);
      throw err;
    }
  };

  const initDetector = async () => {
    try {
      setIsLoading(true);
      await tf.ready();
      
      // Ensure we have a valid backend
      if (!tf.getBackend()) {
        await tf.setBackend('webgl');
      }

      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      
      const detector = await poseDetection.createDetector(model, detectorConfig);
      detectorRef.current = detector;
      setIsLoading(false);
    } catch (err: any) {
      console.error("Detector init error:", err);
      let errorMsg = "Falha ao carregar modelo de IA.";
      if (err.message && err.message.includes('fetch')) {
        errorMsg = "Erro de conexão: Os modelos de IA não puderam ser baixados. Verifique se seu navegador ou rede bloqueiam o site 'tfhub.dev'.";
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const calculateAngle = (a: poseDetection.Keypoint, b: poseDetection.Keypoint, c: poseDetection.Keypoint) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const processPose = useCallback((poses: poseDetection.Pose[]) => {
    if (poses.length === 0) return;
    const keypoints = poses[0].keypoints;
    
    // Find keypoints helper
    const getKP = (name: string) => keypoints.find(kp => kp.name === name);

    if (exerciseType === 'squat') {
      const hip = getKP('left_hip') || getKP('right_hip');
      const knee = getKP('left_knee') || getKP('right_knee');
      const ankle = getKP('left_ankle') || getKP('right_ankle');

      if (hip && knee && ankle && hip.score! > 0.3 && knee.score! > 0.3 && ankle.score! > 0.3) {
        const angle = calculateAngle(hip, knee, ankle);
        
        if (angle > 160) {
          if (stageRef.current === 'down') {
            setReps(prev => {
              const newReps = prev + 1;
              onRepChange?.(newReps);
              return newReps;
            });
            setFeedback("Boa! Continue assim.");
          }
          stageRef.current = 'up';
        }

        if (angle < 90) {
          stageRef.current = 'down';
          setFeedback("Suba agora!");
        }
      }
    } else if (exerciseType === 'pushup') {
      const shoulder = getKP('left_shoulder') || getKP('right_shoulder');
      const elbow = getKP('left_elbow') || getKP('right_elbow');
      const wrist = getKP('left_wrist') || getKP('right_wrist');

      if (shoulder && elbow && wrist && shoulder.score! > 0.3 && elbow.score! > 0.3 && wrist.score! > 0.3) {
        const angle = calculateAngle(shoulder, elbow, wrist);
        
        if (angle > 160) {
          if (stageRef.current === 'down') {
            setReps(prev => {
              const newReps = prev + 1;
              onRepChange?.(newReps);
              return newReps;
            });
          }
          stageRef.current = 'up';
          setFeedback("Desça o máximo que puder");
        }

        if (angle < 90) {
          stageRef.current = 'down';
          setFeedback("Empurre com força!");
        }
      }
    }
  }, [exerciseType, onRepChange]);

  const drawPose = (poses: poseDetection.Pose[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw skeleton
    poses.forEach(pose => {
      pose.keypoints.forEach(kp => {
        if (kp.score && kp.score > 0.3) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#10b981'; // emerald-500
          ctx.fill();
        }
      });
    });
  };

  const detect = useCallback(async () => {
    if (isActive && detectorRef.current && videoRef.current && videoRef.current.readyState === 4) {
      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      processPose(poses);
      drawPose(poses);
    }
    if (isActive) {
      requestAnimationFrame(detect);
    }
  }, [isActive, processPose]);

  const toggleActive = async () => {
    if (!isActive) {
      if (!videoRef.current?.srcObject) {
         try {
           setIsLoading(true);
           await setupCamera();
           setIsLoading(false);
         } catch (err) {
           return;
         }
      }
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  useEffect(() => {
    const start = async () => {
      try {
        await initDetector();
      } catch (err) {
        console.error(err);
      }
    };
    start();
  }, []);

  useEffect(() => {
    if (isActive) {
      detect();
    }
  }, [isActive, detect]);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-white font-bold animate-pulse">Iniciando Vision Engine...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <p className="text-white font-bold text-lg mb-4">{error}</p>
          <button 
            onClick={() => { 
              setError(null); 
              initDetector();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="relative aspect-video">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={cn("w-full h-full object-cover grayscale transition-opacity duration-700", isActive ? "opacity-40" : "opacity-10")}
        />
        <canvas 
          ref={canvasRef} 
          width="640" 
          height="480" 
          className="absolute inset-0 w-full h-full"
        />
        
        {!isActive && !isLoading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/40 backdrop-blur-[2px]">
             <div className="p-6 bg-white/10 rounded-full border border-white/20 animate-pulse">
                <Camera className="w-12 h-12 text-white" />
             </div>
             <p className="text-white font-black text-xs uppercase tracking-[0.3em]">Clique no Play para iniciar IA</p>
          </div>
        )}

        {/* Overlay do Contador */}
        <div className="absolute top-6 left-6 flex items-center gap-4">
           {reps > 0 && (
             <div className="px-6 py-4 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl animate-in zoom-in duration-300">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Repetições</p>
                <p className="text-5xl font-black text-white leading-none">{reps}</p>
             </div>
           )}
           
           {isActive && (
             <div className="px-6 py-4 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl animate-in slide-in-from-left-4 duration-500">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter">Detectando</p>
                </div>
             </div>
           )}
        </div>

        {/* Feedback Real-time */}
        {isActive && (
          <div className="absolute bottom-6 left-6 right-6">
             <div className="px-6 py-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  Dica da IA
                </p>
                <p className="text-lg font-bold text-white leading-tight">{feedback}</p>
             </div>
          </div>
        )}

        {/* Controles */}
        <div className="absolute top-6 right-6">
           <button 
             onClick={toggleActive}
             className={cn(
               "p-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center scale-110",
               isActive ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
             )}
           >
              {isActive ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white" />}
           </button>
        </div>
      </div>
      
      <div className="p-6 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
               <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exercício Atual</p>
               <h4 className="text-white font-bold capitalize">{exerciseType.replace('_', ' ')}</h4>
            </div>
         </div>
         <button 
           onClick={() => setReps(0)}
           className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
         >
           Resetar Contador
         </button>
      </div>
    </div>
  );
};
