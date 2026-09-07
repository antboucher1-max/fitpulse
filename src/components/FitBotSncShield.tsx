import { useState } from 'react';
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface SncFitnessStatus {
  status: 'optimal' | 'fatigue_moderee' | 'saturation_snc';
  message: string;
  recommendedAction: string;
}

export default function FitBotSncShield() {
  const [weeklyLoad, setWeeklyLoad] = useState<number>(2100);
  const [recoveryScore, setRecoveryScore] = useState<number>(45); // Score de préparation en %

  // Évaluation algorithmique du système nerveux central
  const evaluateSncStatus = (load: number, recovery: number): SncFitnessStatus => {
    if (load > 2500 && recovery < 50) {
      return {
        status: 'saturation_snc',
        message: '🚨 Alerte Critique : Saturation du Système Nerveux Central (SNC) détectée.',
        recommendedAction: 'Basculement forcé en mode Mobilité / Récupération active. Interdiction de lever lourd ou de faire de la VMA durant 48h.'
      };
    } else if (load > 1800 || recovery < 70) {
      return {
        status: 'fatigue_moderee',
        message: '⚠️ Fatigue neuromusculaire accumulée.',
        recommendedAction: 'Réduire le volume de 25% sur la prochaine séance de force et privilégier un footing souple.'
      };
    }
    return {
      status: 'optimal',
      message: '⚡ Système nerveux prêt pour la performance.',
      recommendedAction: 'Aucune restriction, toutes les intensités (lourd, VMA, MetCon) sont permises.'
    };
  };

  const sncState = evaluateSncStatus(weeklyLoad, recoveryScore);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4" /> Pilier 2 : FitBot SNC (Bouclier Anti-Surentraînement)
        </div>
        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
          sncState.status === 'saturation_snc' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
          sncState.status === 'fatigue_moderee' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        }`}>
          État : {sncState.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
          <label className="text-xs font-bold text-neutral-300 block">Charge Hebdomadaire Cumulée (pts) : {weeklyLoad}</label>
          <input 
            type="range" min="800" max="3500" step="50" 
            value={weeklyLoad} onChange={e => setWeeklyLoad(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
          <label className="text-xs font-bold text-neutral-300 block">Score de Récupération (Readiness) : {recoveryScore}%</label>
          <input 
            type="range" min="10" max="100" step="5" 
            value={recoveryScore} onChange={e => setRecoveryScore(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Console d'alerte FitBot */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
        sncState.status === 'saturation_snc' ? 'bg-red-950/30 border-red-500/40 text-red-200' :
        sncState.status === 'fatigue_moderee' ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' :
        'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
      }`}>
        <div className="mt-0.5 flex-shrink-0">
          {sncState.status === 'saturation_snc' ? <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" /> :
           sncState.status === 'fatigue_moderee' ? <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" /> :
           <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-xs uppercase tracking-wider text-white">{sncState.message}</h4>
          <p className="text-xs leading-relaxed opacity-90">{sncState.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}
