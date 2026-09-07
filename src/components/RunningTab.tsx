import PaywallGate from './PaywallGate';
import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Navigation, Activity, Mountain, Compass as CompassIcon, Trophy, Award, Send, Ghost, Zap, Lock, CheckCircle2, Sparkles, Utensils, RefreshCw, ChevronDown, ChevronUp, BarChart2, Users, ArrowLeft, EyeOff, X
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GearTrackerSection from './GearTrackerSection';
import gpxParser from 'gpxparser';

const runnerIcon = L.divIcon({
  className: 'custom-runner-marker',
  html: `<div style="width: 20px; height: 20px; background: #10b981; border: 4px solid #ffffff; border-radius: 50%; box-shadow: 0 0 16px #10b981;"></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10]
});

const ghostIcon = L.divIcon({
  className: 'custom-ghost-marker',
  html: `<div style="width: 18px; height: 18px; background: #ef4444; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: white;">👻</div>`,
  iconSize: [18, 18], iconAnchor: [9, 9]
});

function MapController({ center, plannedRoute }: { center: [number, number], plannedRoute?: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (plannedRoute && plannedRoute.length > 0) {
      map.fitBounds(L.latLngBounds(plannedRoute), { padding: [50, 50], animate: true });
    } else {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, plannedRoute, map]);
  return null;
}

function FitBotSNC({ readinessScore = 78, weeklyLoad = 45 }: { readinessScore?: number; weeklyLoad?: number }) {
  const isLocked = readinessScore < 50 || weeklyLoad > 80;
  return (
    <div className={`border rounded-3xl p-4 space-y-2 shadow-xl ${isLocked ? 'bg-red-950/20 border-red-500/40' : 'bg-neutral-900 border-neutral-800'}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase text-orange-400">
        <Zap className="w-4 h-4 animate-pulse" /> FitBot SNC (Auto-Régulation IA)
      </div>
      <p className="text-xs text-neutral-300">
        {isLocked ? "🚨 [ALERTE SNC] Fatigue nerveuse détectée. Intensité verrouillée." : "⚡ [SNC Optimal] Système nerveux paré pour l'effort."}
      </p>
    </div>
  );
}

function FuelLockPostWod({ lastRunDistanceKm = 10, bodyWeightKg = 70 }: { lastRunDistanceKm?: number; bodyWeightKg?: number }) {
  const [recipe, setRecipe] = useState<any>(null);
  const targetCarbs = Math.round(lastRunDistanceKm * 8);
  const targetProt = Math.round(bodyWeightKg * 0.4);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-black text-cyan-400 uppercase">
        <span>Fuel-Lock Post-Effort 🧬</span>
        <span>Cible : {targetCarbs}g Glucides</span>
      </div>
      {!recipe ? (
        <button onClick={() => setRecipe({ title: "Bowl Récupération Poulet / Patate Douce", macros: `Glucides : ~${targetCarbs}g | Protéines : ~${targetProt}g` })} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs uppercase cursor-pointer">
          Générer la recette 🥗
        </button>
      ) : (
        <div className="bg-neutral-950 p-3 rounded-xl border border-cyan-500/30 text-xs space-y-1">
          <div className="font-bold text-cyan-300">{recipe.title}</div>
          <div className="text-emerald-400 font-mono">{recipe.macros}</div>
        </div>
      )}
    </div>
  );
}

