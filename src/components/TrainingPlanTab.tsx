import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TrainingPlanTab({ currentUserId }: { currentUserId?: string }) {
  const [userId, setUserId] = useState<string | undefined>(currentUserId);
  const [goal, setGoal] = useState('10 km');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Récupérer l'utilisateur connecté si la prop est vide
  useEffect(() => {
    async function resolveUser() {
      if (currentUserId) {
        setUserId(currentUserId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      }
    }
    resolveUser();
  }, [currentUserId]);

  const fetchActivePlan = async () => {
    if (!userId) return;
    
    try {
      const { data: planData, error: planError } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (planError) {
        console.error("Erreur fetch plan:", planError.message);
        return;
      }

      if (planData) {
        setActivePlan(planData);
        
        const { data: sessionData, error: sessionError } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('plan_id', planData.id)
          .order('id', { ascending: true });

        if (sessionError) {
          console.error("Erreur fetch séances:", sessionError.message);
        } else {
          setSessions(sessionData || []);
        }
      } else {
        setActivePlan(null);
        setSessions([]);
      }
    } catch (err: any) {
      console.error("Erreur critique chargement plan :", err.message);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchActivePlan();
    }
  }, [userId]);

  const handleGeneratePlan = async (e: any) => {
    e.preventDefault();
    
    let targetUser = userId;
    if (!targetUser) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) targetUser = user.id;
    }

    if (!targetUser) {
      alert("Erreur : Aucun utilisateur connecté détecté. Vérifie ton authentification Supabase.");
      return;
    }

    setLoading(true);

    try {
      // 1. Désactiver les anciens plans
      await supabase.from('training_plans').update({ is_active: false }).eq('user_id', targetUser);

      // 2. Créer le nouveau plan
      const { data: newPlan, error: planError } = await supabase
        .from('training_plans')
        .insert([{ user_id: targetUser, goal, days_per_week: daysPerWeek, is_active: true }])
        .select()
        .single();

      if (planError || !newPlan) {
        throw new Error(planError?.message || "Impossible de créer le plan.");
      }

      // 3. Insérer les séances de base
      const defaultSessions = [
        { plan_id: newPlan.id, week_number: 1, day_name: 'Mardi', session_type: 'Endurance Fondamentale', description: '45 min à 65-70% VMA', status: 'À faire' },
        { plan_id: newPlan.id, week_number: 1, day_name: 'Jeudi', session_type: 'Fractionné VMA', description: '10 x (30s / 30s)', status: 'À faire' },
        { plan_id: newPlan.id, week_number: 1, day_name: 'Dimanche', session_type: 'Sortie Longue', description: '1h15 allure progressive', status: 'À faire' }
      ];

      const { error: sessionError } = await supabase.from('training_sessions').insert(defaultSessions);

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      await fetchActivePlan();
    } catch (err: any) {
      console.error("Erreur lors de la génération :", err.message);
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Calendar className="w-4 h-4" /> Plan d'Entraînement Intelligent
        </div>
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
              <option value="5 km">Préparer un 5 km</option>
              <option value="10 km">Préparer un 10 km</option>
              <option value="Semi-Marathon">Préparer un Semi-Marathon</option>
              <option value="Marathon">Préparer un Marathon</option>
              <option value="Endurance">Améliorer l'endurance fondamentale</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400">Séances disponibles par semaine :</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDaysPerWeek(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                    daysPerWeek === num ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
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
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-extrabold rounded-2xl text-xs transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Génération en cours..." : "Générer mon plan adaptatif 🚀"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Objectif Actif</span>
              <span className="text-sm font-black text-white">Plan {activePlan.goal} ({activePlan.days_per_week} séances/semaine)</span>
            </div>
            <button 
              onClick={async () => {
                await supabase.from('training_plans').update({ is_active: false }).eq('id', activePlan.id);
                setActivePlan(null);
                setSessions([]);
              }} 
              className="text-[11px] text-neutral-400 underline hover:text-white"
            >
              Changer
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Semaine en cours :</h4>
            
            {sessions.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-4">Aucune séance planifiée pour l'instant.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold block">{session.day_name} • {session.session_type}</span>
                    <span className="text-xs font-bold text-white">{session.description}</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-xl font-bold border ${
                    session.status === 'Adaptée' 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
