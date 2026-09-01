import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, MapPin, Flame } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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

export default function RunningTab({ 
  currentUserId, 
  currentUsername, 
  selectedClub, 
  currentUserProfile, 
  userAvatarUrl, 
  onRefreshFeed 
}: RunningTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [lastPosition, setLastPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [runCaption, setRunCaption] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  // Fonction pour calculer la distance entre deux points GPS (formule de Haversine simplifiée)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Rayon de la terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // en mètres
  };

  // Gestion du Chrono de course
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Gestion du GPS en direct
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
          const currentPos = { lat: latitude, lng: longitude };

          if (lastPosition) {
            const dist = calculateDistance(lastPosition.lat, lastPosition.lng, currentPos.lat, currentPos.lng);
            // On filtre les petits sauts GPS aberrants de moins de 2 mètres
            if (dist > 2 && dist < 100) {
              setDistanceMeters(prev => prev + dist);
            }
          }
          setLastPosition(currentPos);
        },
        (error) => {
          console.error("Erreur GPS :", error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
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
  }, [isRunning, lastPosition]);

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
  const pace = distanceMeters > 0 ? (seconds / 60) / Number(distanceKm) : 0;
  const formatPace = (p: number) => {
    if (!isFinite(p) || p === 0) return "--:--";
    const mins = Math.floor(p);
    const secs = Math.round((p - mins) * 60);
    return `${mins}'${secs.toString().padStart(2, '0')}" /km`;
  };

  const handleFinishRun = async () => {
    if (!currentUserId) return;
    setIsRunning(false);
    setShowSaveModal(true);
  };

  const publishRunToFeed = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    const fullCaption = `🏃‍♂️ Sortie Running : ${distanceKm} km en ${formatTime(seconds)} (Allure : ${formatPace(pace)}) ${runCaption ? `- ${runCaption}` : ''}`.trim();

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
      // Attribution de points pour la Ligue (ex: 20 pts pour une course)
      const pointsToAdd = Math.round(Number(distanceKm) * 5) + 10;
      await supabase.from('profiles').update({ points: (currentUserProfile?.points || 0) + pointsToAdd }).eq('id', currentUserId);

      setShowSaveModal(false);
      setSeconds(0);
      setDistanceMeters(0);
      setRunCaption('');
      onRefreshFeed();
      alert("✅ Sortie publiée avec succès sur le fil FitPulse ! (+ " + pointsToAdd + " pts ⚡)");
    } else {
      alert("Erreur lors de la publication : " + error.message);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      {/* En-tête Running */}
      <div className="bg-gradient-to-r from-emerald-950/95 to-neutral-900 border border-emerald-500/40 rounded-3xl p-5 text-white shadow-2xl">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
          <MapPin className="w-4 h-4" /> FitPulse Running Tracker
        </div>
        <h2 className="text-xl font-black">Traceur GPS & Performances</h2>
        <p className="text-xs text-neutral-300 mt-1">Enregistre tes footings, calcule ton allure en direct et partage tes runs avec la communauté.</p>
      </div>

      {/* Tableau de bord du Chrono / GPS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-6 shadow-xl">
        <div className="grid grid-cols-2 gap-4 border-b border-neutral-800 pb-5">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Distance</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{distanceKm} <span className="text-xs font-semibold text-neutral-400">km</span></div>
          </div>
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Allure moyenne</span>
            <div className="text-2xl font-black text-white mt-1">{formatPace(pace)}</div>
          </div>
        </div>

        <div>
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Temps écoulé</span>
          <div className={`text-6xl font-black tracking-widest my-2 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
            {formatTime(seconds)}
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          {!isRunning ? (
            <button 
              onClick={() => setIsRunning(true)} 
              className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-xl transition transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" /> Démarrer la course
            </button>
          ) : (
            <button 
              onClick={() => setIsRunning(false)} 
              className="flex items-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl text-sm shadow-xl transition transform active:scale-95"
            >
              <Pause className="w-5 h-5 fill-white" /> Pause
            </button>
          )}

          {seconds > 0 && !isRunning && (
            <button 
              onClick={handleFinishRun} 
              className="flex items-center gap-2 px-6 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl text-sm shadow-xl transition transform active:scale-95"
            >
              <Square className="w-5 h-5 fill-white" /> Terminer & Publier
            </button>
          )}
        </div>
      </div>

      {/* Modale de publication de fin de course */}
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
                <span className="text-neutral-400">Allure :</span>
                <span className="font-bold text-white">{formatPace(pace)}</span>
              </div>
            </div>

            <form onSubmit={publishRunToFeed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Légende / Ressenti :</label>
                <textarea 
                  rows={3} 
                  placeholder="Ex: Super sortie le long du canal, bonnes sensations !" 
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
