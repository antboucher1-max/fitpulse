import { useState } from 'react';
import { Zap, Activity, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ReadinessCheckinProps {
  currentUserId?: string;
  onUpdatePlan?: (recommendation: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export default function ReadinessCheckin({ currentUserId, onUpdatePlan, onNavigateTab }: ReadinessCheckinProps) {
  const [sleepScore, setSleepScore] = useState<number>(4);
  const [soreness, setSoreness] = useState<number>(3);
  const [stress, setStress] = useState<number>(2);
  const [recentLoadKm, setRecentLoadKm] = useState<number>(25);
  const [recentWods, setRecentWods] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const runningLoad = recentLoadKm * 3.5;
  const strengthLoad = recentWods * 12;
  const totalTrainingLoad = Math.min(100, Math.round(runningLoad + strengthLoad));

  const recoveryScore = Math.max(10, Math.min(100, Math.round(
    ((sleepScore / 5) * 40) + 
    (((6 - soreness) / 5) * 30) + 
    (((6 - stress) / 5) * 30) - 
    (totalTrainingLoad * 0.15)
  )));

  const getStatusDetails = (score: number) => {
    if (score >= 75) return { label: '🟢 Récupération Optimale - Prêt pour l’intensité', color: 'text-emerald-400', advice: 'Feu vert pour une grosse séance de seuil ou un WOD lourd.' };
    if (score >= 45) return { label: '🟡 Charge Équilibrée - Vigilance modérée', color: 'text-amber-400', advice: 'Privilégie une intensité modérée ou de l’endurance fondamentale.' };
    return { label: '🔴 Risque de Surentraînement - Repos conseillé', color: 'text-red-400', advice: 'Risque élevé de fatigue nerveuse ou tendineuse. Allége le volume.' };
  };

  const statusInfo = getStatusDetails(recoveryScore);

  const handleSaveCheckin = async () => {
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (currentUserId) {
        const { error } = await supabase.from('readiness_logs').upsert([{
          user_id: currentUserId,
          date: today,
          sleep_score: sleepScore,
          soreness_score: soreness,
          stress_score: stress,
          training_load: totalTrainingLoad,
          readiness_score: recoveryScore
        }], { onConflict: 'user_id,date' });

        if (error) {
          console.warn("Stockage cloud indisponible, bascule en cache local :", error.message);
        }
      }

      localStorage.setItem('fitpulse_last_readiness', JSON.stringify({
        date: today,
        score: recoveryScore,
        load: totalTrainingLoad,
        advice: statusInfo.advice
      }));

      setSaved(true);
      if (onUpdatePlan) {
        onUpdatePlan(statusInfo.advice);
      }
    } catch (err: any) {
      console.error("Erreur check-in :", err);
      setSaved(true);
      if (onUpdatePlan) onUpdatePlan(statusInfo.advice);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    localStorage.setItem('fitpulse_active_tab', 'running');
    if (onNavigateTab) {
      onNavigateTab('running');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Activity className="w-4 h-4" /> Check-in & Load Score Hybride
        </div>
        <button
          type="button"
          onClick={handleReturn}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Indice de Récupération</span>
          <span className={`text-2xl font-black ${statusInfo.color}`}>{recoveryScore}%</span>
        </div>
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Charge Cumulée (Load)</span>
          <span className="text-2xl font-black text-orange-400">{totalTrainingLoad} <span className="text-xs font-normal text-neutral-500">/ 100</span></span>
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-1">
        <span className={`text-xs font-black block ${statusInfo.color}`}>{statusInfo.label}</span>
        <p className="text-xs text-neutral-300 leading-relaxed">{statusInfo.advice}</p>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
            <span>Qualité du Sommeil (1-5) :</span>
            <span className="text-white font-bold">{sleepScore} / 5</span>
          </div>
          <input 
            type="range" min="1" max="5" value={sleepScore} 
            onChange={(e) => setSleepScore(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-1">
            <span>Niveau de Courbatures / Tensions (1-5) :</span>
            <span className="text-white font-bold">{soreness} / 5</span>
          </div>
          <input 
            type="range" min="1" max="5" value={soreness} 
            onChange={(e) => setSoreness(Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Run récent (km) :</label>
            <input 
              type="number" value={recentLoadKm} 
              onChange={(e) => setRecentLoadKm(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Séances Muscu/WOD :</label>
            <input 
              type="number" value={recentWods} 
              onChange={(e) => setRecentWods(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button 
          type="button"
          onClick={handleSaveCheckin}
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-neutral-950" /> : <Zap className="w-4 h-4 text-neutral-950 fill-neutral-950" />}
          {saved ? "Check-in enregistré !" : "Valider mon statut du jour ⚡"}
        </button>

        {saved && (
          <button 
            type="button"
            onClick={handleReturn}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Revenir à l'écran Running / Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
