import { Activity, ArrowRight, Zap } from 'lucide-react';

interface FatigueConverterCardProps {
  lastGymSessionWeightTonnes?: number; // Ex: 12 tonnes levées hier
  nextRunDistanceKm?: number;        // Ex: 12 km prévus
}

export default function FatigueConverterCard({
  lastGymSessionWeightTonnes = 14.5,
  nextRunDistanceKm = 10
}: FatigueConverterCardProps) {
  // Calcul de l'impact : 1 tonne levée en muscu lourde impacte l'élasticité de foulée
  const calculatedImpactIndex = Math.min(100, Math.round(lastGymSessionWeightTonnes * 5.5));
  const recommendedPaceAdjustment = calculatedImpactIndex > 70 ? "+15 sec/km" : "Allure nominale";

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Convertisseur de Fatigue Hybride
        </span>
        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
          Cross-Impact 🔄
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-bold">Fonte levée hier</span>
          <div className="text-lg font-black text-white">{lastGymSessionWeightTonnes} <span className="text-xs text-neutral-500">Tonnes</span></div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-bold">Impact sur le Run</span>
          <div className="text-lg font-black text-amber-400">{calculatedImpactIndex}% <span className="text-xs text-neutral-500">Fatigue</span></div>
        </div>
      </div>

      <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-2xl flex items-center justify-between text-xs">
        <span className="text-neutral-300">Recommandation d'allure pour ton 10km :</span>
        <strong className="text-white bg-orange-600/30 border border-orange-500/40 px-2.5 py-1 rounded-lg text-orange-400">
          {recommendedPaceAdjustment}
        </strong>
      </div>
    </div>
  );
}
