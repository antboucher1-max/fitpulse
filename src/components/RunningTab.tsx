import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, MapPin, Volume2, VolumeX, 
  Compass, Apple, Droplet, Zap, Navigation, LocateFixed, Activity, Gauge, Timer 
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GearTrackerSection from './GearTrackerSection';

const runnerIcon = L.divIcon({
  className: 'custom-runner-marker',
  html: `<div style="width: 20px; height: 20px; background: #10b981; border: 4px solid #ffffff; border-radius: 50%; box-shadow: 0 0 16px #10b981, 0 0 4px rgba(0,0,0,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Contrôleur pour recentrer et redimensionner la carte dynamiquement
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

interface RunningTabProps {
  currentUserId?: string;
  currentUsername?: string;
  selectedClub?: string;
  currentUserProfile?: any;
  userAvatarUrl?: string;
  onRefreshFeed?: () => void;
  shoes?: any[];
  onAddShoe?: (brand: string, model: string, maxKm: number) => void;
  onDeleteShoe?: (shoeId: string) => void;
  onSetActiveShoe?: (shoeId: string) => void;
  onSaveRunPost?: (caption: string, km: number) => void;
  onNavigateTab?: (tab: string) => void;
}

export default function RunningTab({
  shoes = [],
  onAddShoe = () => {},
  onDeleteShoe = () => {},
  onSetActiveShoe = () => {},
  onSaveRunPost,
  onNavigateTab
}: RunningTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [audioCoaching, setAudioCoaching] = useState(true);

  const [currentPosition, setCurrentPosition] = useState<[number, number]>([50.505, 3.325]);
  const [routePositions, setRoutePositions] = useState<Array<[number, number]>>([
    [50.505, 3.325]
  ]);

  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [intensity, setIntensity] = useState<'modere' | 'soutenu' | 'maximal'>('soutenu');
  const [bodyWeight, setBodyWeight] = useState<number>(70);

  const lastPositionRef = useRef<[number, number]>([50.505, 3.325]);

  // Initialisation et centrage sur la position réelle
  const fetchInitialPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coord: [number, number] = [lat, lng];
          setCurrentPosition(coord);
          lastPositionRef.current = coord;
          setRoutePositions([coord]);
        },
        (error) => console.warn("GPS non disponible :", error.message),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    fetchInitialPosition();
  }, []);

  // Suivi GPS stable : ajoute les points uniquement en avançant
  useEffect(() => {
    let interval: any = null;
    let watchId: number | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        setDistanceKm(d => Number((d + 0.0033).toFixed(2)));
      }, 1000);

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const newPos: [number, number] = [lat, lng];

            const last = lastPositionRef.current;
            const distanceMoved = Math.hypot(newPos[0] - last[0], newPos[1] - last[1]);

            if (distanceMoved > 0.00001) {
              lastPositionRef.current = newPos;
              setCurrentPosition(newPos);
              setRoutePositions(prev => [...prev, newPos]);
            }
          },
          (error) => console.error(error),
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
        );
      }
    }

    return () => {
      clearInterval(interval);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isRunning, isPaused]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remainingMins < 10 ? '0' : ''}${remainingMins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartRun = () => {
    setIsRunning(true);
    setIsPaused(false);
    setSeconds(0);
    setDistanceKm(0);
    fetchInitialPosition();
  };

  const handlePauseRun = () => setIsPaused(!isPaused);

  const handleStopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (distanceKm > 0 && onSaveRunPost) {
      onSaveRunPost(`[Running] Sortie de ${distanceKm} km en ${formatTime(seconds)} 🏃‍♂️`, distanceKm);
    }
  };

  // Calculs d'allure et vitesse en temps réel
  const currentHours = seconds / 3600;
  const currentSpeedKmh = currentHours > 0 && distanceKm > 0 ? (distanceKm / currentHours).toFixed(1) : '0.0';
  
  let paceFormatted = '--:--';
  if (distanceKm > 0 && seconds > 0) {
    const totalSecPerKm = seconds / distanceKm;
    const rawMins = Math.floor(totalSecPerKm / 60);
    const rawSecs = Math.round(totalSecPerKm % 60);
    paceFormatted = `${rawMins}'${rawSecs < 10 ? '0' : ''}${rawSecs}"`;
  }

  const totalHours = durationHours + durationMins / 60;
  let carbsPerHour = 60;
  if (intensity === 'modere') carbsPerHour = 45;
  if (intensity === 'soutenu') carbsPerHour = 65;
  if (intensity === 'maximal') carbsPerHour = 90;

  const totalCarbs = Math.round(carbsPerHour * totalHours);
  const waterPerception = intensity === 'maximal' ? 750 : 600;
  const totalWaterMl = Math.round(waterPerception * totalHours);
  const standardGelsCount = Math.round(totalCarbs / 25);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* En-tête de section moderne */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/35 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4" /> Mode Running & Stratégie
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">GPS, Carte Live & Nutrition</h2>
          </div>
          <button 
            type="button"
            onClick={fetchInitialPosition}
            className="flex items-center gap-1.5 text-xs font-bold bg-neutral-950/90 border border-neutral-800 px-3.5 py-2 rounded-xl text-emerald-400 hover:bg-neutral-800 transition shadow-inner cursor-pointer"
          >
            <LocateFixed className="w-4 h-4 animate-pulse" /> Ma Position
          </button>
        </div>
      </div>

      {/* Widget Intégré : Contrôle de Récupération & Charge (Readiness / Load Score) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Statut de Forme & Fatigue du Jour
          </div>
          <button 
            type="button"
            onClick={() => {
              localStorage.setItem('fitpulse_active_tab', 'readiness');
              if (onNavigateTab) {
                onNavigateTab('readiness');
              } else {
                window.location.reload();
              }
            }}
            className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full hover:bg-orange-500/20 transition cursor-pointer"
          >
            Faire un Check-in ⚡
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Indice Récupération</span>
            <span className="text-xl font-black text-emerald-400">78% <span className="text-[10px] text-neutral-500 font-normal">Optimal</span></span>
          </div>
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Charge Hebdo (Load)</span>
            <span className="text-xl font-black text-orange-400">45 <span className="text-[10px] text-neutral-500 font-normal">/ 100</span></span>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center justify-between text-xs">
          <span className="text-neutral-300">💡 Conseil du jour : Feu vert pour une sortie endurance ou seuil modéré.</span>
        </div>
      </div>

      {/* Carte GPS prenant tout le cadre avec suivi et marqueur */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" /> Carte Live & Tracé Route
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {isRunning ? 'Enregistrement actif...' : 'Prêt à démarrer'}
          </span>
        </div>

        <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative z-0">
          <MapContainer 
            center={currentPosition} 
            zoom={16} 
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', background: '#0a0a0a' }}
          >
            <MapController center={currentPosition} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline 
              positions={routePositions} 
              pathOptions={{ color: '#10b981', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} 
            />
            <Marker position={currentPosition} icon={runnerIcon} />
          </MapContainer>

          {/* Badge position GPS en temps réel sur la carte */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-neutral-950/90 border border-neutral-800 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] text-emerald-400 font-mono flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Lat: {currentPosition[0].toFixed(4)}° N, Lng: {currentPosition[1].toFixed(4)}° E</span>
          </div>
        </div>
      </div>

      {/* Module GPS / Tracker Live avec Vitesse km/h et Allure min/km */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-orange-500" /> Traceur Live & Audio
          </h3>
          <button 
            type="button"
            onClick={() => setAudioCoaching(!audioCoaching)}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              audioCoaching ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-neutral-950 text-neutral-500 border-neutral-800'
            }`}
          >
            {audioCoaching ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioCoaching ? 'Coach Vocal Actif' : 'Muté'}
          </button>
        </div>

        {/* Grille des 4 indicateurs clés : Distance, Vitesse (km/h), Allure (min/km), Chrono */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Distance</span>
            <span className="text-lg font-black text-white">{distanceKm.toFixed(2)} <span className="text-[10px] font-normal text-neutral-400">km</span></span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-400" /> Vitesse
            </span>
            <span className="text-lg font-black text-emerald-400">{currentSpeedKmh} <span className="text-[10px] font-normal text-neutral-400">km/h</span></span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase flex items-center gap-1">
              <Timer className="w-3 h-3 text-orange-400" /> Allure
            </span>
            <span className="text-lg font-black text-orange-400">{paceFormatted}</span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Chrono</span>
            <span className="text-lg font-black text-white">{formatTime(seconds)}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {!isRunning ? (
            <button 
              type="button"
              onClick={handleStartRun}
              className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Démarrer la sortie
            </button>
          ) : (
            <>
              <button 
                type="button"
                onClick={handlePauseRun}
                className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button 
                type="button"
                onClick={handleStopRun}
                className="flex-1 py-4 bg-red-950/60 border border-red-900/50 hover:bg-red-900/60 text-red-400 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Square className="w-4 h-4 fill-red-400" /> Terminer & Publier
              </button>
            </>
          )}
        </div>
      </div>

      {/* Planificateur de Ravitaillement Intégré */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
          <Zap className="w-4 h-4" /> Planificateur de Ravitaillement
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Durée (Heures) :</label>
            <input 
              type="number" 
              min="0" 
              max="12"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Durée (Minutes) :</label>
            <input 
              type="number" 
              min="0" 
              max="55"
              step="5"
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Intensité :</label>
            <select 
              value={intensity} 
              onChange={(e: any) => setIntensity(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="modere">Modéré (Endurance cool)</option>
              <option value="soutenu">Soutenu (Allure semi/marathon)</option>
              <option value="maximal">Maximal (Seuil / Race Pace)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Poids corporel (kg) :</label>
            <input 
              type="number" 
              value={bodyWeight}
              onChange={(e) => setBodyWeight(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Apple className="w-3.5 h-3.5 text-orange-500" /> Glucides Totaux
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {totalCarbs} <span className="text-xs font-normal text-orange-400">g</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">Soit ~{carbsPerHour}g / heure</span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Hydratation / Eau
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {(totalWaterMl / 1000).toFixed(2)} <span className="text-xs font-normal text-cyan-400">L</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">Avec électrolytes conseillés</span>
          </div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
          <span className="font-bold text-orange-400 block">Stratégie de course :</span>
          <p className="text-neutral-300 leading-relaxed">
            Pour cette sortie de <strong>{durationHours}h{durationMins > 0 ? durationMins : ''}</strong>, prévois environ <strong>{standardGelsCount} gels énergétiques</strong> à répartir toutes les 30 à 45 minutes, accompagnés de petites gorgées d'eau régulièrement.
          </p>
        </div>
      </div>

      <GearTrackerSection 
        shoes={shoes} 
        onAddShoe={onAddShoe} 
        onDeleteShoe={onDeleteShoe} 
        onSetActiveShoe={onSetActiveShoe} 
      />
    </div>
  );
}
