import { useState, useEffect, FormEvent } from 'react';
import { Dumbbell, Plus, Trash2, Play, CheckCircle2, ShieldAlert, History } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface GymLogTabProps {
  currentUserId?: string;
  onStartRestTimer?: () => void;
}

interface ExerciseLog {
  id: string;
  exerciseName: string;
  category: 'Jambes' | 'Pecs/Triceps' | 'Dos/Biceps' | 'Épaules/Abdos' | 'Mobilité Hybride' | 'Bras' | 'Fessiers';
  previousBest?: string;
  sets: Array<{ weight: number; reps: number; completed: boolean; status?: 'pending' | 'active' | 'validated' }>;
}

export default function GymLogTab({ currentUserId, onStartRestTimer }: GymLogTabProps) {
  const [activeSessionName, setActiveSessionName] = useState('Full Body Force & Puissance');
  const [exercises, setExercises] = useState([] as ExerciseLog[]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [historicalLogs, setHistoricalLogs] = useState<any[]>([]);

  // Charger l'historique des séances depuis Supabase au montage
  useEffect(() => {
    if (currentUserId) {
      fetchUserGymHistory(currentUserId);
    }
  }, [currentUserId]);

  const fetchUserGymHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('gym_logs')
      .select('*')
      .filter('user_id', 'eq', userId);

    if (!error && data) {
      setHistoricalLogs(data);
    }
  };

  // Chronographe de séance
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleStartWorkout = () => {
    setIsSessionActive(true);
    setSessionTimer(0);
    setExercises([
      {
        id: '1',
        exerciseName: 'Back Squat (Force)',
        category: 'Jambes',
        previousBest: '100kg x 5',
        sets: [
          { weight: 100, reps: 5, completed: true, status: 'validated' },
          { weight: 105, reps: 5, completed: false, status: 'pending' }
        ]
      }
    ]);
  };

  const handleAddPresetExercise = (exerciseName: string, categoryKey: string) => {
    const newExercise: ExerciseLog = {
      id: Date.now().toString(),
      exerciseName: exerciseName,
      category: categoryKey as any,
      previousBest: 'Référence libre 🚀',
      sets: [{ weight: 0, reps: 0, completed: false, status: 'pending' }]
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const handleAddCustomExercise = (e: FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newExercise: ExerciseLog = {
      id: Date.now().toString(),
      exerciseName: newExName.trim(),
      category: newExCategory,
      previousBest: 'Première perf 🚀',
      sets: [{ weight: 0, reps: 0, completed: false, status: 'pending' }]
    };

    setExercises(prev => [...prev, newExercise]);
    setNewExName('');
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { weight: lastSet ? lastSet.weight : 0, reps: lastSet ? lastSet.reps : 0, completed: false, status: 'pending' }]
        };
      }
      return ex;
    }));
  };

  const handleSetAction = (exerciseId: string, setIndex: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        const currentStatus = newSets[setIndex].status || (newSets[setIndex].completed ? 'validated' : 'pending');

        if (currentStatus === 'pending') {
          newSets[setIndex] = { ...newSets[setIndex], status: 'active', completed: false };
        } else if (currentStatus === 'active') {
          newSets[setIndex] = { ...newSets[setIndex], status: 'validated', completed: true };
          if (onStartRestTimer) {
            onStartRestTimer();
          }
        } else {
          newSets[setIndex] = { ...newSets[setIndex], status: 'pending', completed: false };
        }

        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const handleUpdateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex][field] = Math.max(0, value);
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const calculate1RM = (weight: number, reps: number) => {
    if (reps <= 0 || weight <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  let maxHistorical1RM = 0;
  let totalHistoricalSets = 0;

  historicalLogs.forEach(log => {
    totalHistoricalSets += (log.total_sets || 0);
    if (Array.isArray(log.exercises_data)) {
      log.exercises_data.forEach((ex: any) => {
        if (Array.isArray(ex.sets)) {
          ex.sets.forEach((set: any) => {
            const rm = calculate1RM(set.weight, set.reps);
            if (rm > maxHistorical1RM) maxHistorical1RM = rm;
          });
        }
      });
    }
  });

  exercises.forEach(ex => {
    ex.sets.forEach(set => {
      const rm = calculate1RM(set.weight, set.reps);
      if (rm > maxHistorical1RM) maxHistorical1RM = rm;
    });
  });

  const currentSessionSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed || s.status === 'validated').length, 0);
  const totalDisplaySets = totalHistoricalSets + currentSessionSets;

  const handleFinishWorkout = async () => {
    if (!currentUserId) return;
    
    const payload: any = {
      user_id: currentUserId,
      session_name: activeSessionName,
      duration_seconds: sessionTimer,
      total_sets: currentSessionSets,
      exercises_data: exercises,
      date: new Date().toISOString()
    };

    const { error } = await supabase.from('gym_logs').insert([payload]);

    if (!error) {
      alert(`🎉 Séance "${activeSessionName}" enregistrée avec succès ! Volume : ${currentSessionSets} séries validées.`);
      setIsSessionActive(false);
      setExercises([]);
      fetchUserGymHistory(currentUserId);
    } else {
      alert("Erreur lors de l'enregistrement de la séance : " + error.message);
    }
  };

  const muscleGroupsDatabase: Record<string, string[]> = {
    'Jambes': ['Back Squat (Force)', 'Front Squat', 'Presse à cuisses', 'Fentes bulgares', 'Leg Extension', 'Leg Curl ischio', 'Soulevé de Terre Roumain'],
    'Fessiers': ['Hip Thrust (Bassin)', 'Glute Bridge', 'Kickback poulie', 'Fentes marchées'],
    'Dos/Biceps': ['Tractions Lestées', 'Rowing barre', 'Rowing poulie basse', 'Tirage vertical', 'Curl Biceps'],
    'Pecs/Triceps': ['Développé Couché Incliné', 'Développé Couché plat', 'Dips', 'Écartés poulie', 'Extension Triceps'],
    'Bras': ['Curl haltères alternés', 'Curl Marteau', 'Extension corde triceps', 'Dips banc'],
    'Épaules/Abdos': ['Développé Militaire', 'Élévations latérales', 'Gainage Pallof'],
    'Mobilité': ['Mobilité hanche 90/90', 'Étirements chaîne post']
  };

  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('Jambes');
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<'Jambes' | 'Pecs/Triceps' | 'Dos/Biceps' | 'Épaules/Abdos' | 'Mobilité Hybride' | 'Bras' | 'Fessiers'>('Jambes');

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* En-tête / Dashboard de Contrôle */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/40 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Dumbbell className="w-4 h-4" /> Moteur Force & Hypertrophie
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Carnet de Musculation Hybride</h2>
        </div>
        
        {!isSessionActive ? (
          <button
            type="button"
            onClick={handleStartWorkout}
            className="py-3 px-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" /> Démarrer
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-neutral-950 text-emerald-400 px-3 py-1.5 rounded-xl border border-neutral-800 animate-pulse">
              ⏱️ {formatSessionTime(sessionTimer)}
            </span>
            <button
              type="button"
              onClick={handleFinishWorkout}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
            >
              Terminer ✅
            </button>
          </div>
        )}
      </div>

      {!isSessionActive ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">1RM Estimé Max</span>
              <div className="text-xl font-black text-white">{maxHistorical1RM > 0 ? `${maxHistorical1RM} kg` : '-- kg'}</div>
              <span className="text-[10px] text-neutral-500">Formule d'Epley active</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Volume Hebdo</span>
              <div className="text-xl font-black text-orange-400">{totalDisplaySets} <span className="text-xs font-normal text-neutral-400">séries</span></div>
              <span className="text-[10px] text-neutral-500">Objectif : 12-18 sets</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl col-span-2 sm:col-span-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-cyan-400" /> Focus Athlète Hybride
              </span>
              <div className="text-xs text-neutral-300 pt-1 leading-snug">
                Renfo orienté stabilité pelvienne & prévention des tendinites.
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto text-xl">
              🏋️‍♂️
            </div>
            <h3 className="text-sm font-black text-white">Prêt à valider tes perfs ?</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Lance ta séance pour composer ton WOD sur-mesure et suivre ton historique en direct.
            </p>
            <button
              type="button"
              onClick={handleStartWorkout}
              className="py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              Lancer la séance du jour ⚡
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
            <input 
              type="text"
              value={activeSessionName}
              onChange={(e) => setActiveSessionName(e.target.value)}
              className="bg-transparent font-black text-sm text-white focus:outline-none border-b border-transparent focus:border-orange-500 pb-1 w-full"
            />
            <span className="text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/30 flex-shrink-0 ml-2">
              Live Session ⚡
            </span>
          </div>

          {exercises.map((ex) => (
            <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">{ex.category}</span>
                  <h4 className="text-sm font-black text-white">{ex.exerciseName}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setExercises(prev => prev.filter(item => item.id !== ex.id))}
                  className="text-neutral-500 hover:text-red-400 p-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold uppercase text-neutral-500 px-1">
                  <span className="col-span-2 text-center">Série</span>
                  <span className="col-span-3 text-center">Poids (kg)</span>
                  <span className="col-span-3 text-center">Reps</span>
                  <span className="col-span-4 text-center">Action / État</span>
                </div>

                {ex.sets.map((set, setIndex) => {
                  const est1RM = calculate1RM(set.weight, set.reps);
                  const status = set.status || (set.completed ? 'validated' : 'pending');

                  return (
                    <div key={setIndex} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border transition ${status === 'validated' ? 'bg-emerald-950/20 border-emerald-500/30' : status === 'active' ? 'bg-amber-950/20 border-amber-500/40' : 'bg-neutral-950 border-neutral-800'}`}>
                      <div className="col-span-2 text-center text-xs font-bold text-neutral-400">
                        #{setIndex + 1}
                      </div>
                      <div className="col-span-3">
                        <input 
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(ex.id, setIndex, 'weight', Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-1.5 text-center text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="col-span-3">
                        <input 
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(ex.id, setIndex, 'reps', Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-1.5 text-center text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="col-span-4 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetAction(ex.id, setIndex)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            status === 'validated' 
                              ? 'bg-emerald-600 text-white shadow-lg' 
                              : status === 'active'
                              ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse shadow-md'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                          }`}
                        >
                          {status === 'validated' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Validé
                            </>
                          ) : status === 'active' ? (
                            'Valider'
                          ) : (
                            'Commencer'
                          )}
                        </button>
                      </div>

                      {est1RM > 0 && (
                        <div className="col-span-12 text-[10px] text-neutral-500 text-right pr-2">
                          1RM estimé : <strong className="text-orange-400">{est1RM} kg</strong>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleAddSet(ex.id)}
                  className="w-full py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter une série
                </button>
              </div>
            </div>
          ))}

          {/* Sélection rapide par groupe musculaire */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              ⚡ Ajouter un exercice rapide (Sélectionne ton muscle)
            </h4>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.keys(muscleGroupsDatabase).map((muscleGroup) => (
                <button
                  key={muscleGroup}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(muscleGroup)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedMuscleFilter === muscleGroup
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {muscleGroup}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {muscleGroupsDatabase[selectedMuscleFilter]?.map((exName, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPresetExercise(exName, selectedMuscleFilter)}
                  className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-cyan-500/50 rounded-2xl text-left transition cursor-pointer flex items-center justify-between"
                >
                  <span className="text-xs font-black text-white">{exName}</span>
                  <span className="text-[10px] bg-neutral-900 text-cyan-400 px-2 py-1 rounded-lg border border-neutral-800">+ Ajouter</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulaire d'exercice personnalisé libre */}
          <form onSubmit={handleAddCustomExercise} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Exercice personnalisé libre
            </h4>
             
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input 
                type="text"
                placeholder="Nom (ex: Hack Squat)..."
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <select
                value={newExCategory}
                onChange={(e: any) => setNewExCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="Jambes">Jambes</option>
                <option value="Fessiers">Fessiers</option>
                <option value="Pecs/Triceps">Pecs / Triceps</option>
                <option value="Dos/Biceps">Dos / Biceps</option>
                <option value="Bras">Bras</option>
                <option value="Épaules/Abdos">Épaules / Core</option>
                <option value="Mobilité Hybride">Mobilité</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-black rounded-2xl text-xs transition cursor-pointer shadow-inner"
            >
              Ajouter l'exercice libre 🏋️‍♂️
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
