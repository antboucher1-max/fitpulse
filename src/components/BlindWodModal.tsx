import { useState } from 'react';
import { Flame, Play, Trophy, X, Zap } from 'lucide-react';

interface BlindWodModalProps {
  onClose: () => void;
}

export default function BlindWodModal({ onClose }: BlindWodModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleRevealWod = () => {
    setRevealed(true);
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-red-950/40 border border-red-500/30 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Blind WOD Test Hebdo</h3>
        </div>
        <span className="text-[9px] bg-red-500/20 text-red-400 font-extrabold px-2 py-0.5 rounded-md border border-red-500/30">
          Mystère 💀
        </span>
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed">
        Le contenu du WOD de la semaine est scellé. Pas de stratégie possible : tu découvres l'exercice au moment de lancer le chrono. Prêt à relever le défi ?
      </p>

      {!revealed ? (
        <button
          type="button"
          onClick={handleRevealWod}
          className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" /> Dévoiler & Démarrer le Blind WOD ⚡
        </button>
      ) : (
        <div className="bg-neutral-950 border border-red-500/40 p-4 rounded-2xl space-y-2 animate-fadeIn">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">WOD Révélé : AMRAP 12 min</span>
          <div className="text-sm font-black text-white space-y-1">
            <p>• 15 Burpees Over Bar</p>
            <p>• 10 Thrusters (42.5kg / 30kg)</p>
            <p>• 200m Run</p>
          </div>
          <button
            type="button"
            onClick={() => alert("Chrono lancé ! Enregistre ton score sur le fil BoxWars dès la fin.")}
            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Lancer le Chrono Interne ⏱️
          </button>
        </div>
      )}
    </div>
  );
}
