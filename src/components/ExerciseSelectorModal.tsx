import { useState } from 'react';
import { Search, X, Dumbbell } from 'lucide-react';
import { EXERCISE_DATABASE, ExerciseItem } from '../exercisesDatabase';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseItem) => void;
}

const MUSCLE_FILTERS = ['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Full Body'];
const EQUIPMENT_FILTERS = ['Tous', 'Barre', 'Haltères', 'Poids de corps', 'Machine', 'Poulie'];

export default function ExerciseSelectorModal({ isOpen, onClose, onSelectExercise }: ExerciseSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Tous');
  const [selectedEquipment, setSelectedEquipment] = useState('Tous');

  if (!isOpen) return null;

  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Tous' || ex.targetMuscle === selectedMuscle;
    const matchesEq = selectedEquipment === 'Tous' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEq;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-500" /> Choisir un exercice
          </h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 flex-shrink-0 bg-neutral-950/50 border-b border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou muscle..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MUSCLE_FILTERS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedMuscle === m ? 'bg-orange-600 text-white shadow' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs">
              Aucun exercice trouvé.
            </div>
          ) : (
            filteredExercises.map(exercise => (
              <div 
                key={exercise.id}
                onClick={() => {
                  onSelectExercise(exercise);
                  onClose();
                }}
                className="bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/80 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition shadow"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{exercise.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                    <span className="text-orange-400">{exercise.targetMuscle}</span>
                    <span>•</span>
                    <span>{exercise.equipment}</span>
                    <span>•</span>
                    <span className="text-cyan-400">{exercise.category}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs">
                  +
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
