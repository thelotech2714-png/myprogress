import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, MapPin, Navigation, Info, Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../utils';

import { Geolocation } from '@capacitor/geolocation';
import { permissionService } from '../services/permissionService';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
}

const ChangeView = ({ center }: { center: Location }) => {
  const map = useMap();
  map.setView([center.lat, center.lng], map.getZoom());
  return null;
};

export const RunningTracker: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [path, setPath] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [pace, setPace] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const watchId = useRef<string | null>(null);
  const timerId = useRef<number | null>(null);

  // Request high accuracy location
  useEffect(() => {
    const initGPS = async () => {
      try {
        const granted = await permissionService.requestGeolocation();
        if (!granted) {
          setLocationError("Permissão de localização negada. Habilite o GPS nas configurações.");
          return;
        }

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
      } catch (err: any) {
        console.error("Erro ao obter localização inicial:", err);
        setLocationError("Não foi possível encontrar sua localização. Verifique seu sinal de GPS.");
      }
    };

    initGPS();
  }, []);

  const calculateDistance = (loc1: Location, loc2: Location) => {
    const R = 6371; // Earth radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const startTracking = async () => {
    const granted = await permissionService.requestGeolocation();
    if (!granted) {
      alert("A permissão de GPS é necessária para rastrear sua corrida.");
      return;
    }

    setIsActive(true);
    setPath([]);
    setDistance(0);
    setTime(0);

    // Start Timer
    timerId.current = window.setInterval(() => {
      setTime(t => t + 1);
    }, 1000);

    // Start GPS Tracking
    try {
      watchId.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 5000 },
        (pos) => {
          if (!pos) return;
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(newLoc);
          
          setPath(prevPath => {
            if (prevPath.length > 0) {
              const lastLoc = prevPath[prevPath.length - 1];
              const d = calculateDistance(lastLoc, newLoc);
              if (d > 0.005) { // Only add if moved more than 5 meters to filter noise
                setDistance(prevDist => prevDist + d);
                return [...prevPath, newLoc];
              }
              return prevPath;
            }
            return [newLoc];
          });
        }
      );
    } catch (err) {
      console.error("Error watching position:", err);
    }
  };

  const stopTracking = () => {
    setIsActive(false);
    if (watchId.current !== null) {
      Geolocation.clearWatch({ id: watchId.current });
      watchId.current = null;
    }
    if (timerId.current !== null) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
    
    // Save activity logic could go here
    console.log("Atividade finalizada:", { distance, time, pace, path });
  };

  // Pace calculation (min/km)
  useEffect(() => {
    if (distance > 0) {
      const minutes = time / 60;
      setPace(minutes / distance);
    } else {
      setPace(0);
    }
  }, [time, distance]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const formatPace = (paceValue: number) => {
    if (!paceValue || paceValue === Infinity) return "0:00";
    const m = Math.floor(paceValue);
    const s = Math.round((paceValue - m) * 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="card-standard overflow-hidden bg-white border-2 border-orange-100 shadow-xl shadow-orange-500/5">
      <div className="relative h-[400px] w-full bg-slate-100">
        {currentLocation && (
          <MapContainer 
            center={[currentLocation.lat, currentLocation.lng]} 
            zoom={16} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {path.length > 1 && (
              <Polyline positions={path.map(l => [l.lat, l.lng])} color="#f97316" weight={5} opacity={0.8} />
            )}
            <Marker position={[currentLocation.lat, currentLocation.lng]} />
            <ChangeView center={currentLocation} />
          </MapContainer>
        )}
        
        {!currentLocation && !locationError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
             <Navigation className="w-12 h-12 animate-pulse" />
             <p className="text-sm font-bold uppercase tracking-widest">Buscando sinal GPS...</p>
          </div>
        )}

        {locationError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-white/90 backdrop-blur-md z-[1001]">
             <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
                <AlertCircle className="w-8 h-8" />
             </div>
             <p className="text-slate-900 font-bold text-sm leading-relaxed">{locationError}</p>
             <button 
               onClick={() => window.location.reload()}
               className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"
             >
               Tentar Novamente
             </button>
          </div>
        )}

        <div className="absolute top-6 left-6 z-[1000]">
           <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                 <Zap className="w-5 h-5 fill-orange-600" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                 <p className={cn("text-xs font-bold uppercase tracking-tight", isActive ? "text-emerald-600" : "text-amber-500")}>
                    {isActive ? "Em Corrida" : "Pronto para Iniciar"}
                 </p>
              </div>
           </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 md:gap-8 mb-8">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Kms</span>
            <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
              {distance.toFixed(2)}
              <span className="text-sm md:text-xl ml-1 text-slate-400 font-bold uppercase">km</span>
            </p>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Tempo</span>
            <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
              {formatTime(time)}
            </p>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Pace</span>
            <p className="text-2xl xs:text-3xl md:text-5xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
              {formatPace(pace)}
              <span className="text-xs md:text-xl ml-1 text-slate-400 font-bold uppercase">/km</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {!isActive ? (
            <button 
              onClick={startTracking}
              disabled={!currentLocation}
              className="flex-1 py-6 bg-orange-600 text-white font-black text-lg rounded-[1.5rem] hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              <Play className="w-6 h-6 fill-white" />
              INICIAR CORRIDA
            </button>
          ) : (
            <button 
              onClick={stopTracking}
              className="flex-1 py-6 bg-slate-900 text-white font-black text-lg rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group"
            >
              <Square className="w-6 h-6 fill-white" />
              PARAR E SALVAR
            </button>
          )}
          
          <button className="hidden md:flex w-20 py-6 bg-slate-50 border border-slate-200 text-slate-400 rounded-[1.5rem] hover:bg-white hover:border-orange-200 hover:text-orange-600 transition-all items-center justify-center">
             <Info className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
           Mantenha o GPS ligado para melhor precisão
        </p>
      </div>
    </div>
  );
};
