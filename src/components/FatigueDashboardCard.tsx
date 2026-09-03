import { Activity, ShieldAlert, Zap } from 'lucide-react';
import { calculateMuscleFatigue, calculateACWR, GymLogEntry } from '../utils/fatigueCalculator';

interface FatigueDashboardCardProps {
  logs: GymLogEntry[];
}

export default function FatigueDashboardCard({ logs }: FatigueDashboardCardProps) {
  const muscleFatigue = calculateMuscleFatigue(logs);
  const acwrData = calculateACWR(logs);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-sm uppercase tracking-wider">
          <Activity className="w-5 h-5" /> Readiness & Fatigue Hybride
        </div>
        <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md font-black uppercase">
          ACWR : {acwrData.ratio}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Indicateur de risque global ACWR */}
        <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-bold block">Statut de Charge</span>
            <span className={`text-xs font-black ${acwrData.riskColor}`}>{acwrData.riskLevel}</span>
          </div>
          <ShieldAlert className="w-6 h-6 text-neutral-600" />
        </div>

        {/* État de fraîcheur global */}
        <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-bold block">Volume Aigu (7j)</span>
            <span className="text-xs font-black text-white">{Math.round(acwrData.acuteLoad)} unités</span>
          </div>
          <Zap className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      {/* Barres de fatigue par groupe musculaire */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest block">Cartographie de Fatigue Musculaire :</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(muscleFatigue).map((item) => (
            <div key={item.muscle} className={`p-2.5 rounded-xl border ${item.color} flex flex-col justify-between`}>
              <div className="flex justify-between items-center text-xs font-black uppercase">
                <span className="text-white">{item.muscle}</span>
                <span>{item.fatigueScore}%</span>
              </div>
              <span className="text-[10px] font-semibold mt-1 capitalize opacity-80">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
