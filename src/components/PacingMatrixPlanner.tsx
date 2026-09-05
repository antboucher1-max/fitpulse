import { useState } from 'react';
import { Target, Calendar, TrendingUp, Sparkles, Activity, Layers, CheckCircle2 } from 'lucide-react';

interface PacingMatrixProps {
  currentWeeklyKm?: number;
  currentLoad?: number;
}

export default function PacingMatrixPlanner({ currentWeeklyKm = 35, currentLoad = 45 }: PacingMatrixProps) {
  const [targetDistance, setTargetDistance] = useState<'10km' | 'semi' | 'marathon' | 'trail'>('semi');
  const [weeksCount, setWeeksCount] = useState<number>(8);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<Array<any>>([]);

  const handleGenerateMatrix = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const plan = [];
      let baseKm = currentWeeklyKm;
      
      // Facteur multiplicateur selon l'objectif
      const peakMultiplier = targetDistance === 'marathon' ? 1.6 : targetDistance === 'semi' ? 1.4 : 1.2;

      for (let i = 1; i <= weeksCount; i++) {
        // Semaine de décharge (toutes les 4 semaines ou avant la fin)
        const isRecoveryWeek = i % 4 === 0 || i === weeksCount;
        
        let weekKm = 0;
        if (isRecoveryWeek) {
          weekKm = Math.round(baseKm * 0.75); // -25% de volume pour absorber
        } else {
          baseKm = Math.min(baseKm * 1.1, baseKm * peakMultiplier * (i / weeksCount));
          weekKm = Math.round(baseKm);
        }

        plan.push({
          weekNumber: i,
          targetKm: weekKm,
          focus: isRecoveryWeek ? '🟢 Récupération & Assimilation (SNC)' : i > weeksCount - 2 ? '🏁 Affûtage (Tapering)' : '⚡ Développement / Seuil',
          intensityLoad: isRecoveryLoad(isRecoveryWeek, i, weeksCount)
        });
      }

      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 1000);
  };

  const isRecoveryLoad = (isRecovery: boolean, weekNum: number, total: number) => {
    if (isRecovery) return 'Faible (40-50%)';
    if (weekNum > total - 2) return 'Modéré (Affûtage)';
    return 'Élevé (75-85%)';
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400">
          <Target className="w-4 h-4" /> IA Pacing Matrix (Planificateur de Cycle)
        </div>
        <span className="text-[10px] font-extrabold bg-orange-500/20 text-orange-300 px-2.5 py-0.5 rounded-full border border-orange-500/30">
          Périodïsation Intelligente 🧠
        </span>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Génère ton plan d'entraînement sur-mesure en fonction de ta charge actuelle et de ton échéance. L'algorithme intègre automatiquement des semaines de surcompensation pour protéger ton système nerveux.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="block font-bold text-neutral-300">Objectif de course :</label>
          <select
            value={targetDistance}
            onChange={(e: any) => setTargetDistance(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="10km">10 Kilomètres (Vitesse & Seuil)</option>
            <option value="semi">Semi-Marathon (21.1 km)</option>
            <option value="marathon">Marathon (42.2 km - Endurance)</option>
            <option value="trail">Trail / Boucle Technique</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block font-bold text-neutral-300">Durée du cycle (Semaines) :</label>
          <select
            value={weeksCount}
            onChange={(e) => setWeeksCount(Number(e.target.value))}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value={6}>6 Semaines (Court)</option>
            <option value={8}>8 Semaines (Standard)</option>
            <option value={12}>12 Semaines (Fondation solide)</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={isGenerating}
        onClick={handleGenerateMatrix}
        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-xl disabled:opacity-50"
      >
        {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
        {isGenerating ? "Calcul de la matrice d'entraînement..." : "Générer mon Plan Pacing Matrix 🚀"}
      </button>

      {generatedPlan.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" /> Cycle généré ({weeksCount} semaines) :
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {generatedPlan.map((week) => (
              <div key={week.weekNumber} className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-black text-white">Semaine {week.weekNumber}</span>
                  <div className="text-[11px] text-neutral-400">{week.focus}</div>
                </div>
                <div className="text-right">
                  <span className="font-black text-orange-400 text-sm">~{week.targetKm} km</span>
                  <div className="text-[10px] text-neutral-500">Charge : {week.intensityLoad}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
