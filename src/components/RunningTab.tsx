import PaywallGate from './PaywallGate';
import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, MapPin, Volume2, VolumeX, 
  Compass, Apple, Droplet, Zap, Navigation, LocateFixed, Activity, Gauge, Timer, Target, Radio, Wind, ArrowLeft, Share2, EyeOff, X, Upload, Mountain, Compass as CompassIcon, Trophy, Award, Flame, Send 
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
  const [routePositions, setRoutePositions] = useState<Array<[number, number]>>([
    [50.505, 3.325]
  ]);

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

        setPlannedRoutePositions(coords);
        setPlannedDistanceKm(actualKm);
        alert(`✅ Circuit routier validé : ${actualKm} km 🗺️`);
        return;
      }
      throw new Error("Réponse OSRM vide");
    } catch (e) {
      console.warn("Basculement sur le générateur géométrique de secours sécurisé :", e);
      
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
        alert("Veuillez sélectionner un fichier .gpx valide.");
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

  const triggerSilentBroadcastTest = () => {
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 400]);
    alert("📳 [Silent Broadcast] Signal d'encouragement reçu en direct !");
  };

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
  const standardGelsCount = Math.round(totalCarbs / 25);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {onBack && (
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/35 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4" /> Mode Running & Ghost Pacing
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">GPS Réel, Rapports & Défis Club</h2>
          </div>
          <button type="button" onClick={fetchInitialPosition} className="flex items-center gap-1.5 text-xs font-bold bg-neutral-950/90 border border-neutral-800 px-3.5 py-2 rounded-xl text-emerald-400 hover:bg-neutral-800 transition shadow-inner cursor-pointer">
            <LocateFixed className="w-4 h-4 animate-pulse" /> Ma Position
          </button>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <CompassIcon className="w-4 h-4" /> Architecte de Circuits & Itinéraires Réels ⚡
          </div>
          {plannedRoutePositions.length > 0 && (
            <button onClick={() => { setPlannedRoutePositions([]); setPlannedDistanceKm(0); }} className="text-[10px] text-red-400 hover:underline font-bold">
              Effacer le tracé ✕
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Génère instantanément un vrai circuit routier basé sur les axes d'OpenStreetMap autour de ta position pour ta préparation ou ton entraînement du jour.
        </p>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-300">Type de sol :</span>
            {(['route', 'bois', 'carriere'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setCircuitType(type)}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer border ${
                  circuitType === type ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {type === 'route' ? '🛣️ Route' : type === 'bois' ? '🌲 Bois / Chemins' : '🏗️ Carrière'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 21].map(km => (
              <button key={km} type="button" onClick={() => handleGenerateSmartCircuit(km)} className="py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/50 rounded-2xl text-xs font-black text-white transition cursor-pointer shadow-md flex flex-col items-center gap-1 group">
                <span className="text-sky-400 group-hover:scale-110 transition">{km} km</span>
                <span className="text-[9px] text-neutral-400 uppercase">Boucle</span>
              </button>
            ))}
          </div>

          {plannedRoutePositions.length > 0 && (
            <button type="button" onClick={handleShareCircuitAsChallenge} className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg">
              <Send className="w-4 h-4" /> Partager ce parcours en Défi au Club 🎯
            </button>
          )}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Mountain className="w-4 h-4" /> Sélection du Type de Terrain (Correction d'effort)
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Choisis ton type de parcours avant de démarrer. FitPulse adapte le calcul de la distance d'effort et protège ton score de forme (Readiness) face à la pénibilité du sol ou du dénivelé.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {[
            { id: 'route', label: '🛣️ Route / Asphalte', desc: 'Standard (1.0x)' },
            { id: 'chemin', label: '🛤️ Chemin / Terre', desc: 'Léger amorti (1.05x)' },
            { id: 'trail', label: '⛰️ Trail & Dénivelé', desc: 'Montées/Descentes (1.1x)' },
            { id: 'carriere', label: '🏗️ Carrière / Gravier', desc: 'Sol fuyant (1.15x)' },
            { id: 'boue', label: '🌧️ Boue / Sable / Neige', desc: 'Très énergivore (1.25x)' },
          ].map((terrain) => (
            <button
              key={terrain.id}
              type="button"
              disabled={isRunning}
              onClick={() => setTerrainType(terrain.id as any)}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                terrainType === terrain.id ? 'bg-orange-600/20 border-orange-500 text-white shadow-md' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-xs font-black">{terrain.label}</span>
              <span className="text-[10px] text-neutral-400 pt-1">{terrain.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 text-xs space-y-1.5 shadow-lg">
        <div className="flex items-center gap-2 text-orange-400 font-bold">
          <span>💡 Comment utiliser l'onglet Running ?</span>
        </div>
        <p className="text-neutral-400 leading-relaxed">
          Enregistre ton parcours en direct avec le traceur GPS ou importe le fichier <code className="text-orange-300">.gpx</code> de ta montre (Huawei, Garmin...). À la fin de ta séance, la distance est automatiquement reportée sur l'usure kilométrique de tes chaussures actives ! 👟
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
          <Upload className="w-4 h-4" /> Import Universel Montre (.GPX)
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Importe directement le fichier d'export de ta montre (Garmin, Huawei, Polar, Coros, etc.) pour afficher instantanément ton tracé sur la carte et calculer ta distance.
        </p>
        <input type="file" accept=".gpx" onChange={handleFileUpload} className="w-full text-xs text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer bg-neutral-950 border border-neutral-800 rounded-2xl p-2" />
      </div>

      <PaywallGate userId={currentUserId} currentUserProfile={currentUserProfile} featureName="Ghost Pacing Météo & Vocal">
        <div className="bg-neutral-900 border border-orange-500/30 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 text-orange-400 font-black text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Ghost Pacing & Vent Météo en Direct
            </div>
            <span className="text-[10px] font-extrabold bg-orange-500/20 text-orange-300 px-2.5 py-0.5 rounded-full border border-orange-500/30">
              Pro 🛰️
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs relative z-10">
            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
              <span className="text-neutral-400 flex items-center gap-1.5 font-bold"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Analyse Vent Satellite</span>
              <div className="text-sm font-black text-white pt-1">{windDescription}</div>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
              <span className="text-neutral-400 flex items-center gap-1.5 font-bold"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Orientation & Vitesse</span>
              <span className="text-sm font-black text-emerald-400">
                {windSpeedKmh} km/h (Cap {windDirectionDeg}°)
              </span>
            </div>
          </div>

          <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
              🗣️
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 block">Dernier conseil vocal du coach</span>
              <p className="text-xs text-neutral-200 leading-snug">{coachingAdvice}</p>
            </div>
          </div>
        </div>
      </PaywallGate>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Statut de Forme & Fatigue du Jour
          </div>
          <button type="button" onClick={() => { localStorage.setItem('fitpulse_active_tab', 'readiness'); if (onNavigateTab) onNavigateTab('readiness'); else window.location.reload(); }} className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full hover:bg-orange-500/20 transition cursor-pointer">
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

      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" /> Carte Live & Circuit Cible (Offline Safe)
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {isRunning ? 'Enregistrement actif...' : plannedDistanceKm > 0 ? `Circuit ${plannedDistanceKm} km prêt` : 'Prêt à démarrer'}
          </span>
        </div>

        <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 relative z-0">
          <MapContainer center={currentPosition} zoom={16} scrollWheelZoom={true} style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
            <MapController center={currentPosition} plannedRoute={plannedRoutePositions} />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {plannedRoutePositions.length > 0 && (
              <Polyline positions={plannedRoutePositions} pathOptions={{ color: '#38bdf8', weight: 4, opacity: 0.8, dashArray: '6, 6', lineCap: 'round', lineJoin: 'round' }} />
            )}
            <Polyline positions={routePositions} pathOptions={{ color: '#10b981', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} />
            <Marker position={currentPosition} icon={runnerIcon} />
          </MapContainer>

          <div className="absolute bottom-3 left-3 z-[1000] bg-neutral-950/90 border border-neutral-800 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] text-emerald-400 font-mono flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Lat: {currentPosition[0].toFixed(4)}° N, Lng: {currentPosition[1].toFixed(4)}° E</span>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-orange-500" /> Traceur Live & Audio
          </h3>
          <button type="button" onClick={() => setAudioCoaching(!audioCoaching)} className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${audioCoaching ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-neutral-950 text-neutral-500 border-neutral-800'}`}>
            {audioCoaching ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioCoaching ? 'Coach Vocal Actif' : 'Muté'}
          </button>
        </div>

        <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-orange-400" /> Objectif d'allure cible :
            </span>
            <select value={targetPaceSecs} onChange={(e) => setTargetPaceSecs(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-orange-400 font-bold focus:outline-none cursor-pointer">
              <option value={270}>4'30" / km (Soutenu)</option>
              <option value={300}>5'00" / km (Modéré+)</option>
              <option value={330}>5'30" / km (Endurance active)</option>
              <option value={360}>6'00" / km (Endurance cool)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-neutral-900 space-y-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Fourchette d'alerte vocale (Trop rapide / Trop lent)</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Seuil min (ex: 5'00")</label>
                <select value={minAllowedPaceSecs} onChange={(e) => setMinAllowedPaceSecs(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none">
                  <option value={240}>4'00" / km</option>
                  <option value={270}>4'30" / km</option>
                  <option value={300}>5'00" / km</option>
                  <option value={330}>5'30" / km</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Seuil max (ex: 6'00")</label>
                <select value={maxAllowedPaceSecs} onChange={(e) => setMaxAllowedPaceSecs(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-cyan-400 font-bold focus:outline-none">
                  <option value={330}>5'30" / km</option>
                  <option value={360}>6'00" / km</option>
                  <option value={390}>6'30" / km</option>
                  <option value={420}>7'00" / km</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Distance d'effort</span>
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

        <button type="button" onClick={triggerSilentBroadcastTest} className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg">
          <Radio className="w-4 h-4 animate-pulse" /> 📳 Tester le Silent Broadcast (Vibration + Son)
        </button>

        <div className="flex gap-3 pt-2">
          {!isRunning ? (
            <button type="button" onClick={handleStartRun} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition cursor-pointer">
              <Play className="w-4 h-4 fill-white" /> Démarrer la sortie ({terrainType.toUpperCase()})
            </button>
          ) : (
            <>
              <button type="button" onClick={handlePauseRun} className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer">
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button type="button" onClick={handleOpenReportModal} className="flex-1 py-4 bg-red-950/60 border border-red-900/50 hover:bg-red-900/60 text-red-400 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer">
                <Square className="w-4 h-4 fill-red-400" /> Terminer la course
              </button>
            </>
          )}
        </div>
      </div>

      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" /> Rapport de Course & Défi Club
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
                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Allure Brute</span>
                  <span className="text-sm font-black text-orange-400">{paceFormatted}</span>
                </div>
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Vitesse Moy</span>
                  <span className="text-sm font-black text-emerald-400">{currentSpeedKmh} km/h</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" /> Analyse & Impact Forme :
              </span>
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 text-neutral-400 space-y-1.5 leading-relaxed">
                <p>✅ <strong>Coefficient de terrain ({terrainType}) :</strong> Appliqué avec succès pour refléter l'effort réel sur le système cardiovasculaire et l'usure de vos chaussures.</p>
                <p>⚡ <strong>Impact Récupération (Readiness) :</strong> Intégré dans l'historique de charge d'entraînement FitPulse.</p>
              </div>
            </div>

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

      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
          <Zap className="w-4 h-4" /> Planificateur de Ravitaillement
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Durée (Heures) :</label>
            <input type="number" min="0" max="12" value={activeHours} disabled={isRunning} onChange={(e) => setDurationHours(Number(e.target.value))} className={`w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`} />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Durée (Minutes) :</label>
            <input type="number" min="0" max="55" step="5" value={activeMins} disabled={isRunning} onChange={(e) => setDurationMins(Number(e.target.value))} className={`w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Intensité :</label>
            <select value={intensity} onChange={(e: any) => setIntensity(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer">
              <option value="modere">Modéré (Endurance cool)</option>
              <option value="soutenu">Soutenu (Allure semi/marathon)</option>
              <option value="maximal">Maximal (Seuil / Race Pace)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Poids corporel (kg) :</label>
            <input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none" />
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
            <span className="text-[10px] text-neutral-500 block">With electrolytes suggested</span>
          </div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
          <span className="font-bold text-orange-400 block">Stratégie de course :</span>
          <p className="text-neutral-300 leading-relaxed">
            Pour cette sortie de <strong>{activeHours}h{activeMins > 0 ? `${activeMins}m` : ''}</strong>, prévois environ <strong>{standardGelsCount} gels énergétiques</strong> à répartir toutes les 30 à 45 minutes, accompagnés de petites gorgées d'eau régulièrement.
          </p>
        </div>
      </div>

      <GearTrackerSection shoes={shoes} onAddShoe={onAddShoe} onDeleteShoe={onDeleteShoe} onSetActiveShoe={onSetActiveShoe} />
    </div>
  );
}
