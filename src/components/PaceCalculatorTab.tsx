import { useState } from 'react';
import { Gauge, Flame, Zap, Compass } from 'lucide-react';

export default function PaceCalculatorTab() {
  const [vma, setVma] = useState<number>(14); // VMA par défaut en km/h

  // Calcul des allures (exprimées en min/km)
  const calculatePace = (percentage: number) => {
    const speed = vma * (percentage / 100);
    const minutesPerKm = 60 / speed;
    const mins = Math.floor(minutesPerKm);
    const secs = Math.round((minutesPerKm - mins) * 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs} min/km`;
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
        <Gauge className="w-4 h-4" /> Calculateur d'Allures & Zones VMA
      </div>

      <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-2">
        <label className="block text-xs font-semibold text-neutral-400">Ta VMA estimée (km/h) :</label>
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            step="0.5" 
            min="8" 
            max="24" 
            value={vma} 
            onChange={(e) => setVma(Number(e.target.value))} 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xl font-black text-white focus:border-emerald-500 focus:outline-none" 
          />
          <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">{vma} km/h</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Tes zones d'entraînement cibles :</h4>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-bold text-xs text-white block">Endurance Fondamentale (EF)</span>
                <span className="text-[10px] text-neutral-400">60% à 70% VMA • Idéal pour bâtir le foncier</span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-cyan-400">{calculatePace(65)}</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-xs text-white block">Seuil Anaérobie</span>
                <span className="text-[10px] text-neutral-400">80% à 85% VMA • Tenable sur 45-60 min</span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-amber-400">{calculatePpaceSafe(vma, 82)}</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <div>
                <span className="font-bold text-xs text-white block">VMA Court (100%)</span>
                <span className="text-[10px] text-neutral-400">100% VMA • Séances de fractionné (30/30, 400m)</span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-orange-500">{calculatePace(100)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Petite fonction utilitaire interne pour le seuil
function calculatePpaceSafe(vmaVal: number, percentage: number) {
  const speed = vmaVal * (percentage / 100);
  const minutesPerKm = 60 / speed;
  const mins = Math.floor(minutesPerKm);
  const secs = Math.round((minutesPerKm - mins) * 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs} min/km`;
}
