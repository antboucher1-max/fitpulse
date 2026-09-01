import { useState } from 'react';
import { BrainCircuit, BatteryCharging, Send, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SmartCoachTab({ currentUserId }: { currentUserId?: string }) {
  const [sleep, setSleep] = useState(4);
  const [fatigue, setFatigue] = useState(2);
  const [soreness, setSoreness] = useState(2);
  const [rpe, setRpe] = useState(6);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerateAndSave = async (e: any) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("Utilisateur non identifié.");
      return;
    }

    setLoading(true);
    setSaved(false);

    // 1. Génération de l'analyse intelligente (le "mot du coach")
    let advice = "";
    if (fatigue >= 4 || sleep <= 2) {
      advice = "Attention : Ton niveau de fatigue est élevé et ton sommeil a été court. Le coach te conseille de basculer la séance d'intensité d'aujourd'hui en un footing très souple de 30 minutes, ou de prendre un repos total. Écoute ton corps.";
    } else if (rpe >= 8) {
      advice = "Excellente implication sur la dernière séance ! La charge était importante. Veille à bien t'hydrater aujourd'hui et à placer une bonne séance de mobilité ce soir pour faciliter la récupération.";
    } else {
      advice = "Feu vert total ! Tes voyants de récupération sont au vert. C'est la journée idéale pour aller chercher ton allure cible sur ta séance du jour. Bon entraînement !";
    }

    setFeedback(advice);

    try {
      // 2. Enregistrement du check-in dans Supabase (Upsert pour la date du jour)
      const { error: readinessError } = await supabase
        .from('athlete_readiness')
        .upsert([{
          user_id: currentUserId,
          date: new Date().toISOString().split('T')[0],
          sleep_quality: sleep,
          fatigue_level: fatigue,
          soreness: soreness
        }], { onConflict: 'user_id,date' });

      if (readinessError) throw readinessError;

      // 3. Enregistrement du feedback du coach dans Supabase
      const { error: feedbackError } = await supabase
        .from('training_feedback')
        .insert([{
          user_id: currentUserId,
          ai_comment: advice,
          rpe: rpe
        }]);

      if (feedbackError) throw feedbackError;

      setSaved(true);
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement :", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
        <BrainCircuit className="w-4 h-4" /> Coach IA & Analyse de Forme
      </div>

      <form onSubmit={handleGenerateAndSave} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-4">
        <h4 className="text-xs font-semibold text-white flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-emerald-400" /> Check-in Matinal Flash
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Qualité du sommeil (1 à 5) : {sleep}</label>
            <input 
              type="range" min="1" max="5" value={sleep} 
              onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Niveau de fatigue musculaire (1 à 5) : {fatigue}</label>
            <input 
              type="range" min="1" max="5" value={fatigue} 
              onChange={(e) => setFatigue(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Niveau de courbatures / tensions (1 à 5) : {soreness}</label>
            <input 
              type="range" min="1" max="5" value={soreness} 
              onChange={(e) => setSoreness(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Ressenti de la dernière séance (RPE 1 à 10) : {rpe}</label>
            <input 
              type="range" min="1" max="10" value={rpe} 
              onChange={(e) => setRpe(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-extrabold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {loading ? "Analyse en cours..." : "Analyser ma forme et consulter le coach"}
          </button>
        </div>
      </form>

      {feedback && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Le mot du Coach</span>
            {saved && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré
              </span>
            )}
          </div>
          <p className="text-xs text-white leading-relaxed">{feedback}</p>
        </div>
      )}
    </div>
  );
}
