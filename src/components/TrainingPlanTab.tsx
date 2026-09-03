import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { getAdaptiveTrainingPlan } from '../utils/adaptiveTrainer';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ordre chronologique pour trier les jours de la semaine proprement
const DAY_ORDER: Record<string, number> = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 7
};

export default function TrainingPlanTab({ currentUserId }: { currentUserId?: string }) {
  const [userId, setUserId] = useState<string | undefined>(currentUserId);
  const [goal, setGoal] = useState('Force & Hypertrophie + Cardio');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>("Vérification de l'auth...");

  // État pour stocker les adaptations dynamiques des séances en fonction du carnet de muscu
  const [adaptedSessions, setAdaptedSessions] = useState<Record<string, any>>({});

  useEffect(() => {
    async function resolveUser() {
      if (currentUserId) {
        setUserId(currentUserId);
        setAuthStatus(`Connecté (Prop ID: ${currentUserId.slice(0, 6)}...)`);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setAuthStatus(`Connecté (Auth ID: ${user.id.slice(0, 6)}...)`);
      } else {
        setAuthStatus("❌ Non connecté (Aucun utilisateur Supabase actif)");
      }
    }
    resolveUser();
  }, [currentUserId]);

  const fetchActivePlan = async () => {
    if (!userId) return;
    
    const { data: planData } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (planData) {
      setActivePlan(planData);
      const { data: sessionData } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('plan_id', planData.id);

      if (sessionData) {
        // Tri direct des séances par ordre chronologique des jours
        const sorted = [...sessionData].sort((a, b) => {
          return (DAY_ORDER[a.day_name] || 99) - (DAY_ORDER[b.day_name] || 99);
        });
        setSessions(sorted);

        // Récupérer les gym_logs récents pour exécuter l'algorithme adaptatif
        const { data: gymLogs } = await supabase
          .from('gym_logs')
          .select('*')
          .eq('user_id', userId);

        if (gymLogs) {
          const adaptations: Record<string, any> = {};
          sorted.forEach(session => {
            const result = getAdaptiveTrainingPlan(gymLogs, session.session_type);
            adaptations[session.id] = result;
          });
          setAdaptedSessions(adaptations);
        }

      } else {
        setSessions([]);
      }
    }
  };

  useEffect(() => {
    if (userId) fetchActivePlan();
  }, [userId]);

  const handleGeneratePlan = async (e: any) => {
    e.preventDefault();
    
    if (!userId) {
      alert("Blocage : Impossible de générer un plan car aucun utilisateur n'est connecté à Supabase.");
      return;
    }

    setLoading(true);

    try {
      // 1. Désactiver les anciens plans
      await supabase.from('training_plans').update({ is_active: false }).eq('user_id', userId);

      // 2. Créer le plan avec le bon nombre de jours
      const { data: newPlan, error: planError } = await supabase
        .from('training_plans')
        .insert([{ user_id: userId, goal, days_per_week: daysPerWeek, is_active: true }])
        .select()
        .single();

      if (planError) throw new Error("Plan error: " + planError.message);

      // 3. Définir un catalogue de séances hybrides par défaut sur la semaine
      const allPossibleSessions = [
        { day_name: 'Lundi', session_type: 'Musculation (Push / Force)', description: 'Pectoraux / Épaules / Triceps + lourd' },
        { day_name: 'Mardi', session_type: 'WOD / Fonctionnel', description: 'MetCon court & intensité élevée' },
        { day_name: 'Mercredi', session_type: 'Récupération Active', description: 'Mobilité & Core training léger' },
        { day_name: 'Jeudi', session_type: 'Musculation (Pull / Dos)', description: 'Dos / Biceps / Postérieur + isolation' },
        { day_name: 'Vendredi', session_type: 'Cardio Hybride / Fractionné VMA', description: '30 min endurance fondamentale ou seuil' },
        { day_name: 'Samedi', session_type: 'Jambes / Force Bas du corps', description: 'Squats, Deadlifts & hypertrophie' },
        { day_name: 'Dimanche', session_type: 'Repos total', description: 'Recharge & décompression' }
      ];

      // On sélectionne exactement le nombre de séances demandé par l'utilisateur (`daysPerWeek`)
      const selectedSessions = allPossibleSessions.slice(0, daysPerWeek).map((s) => ({
        plan_id: newPlan.id,
        week_number: 1,
        day_name: s.day_name,
        session_type: s.session_type,
        description: s.description,
        status: 'À faire'
      }));

      const { error: sessionError } = await supabase.from('training_sessions').insert(selectedSessions);
      if (sessionError) throw new Error("Session error: " + sessionError.message);

      await fetchActivePlan();
      alert("Plan hybride généré avec succès ! 🚀");
    } catch (err: any) {
      alert("Erreur technique : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
          <Calendar className="w-4 h-4" /> Plan d'Entraînement Hybride Intelligent
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-[11px] text-neutral-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Statut : <strong className="text-white">{authStatus}</strong></span>
      </div>

      {!activePlan ? (
        <form onSubmit={handleGeneratePlan} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400">Quel est ton objectif principal ?</label>
            <select 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none"
            >
              <option value="Force & Hypertrophie + Cardio">💪 Force & Hypertrophie + Cardio d'entretien</option>
              <option value="Hybride WOD + Running">⚡ Hybride WOD & Running (Style Hyrox)</option>
              <option value="Prise de masse / Puissance">🏋️‍♂️ Prise de masse / Puissance</option>
              <option value="Préparer un 10 km">🏃‍♂️ Préparer un 10 km (Focus Course)</option>
              <option value="Semi-Marathon">Préparer un Semi-Marathon</option>
              <option value="Marathon">Préparer un Marathon</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400">Séances disponibles par semaine :</label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDaysPerWeek(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                    daysPerWeek === num ? 'bg-orange-600 text-white border-orange-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {num} séances
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl text-xs transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Génération..." : "Générer mon plan hybride adaptatif 🚀"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-orange-400 font-bold uppercase block">Objectif Actif</span>
              <span className="text-sm font-black text-white">Plan {activePlan.goal} ({activePlan.days_per_week} séances/semaine)</span>
            </div>
            <button 
              onClick={async () => {
                await supabase.from('training_plans').update({ is_active: false }).eq('id', activePlan.id);
                setActivePlan(null);
                setSessions([]);
              }} 
              className="text-[11px] text-neutral-400 underline hover:text-white cursor-pointer"
            >
              Changer
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Séances de la semaine (Adaptation IA) :</h4>
            {sessions.map((session) => {
              const adaptation = adaptedSessions[session.id];
              const isModified = adaptation?.isModified;

              return (
                <div key={session.id} className={`bg-neutral-950 border p-3.5 rounded-2xl space-y-2 transition-all ${isModified ? 'border-amber-500/50 bg-amber-950/10' : 'border-neutral-800'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-orange-400 font-bold block">
                        {session.day_name} • {isModified ? <span className="text-amber-400 font-extrabold">⚡ {adaptation.recommendedSession}</span> : session.session_type}
                      </span>
                      <span className="text-xs font-bold text-white">{session.description}</span>
                    </div>
                    <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2.5 py-1 rounded-xl font-bold">
                      {session.status}
                    </span>
                  </div>

                  {/* Alerte d'adaptation si l'algorithme a détecté une fatigue des jambes suite au GymLog */}
                  {isModified && (
                    <div className={`text-[10px] p-2 rounded-xl border flex items-start gap-1.5 ${adaptation.badgeColor}`}>
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{adaptation.reason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
