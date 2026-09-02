import { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, MapPin, Volume2, VolumeX, 
  Compass, Apple, Droplet, Zap, Navigation, LocateFixed 
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GearTrackerSection from './GearTrackerSection';

const runnerIcon = L.divIcon({
  className: 'custom-runner-marker',
  html: `<div style="width: 18px; height: 18px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 14px #10b981;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

// Composant pour centrer automatiquement et dynamiquement la carte
function MapAutoCentering({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 0.5 });
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
}

export default function RunningTab({
  shoes = [],
  onAddShoe = () => {},
  onDeleteShoe = () => {},
  onSetActiveShoe = () => {},
  onSaveRunPost
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

  const updateGpsPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newCoord: [number, number] = [lat, lng];
          setCurrentPosition(newCoord);
          setRoutePositions(prev => [...prev, newCoord]);
        },
        (error) => console.warn("GPS non disponible :", error.message),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    updateGpsPosition();
  }, []);

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
            setCurrentPosition(newPos);
            setRoutePositions(prev => [...prev, newPos]);
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
    updateGpsPosition();
  };

  const handlePauseRun = () => setIsPaused(!isPaused);

  const handleStopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (distanceKm > 0 && onSaveRunPost) {
      onSaveRunPost(`[Running] Sortie de ${distanceKm} km en ${formatTime(seconds)} 🏃‍♂️`, distanceKm);
    }
  };

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
            onClick={updateGpsPosition}
            className="flex items-center gap-1.5 text-xs font-bold bg-neutral-950/90 border border-neutral-800 px-3.5 py-2 rounded-xl text-emerald-400 hover:bg-neutral-800 transition shadow-inner cursor-pointer"
          >
            <LocateFixed className="w-4 h-4 animate-pulse" /> Ma Position
          </button>
        </div>
      </div>

      {/* Carte GPS avec centrage automatique permanent */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" /> Carte Live & Tracé Route
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {isRunning ? 'GPS Actif (Suivi Auto...)' : 'Prêt à démarrer'}
          </span>
        </div>

        <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative z-0">
          <MapContainer 
            center={currentPosition} 
            zoom={16} 
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', background: '#1a1a1a' }}
          >
            <MapAutoCentering center={currentPosition} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline 
              positions={routePositions} 
              pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }} 
            />
            <Marker position={currentPosition} icon={runnerIcon} />
          </MapContainer>
        </div>
      </div>

      {/* Module GPS / Tracker Live */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-orange-500" /> Traceur Live & Audio
          </h3>
          <button 
            onClick={() => setAudioCoaching(!audioCoaching)}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              audioCoaching ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-neutral-950 text-neutral-500 border-neutral-800'
            }`}
          >
            {audioCoaching ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioCoaching ? 'Coach Vocal Actif' : 'Muté'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Distance</span>
            <span className="text-2xl font-black text-white">{distanceKm.toFixed(2)} <span className="text-xs font-normal text-neutral-400">km</span></span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Chrono</span>
            <span className="text-2xl font-black text-orange-400">{formatTime(seconds)}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {!isRunning ? (
            <button 
              onClick={handleStartRun}
              className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Démarrer la sortie
            </button>
          ) : (
            <>
              <button 
                onClick={handlePauseRun}
                className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button 
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
            <label className="block text-xs font-bold text-neutral-40
