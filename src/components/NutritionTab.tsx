import { useState, useEffect } from 'react';
import { Apple, Droplet, Flame, Zap, Activity, Calendar, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface NutritionTabProps {
  currentUserProfile?: any;
  bodyWeight?: number;
  currentUserId?: string;
  onNutritionValidated?: () => void;
}

export default function NutritionTab({ currentUserProfile, bodyWeight = 70, currentUserId, onNutritionValidated }: NutritionTabProps) {
  const [targetHours, setTargetHours] = useState<number>(1.5);
  const [sessionType, setSessionType] = useState<'endurance' | 'seuil' | 'foot' | 'longue'>('endurance');
  const [ambientTemp, setAmbientTemp] = useState<number>(20); // Température extérieure estimée
  const [isNutritionValidatedToday, setIsNutritionValidatedToday] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUserId) return;
    const saved = localStorage.getItem(`fitpulse_nutrition_${currentUserId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        if (parsed.date === todayStr && parsed.validated) {
          setIsNutritionValidatedToday(true);
        }
      } catch (e) {
        // Ignore
      }
    }
  }, [currentUserId]);

  const handleValidateNutrition = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = { date: todayStr, validated: true, timestamp: Date.now() };

    if (currentUserId) {
      localStorage.setItem(`fitpulse_nutrition_${currentUserId}`, JSON.stringify(data));
    }
    setIsNutritionValidatedToday(true);
    alert("Diète & Fuel-Lock validés pour aujourd'hui ! 100% 🍏");

    if (onNutritionValidated) {
      onNutritionValidated();
    }
  };

  const handleResetNutrition = () => {
    if (currentUserId) {
      localStorage.removeItem(`fitpulse_nutrition_${currentUserId}`);
    }
    setIsNutritionValidatedToday(false);
    if (onNutritionValidated) {
      onNutritionValidated();
    }
  };

  // --- CALCULATEUR DE CARB-LOADING & RAVITO ---
  let targetCarbsPerHour = 60;
  if (sessionType === 'endurance') targetCarbsPerHour = 50;
  if (sessionType === 'seuil') targetCarbsPerHour = 75;
  if (sessionType === 'longue' || sessionType === 'foot') targetCarbsPerHour = 85;

  const totalCarbsNeeded = Math.round(targetCarbsPerHour * targetHours);
  const waterPerceptionMl = ambientTemp > 25 ? 800 : ambientTemp > 18 ? 650 : 500;
  const totalWaterMl = Math.round(waterPerceptionMl * targetHours);
  const sodiumMgPerHour = ambientTemp > 25 ? 700 : 500;
  const totalSodiumMg = Math.round(sodiumMgPerHour * targetHours);

  // --- FENÈTRE ANABOLIQUE POST-EFFORT ---
  const postWorkoutProtein = Math.round(bodyWeight * 0.4); // ~0.4g par kg de poids de corps
  const postWorkoutCarbs = Math.round(bodyWeight * 0.8); // ~0.8g par kg pour reconstituer le glycogène

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      
      {/* En-tête Nutrition Lab & Validation Fuel-Lock */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950/35 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <Apple className="w-4 h-4" /> Nutrition Lab & Glycogène
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Stratégie Énergétique & Fenêtre de Récupération</h2>
          <p className="text-xs text-neutral-400">Optimisez vos stocks de glycogène et vos apports électrolytiques selon vos séances et la météo.</p>
        </div>

        {/* Bouton de validation Fuel-Lock */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white block">Validation Fuel-Lock du jour</span>
            <span className="text-[10px] text-neutral-400 block">Passe le score nutritionnel de l'Index Apex à 100%</span>
          </div>

          {isNutritionValidatedToday ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-4 h-4" /> Validé (100%)
              </span>
              <button onClick={handleResetNutrition} className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer">
                Modifier
              </button>
            </div>
          ) : (
            <button 
              onClick={handleValidateNutrition}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              Valider ma diète 🍏
            </button>
          )}
        </div>
      </div>

      {/* 1. Simulateur de Ravitaillement Intelligent */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4" /> Simulateur de Ravitaillement en Direct
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">Type de Séance :</label>
            <select
              value={sessionType}
              onChange={(e: any) => setSessionType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="endurance">Endurance Fondamentale (Cool)</option>
              <option value="seuil">Seuil / Allure Spécifique</option>
              <option value="longue">Sortie Longue / Trail</option>
              <option value="foot">Match / Entraînement Football</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">Durée estimée (Heures) :</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="6"
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">Température Extérieure (°C) :</label>
            <input
              type="number"
              min="-5"
              max="40"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Glucides Requis
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {totalCarbsTestOrValue(totalCarbsNeeded)} <span className="text-xs font-normal text-orange-400">g</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">Soit ~{targetCarbsPerHour}g / heure</span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Eau & Hydratation
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {(totalWaterMl / 1000).toFixed(2)} <span className="text-xs font-normal text-cyan-400">L</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">~{waterPerceptionMl} ml / heure</span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Sodium / Électrolytes
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {totalSodiumMg} <span className="text-xs font-normal text-emerald-400">mg</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">Recommandé en cas de sueur abondante</span>
          </div>
        </div>
      </div>

      {/* 2. Fenêtre de Récupération Post-Effort */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Activity className="w-4 h-4" /> Fenêtre Anabolique Post-Effort (Récupération)
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Dans les 45 à 60 minutes suivant votre séance, l'assimilation des nutriments est maximale pour reconstituer les stocks de glycogène et réparer les fibres musculaires.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Protéines Cibles (Post-Séance)</span>
            <span className="text-xl font-black text-emerald-400">{postWorkoutProtein} g</span>
            <span className="text-[10px] text-neutral-500 block">Réparation tissulaire</span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Glucides de Recharge</span>
            <span className="text-xl font-black text-orange-400">{postWorkoutCarbs} g</span>
            <span className="text-[10px] text-neutral-500 block">Reconstitution glycogène</span>
          </div>
        </div>
      </div>

    </div>
  );
}

function totalCarbsTestOrValue(val: number) {
  return val;
}
