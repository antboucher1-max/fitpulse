import { useState } from 'react';
import { Apple, Droplet, Flame, Zap, CheckCircle2 } from 'lucide-react';

export default function NutritionPlannerTab() {
  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [intensity, setIntensity] = useState<'modere' | 'soutenu' | 'maximal'>('soutenu');
  const [bodyWeight, setBodyWeight] = useState<number>(70);

  // Calculs nutritionnels
  const totalHours = durationHours + durationMins / 60;
  
  // Recommandation de glucides par heure selon l'intensité
  let carbsPerHour = 60; // par défaut
  if (intensity === 'modere') carbsPerHour = 45;
  if (intensity === 'soutenu') carbsPerHour = 65;
  if (intensity === 'maximal') carbsPerHour = 90;

  const totalCarbs = Math.round(carbsPerHour * totalHours);
  
  // Besoins en eau (environ 500ml à 750ml par heure selon conditions)
  const waterPerception = intensity === 'maximal' ? 750 : 600;
  const totalWaterMl = Math.round(waterPerception * totalHours);

  // Équivalence en gels / barres (un gel standard contient ~25g de glucides)
  const standardGelsCount = Math.round(totalCarbs / 25);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/35 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Zap className="w-4 h-4" /> Stratégie Énergétique
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Planificateur de Ravitaillement</h2>
          </div>
          <span className="text-xs font-bold bg-neutral-950/80 border border-neutral-800 px-3.5 py-1.5 rounded-full text-orange-400 shadow-inner">
            Carburant Course
          </span>
        </div>
      </div>

      {/* Paramètres de l'effort */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
          <Flame className="w-4 h-4 text-orange-500" /> Paramètres de la sortie
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Durée (Heures) :</label>
            <input 
              type="number" 
              min="0" 
              max="12"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Durée (Minutes) :</label>
            <input 
              type="number" 
              min="0" 
              max="55"
              step="5"
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Intensité :</label>
            <select 
              value={intensity} 
              onChange={(e: any) => setIntensity(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="modere">Modéré (Endurance cool)</option>
              <option value="soutenu">Soutenu (Allure semi/marathon)</option>
              <option value="maximal">Maximal (Seuil / Race Pace)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1">Poids corporel (kg) :</label>
            <input 
              type="number" 
              value={bodyWeight}
              onChange={(e) => setBodyWeight(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Résultats & Plan Stratégique */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ton plan nutritionnel personnalisé
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Apple className="w-3.5 h-3.5 text-orange-500" /> Glucides Totaux
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {totalCarbs} <span className="text-xs font-normal text-orange-400">g</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">Soit ~{carbsPerHour}g / heure</span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Hydratation / Eau
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {(totalWaterMl / 1000).toFixed(2)} <span className="text-xs font-normal text-cyan-400">L</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">Avec électrolytes conseillés</span>
          </div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
          <span className="font-bold text-orange-400 block">Recommandation pratique :</span>
          <p className="text-neutral-300 leading-relaxed">
            Pour cette sortie de <strong>{durationHours}h{durationMins > 0 ? durationMins : ''}</strong>, prévois environ <strong>{standardGelsCount} gels énergétiques</strong> (ou équivalent en barres/compotes) à répartir régulièrement toutes les 30 à 45 minutes, accompagnés de petites gorgées d'eau toutes les 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
