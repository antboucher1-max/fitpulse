import { useState, useEffect } from 'react';
import { Apple, Droplet, Zap, Utensils, Flame, CheckCircle2 } from 'lucide-react';

interface NutritionDashboardProps {
  lastRunDistance?: number; // en km
  lastRunDurationSecs?: number; // en secondes
  bodyWeight?: number; // en kg (par défaut 70)
  recoveryScore?: number; // en % (issu du readiness)
}

export default function NutritionDashboard({
  lastRunDistance = 10,
  lastRunDurationSecs = 3300, // 55 min par défaut
  bodyWeight = 70,
  recoveryScore = 78
}: NutritionDashboardProps) {
  const [hydrationDrank, setHydrationDrank] = useState<number>(0);
  const [carbsConsumed, setCarbsConsumed] = useState<number>(0);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  // Calculs automatiques des besoins post-effort
  const durationHours = lastRunDurationSecs / 3600;
  
  // Besoins en eau : ~750ml par heure d'effort + réhydratation de base (150% du poids perdu estimé)
  const targetWaterMl = Math.round((durationHours * 750) + (bodyWeight * 50));
  
  // Besoins en glucides de récupération : 1.2g par kg de poids corporel + recharge post-effort
  const targetCarbsGrams = Math.round(bodyWeight * 1.2 + (lastRunDistance * 4));
  
  // Besoins en protéines : 0.4g par kg pour la reconstruction tissulaire (surtout en hybride muscu/run)
  const targetProteinGrams = Math.round(bodyWeight * 0.4);

  // Recommandation personnalisée selon le score de fatigue
  const getPostWorkoutAdvice = (score: number) => {
    if (score < 45) {
      return "⚠️ Fatigue élevée détectée : Priorité absolue aux antioxydants, à une hydratation riche en magnésium/sodium et à un apport protéique rapide pour limiter les microlésions.";
    }
    if (score < 75) {
      return "⚡ Charge modérée : Vise une fenêtre métabolique classique (glucides à index glycémique modéré + protéines dans les 45 min suivant l'effort).";
    }
    return "🔥 Récupération optimale : Excellent profil énergétique. Un repas complet équilibré dans les 2 heures suffira pour reconstituer les stocks de glycogène.";
  };

  const handleLogNutrition = () => {
    setIsLogged(true);
    localStorage.setItem('fitpulse_last_nutrition_log', JSON.stringify({
      water: targetWaterMl,
      carbs: targetCarbsGrams,
      protein: targetProteinGrams,
      date: new Date().toISOString()
    }));
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn">
      {/* En-tête du Dashboard */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
          <Utensils className="w-4 h-4" /> Nutrition Post-Effort Automatisée
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          Synchronisé avec la sortie
        </span>
      </div>

      {/* Résumé de la dernière séance */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
          <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Distance</span>
          <span className="text-base font-black text-white">{lastRunDistance} <span className="text-xs font-normal text-neutral-400">km</span></span>
        </div>
        <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
          <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Durée</span>
          <span className="text-base font-black text-orange-400">{Math.floor(lastRunDurationSecs / 60)} min</span>
        </div>
        <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
          <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Poids Athlète</span>
          <span className="text-base font-black text-white">{bodyWeight} <span className="text-xs font-normal text-neutral-400">kg</span></span>
        </div>
      </div>

      {/* Cibles nutritionnelles calculées */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Hydratation */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Eau & Électrolytes
            </span>
            <span className="text-xs font-bold text-cyan-400">{(targetWaterMl / 1000).toFixed(2)} L</span>
          </div>
          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: '100%' }} />
          </div>
          <span className="text-[10px] text-neutral-500 block">Inclut sodium & magnésium post-run</span>
        </div>

        {/* Glucides */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Apple className="w-3.5 h-3.5 text-orange-500" /> Glucides (Glycogène)
            </span>
            <span className="text-xs font-bold text-orange-400">{targetCarbsGrams} g</span>
          </div>
          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: '100%' }} />
          </div>
          <span className="text-[10px] text-neutral-500 block">Recharge rapide recommandée</span>
        </div>

        {/* Protéines */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-emerald-400" /> Protéines (Muscles)
            </span>
            <span className="text-xs font-bold text-emerald-400">{targetProteinGrams} g</span>
          </div>
          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: '100%' }} />
          </div>
          <span className="text-[10px] text-neutral-500 block">Synthèse protéique post-effort</span>
        </div>
      </div>

      {/* Conseil stratégique automatisé */}
      <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-2">
        <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
          <Zap className="w-4 h-4" /> Stratégie Métabolique Hybride :
        </span>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {getPostWorkoutAdvice(recoveryScore)}
        </p>
      </div>

      {/* Validation de la prise post-effort */}
      <button 
        type="button"
        onClick={handleLogNutrition}
        className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
          isLogged 
            ? 'bg-emerald-600 text-neutral-950' 
            : 'bg-orange-600 hover:bg-orange-500 text-white'
        }`}
      >
        {isLogged ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-white" />}
        {isLogged ? "Ravitaillement post-effort validé !" : "Valider mon protocole de nutrition ⚡"}
      </button>
    </div>
  );
}
