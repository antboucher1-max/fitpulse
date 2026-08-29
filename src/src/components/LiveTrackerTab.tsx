import React from 'react';
import { Activity, Plus, Check, CheckCircle } from 'lucide-react';
import { LiveWorkoutExercise, ExerciseGuide } from '../types';

interface LiveTrackerTabProps {
  liveWorkoutName: string;
  setLiveWorkoutName: (name: string) => void;
  liveElapsedSeconds: number;
  liveExercises: LiveWorkoutExercise[];
  selectedExToAdd: string;
  setSelectedExToAdd: (name: string) => void;
  exercisesDatabase: ExerciseGuide[];
  onAddExercise: () => void;
  onAddSet: (exId: string) => void;
  onToggleSet: (exId: string, setIndex: number) => void;
  onUpdateWeight: (exId: string, sIdx: number, val: number) => void;
  onUpdateReps: (exId: string, sIdx: number, val: number) => void;
  onFinishWorkout: () => void;
  onQuitLive: () => void;
}

export default function LiveTrackerTab({
  liveWorkoutName,
  setLiveWorkoutName,
  liveElapsedSeconds,
  liveExercises,
  selectedExToAdd,
  setSelectedExToAdd,
  exercisesDatabase,
  onAddExercise,
  onAddSet,
  onToggleSet,
  onUpdateWeight,
  onUpdateReps,
  onFinishWorkout,
  onQuitLive
}: LiveTrackerTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500 animate-pulse" /> Tracker en Direct
            </h2>
            <span className="text-xs text-orange-400 font-mono font-bold">
              ⏱️ {Math.floor(liveElapsedSeconds / 60)}:{(liveElapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <button onClick={onQuitLive} className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition">
            Quitter le Live
          </button>
        </div>

        <input 
          type="text" 
          value={liveWorkoutName} 
          onChange={(e) => setLiveWorkoutName(e.target.value)} 
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-orange-500" 
          placeholder="Nom de la séance..."
        />

        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">Ajouter un exercice :</span>
          <div className="flex gap-2">
            <select 
              value={selectedExToAdd} 
              onChange={(e) => setSelectedExToAdd(e.target.value)} 
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white"
            >
              {exercisesDatabase.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
            </select>
            <button onClick={onAddExercise} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {liveExercises.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">Aucun exercice dans cette séance en direct. Ajoute-en un ci-dessus !</div>
          ) : (
            liveExercises.map((ex) => (
              <div key={ex.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{ex.name}</span>
                  <button onClick={() => onAddSet(ex.id)} className="text-xs text-orange-400 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Série
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-neutral-500 uppercase px-1">
                    <span className="col-span-2 text-center">Série</span>
                    <span className="col-span-4 text-center">Poids (kg)</span>
                    <span className="col-span-4 text-center">Reps</span>
                    <span className="col-span-2 text-center">Valider</span>
                  </div>
                  {ex.sets.map((set, sIdx) => (
                    <div key={sIdx} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border ${set.completed ? 'bg-green-950/20 border-green-500/40' : 'bg-neutral-900 border-neutral-800'}`}>
                      <span className="col-span-2 text-center font-bold text-xs text-neutral-300">#{set.setNumber}</span>
                      <div className="col-span-4">
                        <input 
                          type="number" 
                          value={set.weight} 
                          onChange={(e) => onUpdateWeight(ex.id, sIdx, Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 text-center text-xs text-white" 
                        />
                      </div>
                      <div className="col-span-4">
                        <input 
                          type="number" 
                          value={set.reps} 
                          onChange={(e) => onUpdateReps(ex.id, sIdx, Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 text-center text-xs text-white" 
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <button 
                          onClick={() => onToggleSet(ex.id, sIdx)} 
                          className={`p-2 rounded-xl transition ${set.completed ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {liveExercises.length > 0 && (
          <button onClick={onFinishWorkout} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-sm mt-4">
            <CheckCircle className="w-5 h-5" /> Terminer & Publier ma séance
          </button>
        )}
      </div>
    </div>
  );
}
