import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface HybridShareCardProps {
  username?: string;
  runKm?: number;
  runTime?: string;
  squatKg?: number;
  wodName?: string;
  wodScore?: string;
  onClose?: () => void;
}

export default function HybridShareCard({
  username = 'Athlète Apex',
  runKm = 10.2,
  runTime = '48:30',
  squatKg = 120,
  wodName = 'FRAN (21-15-9)',
  wodScore = '4:15',
  onClose
}: HybridShareCardProps) {
  const [shared, setShared] = useState(false);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon Dash Apex du Jour',
          text: `⚡ Session hybride validée sur FitPulse !\n🏃‍♂️ ${runKm}km (${runTime})\n🏋️‍♂️ Squat max: ${squatKg}kg\n🔥 ${wodName}: ${wodScore}`,
          url: window.location.href,
        });
        setShared(true);
      } catch (err) {
        console.warn("Partage annulé ou non supporté", err);
      }
    } else {
      navigator.clipboard.writeText(`⚡ Session hybride FitPulse : ${runKm}km | Squat ${squatKg}kg | ${wodName} ${wodScore}`);
      alert("📋 Résumé copié dans le presse-papier ! Prêt à être collé sur WhatsApp ou Instagram.");
      setShared(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        
        {/* 🎨 LA CARTE GRAPHIQUE HYBRIDE (Format Story / Vitrine) */}
        <div id="apex-share-card" className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-orange-950/40 border-2 border-orange-500/40 rounded-3xl p-6 space-y-6 shadow-[0_0_30px_rgba(234,88,12,0.2)] relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
          
          {/* En-tête Marque */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-lg">
                ⚡
              </div>
              <span className="text-xs font-black tracking-widest text-white uppercase">FitPulse • ApexWod</span>
            </div>
            <span className="text-[10px] font-extrabold bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/30">
              Hybrid Performance
            </span>
          </div>

          {/* Identité Athlète */}
          <div className="space-y-1 relative z-10">
            <h3 className="text-lg font-black text-white tracking-tight">{username}</h3>
            <p className="text-[11px] text-neutral-400">Journal d'entraînement combiné du jour</p>
          </div>

          {/* 📊 LES DONNÉES HÉTÉROGÈNES (Endurance + Force) */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            
            {/* Bloc Course */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl space-y-1 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                🏃‍♂️ Endurance / Run
              </span>
              <div className="text-xl font-black text-white pt-0.5">
                {runKm} <span className="text-xs font-normal text-neutral-400">km</span>
              </div>
              <span className="text-[10px] text-neutral-500 block">Chrono : {runTime}</span>
            </div>

            {/* Bloc Force / CrossFit */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl space-y-1 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                🏋️‍♂️ Force / WOD
              </span>
              <div className="text-xl font-black text-white pt-0.5">
                {squatKg} <span className="text-xs font-normal text-neutral-400">kg max</span>
              </div>
              <span className="text-[10px] text-neutral-500 truncate block">{wodName} : {wodScore}</span>
            </div>

          </div>

          {/* Footer de la carte */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 relative z-10">
            <span>#HybridAthlete #FitPulse</span>
            <span className="font-bold text-orange-400">Rejoins le mouvement 🚀</span>
          </div>
        </div>

        {/* Boutons d'action de partage */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> {shared ? 'Partagé avec succès !' : 'Partager sur Instagram / WhatsApp'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-2xl text-xs transition border border-neutral-800 cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
