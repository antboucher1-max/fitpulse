import React from 'react';
import { Calculator } from 'lucide-react';

interface CalculatorTabProps {
  targetWeight: number | '';
  setTargetWeight: (val: number | '') => void;
  barbellWeight: number;
  setBarbellWeight: (val: number) => void;
  plateBreakdown: { weight: number; count: number }[];
}

export default function CalculatorTab({
  targetWeight,
  setTargetWeight,
  barbellWeight,
  setBarbellWeight,
  plateBreakdown
}: CalculatorTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <h2 className="text-base font-black tracking-tight flex items-center gap-2">
          <Calculator className="w-5 h-5 text-orange-500" /> Calculateur de charge (disques par côté)
        </h2>
        <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Poids total cible (kg) :</label>
            <input 
              type="number" 
              value={targetWeight} 
              onChange={(e) => setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" 
              placeholder="Ex: 100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Poids de la barre (kg) :</label>
            <select 
              value={barbellWeight} 
              onChange={(e) => setBarbellWeight(Number(e.target.value))} 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500"
            >
              <option value={20}>Barre olympique standard (20 kg)</option>
              <option value={15}>Barre féminine / technique (15 kg)</option>
              <option value={10}>Petite barre droite (10 kg)</option>
              <option value={0}>Sans barre (0 kg)</option>
            </select>
          </div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Disques à charger de chaque côté :</h3>
          {plateBreakdown.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-4">Entrez un poids cible supérieur à la barre.</p>
          ) : (
            <div className="space-y-2">
              {plateBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-sm">
                  <span className="font-bold text-white">Disque de {item.weight} kg</span>
                  <span className="font-mono font-black text-orange-400">× {item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
