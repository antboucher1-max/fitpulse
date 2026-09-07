import { ShieldAlert, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { analyzeSncShield, TrainingLoadEntry } from './SncShieldEngine';

interface SncShieldWidgetProps {
  currentReadiness?: number;
  weeklyLoad?: number;
  recentLoads?: TrainingLoadEntry[];
  onOpenDetails?: () => void;
}

export default function SncShieldWidget({ 
  currentReadiness = 75, 
  weeklyLoad = 1800, 
  recentLoads 
}: SncShieldWidgetProps) {
  const loadsToAnalyze = recentLoads || ([
    { date: new Date().toISOString(), loadScore: weeklyLoad, type: 'mixed' }
  ] as TrainingLoadEntry[]);

  // Analyse en direct via l'algorithme intelligent
  const shieldData = analyzeSncShield(loadsToAnalyze, currentReadiness);

  const getBadgeStyle = () => {
    switch (shieldData.riskLevel) {
      case 'critical': return 'bg-red-950/40 border-red-500/50 text-red-400';
      case 'warning': return 'bg-amber-950/40 border-amber-500/50 text-amber-400';
      default: return 'bg-neutral-900 border-neutral-800 text-emerald-400';
    }
  };

  return (
    <div className={`border rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden transition-all ${getBadgeStyle()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          {shieldData.riskLevel === 'critical' ? <ShieldAlert className="w-4 h-4 text-red-500 animate-bounce" /> : 
           shieldData.riskLevel === 'warning' ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : 
           <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          SNC Shield (Bouclier Prédictif)
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
          shieldData.riskLevel === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 
          shieldData.riskLevel === 'warning' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }`}>
          {shieldData.riskLevel === 'critical' ? 'VERROUILLÉ 🔒' : shieldData.riskLevel === 'warning' ? 'SURVEILLANCE ⚠️' : 'ACTIF & NOMINAL 🛡️'}
        </span>
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed">
        {shieldData.shieldMessage}
      </p>

      {/* Recommandation de séance ajustée */}
      <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-white flex items-center gap-1.5">
            {shieldData.forcedAction === 'lockdown_active' ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
            {shieldData.adjustedPlanTitle}
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">IA Auto-régul</span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-snug">
          {shieldData.adjustedPlanDescription}
        </p>
      </div>
    </div>
  );
}
