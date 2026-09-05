import { useState } from 'react';
import { Apple, Flame, Utensils, Sparkles, RefreshCw } from 'lucide-react';

interface FuelLockProps {
  lastRunDistanceKm?: number;
  bodyWeightKg?: number;
}

export default function FuelLockPostWod({ lastRunDistanceKm = 10, bodyWeightKg = 70 }: FuelLockProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipeGenerated, setRecipeGenerated] = useState<any>(null);

  // Calcul du besoin post-effort (environ 1g de glucide par kg par tranche de distance ou ~60kcal/km)
  const estimatedCaloriesBurned = Math.round(lastRunDistanceKm * bodyWeightKg * 0.9);
  const targetCarbsGrams = Math.round(lastRunDistanceKm * 8); // Recharge glycogénique
  const targetProteinGrams = Math.round(bodyWeightKg * 0.4); // Fenêtre anabolique

  const handleScanAndGenerateRecipe = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setRecipeGenerated({
        title: "Bowl Récupération Glycogène & Poulet / Patate Douce",
        ingredients: ["150g de patate douce rôtie", "120g de blanc de poulet grillé", "1 œuf poché", "Épinards frais & huile d'olive"],
        macros: `Glucides : ~${targetCarbsGrams}g | Protéines : ~${targetProteinGrams}g`
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
          <Utensils className="w-4 h-4" /> Fuel-Lock Post-Effort (Nutrition Intelligente)
        </div>
        <span className="text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
          Auto-Ajusté 🧬
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>Dernière séance estimée :</span>
          <span className="font-bold text-white">{lastRunDistanceKm} km (~{estimatedCaloriesBurned} kcal)</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Cible Glucides (Recharge) :</span>
          <span className="font-bold text-orange-400">~{targetCarbsGrams}g</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Cible Protéines (Réparation) :</span>
          <span className="font-bold text-emerald-400">~{targetProteinGrams}g</span>
        </div>
      </div>

      {!recipeGenerated ? (
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleScanAndGenerateRecipe}
          className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAnalyzing ? "Analyse du frigo & calcul des macros..." : "Scanner le frigo & Générer le Fuel-Lock 🥗"}
        </button>
      ) : (
        <div className="bg-neutral-950 border border-cyan-500/40 p-4 rounded-2xl space-y-2 text-xs animate-fadeIn">
          <div className="font-black text-cyan-300">{recipeGenerated.title}</div>
          <ul className="text-neutral-300 space-y-1 list-disc list-inside">
            {recipeGenerated.ingredients.map((ing: string, idx: number) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-neutral-900 text-emerald-400 font-bold font-mono text-[11px]">
            {recipeGenerated.macros}
          </div>
          <button
            type="button"
            onClick={() => setRecipeGenerated(null)}
            className="text-[10px] text-neutral-500 hover:text-neutral-300 underline pt-1 block cursor-pointer"
          >
            Refaire un scan
          </button>
        </div>
      )}
    </div>
  );
}