export default function RunningTab({
  currentUserProfile, shoes = [], onAddShoe, onDeleteShoe, onSetActiveShoe, onSaveRunPost, onUpdateShoeKm, onBack
}: any) {
  const [openSection, setOpenSection] = useState<'none' | 'terrain' | 'gear'>('none');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [actualDPlus, setActualDPlus] = useState<number>(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSavingRun, setIsSavingRun] = useState(false);

  const [plannedRoutePositions, setPlannedRoutePositions] = useState<Array<[number, number]>>([]);
  const [ghostPosition, setGhostPosition] = useState<[number, number] | null>(null);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([50.505, 3.325]);
  const [routePositions, setRoutePositions] = useState<Array<[number, number]>>([[50.505, 3.325]]);
  const lastPositionRef = useRef<[number, number]>([50.505, 3.325]);
  const wakeLockRef = useRef<any>(null);

  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const gpx = new gpxParser();
        gpx.parse(evt.target?.result as string);
        const tracks = gpx.tracks[0];
        if (tracks && tracks.points?.length > 0) {
          const points = tracks.points.map((p: any) => [p.lat, p.lon] as [number, number]);
          let km = Number((tracks.distance.total / 1000).toFixed(2));
          let dPlus = 0;
          if (tracks.points[0].ele !== undefined) {
            for (let i = 1; i < tracks.points.length; i++) {
              const diff = tracks.points[i].ele - tracks.points[i - 1].ele;
              if (diff > 0) dPlus += diff;
            }
          } else {
            dPlus = km * 25;
          }
          setRoutePositions(points);
          setDistanceKm(km);
          setActualDPlus(Math.round(dPlus));
          setCurrentPosition(points[points.length - 1]);
          lastPositionRef.current = points[points.length - 1];
          alert(`GPX importé : ${km} km, +${Math.round(dPlus)}m D+`);
        }
      } catch (err) {
        alert("Erreur de lecture GPX.");
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    let interval: any = null;
    let watchId: number | null = null;

    if (isRunning) {
      if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(l => wakeLockRef.current = l).catch(() => {});
      interval = setInterval(() => { if (!isPaused) setSeconds(s => s + 1); }, 1000);

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            const delta = calculateHaversineDistance(lastPositionRef.current[0], lastPositionRef.current[1], newPos[0], newPos[1]);
            
            if (delta > 0.05) return; // Filtre anti-sauts GPS
            if (delta < 0.001) { if (!isPaused) setIsPaused(true); return; }
            else if (isPaused) setIsPaused(false);

            if (delta > 0.002) {
              lastPositionRef.current = newPos;
              setCurrentPosition(newPos);
              setRoutePositions(p => [...p, newPos]);
              setDistanceKm(d => Number((d + delta).toFixed(2)));
              setActualDPlus(d => d + Math.round(delta * 20));
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
        );
      }
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }

    return () => {
      clearInterval(interval);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isRunning, isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60), s = secs % 60, h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const paceFormatted = distanceKm > 0 && seconds > 0 ? `${Math.floor((seconds / distanceKm) / 60)}'${Math.round((seconds / distanceKm) % 60).toString().padStart(2, '0')}"` : '--:--';
  const currentSpeed = seconds > 0 && distanceKm > 0 ? (distanceKm / (seconds / 3600)).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      {/* --- CARTE & START --- */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-white">QG Running & GPS</h2>
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
            GPS Blindé 🛰️
          </span>
        </div>

        {isRunning ? (
          <div className="bg-neutral-950 border border-emerald-500/50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-xs text-emerald-400 font-bold">
              <span>Enregistrement en cours...</span>
              <span className="font-mono">{formatTime(seconds)}</span>
            </div>
            <div className="w-full h-56 rounded-xl overflow-hidden border border-neutral-800">
              <MapContainer center={currentPosition} zoom={16} style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
                <MapController center={currentPosition} plannedRoute={plannedRoutePositions} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={routePositions} pathOptions={{ color: '#10b981', weight: 6 }} />
                <Marker position={currentPosition} icon={runnerIcon} />
              </MapContainer>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">Dist: <b>{distanceKm.toFixed(2)}km</b></div>
              <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">D+: <b>+{actualDPlus}m</b></div>
              <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">Vit: <b>{currentSpeed}km/h</b></div>
              <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">Allure: <b>{paceFormatted}</b></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsPaused(!isPaused)} className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl text-xs cursor-pointer">
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button onClick={() => { setIsRunning(false); setIsReportModalOpen(true); }} className="flex-1 py-3 bg-red-950 text-red-400 font-bold rounded-xl text-xs uppercase cursor-pointer">
                Terminer
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setOpenSection('none'); setIsRunning(true); setIsPaused(false); setSeconds(0); setDistanceKm(0); setActualDPlus(0); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase cursor-pointer shadow-xl">
            Démarrer (Mode Focus) 🚀
          </button>
        )}
      </div>

      <FitBotSNC readinessScore={78} weeklyLoad={45} />

      {/* --- TIROIR GPX & GEAR --- */}
      <div className="space-y-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <button onClick={() => setOpenSection(openSection === 'terrain' ? 'none' : 'terrain')} className="w-full p-4 flex justify-between items-center text-xs font-bold text-cyan-400 cursor-pointer">
            <span className="flex items-center gap-2"><Mountain className="w-4 h-4" /> Import GPX & Altitude</span>
            {openSection === 'terrain' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSection === 'terrain' && (
            <div className="p-4 pt-0 border-t border-neutral-800 space-y-2 text-xs">
              <input type="file" accept=".gpx" onChange={handleFileUpload} className="w-full text-xs text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-xl p-2 file:bg-orange-600 file:text-white file:rounded-lg file:border-0 file:text-xs cursor-pointer" />
            </div>
          )}
        </div>
      </div>

      {/* --- MODALE BILAN COURSE --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" /> Bilan de Course Certifié
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-neutral-400 rounded-xl bg-neutral-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              <div><span className="text-[9px] text-neutral-400 block font-bold">Distance</span><b>{distanceKm.toFixed(2)}km</b></div>
              <div><span className="text-[9px] text-neutral-400 block font-bold">Vrai D+</span><b className="text-emerald-400">+{actualDPlus}m</b></div>
              <div><span className="text-[9px] text-neutral-400 block font-bold">Allure</span><b className="text-orange-400">{paceFormatted}</b></div>
              <div><span className="text-[9px] text-neutral-400 block font-bold">Chrono</span><b className="text-cyan-400">{formatTime(seconds)}</b></div>
            </div>

            {distanceKm > 0.05 && <FuelLockPostWod lastRunDistanceKm={distanceKm} />}

            <div className="space-y-2 pt-2">
              <button onClick={() => { setIsSavingRun(true); onSaveRunPost?.(`🎯 [DÉFI CLUB] ${distanceKm} km en ${formatTime(seconds)} (+${actualDPlus}m D+) 🚀`, distanceKm); setIsReportModalOpen(false); setIsSavingRun(false); }} disabled={isSavingRun} className="w-full py-3.5 bg-orange-600 text-white font-black rounded-2xl text-xs uppercase cursor-pointer">
                Publier sur le Fil du Club 🏆
              </button>
              <button onClick={() => { setIsSavingRun(true); if(shoes.length > 0 && onUpdateShoeKm) { const s = shoes.find((x:any)=>x.is_active||x.active); if(s) onUpdateShoeKm(s.id||s._id, distanceKm); } setIsReportModalOpen(false); setIsSavingRun(false); }} disabled={isSavingRun} className="w-full py-3 bg-neutral-800 text-neutral-300 font-bold rounded-2xl text-xs cursor-pointer">
                Enregistrer en privé & Mettre à jour chaussures 🔒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
