import PaywallGate from './PaywallGate';
import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, MapPin, Volume2, VolumeX, 
  Compass, Apple, Droplet, Zap, Navigation, LocateFixed, Activity, Gauge, Timer, Target, Radio, Wind, ArrowLeft 
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
  onBack?: () => void;
}

export default function RunningTab({
  currentUserId,
  shoes = [],
  onAddShoe = () => {},
  onDeleteShoe = () => {},
  onSetActiveShoe = () => {},
  onSaveRunPost,
  onNavigateTab,
  onBack
}: RunningTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [audioCoaching, setAudioCoaching] = useState(true);

  // Ghost Pacing Vocal & Météo Réelle API States
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(0);
  const [windDirectionDeg, setWindDirectionDeg] = useState<number>(0);
  const [windDescription, setWindDescription] = useState<string>('Analyse météo en cours...');
  const [coachingAdvice, setCoachingAdvice] = useState('En attente du démarrage de la course...');

  // Objectif d'allure cible en secondes par kilomètre (Ex: 5'30" = 330 secondes)
  const [targetPaceSecs, setTargetPaceSecs] = useState<number>(330); 

  const [currentPosition, setCurrentPosition] = useState<[number, number]>([50.505, 3.325]);
  const [routePositions, setRoutePositions] = useState<Array<[number, number]>>([
    [50.505, 3.325]
  ]);

  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [intensity, setIntensity] = useState<'modere' | 'soutenu' | 'maximal'>('soutenu');
  const [bodyWeight, setBodyWeight] = useState<number>(70);

  const lastPositionRef = useRef<[number, number]>([50.505, 3.325]);

  // --- OFFLINE RUN GUARD : Restauration d'une course non finalisée au chargement ---
  useEffect(() => {
    const savedRun = localStorage.getItem('fitpulse_offline_run');
    if (savedRun) {
      try {
        const parsed = JSON.parse(savedRun);
        if (parsed.distanceKm > 0 && confirm("⚡ [Mode Hors-Ligne] Une course interrompue a été détectée en local. Veux-tu récupérer ton tracé et tes données ?")) {
          setRoutePositions(parsed.routePositions || [[50.505, 3.325]]);
          setDistanceKm(parsed.distanceKm || 0);
          setSeconds(parsed.seconds || 0);
          if (parsed.routePositions?.length > 0) {
            setCurrentPosition(parsed.routePositions[parsed.routePositions.length - 1]);
            lastPositionRef.current = parsed.routePositions[parsed.routePositions.length - 1];
          }
        } else {
          localStorage.removeItem('fitpulse_offline_run');
        }
      } catch (e) {
        console.warn("Erreur lecture sauvegarde locale course :", e);
        localStorage.removeItem('fitpulse_offline_run');
      }
    }
  }, []);

  // --- OFFLINE RUN GUARD : Sauvegarde incrémentielle en temps réel ---
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

  // Fonction de synthèse vocale intelligente (strictement sécurisée : ne parle QUE si isRunning est actif)
  const speakMessage = (text: string) => {
    if (!audioCoaching || !isRunning || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Récupération automatique de la météo réelle (Vent & Vitesse) via API Open-Meteo
  const fetchRealTimeWindAndPosition = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m`);
      const data = await response.json();
       
      if (data && data.current) {
        const speed = data.current.wind_speed_10m;
        const direction = data.current.wind_direction_10m;
         
        setWindSpeedKmh(speed);
        setWindDirectionDeg(direction);

        if (speed > 25) {
          setWindDescription(`Vent fort de ${speed} km/h (Direction ${direction}°) 💨`);
        } else if (speed > 12) {
          setWindDescription(`Vent modéré de ${speed} km/h (Direction ${direction}°) 🌬️`);
        } else {
          setWindDescription(`Conditions de vent calmes (${speed} km/h) 🍃`);
        }
      }
    } catch (e) {
      console.warn("Impossible de joindre l'API Météo (Zone blanche potentielle) :", e);
      setWindDescription("Météo locale indisponible (Mode hors-ligne actif)");
    }
  };

  const fetchInitialPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coord: [number, number] = [lat, lng];
          setCurrentPosition(coord);
          lastPositionRef.current = coord;
          if (routePositions.length <= 1) {
            setRoutePositions([coord]);
          }
          fetchRealTimeWindAndPosition(lat, lng);
        },
        (error) => {
          console.warn("GPS non disponible :", error.message);
          fetchRealTimeWindAndPosition(50.6053, 3.3862);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    fetchInitialPosition();
  }, []);

  // Calculateur de distance Haversine entre deux points GPS réels
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    let interval: any = null;
    let watchId: number | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => {
          const newSecs = s + 1;
           
          if (newSecs > 0 && newSecs % 60 === 0 && distanceKm > 0) {
            const currentSecPerKm = newSecs / distanceKm;
            const diff = currentSecPerKm - targetPaceSecs; 
             
            let coachingText = `Point course : ${distanceKm.toFixed(2)} kilomètres. `;
             
            if (windSpeedKmh > 15) {
              coachingText += `Attention, vent estimé à ${windSpeedKmh} kilomètres heure. Adapte ta foulée. `;
            }

            if (Math.abs(diff) < 15) {
              coachingText += "Allure parfaite, tu es dans les clous !";
            } else if (diff < -15) {
              coachingText += "Attention, tu cours trop vite par rapport à ta cible !";
            } else {
              coachingText += "Tu es en dessous de ton allure cible, relance un peu !";
            }

            setCoachingAdvice(coachingText);
            speakMessage(coachingText);
          }
          return newSecs;
        });
      }, 1000);

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const newPos: [number, number] = [lat, lng];

            const last = lastPositionRef.current;
            const deltaKm = calculateHaversineDistance(last[0], last[1], newPos[0], newPos[1]);

            // Filtrer les micro-sauts GPS aberrants (< 2 mètres)
            if (deltaKm > 0.002) {
              lastPositionRef.current = newPos;
              setCurrentPosition(newPos);
              setRoutePositions(prev => [...prev, newPos]);
              setDistanceKm(d => Number((d + deltaKm).toFixed(2)));
              fetchRealTimeWindAndPosition(lat, lng);
            }
          },
          (error) => console.warn("GPS watch error (hors-ligne probable) :", error),
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
        );
      }
    }

    return () => {
      clearInterval(interval);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isRunning, isPaused, distanceKm, targetPaceSecs, audioCoaching, windSpeedKmh]);

  const triggerSilentBroadcastTest = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 400]);
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
       
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(587.33, audioContext.currentTime); 
      gain1.gain.setValueAtTime(0.15, audioContext.currentTime);
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.start();
      osc1.stop(audioContext.currentTime + 0.15);

      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(880, audioContext.currentTime); 
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.3);
      }, 200);
    } catch (e) {
      console.warn("Audio context non supporté", e);
    }

    alert("📳 [Silent Broadcast] Signal d'encouragement reçu en direct !");
  };

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
    setCoachingAdvice(`Sortie démarrée. GPS réel et sécurité hors-ligne actifs.`);
    speakMessage("Sortie démarrée. GPS réel activé. Bon entraînement !");
  };

  const handlePauseRun = () => {
    setIsPaused(!isPaused);
    speakMessage(isPaused ? "Reprise de la course." : "Chrono en pause.");
  };

  const handleStopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    speakMessage("Séance terminée. Excellent travail !");
    
    if (distanceKm > 0 && onSaveRunPost) {
      onSaveRunPost(`[Running] Sortie GPS de ${distanceKm} km en ${formatTime(seconds)} 🏃‍♂️`, distanceKm);
    }

    // Nettoyage de la sauvegarde locale après publication réussie
    localStorage.removeItem('fitpulse_offline_run');
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
      
      {/* 🔙 BOUTON RETOUR */}
      {onBack && (
        <button 
          type="button" 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      {/* En-tête de section moderne */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/35 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4" /> Mode Running & Ghost Pacing
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">GPS Réel, Météo Satellite & Sécurité Hors-Ligne</h2>
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

      {/* Moteur de Ghost Pacing & Vent Réel API (PROTÉGÉ PAR LE PAYWALL) */}
      <PaywallGate userId={currentUserId} featureName="Ghost Pacing Météo & Vocal">
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

      {/* Widget Intégré : Contrôle de Récupération & Charge */}
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

      {/* Carte GPS */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" /> Carte Live & Tracé Route (Offline Safe)
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

          <div className="absolute bottom-3 left-3 z-[1000] bg-neutral-950/90 border border-neutral-800 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] text-emerald-400 font-mono flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Lat: {currentPosition[0].toFixed(4)}° N, Lng: {currentPosition[1].toFixed(4)}° E</span>
          </div>
        </div>
      </div>

      {/* Module GPS / Tracker Live */}
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

        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-orange-400" /> Objectif d'allure cible :
          </span>
          <select 
            value={targetPaceSecs}
            onChange={(e) => setTargetPaceSecs(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-orange-400 font-bold focus:outline-none cursor-pointer"
          >
            <option value={270}>4'30" / km (Soutenu)</option>
            <option value={300}>5'00" / km (Modéré+)</option>
            <option value={330}>5'30" / km (Endurance active)</option>
            <option value={360}>6'00" / km (Endurance cool)</option>
          </select>
        </div>

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

        <button 
          type="button"
          onClick={triggerSilentBroadcastTest}
          className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Radio className="w-4 h-4 animate-pulse" /> 📳 Tester le Silent Broadcast (Vibration + Son)
        </button>

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

      {/* Planificateur de Ravitaillement */}
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
