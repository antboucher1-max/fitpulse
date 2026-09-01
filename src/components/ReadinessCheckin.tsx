import { useState } from 'react';
import { Activity, BatteryCharging, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ReadinessCheckin({ currentUserId, onUpdatePlan }: { currentUserId?: string, onUpdatePlan: (recommendation: string) => void }) {
  const [fatigue, setFatigue] = useState<'frais' | 'normal' | 'fatigué' | 'épuisé'>('normal');
  const [sleep, setSleep] = useState<number>(4);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveReadiness = async () => {
    if (!currentUserId) return;
    setSubmitting(true);

    // 1. Enregistrement en base
    const { error } = await supabase.from('athlete_readiness').insert([{
      user_id: currentUserId,
      fatigue_level: fatigue,
      sleep_quality: sleep,
      rpe_score: fatigue === 'épuisé' ? 9 : fatigue === 'fatigué' ? 7 : 4
    }]);

    if (!error) {
      // 2. Logique d'adaptation instantanée du plan
      if (fatigue === 'épuisé' || sleep <= 2) {
        onUpdatePlan("⚡ Alerte Fatigue : Ta séance de VMA de ce soir a été automatiquement convertie en 30 minutes de footing très léger (Z1) pour préserver ton intégrité physique.");
      } else if (fatigue === 'fatigué') {
        onUpdatePlan("💡 Note du Coach : On retire 10% d'intensité sur tes blocs d'allure aujourd'hui. Écoute tes jambes.");
      } else {
        onUpdatePlan("✅ Feu vert : Ton corps est prêt. Respecte ton allure cible sur la séance du jour !");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
        <Activity className="w-4 h-4" /> Bilan Forme du Jour
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Comment te sens-tu musculairement ?</label>
          <div className="grid grid-cols-2 gap-2">
            {(['frais', 'normal', 'fatigué', 'épuisé'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFatigue(level)}
                className={`py-2.5 rounded-xl text-xs font-bold capitalize transition border ${
                  fatigue === level 
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                }`}
              >
                {level === 'frais' && '🚀 Frais / Dispo'}
                {level === 'normal' && '👍 Normal'}
                {level === 'fatigué' && '⚠️ Fatigué'}
                {level === 'épuisé' && '🔴 Épuisé'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">Qualité de sommeil (1 à 5) :</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSleep(s)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                  sleep === s ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                }`}
              >
                {s} {s === 5 ? '⭐' : ''}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleSaveReadiness}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-extrabold rounded-2xl text-xs transition shadow-lg"
        >
          {submitting ? "Analyse en cours..." : "Valider mon état & adapter ma séance 🧠"}
        </button>
      </div>
    </div>
  );
}
