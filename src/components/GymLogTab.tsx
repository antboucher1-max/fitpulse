import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trophy, Flame, CheckCircle, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MUSCLE_GROUPS = [
  'Pectoraux / Triceps (Push)',
  'Dos / Biceps (Pull)',
  'Jambes / Fessiers (Legs)',
  'Épaules / Abdos',
  'Full Body'
];

export default function GymLogTab({ currentUserId, onStartRestTimer }: { currentUserId?: string, onStartRestTimer?: () => void }) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState(MUSCLE_GROUPS[0]);
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [reps, setReps] = useState<number | ''>('');
  const [sets, setSets] = useState<number | ''>(4);
  const [loading, setLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const fetchGymLogs = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('gym_logs')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecentLogs(data);
  };

  useEffect(() => {
    if (currentUserId) fetchGymLogs();
  }, [currentUserId]);

  const handleLogExercise = async (e: any) => {
    e.preventDefault();
    if (!currentUserId || !exerciseName.trim() || weight === '' || reps === '') return;

    setLoading(true);
    try {
      const { error } = await supabase.from('gym_logs').insert([{
        user_id: currentUserId,
        muscle_group: selectedGroup,
        exercise_name: exerciseName.trim(),
        weight: Number(weight),
        reps: Number(reps),
        sets: Number(sets),
        date: new Date().toISOString().split('T')[0]
      }]);

      if (error) throw error;

      setExerciseName('');
      setWeight('');
      setReps('');
      fetchGymLogs();

      // Déclenche le minuteur de repos si la fonction est transmise
      if (onStartRestTimer) onStartRestTimer();
      
      alert("🏋️‍♂️ Série enregistrée avec succès ! Minuteur de repos lancé ⏱️");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    await supabase.from('gym_logs').delete().eq('id', id);
    fetchGymLogs();
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
          <Dumbbell className="w-4 h-4" /> Carnet de Musculation & PRs
        </div>
      </div>

      {/* Formulaire d'enregistrement éclair */}
      <form onSubmit={handleLogExercise} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-400">Groupe Musculaire :</label>
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
          >
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-400">Nom de l'exercice :</label>
          <input 
            type="text" 
            required 
            placeholder="Ex: Développé couché, Squat, Tractions..." 
            value={exerciseName} 
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-400">Poids (kg) :</label>
            <input 
              type="number" 
              step="0.5" 
              required 
              placeholder="Ex: 80" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-400">Répétitions :</label>
            <input 
              type="number" 
              required 
              placeholder="Ex: 10" 
              value={reps} 
              onChange={(e) => setReps(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-400">Séries :</label>
            <input 
              type="number" 
              required 
              value={sets} 
              onChange={(e) => setSets(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Plus className="w-4 h-4" /> Enregistrer la séance & Lancer le repos ⏱️
        </button>
      </form>

      {/* Historique récent des perfs */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Dernières perfs enregistrées :</h4>
        {recentLogs.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4 bg-neutral-950 rounded-2xl border border-neutral-800">Aucun historique de musculation pour le moment.</p>
        ) : (
          recentLogs.map((log) => (
            <div key={log.id} className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-orange-400 font-bold block">{log.muscle_group}</span>
                <span className="text-xs font-black text-white">{log.exercise_name}</span>
                <p className="text-[11px] text-neutral-400 pt-0.5">
                  <strong className="text-white">{log.weight} kg</strong> • {log.reps} reps • {log.sets} séries
                </p>
              </div>
              <button 
                onClick={() => handleDeleteLog(log.id)}
                className="p-2 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
