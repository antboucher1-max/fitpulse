import PaywallGate from './PaywallGate';
import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, MapPin, Volume2, VolumeX, 
  Compass, Apple, Droplet, Zap, Navigation, LocateFixed, Activity, Gauge, Timer, Target, Radio, Wind, ArrowLeft, Share2, EyeOff, X, Upload, Mountain, Compass as CompassIcon, Trophy, Award, Flame, Send, Ghost, ShieldAlert, Lock, CheckCircle2, Sparkles, Utensils, RefreshCw, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GearTrackerSection from './GearTrackerSection';
import gpxParser from 'gpxparser';

const runnerIcon = L.divIcon({
  className: 'custom-runner-marker',
  html: `<div style="width: 20px; height: 20px; background: #10b981; border: 4px solid #ffffff; border-radius: 50%; box-shadow: 0 0 16px #10b981, 0 0 4px rgba(0,0,0,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const ghostIcon = L.divIcon({
  className: 'custom-ghost-marker',
  html: `<div style="width: 18px; height: 18px; background: #ef4444; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 14px #ef4444, 0 0 4px rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; font-size: 8px; color: white; font-weight: bold;">👻</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function MapController({ center, plannedRoute }: { center: [number, number], plannedRoute?: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (plannedRoute && plannedRoute.length > 0) {
      const bounds = L.latLngBounds(plannedRoute);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, plannedRoute, map]);
  return null;
}

// --- SOUS-MODULE 1 : FitBot SNC (Auto-régulation du Système Nerveux Central) ---
function FitBotSNC({ readinessScore = 78, weeklyLoad = 45 }: { readinessScore?: number; weeklyLoad?: number }) {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string>('Analyse du SNC en cours...');

  useEffect(() => {
    if (readinessScore < 50 || weeklyLoad > 80) {
      setIsLocked(true);
      setRecommendation("🚨 [ALERTE SNC] Fatigue nerveuse profonde détectée. Les entraînements à haute intensité (Seuil / VMA) sont verrouillés d'office pour éviter la blessure. Session d'endurance douce ou repos obligatoire.");
    } else if (readinessScore < 70) {
      setIsLocked(false);
      setRecommendation("⚠️ [Vigilance SNC] Forme moyenne. Privilégie une intensité modérée et écoute tes sensations.");
    } else {
      setIsLocked(false);
      setRecommendation("⚡ [SNC Optimal] Système nerveux paré pour l'effort. Feu vert pour le plan initial.");
    }
  }, [readinessScore, weeklyLoad]);

  return (
    <div className={`border rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden transition-all ${
      isLocked ? 'bg-red-950/20 border-red-500/40' : 'bg-neutral-900 border-neutral-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400">
          <Zap className="w-4 h-4 animate-pulse" /> FitBot SNC (Auto-Régulation IA)
        </div>
        {isLocked ? (
          <span className="flex items-center gap-1 text-[10px] font-extrabold bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
            <Lock className="w-3 h-3" /> Haute Intensité Verrouillée
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Statut Sûr
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed">
        {recommendation}
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Indice Récupération SNC</span>
          <span className={`text-lg font-black ${readinessScore < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
            {readinessScore}%
          </span>
        </div>
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Sécurité Charge</span>
          <span className="text-lg font-black text-orange-400">{weeklyLoad} <span className="text-[10px] text-neutral-500 font-normal">/ 100</span></span>
        </div>
      </div>
    </div>
  );
}

// --- SOUS-MODULE 2 : Fuel-Lock Post-WOD (Nutrition connectée post-effort) ---
function FuelLockPostWod({ lastRunDistanceKm = 10, bodyWeightKg = 70 }: { lastRunDistanceKm?: number; bodyWeightKg?: number }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipeGenerated, setRecipeGenerated] = useState<any>(null);

  const effectiveDistance = lastRunDistanceKm > 0 ? lastRunDistanceKm : 1.0;

  const estimatedCaloriesBurned = Math.round(effectiveDistance * bodyWeightKg * 0.9);
  const targetCarbsGrams = Math.round(effectiveDistance * 8);
  const targetProteinGrams = Math.round(bodyWeightKg * 0.4);

  const handleScanAndGenerateRecipe = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setRecipeGenerated({
        title: "Bowl Récupération Glycogène & Poulet / Patate Douce",
        ingredients: ["150g de patate douce rôtie", "120g de blanc de poulet grillé", "1 œuf poché", "Épinards frais & huile d'olive"],
        macros: `Glucides : ~${targetCarbsGrams}g | Protéines : ~${targetProteinGrams}g`
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
          <Utensils className="w-4 h-4" /> Fuel-Lock Post-Effort (Nutrition Intelligente)
        </div>
        <span className="text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
          Auto-Ajusté 🧬
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>Dernière séance estimée :</span>
          <span className="font-bold text-white">{effectiveDistance.toFixed(2)} km (~{estimatedCaloriesBurned} kcal)</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Cible Glucides (Recharge) :</span>
          <span className="font-bold text-orange-400">~{targetCarbsGrams}g</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Cible Protéines (Réparation) :</span>
          <span className="font-bold text-emerald-400">~{targetProteinGrams}g</span>
        </div>
      </div>

      {!recipeGenerated ? (
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleScanAndGenerateRecipe}
          className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAnalyzing ? "Analyse du frigo & calcul des macros..." : "Scanner le frigo & Générer le Fuel-Lock 🥗"}
        </button>
      ) : (
        <div className="bg-neutral-950 border border-cyan-500/40 p-4 rounded-2xl space-y-2 text-xs animate-fadeIn">
          <div className="font-black text-cyan-300">{recipeGenerated.title}</div>
          <ul className="text-neutral-300 space-y-1 list-disc list-inside">
            {recipeGenerated.ingredients.map((ing: string, idx: number) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-neutral-900 text-emerald-400 font-bold font-mono text-[11px]">
            {recipeGenerated.macros}
          </div>
          <button
            type="button"
            onClick={() => setRecipeGenerated(null)}
            className="text-[10px] text-neutral-500 hover:text-neutral-300 underline pt-1 block cursor-pointer"
          >
            Refaire un scan
          </button>
        </div>
      )}
    </div>
  );
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
  onUpdateShoeKm?: (shoeId: string, addedKm: number) => void;
  onNavigateTab?: (tab: string) => void;
  onBack?: () => void;
}

export default function RunningTab({
  currentUserId,
  currentUserProfile,
  shoes = [],
  onAddShoe = () => {},
  onDeleteShoe = () => {},
  onSetActiveShoe = () => {},
  onSaveRunPost,
  onUpdateShoeKm,
  onNavigateTab,
  onBack
}: RunningTabProps) {
  const [openSection, setOpenSection] = useState<'none' | 'circuits' | 'terrain' | 'ravito' | 'gear'>('none');

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [audioCoaching, setAudioCoaching] = useState(true);

  const [terrainType, setTerrainType] = useState<'route' | 'chemin' | 'trail' | 'carriere' | 'boue'>('route');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSavingRun, setIsSavingRun] = useState(false);

  const [plannedRoutePositions, setPlannedRoutePositions] = useState<Array<[number, number]>>([]);
  const [plannedDistanceKm, setPlannedDistanceKm] = useState<number>(0);
  const [circuitType, setCircuitType] = useState<'route' | 'bois' | 'carriere'>('route');
  const [ghostPosition, setGhostPosition] = useState<[number, number] | null>(null);

  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(0);
  const [windDirectionDeg, setWindDirectionDeg] = useState<number>(0);
  const [windDescription, setWindDescription] = useState<string>('Analyse météo en cours...');
  const [coachingAdvice, setCoachingAdvice] = useState('En attente du démarrage de la course...');

  const [targetPaceSecs, setTargetPaceSecs] = useState<number>(330); 
  const [minAllowedPaceSecs, setMinAllowedPaceSecs] = useState<number>(300);
  const [maxAllowedPaceSecs, setMaxAllowedPaceSecs] = useState<number>(360);

  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.log('Wake Lock non supporté ou refusé', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  const [currentPosition, setCurrentPosition] = useState<[number, number]>([50.505, 3.325]);
  const [routePositions, setRoutePositions] = useState<Array<[number, number]>>([[50.505, 3.325]]);

  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [intensity, setIntensity] = useState<'modere' | 'soutenu' | 'maximal'>('soutenu');
  const [bodyWeight, setBodyWeight] = useState<number>(70);

  const lastPositionRef = useRef<[number, number]>([50.505, 3.325]);

  const handleGenerateSmartCircuit = async (targetKm: number) => {
    const baseLat = currentPosition[0];
    const baseLng = currentPosition[1];
    alert(`⏳ Calcul sécurisé du circuit de ${targetKm} km...`);

    try {
      const angleOffset = Math.random() * Math.PI; 
      const halfDistKm = targetKm / 2;
      const latOffset = (halfDistKm / 111) * Math.cos(angleOffset);
      const lngOffset = (halfDistKm / 75) * Math.sin(angleOffset);

      const waypointLat = baseLat + latOffset;
      const waypointLng = baseLng + lngOffset;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${baseLng},${baseLat};${waypointLng},${waypointLat};${baseLng},${baseLat}?overview=full&geometries=geojson`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data && data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        const actualKm = Number((data.routes[0].distance / 1000).toFixed(2));
        const estimatedElevationGain = Math.round(actualKm * 22);

        setPlannedRoutePositions(coords);
        setPlannedDistanceKm(actualKm);
        alert(`✅ Circuit validé : ${actualKm} km | Dénivelé estimé : +${estimatedElevationGain}m D+ ⛰️🗺️`);
        return;
      }
      throw new Error("Réponse OSRM vide");
    } catch (e) {
      const pointsCount = 20;
      const generated: Array<[number, number]> = [];
      const radiusKm = targetKm / (2 * Math.PI);
      const radiusDegree = radiusKm / 111;

      for (let i = 0; i <= pointsCount; i++) {
        const angle = (i / pointsCount) * (2 * Math.PI);
        const lat = baseLat + (Math.sin(angle) * radiusDegree);
        const lng = baseLng + (Math.cos(angle) * radiusDegree * 1.4);
        generated.push([lat, lng]);
      }
      generated.push(generated[0]);

      setPlannedRoutePositions(generated);
      setPlannedDistanceKm(targetKm);
      alert(`⚡ Mode Sécurisé Hors-Ligne : Boucle de ${targetKm} km générée.`);
    }
  };

  // --- GÉNÉRATEUR DE VRAIS SENTIERS DE TRAIL AVEC CALCUL DE DÉNIVELÉ ---
  const handleFetchAllForestPaths = async () => {
    alert("🌲 Génération d'un vrai parcours trail à travers les champs et les bois...");

    const baseLat = currentPosition[0];
    const baseLng = currentPosition[1];

    try {
      const wp1Lat = baseLat + 0.018 + (Math.random() * 0.005);
      const wp1Lng = baseLng + 0.005;
      const wp2Lat = baseLat + 0.005;
      const wp2Lng = baseLng + 0.022 + (Math.random() * 0.005);
      const wp3Lat = baseLat - 0.015 - (Math.random() * 0.005);
      const wp3Lng = baseLng - 0.008;

      const url = `https://router.project-osrm.org/route/v1/foot/${baseLng},${baseLat};${wp1Lng},${wp1Lat};${wp2Lng},${wp2Lat};${wp3Lng},${wp3Lat};${baseLng},${baseLat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data && data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        const actualKm = Number((data.routes[0].distance / 1000).toFixed(2));
        
        // Calcul du dénivelé positif estimé (environ 32m D+ par km en sous-bois / champs vallonnés)
        const estimatedElevationGain = Math.round(actualKm * 32);

        setPlannedRoutePositions(coords);
        setPlannedDistanceKm(actualKm);
        alert(`✅ Parcours Trail (Champs & Bois) : ${actualKm} km | Dénivelé : +${estimatedElevationGain}m D+ 🌲⛰️`);
        return;
      }
      throw new Error("Erreur de génération");
    } catch (err) {
      alert("⚠️ Mode hors-ligne : Utilise l'import de fichier GPX (.gpx) pour charger tes tracés de champs et de bois précis !");
    }
  };

  const handleShareCircuitAsChallenge = () => {
    if (plannedRoutePositions.length === 0 || plannedDistanceKm <= 0) {
      alert("Veuillez d'abord générer ou importer un circuit cible !");
      return;
    }

    if (onSaveRunPost) {
      onSaveRunPost(`🗺️ [NOUVEAU PARCOURS DÉFI] Boucle de ${plannedDistanceKm} km (${circuitType.toUpperCase()}). Qui relève le défi de venir la courir ? 🚀`, plannedDistanceKm);
      alert(`🎯 Parcours partagé avec succès sur le fil du club !`);
    } else {
      alert(`🎯 Parcours de ${plannedDistanceKm} km prêt à être partagé !`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.name.endsWith('.gpx')) {
        try {
          const gpx = new gpxParser();
          gpx.parse(content);
          const tracks = gpx.tracks[0];
          if (tracks && tracks.points?.length > 0) {
            const points: Array<[number, number]> = tracks.points.map((p: any) => [p.lat, p.lon]);
            let km = Number((tracks.distance.total / 1000).toFixed(2));

            const isTargetCircuit = confirm(`Tracé GPX chargé (${km} km). Utiliser comme CIRCUIT CIBLE (Ligne bleue) ? Annuler pour importer comme course réalisée.`);

            if (isTargetCircuit) {
              setPlannedRoutePositions(points);
              setPlannedDistanceKm(km);
              alert(`🗺️ Circuit cible importé !`);
            } else {
              if (terrainType === 'trail') km *= 1.1;
              else if (terrainType === 'carriere') km *= 1.15;
              else if (terrainType === 'boue') km *= 1.25;

              setRoutePositions(points);
              setDistanceKm(Number(km.toFixed(2)));
              setCurrentPosition(points[points.length - 1]);
              lastPositionRef.current = points[points.length - 1];
              alert(`🚀 Course GPX importée ! Distance d'effort : ${km.toFixed(2)} km`);
            }
          } else {
            alert("Format GPX invalide ou vide.");
          }
        } catch (err) {
          alert("Erreur lors de l'analyse du fichier GPX.");
        }
      } else {
        alert("Veuillez sélectionner un fichier au format .gpx valide.");
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const savedRun = localStorage.getItem('fitpulse_offline_run');
    if (savedRun) {
      try {
        const parsed = JSON.parse(savedRun);
        if (parsed.distanceKm > 0 && Array.isArray(parsed.routePositions) && parsed.routePositions.length > 0) {
          const validPositions = parsed.routePositions.filter((pt: any) => Array.isArray(pt) && pt.length === 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number');
          
          if (validPositions.length > 0 && confirm("⚡ [Mode Hors-Ligne] Une course interrompue a été détectée. Veux-tu récupérer ton tracé ?")) {
            setRoutePositions(validPositions);
            setDistanceKm(parsed.distanceKm || 0);
            setSeconds(parsed.seconds || 0);
            setCurrentPosition(validPositions[validPositions.length - 1]);
            lastPositionRef.current = validPositions[validPositions.length - 1];
          } else {
            localStorage.removeItem('fitpulse_offline_run');
          }
        } else {
          localStorage.removeItem('fitpulse_offline_run');
        }
      } catch (e) {
        localStorage.removeItem('fitpulse_offline_run');
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      localStorage.setItem('fitpulse_offline_run', JSON.stringify({
        routePositions,
        distanceKm,
        seconds,
        timestamp: Date.now()
      }));
    }
  }, [routePositions, distanceKm, seconds, isRunning]);

  const speakMessage = (text: string) => {
    if (!audioCoaching || !isRunning || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const fetchRealTimeWindAndPosition = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m`);
      const data = await response.json();
      if (data && data.current) {
        setWindSpeedKmh(data.current.wind_speed_10m);
        setWindDirectionDeg(data.current.wind_direction_10m);
        if (data.current.wind_speed_10m > 25) setWindDescription(`Vent fort de ${data.current.wind_speed_10m} km/h 💨`);
        else if (data.current.wind_speed_10m > 12) setWindDescription(`Vent modéré de ${data.current.wind_speed_10m} km/h 🌬️`);
        else setWindDescription(`Vent calme (${data.current.wind_speed_10m} km/h) 🍃`);
      }
    } catch (e) {
      setWindDescription("Météo hors-ligne");
    }
  };

  const fetchInitialPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coord: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCurrentPosition(coord);
          lastPositionRef.current = coord;
          if (routePositions.length <= 1) setRoutePositions([coord]);
          fetchRealTimeWindAndPosition(coord[0], coord[1]);
        },
        () => fetchRealTimeWindAndPosition(50.6053, 3.3862),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => { fetchInitialPosition(); }, []);

  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // --- LOGIQUE DU GHOST PACER ---
  useEffect(() => {
    if (isRunning && !isPaused && plannedRoutePositions.length > 0 && plannedDistanceKm > 0) {
      const ghostDistanceKm = seconds / targetPaceSecs; 
      let ratio = ghostDistanceKm / plannedDistanceKm;
      if (ratio > 1) ratio = 1;

      const targetIndex = Math.floor(ratio * (plannedRoutePositions.length - 1));
      setGhostPosition(plannedRoutePositions[targetIndex]);
    } else if (!isRunning) {
      setGhostPosition(null);
    }
  }, [seconds, isRunning, isPaused, plannedRoutePositions, plannedDistanceKm, targetPaceSecs]);

  useEffect(() => {
    let interval: any = null;
    let watchId: number | null = null;

    if (isRunning && !isPaused) {
      requestWakeLock();
      interval = setInterval(() => {
        setSeconds(s => {
          const newSecs = s + 1;
          if (distanceKm > 0.1) {
            const currentSecPerKm = newSecs / distanceKm;
            if (currentSecPerKm < minAllowedPaceSecs) {
              const alertText = "Attention Antoine, tu es trop rapide ! Ralentis pour rester dans ta fourchette cible.";
              setCoachingAdvice(alertText);
              speakMessage(alertText);
            } else if (currentSecPerKm > maxAllowedPaceSecs) {
              const alertText = "Attention Antoine, ton allure chute, relance ta foulée pour rentrer dans la cible.";
              setCoachingAdvice(alertText);
              speakMessage(alertText);
            }
          }
          return newSecs;
        });
      }, 1000);

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
            const deltaKm = calculateHaversineDistance(lastPositionRef.current[0], lastPositionRef.current[1], newPos[0], newPos[1]);

            if (deltaKm > 0.002) {
              lastPositionRef.current = newPos;
              setCurrentPosition(newPos);
              setRoutePositions(prev => [...prev, newPos]);

              let mult = 1.0;
              if (terrainType === 'chemin') mult = 1.05;
              if (terrainType === 'trail') mult = 1.1;
              if (terrainType === 'carriere') mult = 1.15;
              if (terrainType === 'boue') mult = 1.25;

              setDistanceKm(d => Number((d + deltaKm * mult).toFixed(2)));
              fetchRealTimeWindAndPosition(newPos[0], newPos[1]);
            }
          },
          (error) => console.warn("GPS watch error :", error),
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
        );
      }
    } else {
      releaseWakeLock();
    }

    return () => {
      clearInterval(interval);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      releaseWakeLock();
    };
  }, [isRunning, isPaused, distanceKm, minAllowedPaceSecs, maxAllowedPaceSecs, terrainType]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins < 10 ? '0' : ''}${remMins}m ${secs < 10 ? '0' : ''}${secs}s`;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartRun = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsRunning(true);
    setIsPaused(false);
    setSeconds(0);
    setDistanceKm(0);
    fetchInitialPosition();
    setCoachingAdvice(`Sortie démarrée sur terrain : ${terrainType.toUpperCase()}. GPS réel et sécurité hors-ligne actifs.`);
    speakMessage(`Sortie démarrée. Terrain sélectionné : ${terrainType}. GPS réel activé. Bon entraînement !`);
  };

  const handlePauseRun = () => {
    setIsPaused(!isPaused);
    speakMessage(isPaused ? "Reprise de la course." : "Chrono en pause.");
  };

  const handleOpenReportModal = () => {
    setIsRunning(false);
    setIsPaused(false);
    releaseWakeLock();
    speakMessage("Séance terminée. Excellent travail !");
    setIsReportModalOpen(true);
  };

  const applyMileageToActiveShoe = () => {
    if (distanceKm <= 0 || shoes.length === 0) return;
    const activeShoe = shoes.find((s: any) => s.is_active || s.active);
    if (activeShoe && onUpdateShoeKm) {
      const shoeId = activeShoe.id || activeShoe._id;
      if (shoeId) onUpdateShoeKm(shoeId, distanceKm);
    }
  };

  const handleSavePrivate = () => {
    if (isSavingRun) return;
    setIsSavingRun(true);
    setIsReportModalOpen(false);
    applyMileageToActiveShoe();
    localStorage.removeItem('fitpulse_offline_run');
    alert(`Course de ${distanceKm} km enregistrée en privé ! Kilométrage des chaussures actualisé 👟🔒`);
    setIsSavingRun(false);
  };

  const handlePublishChallenge = () => {
    if (isSavingRun) return;
    setIsSavingRun(true);
    setIsReportModalOpen(false);
    if (distanceKm > 0) {
      if (onSaveRunPost) {
        onSaveRunPost(`🎯 [DÉFI CLUB] Sortie GPS (${terrainType.toUpperCase()}) de ${distanceKm} km en ${formatTime(seconds)} (${paceFormatted}/km). Qui vient battre ce chrono ? 🚀`, distanceKm);
      }
      applyMileageToActiveShoe();
    }
    localStorage.removeItem('fitpulse_offline_run');
    alert(`Rapport publié sur le fil comme Défi Officiel du Club ! 🏆🔥`);
    setIsSavingRun(false);
  };

  const currentHours = seconds / 3600;
  const currentSpeedKmh = currentHours > 0 && distanceKm > 0 ? (distanceKm / currentHours).toFixed(1) : '0.0';
    
  let paceFormatted = '--:--';
  if (distanceKm > 0 && seconds > 0) {
    const totalSecPerKm = seconds / distanceKm;
    const rawMins = Math.floor(totalSecPerKm / 60);
    const rawSecs = Math.round(totalSecPerKm % 60);
    paceFormatted = `${rawMins}'${rawSecs < 10 ? '0' : ''}${rawSecs}"`;
  }

  const activeHours = isRunning ? Math.floor(seconds / 3600) : durationHours;
  const activeMins = isRunning ? Math.floor((seconds % 3600) / 60) : durationMins;
  const totalActiveHours = activeHours + activeMins / 60;

  let carbsPerHour = 60;
  if (intensity === 'modere') carbsPerHour = 45;
  if (intensity === 'soutenu') carbsPerHour = 65;
  if (intensity === 'maximal') carbsPerHour = 90;

  const totalCarbs = Math.round(carbsPerHour * (totalActiveHours > 0 ? totalActiveHours : 0.1));
  const waterPerception = intensity === 'maximal' ? 750 : 600;
  const totalWaterMl = Math.round(waterPerception * (totalActiveHours > 0 ? totalActiveHours : 0.1));

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        )}
      </div>

      {/* --- CARTE PRINCIPALE : PRÊT À COURIR & LANCEMENT RAPIDE --- */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/35 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">QG Running & GPS</span>
            <h2 className="text-xl font-black text-white tracking-tight pt-0.5">Session d'Effort & Live Tracking</h2>
          </div>
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/30 shadow-sm flex items-center gap-1.5">
            <Activity className="w-4 h-4 animate-pulse" /> GPS Actif
          </span>
        </div>

        {/* Bloc Live Actif si la course a démarré */}
        {isRunning ? (
          <div className="bg-neutral-950 border border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-inner animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
                <Navigation className="w-4 h-4 animate-spin" /> Enregistrement en cours...
              </span>
              <span className="text-xs text-neutral-400 font-mono">{formatTime(seconds)}</span>
            </div>

            <div className="w-full h-64 rounded-xl overflow-hidden border border-neutral-800 relative z-0">
              <MapContainer center={currentPosition} zoom={16} scrollWheelZoom={true} style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
                <MapController center={currentPosition} plannedRoute={plannedRoutePositions} />
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {plannedRoutePositions.length > 0 && (
                  <Polyline positions={plannedRoutePositions} pathOptions={{ color: '#38bdf8', weight: 4, opacity: 0.8, dashArray: '6, 6' }} />
                )}
                <Polyline positions={routePositions} pathOptions={{ color: '#10b981', weight: 6, opacity: 0.95 }} />
                <Marker position={currentPosition} icon={runnerIcon} />
                {ghostPosition && <Marker position={ghostPosition} icon={ghostIcon} />}
              </MapContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-[9px] text-neutral-400 font-bold block uppercase">Distance</span>
                <span className="text-sm font-black text-white">{distanceKm.toFixed(2)} km</span>
              </div>
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-[9px] text-neutral-400 font-bold block uppercase">Vitesse</span>
                <span className="text-sm font-black text-emerald-400">{currentSpeedKmh} km/h</span>
              </div>
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-[9px] text-neutral-400 font-bold block uppercase">Allure</span>
                <span className="text-sm font-black text-orange-400">{paceFormatted}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handlePauseRun} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button type="button" onClick={handleOpenReportModal} className="flex-1 py-3 bg-red-950 border border-red-900 hover:bg-red-900 text-red-400 font-black rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer">
                <Square className="w-4 h-4 fill-red-400" /> Terminer
              </button>
            </div>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={handleStartRun} 
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" /> Démarrer la session GPS maintenant 🚀
          </button>
        )}
      </div>

      {/* --- FITBOT SNC (Intelligent Auto-Régulation) --- */}
      <FitBotSNC readinessScore={78} weeklyLoad={45} />

      {/* --- TIROIRS INTELLIGENTS PLIABLES (Pour garder l'écran propre sans rien perdre) --- */}
      <div className="space-y-3">

        {/* 1. Architecte de Circuits & Itinéraires */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <button 
            type="button"
            onClick={() => setOpenSection(openSection === 'circuits' ? 'none' : 'circuits')}
            className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <CompassIcon className="w-4 h-4" /> Architecte de Circuits & Itinéraires ⚡
            </div>
            {openSection === 'circuits' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {openSection === 'circuits' && (
            <div className="p-5 pt-0 space-y-4 border-t border-neutral-800 animate-fadeIn">
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-neutral-400">Génère un circuit ou trace des sentiers de campagne/bois.</span>
                {plannedRoutePositions.length > 0 && (
                  <button onClick={() => { setPlannedRoutePositions([]); setPlannedDistanceKm(0); }} className="text-[10px] text-red-400 hover:underline font-bold">
                    Effacer ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-neutral-300">Sol :</span>
                {(['route', 'bois', 'carriere'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCircuitType(type)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer border ${
                      circuitType === type ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {type === 'route' ? '🛣️ Route' : type === 'bois' ? '🌲 Bois' : '🏗️ Carrière'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 21].map(km => (
                  <button key={km} type="button" onClick={() => handleGenerateSmartCircuit(km)} className="py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/50 rounded-2xl text-xs font-black text-white transition cursor-pointer shadow-md flex flex-col items-center gap-0.5 group">
                    <span className="text-sky-400 group-hover:scale-110 transition">{km} km</span>
                    <span className="text-[8px] text-neutral-400 uppercase">Boucle</span>
                  </button>
                ))}
              </div>

              {/* Bouton pour générer de vrais sentiers de champs et de bois via OSRM Piéton */}
              <button 
                type="button" 
                onClick={handleFetchAllForestPaths} 
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
              >
                🌲 Générer un parcours Trail (Champs & Bois)
              </button>

              {plannedRoutePositions.length > 0 && (
                <button type="button" onClick={handleShareCircuitAsChallenge} className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg">
                  <Send className="w-4 h-4" /> Partager ce parcours au Club 🎯
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Terrain & Import GPX */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <button 
            type="button"
            onClick={() => setOpenSection(openSection === 'terrain' ? 'none' : 'terrain')}
            className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Mountain className="w-4 h-4" /> Terrain d'Effort & Import GPX 🗺️
            </div>
            {openSection === 'terrain' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {openSection === 'terrain' && (
            <div className="p-5 pt-0 space-y-4 border-t border-neutral-800 animate-fadeIn pt-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Type de sol (Ajustement d'effort) :</label>
                <select
                  value={terrainType}
                  onChange={(e: any) => setTerrainType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="route">🛣️ Route / Asphalte (1.0x)</option>
                  <option value="chemin">🛤️ Chemin / Terre (1.05x)</option>
                  <option value="trail">⛰️ Trail & Dénivelé (1.1x)</option>
                  <option value="carriere">🏗️ Carrière / Gravier (1.15x)</option>
                  <option value="boue">🌧️ Boue / Sable / Neige (1.25x)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Import Fichier Montre (.GPX) :</label>
                <input type="file" accept=".gpx" onChange={handleFileUpload} className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer bg-neutral-950 border border-neutral-800 rounded-2xl p-2" />
              </div>
            </div>
          )}
        </div>

        {/* 3. Planificateur de Ravitaillement */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <button 
            type="button"
            onClick={() => setOpenSection(openSection === 'ravito' ? 'none' : 'ravito')}
            className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Planificateur de Ravitaillement 🍎
            </div>
            {openSection === 'ravito' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {openSection === 'ravito' && (
            <div className="p-5 pt-0 space-y-4 border-t border-neutral-800 animate-fadeIn pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Durée (Heures) :</label>
                  <input type="number" min="0" max="12" value={activeHours} onChange={(e) => setDurationHours(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Durée (Minutes) :</label>
                  <input type="number" min="0" max="55" step="5" value={activeMins} onChange={(e) => setDurationMins(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1"><Apple className="w-3.5 h-3.5 text-orange-500" /> Glucides Requis</span>
                  <div className="text-xl font-black text-white">{totalCarbs} <span className="text-xs font-normal text-orange-400">g</span></div>
                </div>
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1"><Droplet className="w-3.5 h-3.5 text-cyan-400" /> Hydratation</span>
                  <div className="text-xl font-black text-white">{(totalWaterMl / 1000).toFixed(2)} <span className="text-xs font-normal text-cyan-400">L</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Gear Tracker & Matériel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <button 
            type="button"
            onClick={() => setOpenSection(openSection === 'gear' ? 'none' : 'gear')}
            className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4" /> Gear Tracker (Chaussures & Usure) 👟
            </div>
            {openSection === 'gear' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {openSection === 'gear' && (
            <div className="p-5 pt-0 border-t border-neutral-800 animate-fadeIn pt-3">
              <GearTrackerSection shoes={shoes} onAddShoe={onAddShoe} onDeleteShoe={onDeleteShoe} onSetActiveShoe={onSetActiveShoe} />
            </div>
          )}
        </div>

      </div>

      {/* --- MODALE DE RAPPORT DE COURSE & FUEL-LOCK --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" /> Rapport de Course & Fuel-Lock
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800/50 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                  Terrain : {terrainType.toUpperCase()}
                </span>
                <span className="text-xs text-neutral-400">{formatTime(seconds)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Distance</span>
                  <span className="text-sm font-black text-white">{distanceKm.toFixed(2)} km</span>
                </div>
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Allure</span>
                  <span className="text-sm font-black text-orange-400">{paceFormatted}</span>
                </div>
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Vitesse</span>
                  <span className="text-sm font-black text-emerald-400">{currentSpeedKmh} km/h</span>
                </div>
              </div>
            </div>

            {/* Condition stricte : Le Fuel-Lock ne s'affiche que si distance > 0.05 km */}
            {distanceKm > 0.05 ? (
              <FuelLockPostWod lastRunDistanceKm={distanceKm} bodyWeightKg={bodyWeight} />
            ) : (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center text-xs text-neutral-400">
                ℹ️ Aucune distance significative enregistrée (session test à 0 km). Pas de calcul Fuel-Lock nécessaire.
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button onClick={handlePublishChallenge} disabled={isSavingRun} className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50">
                <Award className="w-4 h-4" /> Publier comme Défi sur le Fil du Club 🏆
              </button>
              <button onClick={handleSavePrivate} disabled={isSavingRun} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <EyeOff className="w-4 h-4" /> Enregistrer en privé uniquement 🔒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
