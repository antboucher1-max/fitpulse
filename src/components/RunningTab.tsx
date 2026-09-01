import { useState, useEffect, useRef, FormEvent } from 'react';
import { Play, Pause, Square, MapPin, Flame, X, Compass, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RunningTabProps {
  currentUserId?: string;
  currentUsername: string;
  selectedClub: string;
  currentUserProfile?: any;
  userAvatarUrl: string;
  onRefreshFeed: () => void;
}

// Utilitaire audio pour les bips de guidage et la synthèse vocale
const audioCoach = {
  playBeep(frequency = 440, duration = 150) {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) {
      console.log("Audio non supporté", e);
    }
  },

  speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
};

// Composant interne pour centrer dynamiquement la carte
function MapRecenterAndFix({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.invalidateSize();
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function RunningTab({ 
  currentUserId, 
  currentUsername, 
  selectedClub, 
  currentUserProfile, 
  userAvatarUrl, 
  onRefreshFeed 
}: RunningTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [pathCoordinates, setPathCoordinates] = useState<[number, number][]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [runCaption, setRunCaption] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  // État pour activer ou désactiver le coaching vocal/bips
  const [audioEnabled, setAudioEnabled] = useState(true);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);
  const routePointsRef = useRef<[number, number][]>([]);
  const routeIndexRef = useRef<number>(0);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Chrono général et annonces audio périodiques (toutes les 30 secondes)
  useEffect(() => {
    let interval: any = null;
    if (isRunning || isSimulating) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const nextSec = prev + 1;
          // Toutes les 30 secondes, petit point audio sur la distance et l'allure si activé
          if (audioEnabled && nextSec > 0 && nextSec % 30 === 0) {
            const currentDistKm = (distanceMeters / 1000).toFixed(2);
            audioCoach.speak(`Temps : ${Math.floor(nextSec / 60)} minutes. Distance : ${currentDistKm} kilomètres. Continue comme ça !`);
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isSimulating, distanceMeters, audioEnabled]);

  // Vrai GPS (WatchPosition)
  useEffect(() => {
    if (isRunning) {
      if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par ton navigateur.");
        setIsRunning(false);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos: [number, number] = [latitude, longitude];

          setCurrentPosition(newPos);

          setPathCoordinates(prev => {
            if (prev.length > 0) {
              const last = prev[prev.length - 1];
              const dist = calculateDistance(last[0], last[1], latitude, longitude);
              if (dist > 2 && dist < 100) {
                setDistanceMeters(m => {
                  const newTotal = m + dist;
                  // Bip de validation d'un nouveau palier de 500m
                  if (audioEnabled && Math.floor(newTotal / 500) > Math.floor(m / 500)) {
                    audioCoach.playBeep(587, 200); // Bip aigu de réussite
                    audioCoach.speak(`Cap des ${Math.floor(newTotal / 500) / 2} kilomètres franchi.`);
                  }
                  return newTotal;
                });
                return [...prev, newPos];
              }
              return prev;
            }
            return [newPos];
          });
        },
        (error) => {
          console.error("Erreur GPS :", error);
          alert("Impossible de récupérer ta position GPS. Vérifie tes paramètres de localisation.");
          setIsRunning(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isRunning, audioEnabled]);

  // Simulation propre, fluide et unidirectionnelle basée sur OSRM
  const startCleanSimulation = async () => {
    if (audioEnabled) {
      audioCoach.speak("Démarrage de la simulation de course. Bon entraînement !");
    }

    let startLat = 50.6053;
    let startLng = 3.3888; // Tournai par défaut

    try {
      const position: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 3000,
          enableHighAccuracy: true
        });
      });
      startLat = position.coords.latitude;
      startLng = position.coords.longitude;
    } catch (e) {
      console.log("Utilisation de la position de secours (Tournai).");
    }

    const endLat = startLat + 0.008;
    const endLng = startLng + 0.010;

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        routePointsRef.current = routeCoords;
        routeIndexRef.current = 0;

        const firstPoint = routeCoords[0];
        setCurrentPosition(firstPoint);
        setPathCoordinates([firstPoint]);
        setIsSimulating(true);

        simIntervalRef.current = setInterval(() => {
          routeIndexRef.current += 1;
          const currentIndex = routeIndexRef.current;

          if (currentIndex < routePointsRef.current.length) {
            const nextPoint = routePointsRef.current[currentIndex];
            setCurrentPosition(nextPoint);
            setPathCoordinates(prev => [...prev, nextPoint]);
            setDistanceMeters(m => m + 12);
          } else {
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
            setIsSimulating(false);
            if (audioEnabled) {
              audioCoach.speak("Simulation terminée. Belle performance !");
            }
          }
        }, 1000);
      } else {
        alert("Impossible de charger l'itinéraire de simulation.");
      }
    } catch (err) {
      console.error("Erreur OSRM :", err);
      alert("Erreur lors de la simulation.");
    }
  };

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) {
      return `${hrs}:${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const distanceKm = (distanceMeters / 1000).toFixed(2);
  const numericDistance = Number(distanceKm);

  const speedKmh = numericDistance > 0 && seconds > 0 
    ? (numericDistance / (seconds / 3600)).toFixed(1) 
    : "0.0";

  const handleFinishRun = async () => {
    if (!currentUserId) return;
    setIsRunning(false);
    setIsSimulating(false);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (audioEnabled) {
      audioCoach.speak("Session enregistrée. Prépare ton partage !");
    }
    setShowSaveModal(true);
  };

  const handleResetRun = () => {
    setIsRunning(false);
    setIsSimulating(false);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    routeIndexRef.current = 0;
    routePointsRef.current = [];
    setSeconds(0);
    setDistanceMeters(0);
    setPathCoordinates([]);
    setCurrentPosition(null);
    setRunCaption('');
    setHasFinished(false);
  };

  const publishRunToFeed = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    const fullCaption = `🏃‍♂️ Sortie Running : ${distanceKm} km en ${formatTime(seconds)} (Vitesse : ${speedKmh} km/h) ${runCaption ? `- ${runCaption}` : ''}`.trim();

    const { error } = await supabase.from('posts').insert([{
      user_id: currentUserId,
      username: currentUsername,
      avatar_url: currentUserProfile?.avatar_url || userAvatarUrl,
      club_name: selectedClub === '🌐 Tous les clubs (Global)' ? 'Club Tournai (Bastion)' : selectedClub,
      session_type: 'Running / Trail 🏃‍♂️',
      caption: fullCaption,
      image_url: null,
      exercises: [],
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      comments: [],
      is_private: false
    }]);

    if (!error) {
      const pointsToAdd = Math.round(Number(distanceKm) * 5) + 10;
       
      const currentRunningPts = currentUserProfile?.points_running || 0;
      const currentGlobalPts = currentUserProfile?.points_global || currentUserProfile?.points || 0;

      await supabase.from('profiles').update({ 
        points_running: currentRunningPts + pointsToAdd,
        points_global: currentGlobalPts + pointsToAdd,
        points: currentGlobalPts + pointsToAdd 
      }).eq('id', currentUserId);

      setShowSaveModal(false);
      setHasFinished(true);
      onRefreshFeed();
      alert("✅ Sortie publiée avec succès sur le fil FitPulse ! (+ " + pointsToAdd + " pts ⚡)");
    } else {
      alert("Erreur lors de la publication : " + error.message);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      <div className="bg-gradient-to-r from-emerald-950/95 to-neutral-900 border border-emerald-500/40 rounded-3xl p-5 text-white shadow-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" /> FitPulse Running & Audio Coach
          </div>
          <h2 className="text-xl font-black">Traceur GPS & Bips de Guidage</h2>
          <p className="text-xs text-neutral-300 mt-1">Annonces vocales et bips de cadence intégrés.</p>
        </div>

        {/* Bouton Toggle Audio Coach */}
        <button 
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            if (!audioEnabled) audioCoach.speak("Coach audio activé.");
          }}
          className={`p-3 rounded-2xl border flex items-center justify-center transition shadow-lg ${
            audioEnabled 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
          title={audioEnabled ? "Désactiver le coach audio" : "Activer le coach audio"}
        >
          {audioEnabled ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Mini-Carte Interactive */}
      <div className="w-full h-60 rounded-3xl overflow-hidden border border-neutral-800 shadow-xl relative z-10 bg-neutral-950 flex items-center justify-center">
        {currentPosition ? (
          <MapContainer 
            center={currentPosition} 
            zoom={16} 
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            style={{ width: '100%', height: '240px', background: '#0a0a0a' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapRecenterAndFix position={currentPosition} />
             
            {pathCoordinates.length > 0 && (
              <Polyline positions={pathCoordinates} color="#10b981" weight={5} />
            )}
            <CircleMarker center={currentPosition} radius={8} fillColor="#10b981" color="#ffffff" weight={2} fillOpacity={1} />
          </MapContainer>
        ) : (
          <div className="text-center p-6 space-y-2">
            <MapPin className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-xs text-neutral-400 font-medium">Prêt à courir. Active le GPS ou lance la simulation.</p>
          </div>
        )}
      </div>

      {/* Tableau de bord */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-6 shadow-xl">
        <div className="grid grid-cols-2 gap-4 border-b border-neutral-800 pb-5">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Distance</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{distanceKm} <span className="text-xs font-semibold text-neutral-400">km</span></div>
          </div>
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Vitesse moyenne</span>
            <div className="text-2xl font-black text-white mt-1">{speedKmh} <span className="text-xs font-semibold text-neutral-400">km/h</span></div>
          </div>
        </div>

        <div>
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Temps écoulé</span>
          <div className={`text-6xl font-black tracking-widest my-2 ${(isRunning || isSimulating) ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
            {formatTime(seconds)}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex justify-center gap-3">
            {!isRunning && !isSimulating && !hasFinished ? (
              <>
                <button 
                  onClick={() => {
                    setIsRunning(true);
                    if (audioEnabled) audioCoach.speak("Sortie GPS démarrée. C'est parti !");
                  }} 
                  className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" /> Vrai GPS
                </button>
                <button 
                  onClick={startCleanSimulation} 
                  className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs shadow-xl transition transform active:scale-95"
                >
                  <Compass className="w-4 h-4" /> Simuler un run 🗺️
                </button>
              </>
            ) : isRunning || isSimulating ? (
              <button 
                onClick={() => { 
                  setIsRunning(false); 
                  setIsSimulating(false); 
                  if (simIntervalRef.current) clearInterval(simIntervalRef.current);
                  if (audioEnabled) audioCoach.speak("Course mise en pause.");
                }} 
                className="flex items-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl text-sm shadow-xl transition transform active:scale-95"
              >
                <Pause className="w-5 h-5 fill-white" /> Pause
              </button>
            ) : null}

            {hasFinished && (
              <button 
                onClick={handleResetRun} 
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-xl transition transform active:scale-95"
              >
                <RotateCcw className="w-5 h-5" /> Nouvelle course 🔄
              </button>
            )}
          </div>

          {seconds > 0 && !isRunning && !isSimulating && !hasFinished && (
            <button 
              onClick={handleFinishRun} 
              className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl text-sm shadow-xl transition transform active:scale-95"
            >
              <Square className="w-5 h-5 fill-white" /> Terminer & Publier sur le fil
            </button>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" /> Résumé de ta course 🏃‍♂️
              </h3>
              <button type="button" onClick={() => setShowSaveModal(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Distance :</span>
                <span className="font-bold text-emerald-400">{distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Chrono :</span>
                <span className="font-bold text-white">{formatTime(seconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Vitesse moyenne :</span>
                <span className="font-bold text-white">{speedKmh} km/h</span>
              </div>
            </div>

            <form onSubmit={publishRunToFeed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Légende / Ressenti :</label>
                <textarea 
                  rows={3} 
                  placeholder="Ex: Super sortie le long du canal !" 
                  value={runCaption} 
                  onChange={(e) => setRunCaption(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none" 
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm shadow-xl transition">
                Partager sur le fil FitPulse 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
