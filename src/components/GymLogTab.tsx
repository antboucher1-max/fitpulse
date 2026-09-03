import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trash2, Clock, CheckCircle2, Target } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ExerciseSelectorModal, { ExerciseItem } from './ExerciseSelectorModal';
import AnatomicIllustration from './AnatomicIllustration';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trash2, Clock, CheckCircle2, Target } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ExerciseSelectorModal, { ExerciseItem } from './ExerciseSelectorModal';
import AnatomicIllustration from './AnatomicIllustration';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface GymLogTabProps {
  currentUserId?: string;
  onStartRestTimer?: () => void;
}

interface ActiveExerciseSet {
  id: string;
  weight: number | '';
  reps: number | '';
  completed: boolean;
}

interface ActiveWorkoutExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: ActiveExerciseSet[];
}

export default function GymLogTab({ currentUserId, onStartRestTimer }: GymLogTabProps) {
  const [activeExercises, setActiveExercises] = useState<ActiveWorkoutExercise[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('Séance Musculation Full Body');
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fitpulse_active_gym_workout');
      if (saved) {
        const parsed = JSON.parse(saved);
        setActiveExercises(parsed.exercises || []);
        if (parsed.title) setWorkoutTitle(parsed.title);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('fitpulse_active_gym_workout', JSON.stringify({
        title: workoutTitle,
        exercises: activeExercises
      }));
    } catch (_) {}
  }, [activeExercises, workoutTitle]);

  const handleSelectExerciseFromCatalog = (exercise: ExerciseItem) => {
    const newExercise: ActiveWorkoutExercise = {
      id: `${exercise.id}_${Date.now()}`,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      sets: [
        { id: `set_${Date.now()}_1`, weight: '', reps: '', completed: false }
      ]
    };
    setActiveExercises(prev => [...prev, newExercise]);
  };

  const handleAddSet = (exerciseId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets,
          {
            id: `set_${Date.now()}_${ex.sets.length + 1}`,
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false
          }
        ]
      };
    }));
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number | '') => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const handleToggleCompleteSet = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          const nextState = !s.completed;
          if (nextState && onStartRestTimer) {
            onStartRestTimer();
          }
          return { ...s, completed: nextState };
        })
      };
    }));
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setActiveExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const handleFinishWorkout = async () => {
    if (!currentUserId || activeExercises.length === 0) {
      alert("Ajoute au moins un exercice avant de valider ta séance !");
      return;
    }

    setSaving(true);
    try {
      for (const ex of activeExercises) {
        for (const set of ex.sets) {
          if (set.weight !== '' && set.reps !== '') {
            await supabase.from('gym_logs').insert([{
              user_id: currentUserId,
              muscle_group: ex.targetMuscle,
              exercise_name: ex.name,
              weight: Number(set.weight),
              reps: Number(set.reps),
              sets: 1,
              date: new Date().toISOString().split('T')[0]
            }]);
          }
        }
      }

      const summaryText = activeExercises.map(e => `${e.name} (${e.sets.length} séries)`).join(', ');
      
      const { error } = await supabase.from('posts').insert([{
        user_id: currentUserId,
        username: 'Athlète',
        club_name: 'Tournai (Quais de l’Escaut & Parc)',
        session_type: workoutTitle,
        caption: `💪 [CARNET MUSCU] ${workoutTitle} : ${summaryText}`,
        exercises: activeExercises,
        likes_count: 0,
        liked_by: [],
        comments_count: 0,
        comments: [],
        is_private: false
      }]);

      if (!error) {
        alert("Séance enregistrée et publiée sur le fil avec succès ! 🚀");
        localStorage.removeItem('fitpulse_active_gym_workout');
        setActiveExercises([]);
        fetchGymLogs();
      } else {
        alert("Erreur lors de l'enregistrement : " + error.message);
      }
    } catch (err: any) {
      alert("Erreur technique : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    await supabase.from('gym_logs').delete().eq('id', id);
    fetchGymLogs();
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <ExerciseSelectorModal 
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSelectExercise={handleSelectExerciseFromCatalog}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-sm uppercase tracking-wider">
          <Dumbbell className="w-5 h-5" /> Carnet de Musculation & PRs
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-black uppercase tracking-widest text-neutral-400">Titre de la Séance :</label>
          <input 
            type="text" 
            value={workoutTitle} 
            onChange={(e) => setWorkoutTitle(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-base font-black text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="space-y-3">
          {activeExercises.length === 0 ? (
            <div className="text-center py-10 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-neutral-400 text-sm space-y-2">
              <p>Aucun exercice dans cette séance pour le moment.</p>
              <p className="text-neutral-300">Clique sur le bouton ci-dessous pour piocher dans la bibliothèque.</p>
            </div>
          ) : (
            activeExercises.map((exercise) => (
              <div key={exercise.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">{exercise.name}</h4>
                    <span className="text-xs text-orange-400 font-semibold">{exercise.targetMuscle}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="text-neutral-400 hover:text-red-400 p-1.5 transition cursor-pointer"
                    title="Supprimer l'exercice"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Illustration anatomique agrandie */}
                <AnatomicIllustration muscleGroup={exercise.targetMuscle} className="w-full h-32" />

                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-400 uppercase px-1">
                    <span className="col-span-2 text-center">Série</span>
                    <span className="col-span-4 text-center">Kg</span>
                    <span className="col-span-4 text-center">Reps</span>
                    <span className="col-span-2 text-center">Valider</span>
                  </div>

                  {exercise.sets.map((set, setIdx) => (
                    <div key={set.id} className="grid grid-cols-12 gap-2 items-center bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                      <span className="col-span-2 text-center text-sm font-bold text-neutral-300">
                        {setIdx + 1}
                      </span>
                      <div className="col-span-4">
                        <input 
                          type="number" 
                          step="0.5"
                          placeholder="0"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 text-center text-sm text-white font-bold focus:border-orange-500"
                        />
                      </div>
                      <div className="col-span-4">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 text-center text-sm text-white font-bold focus:border-orange-500"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => handleToggleCompleteSet(exercise.id, set.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            set.completed ? 'bg-emerald-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-1">
                  <button 
                    type="button"
                    onClick={() => addSetToExercise(exercise.id)}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer flex items-center gap-1 py-1"
                  >
                    + Ajouter une série
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          type="button"
          onClick={() => setIsExerciseModalOpen(true)}
          className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500/50 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow transition"
        >
          <Plus className="w-5 h-5 text-orange-500" /> Ajouter un exercice (Bibliothèque)
        </button>

        {activeExercises.length > 0 && (
          <button 
            type="button"
            onClick={handleFinishWorkout}
            disabled={saving}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-sm shadow-xl transition cursor-pointer"
          >
            {saving ? "Enregistrement..." : "Terminer et Publier la séance 🚀"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Dernières perfs enregistrées :</h4>
        {recentLogs.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-4 bg-neutral-950 rounded-2xl border border-neutral-800">Aucun historique de musculation pour le moment.</p>
        ) : (
          recentLogs.map((log) => (
            <div key={log.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs text-orange-400 font-bold block">{log.muscle_group}</span>
                <span className="text-sm font-black text-white">{log.exercise_name}</span>
                <p className="text-xs text-neutral-300 pt-1">
                  <strong className="text-white">{log.weight} kg</strong> • {log.reps} reps • {log.sets} séries
                </p>
              </div>
              <button 
                onClick={() => handleDeleteLog(log.id)}
                className="p-2.5 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function addSetToExercise(exerciseId: string) {
  // Fonction utilitaire interne si besoin
}
interface GymLogTabProps {
  currentUserId?: string;
  onStartRestTimer?: () => void;
}

interface ActiveExerciseSet {
  id: string;
  weight: number | '';
  reps: number | '';
  completed: boolean;
}

interface ActiveWorkoutExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: ActiveExerciseSet[];
}

export default function GymLogTab({ currentUserId, onStartRestTimer }: GymLogTabProps) {
  const [activeExercises, setActiveExercises] = useState<ActiveWorkoutExercise[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('Séance Musculation Full Body');
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fitpulse_active_gym_workout');
      if (saved) {
        const parsed = JSON.parse(saved);
        setActiveExercises(parsed.exercises || []);
        if (parsed.title) setWorkoutTitle(parsed.title);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('fitpulse_active_gym_workout', JSON.stringify({
        title: workoutTitle,
        exercises: activeExercises
      }));
    } catch (_) {}
  }, [activeExercises, workoutTitle]);

  const handleSelectExerciseFromCatalog = (exercise: ExerciseItem) => {
    const newExercise: ActiveWorkoutExercise = {
      id: `${exercise.id}_${Date.now()}`,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      sets: [
        { id: `set_${Date.now()}_1`, weight: '', reps: '', completed: false }
      ]
    };
    setActiveExercises(prev => [...prev, newExercise]);
  };

  const handleAddSet = (exerciseId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets,
          {
            id: `set_${Date.now()}_${ex.sets.length + 1}`,
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false
          }
        ]
      };
    }));
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number | '') => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const handleToggleCompleteSet = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          const nextState = !s.completed;
          if (nextState && onStartRestTimer) {
            onStartRestTimer();
          }
          return { ...s, completed: nextState };
        })
      };
    }));
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setActiveExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const handleFinishWorkout = async () => {
    if (!currentUserId || activeExercises.length === 0) {
      alert("Ajoute au moins un exercice avant de valider ta séance !");
      return;
    }

    setSaving(true);
    try {
      for (const ex of activeExercises) {
        for (const set of ex.sets) {
          if (set.weight !== '' && set.reps !== '') {
            await supabase.from('gym_logs').insert([{
              user_id: currentUserId,
              muscle_group: ex.targetMuscle,
              exercise_name: ex.name,
              weight: Number(set.weight),
              reps: Number(set.reps),
              sets: 1,
              date: new Date().toISOString().split('T')[0]
            }]);
          }
        }
      }

      const summaryText = activeExercises.map(e => `${e.name} (${e.sets.length} séries)`).join(', ');
      
      const { error } = await supabase.from('posts').insert([{
        user_id: currentUserId,
        username: 'Athlète',
        club_name: 'Tournai (Quais de l’Escaut & Parc)',
        session_type: workoutTitle,
        caption: `💪 [CARNET MUSCU] ${workoutTitle} : ${summaryText}`,
        exercises: activeExercises,
        likes_count: 0,
        liked_by: [],
        comments_count: 0,
        comments: [],
        is_private: false
      }]);

      if (!error) {
        alert("Séance enregistrée et publiée sur le fil avec succès ! 🚀");
        localStorage.removeItem('fitpulse_active_gym_workout');
        setActiveExercises([]);
        fetchGymLogs();
      } else {
        alert("Erreur lors de l'enregistrement : " + error.message);
      }
    } catch (err: any) {
      alert("Erreur technique : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    await supabase.from('gym_logs').delete().eq('id', id);
    fetchGymLogs();
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <ExerciseSelectorModal 
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSelectExercise={handleSelectExerciseFromCatalog}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
          <Dumbbell className="w-4 h-4" /> Carnet de Musculation & PRs (Style Lyfta)
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">Titre de la Séance :</label>
          <input 
            type="text" 
            value={workoutTitle} 
            onChange={(e) => setWorkoutTitle(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-black text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="space-y-3">
          {activeExercises.length === 0 ? (
            <div className="text-center py-10 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-neutral-500 text-xs space-y-2">
              <p>Aucun exercice dans cette séance pour le moment.</p>
              <p className="text-neutral-400">Clique sur le bouton ci-dessous pour piocher dans la bibliothèque.</p>
            </div>
          ) : (
            activeExercises.map((exercise) => (
              <div key={exercise.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white">{exercise.name}</h4>
                    <span className="text-[10px] text-orange-400 font-semibold">{exercise.targetMuscle}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="text-neutral-500 hover:text-red-400 p-1 transition cursor-pointer"
                    title="Supprimer l'exercice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Illustration Anatomique Vectorielle 3D intégrée dynamiquement */}
                <AnatomicIllustration muscleGroup={exercise.targetMuscle} className="w-full h-28" />

                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-neutral-500 uppercase px-1">
                    <span className="col-span-2 text-center">Série</span>
                    <span className="col-span-4 text-center">Kg</span>
                    <span className="col-span-4 text-center">Reps</span>
                    <span className="col-span-2 text-center">Valider</span>
                  </div>

                  {exercise.sets.map((set, setIdx) => (
                    <div key={set.id} className="grid grid-cols-12 gap-2 items-center bg-neutral-950 p-1.5 rounded-lg border border-neutral-800/80">
                      <span className="col-span-2 text-center text-xs font-bold text-neutral-400">
                        {setIdx + 1}
                      </span>
                      <div className="col-span-4">
                        <input 
                          type="number" 
                          step="0.5"
                          placeholder="0"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-md py-1 text-center text-xs text-white font-bold focus:border-orange-500"
                        />
                      </div>
                      <div className="col-span-4">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-md py-1 text-center text-xs text-white font-bold focus:border-orange-500"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => handleToggleCompleteSet(exercise.id, set.id)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer ${
                            set.completed ? 'bg-emerald-600 text-white shadow' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-1">
                  <button 
                    type="button"
                    onClick={() => handleAddSet(exercise.id)}
                    className="text-[11px] font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer flex items-center gap-1"
                  >
                    + Ajouter une série
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          type="button"
          onClick={() => setIsExerciseModalOpen(true)}
          className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500/50 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow transition"
        >
          <Plus className="w-4 h-4 text-orange-500" /> Ajouter un exercice (Bibliothèque Lyfta)
        </button>

        {activeExercises.length > 0 && (
          <button 
            type="button"
            onClick={handleFinishWorkout}
            disabled={saving}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-xs shadow-xl transition cursor-pointer"
          >
            {saving ? "Enregistrement..." : "Terminer et Publier la séance 🚀"}
          </button>
        )}
      </div>

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
