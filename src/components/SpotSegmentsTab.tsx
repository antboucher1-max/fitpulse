import { useState } from 'react';
import { LOCAL_SPOT_SEGMENTS, checkSegmentAttempt } from './SpotSegmentsEngine';
import { Trophy, Crown, MapPin, ArrowLeft, Zap, Timer, Flame } from 'lucide-react';

interface SpotSegmentsTabProps {
  currentUsername: string;
  userAvatarUrl: string;
  onBack: () => void;
}

export default function SpotSegmentsTab({ currentUsername, userAvatarUrl, onBack }: SpotSegmentsTabProps) {
  const [segments, setSegments] = useState(LOCAL_SPOT_SEGMENTS);
  const [simulatedSeconds, setSimulatedSeconds] = useState<number>(240); // Ex: 4:00
  const [notification, setNotification] = useState<string | null>(null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAttemptSegment = (segmentId: string) => {
    const result = checkSegmentAttempt(segmentId, simulatedSeconds, currentUsername, userAvatarUrl);
    if (result.isNewRecord && result.segment) {
      setSegments([...LOCAL_SPOT_SEGMENTS]);
      setNotification(`👑 VICTOIRE ! Tu as arraché la couronne du segment "${result.segment.name}" !`);
    } else {
      setNotification(`💪 Bien tenté ! Mais le Roi garde sa couronne (Il te manque quelques secondes).`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      <button 
        type="button" 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* En-tête */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" /> King of the Spot (Segments Locaux)
          </span>
          <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30">
            Arène de Quartier ⚡
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed relative z-10">
          Affronte les membres de ton club sur les tracés locaux de Tournai. Prends le meilleur chrono pour t'emparer de la couronne et l'afficher sur ton profil !
        </p>
      </div>

      {notification && (
        <div className="bg-orange-950/50 border border-orange-500/50 text-orange-200 p-4 rounded-2xl text-xs font-bold text-center shadow-2xl animate-bounce">
          {notification}
        </div>
      )}

      {/* Simulateur de chrono pour tester */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
          Simulateur de tentative (Test de Chrono)
        </span>
        <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 p-3 rounded-2xl">
          <span className="text-xs text-neutral-300 flex items-center gap-2">
            <Timer className="w-4 h-4 text-orange-500" /> Ton chrono simulé (secondes) :
          </span>
          <input 
            type="number" 
            value={simulatedSeconds} 
            onChange={(e) => setSimulatedSeconds(Number(e.target.value))}
            className="w-20 bg-neutral-900 border border-neutral-800 text-white font-mono text-xs text-center py-1.5 rounded-xl focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Liste des Segments */}
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-neutral-400 ml-1">
          Segments actifs dans ton club :
        </span>

        {segments.map(seg => (
          <div key={seg.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white">{seg.name}</h4>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1 pt-0.5">
                  <MapPin className="w-3 h-3 text-orange-400" /> {seg.clubSpot} • <span className="text-orange-400 font-bold">{seg.distanceKm} km</span>
                </p>
              </div>
              <span className="text-xl">👑</span>
            </div>

            {/* Détenteur de la couronne */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={seg.currentKing.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-orange-500/50" />
                <div>
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <Crown className="w-3 h-3" /> King of the Spot
                  </span>
                  <strong className="text-xs text-white">{seg.currentKing.username}</strong>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-white text-sm block">{formatTime(seg.currentKing.timeSeconds)}</span>
                <span className="text-[9px] text-neutral-500">établi le {seg.currentKing.date}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAttemptSegment(seg.id)}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-orange-500/50 text-orange-400 font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Flame className="w-4 h-4" /> Soumettre mon chrono sur ce segment 🚀
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
