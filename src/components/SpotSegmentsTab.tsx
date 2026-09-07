import { useState } from 'react';
import { COMMUNITY_SEGMENTS, registerNewSegmentAttempt, createNewCustomSegment } from './SpotSegmentsEngine';
import { Trophy, Crown, MapPin, ArrowLeft, Flame, Plus, X } from 'lucide-react';

interface SpotSegmentsTabProps {
  currentUserId?: string;
  currentUsername?: string;
  userAvatarUrl?: string;
  selectedClub?: string;
  onBack?: () => void;
}

export default function SpotSegmentsTab({ 
  currentUserId = "ant-boucher-id-70", 
  currentUsername = "Antoine Boucher", 
  userAvatarUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150", 
  selectedClub = "Club Tournai (Bastion)", 
  onBack = () => {} 
}: SpotSegmentsTabProps) {
  const [segments, setSegments] = useState(COMMUNITY_SEGMENTS);
  const [isCreating, setIsCreating] = useState(false);
  
  // Formulaire de création de segment
  const [newName, setNewName] = useState('');
  const [newDistance, setNewDistance] = useState<number | ''>('');
  const [newTimeSeconds, setNewTimeSeconds] = useState<number | ''>('');
  const [notification, setNotification] = useState<string | null>(null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newDistance === '' || newTimeSeconds === '' || !currentUserId) return;

    createNewCustomSegment(
      newName.trim(),
      Number(newDistance),
      selectedClub,
      currentUserId,
      currentUsername,
      userAvatarUrl,
      Number(newTimeSeconds)
    );

    setSegments([...COMMUNITY_SEGMENTS]);
    setIsCreating(false);
    setNewName('');
    setNewDistance('');
    setNewTimeSeconds('');
    setNotification("🎯 Nouveau segment créé avec succès ! Tu en es le premier Roi.");
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAttemptSegment = (segmentId: string, currentKingId: string) => {
    if (currentUserId === currentKingId) {
      alert("Tu es déjà le Roi de ce segment ! Défends ta couronne.");
      return;
    }

    // Simulation d'un chrono aléatoire réaliste pour l'exemple ou test
    const simulatedTime = Math.floor(Math.random() * 60) + 200; 
    const result = registerNewSegmentAttempt(segmentId, simulatedTime, currentUserId || 'unknown', currentUsername, userAvatarUrl);

    if (result.isNewRecord && result.segment) {
      setSegments([...COMMUNITY_SEGMENTS]);
      setNotification(`👑 VICTOIRE ! Tu as arraché la couronne sur "${result.segment.name}" !`);
    } else {
      setNotification(`💪 Bien tenté ! Mais le Roi actuel a défendu sa couronne.`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      <div className="flex items-center justify-between">
        <button 
          type="button" 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded-xl transition cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Créer un segment
        </button>
      </div>

      {/* En-tête */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" /> King of the Spot (Segments de la Communauté)
          </span>
          <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30">
            Arène Libre ⚡
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed relative z-10">
          Trace tes propres parcours ou défie les athlètes de ton spot ({selectedClub}). Prends le meilleur chrono pour t'emparer de la couronne !
        </p>
      </div>

      {notification && (
        <div className="bg-orange-950/50 border border-orange-500/50 text-orange-200 p-4 rounded-2xl text-xs font-bold text-center shadow-2xl animate-bounce">
          {notification}
        </div>
      )}

      {/* Modal de création de segment */}
      {isCreating && (
        <form onSubmit={handleCreateSegment} className="bg-neutral-900 border border-orange-500/40 rounded-3xl p-5 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">Créer un nouveau segment</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-neutral-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Nom du segment (ex: Montée du Bois, Sprint du Canal...) :</label>
            <input 
              type="text" 
              required
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du parcours..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Distance (km) :</label>
              <input 
                type="number" 
                step="0.1" 
                required
                value={newDistance} 
                onChange={(e) => setNewDistance(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 1.5"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Ton Temps (secondes) :</label>
              <input 
                type="number" 
                required
                value={newTimeSeconds} 
                onChange={(e) => setNewTimeSeconds(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 320"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition cursor-pointer">
            Publier & Devenir le Premier Roi 👑
          </button>
        </form>
      )}

      {/* Liste des Segments */}
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-neutral-400 ml-1">
          Segments actifs :
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
                <img src={seg.king.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-orange-500/50 bg-neutral-800" />
                <div>
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <Crown className="w-3 h-3" /> King of the Spot
                  </span>
                  <strong className="text-xs text-white">{seg.king.username}</strong>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-white text-sm block">{formatTime(seg.king.timeSeconds)}</span>
                <span className="text-[9px] text-neutral-500">établi le {seg.king.date}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAttemptSegment(seg.id, seg.king.userId)}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-orange-500/50 text-orange-400 font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Flame className="w-4 h-4" /> Tenter de battre le chrono 🚀
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
