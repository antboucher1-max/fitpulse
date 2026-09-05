import { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Lock, CheckCircle2, BatteryCharging } from 'lucide-react';

interface FitBotSNCProps {
  readinessScore?: number; // Score de 0 à 100
  weeklyLoad?: number;     // Charge hebdomadaire
  onOverrideLock?: () => void;
}

export default function FitBotSNC({ readinessScore = 78, weeklyLoad = 45 }: FitBotSNCProps) {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string>('Analyse du SNC en cours...');

  useEffect(() => {
    // Logique d'auto-régulation SNC critique
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
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Indice SNC</span>
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
