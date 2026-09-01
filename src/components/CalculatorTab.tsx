import { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function CalculatorTab() {
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(5);

  const oneRM = Math.round(weight * (1 + reps / 30));
  const percentages = [100, 90, 85, 80, 75, 70, 65, 60];

  return (
    <div className="bg-neutral-900 p-6 rounded-3xl shadow-xl border border-neutral-800 animate-fadeIn mt-4">
      <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
        <Calculator className="text-orange-500" /> Calculateur 1RM
      </h2>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
          <label className="block text-xs text-neutral-400 font-bold mb-1">Poids soulevé (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full bg-transparent text-2xl text-white font-black focus:outline-none" />
        </div>
        <div className="flex-1 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
          <label className="block text-xs text-neutral-400 font-bold mb-1">Répétitions</label>
          <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} className="w-full bg-transparent text-2xl text-white font-black focus:outline-none" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-5 rounded-2xl text-center mb-6 shadow-lg">
        <span className="text-xs text-white/80 font-bold uppercase tracking-widest">Ton 1RM Estimé</span>
        <div className="text-5xl font-black text-white mt-1">{oneRM} <span className="text-xl text-white/70">kg</span></div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {percentages.map(p => (
          <div key={p} className="bg-neutral-950 py-3 rounded-xl border border-neutral-800 text-center flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-bold">{p}%</span>
            <span className="text-sm font-black text-white">{Math.round(oneRM * (p / 100))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
