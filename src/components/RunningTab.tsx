import { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, MapPin, Volume2, VolumeX, 
  Compass, Apple, Droplet, Zap, Navigation 
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GearTrackerSection from './GearTrackerSection';

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
  // États du Tracker GPS / Session Running
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [audioCoaching, setAudioCoaching] = useState(true);

  // Coordonnées GPS pour la carte Leaflet (Centré sur la région de Tournai / Brunehaut)
  const [routePositions, setRoutePositions] = useState<Array<[number, number]>>([
    [50.505, 3.325],
    [50.507, 3.328],
    [50.510, 3.332]
  ]);

  // États du Planificateur de Ravitaillement (Nutrition)
  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [intensity, setIntensity] = useState<'modere' | 'soutenu' | 'maximal'>('soutenu');
  const [bodyWeight, setBodyWeight] = useState<number>(70);

  // Timer de course et simulation de progression géographique sur la carte
  useEffect(() => {
    let interval: any = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        setDistanceKm(d => Number((d + 0.0033).toFixed(2)));
        
        // Allongement progressif du tracé vert sur la carte
        setRoutePositions(prev => {
          const last = prev[prev.length - 1];
          return [...prev, [last[0] + 0.0008, last[1] + 0.001]];
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
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
  };

  const handlePauseRun = () => {
    setIsPaused(!isPaused);
  };

  const handleStopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (distanceKm > 0 && onSaveRunPost) {
      onSaveRunPost(`[Running] Sortie de ${distanceKm} km en ${formatTime(seconds)} 🏃‍♂️`, distanceKm);
    }
  };

  // Calculs nutritionnels (Ravitaillement)
  const totalHours = durationHours + durationMins / 60;
  let carbsPerHour = 60;
  if (intensity === 'modere') carbsPerHour = 45;
  if (intensity === 'soutenu') carbsPerHour = 65;
  if (intensity === 'maximal') carbsPerHour = 90;

  const totalCarbs = Math.round(carbsPerHour * totalHours);
  const waterPerception = intensity === 'maximal' ? 750 : 600;
  const totalWaterMl = Math.round(waterPerception * totalHours);
  const standardGelsCount = Math.round(totalCarbs / 25);

  const currentCenter = routePositions[routePositions.length - 1];

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Style CSS intégré pour basculer les tuiles OpenStreetMap en mode sombre */}
      <style>{`
        .map-tiles-dark {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3);
        }
      `}</style>

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
          <span className="text-xs font-bold bg-neutral-950/80 border border-neutral-800 px-3.5 py-1.5 rounded-full text-orange-400 shadow-inner">
            Live & Plan
          </span>
        </div>
      </div>

      {/* Vraie Carte GPS Interactive avec Tracé Vert (Leaflet + OSM Dark Mode) */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" /> Carte Live & Tracé Route
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {isRunning ? 'GPS Actif (Enregistrement...)' : 'Prêt à démarrer'}
          </span>
        </div>

        {/* Conteneur Leaflet aux couleurs sombres */}
        <div className="w-full h-72 rounded-2xl overflow-hidden border border-neutral-800 relative z-0">
          <MapContainer 
            center={currentCenter} 
            zoom={14} 
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%', background: '#0a0a0a' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles-dark"
            />
            <Polyline 
              positions={routePositions} 
              pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9 }} 
            />
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
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
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

      {/* Intégration du Gear Tracker (Chaussures) */}
      <GearTrackerSection 
        shoes={shoes} 
        onAddShoe={onAddShoe} 
        onDeleteShoe={onDeleteShoe} 
        onSetActiveShoe={onSetActiveShoe} 
      />
    </div>
  );
}
