import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { ExerciseGuide } from '../types';
import MuscleMap from './MuscleMap';

interface ExercisesTabProps {
  exercises?: ExerciseGuide[];
  exerciseSearch?: string;
  setExerciseSearch?: (val: string) => void;
  selectedCategoryFilter?: string;
  setSelectedCategoryFilter?: (cat: string) => void;
  onSelectExercise?: (ex: ExerciseGuide) => void;
}

// Les catégories de ce guide (Pectoraux/Dos/Jambes/Épaules/Bras/Core) ne sont
// pas exactement celles utilisées par MuscleMap (Jambes/Fessiers/Dos-Biceps/
// Pecs-Triceps/Bras/Épaules-Abdos/Mobilité Hybride), donc on fait une petite
// correspondance plutôt que de dupliquer le composant ou sa logique.
const CATEGORY_TO_MUSCLE_MAP: Record<string, string> = {
  'Pectoraux': 'Pecs/Triceps',
  'Dos': 'Dos/Biceps',
  'Jambes': 'Jambes',
  'Épaules': 'Épaules/Abdos',
  'Bras': 'Bras',
  'Core': 'Mobilité Hybride',
};

export default function ExercisesTab({ 
  exercises = [], 
  exerciseSearch: propSearch, 
  setExerciseSearch: propSetSearch, 
  selectedCategoryFilter: propCategory, 
  setSelectedCategoryFilter: propSetCategory, 
  onSelectExercise = () => {} 
}: ExercisesTabProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('Tous');

  const exerciseSearch = propSearch !== undefined ? propSearch : localSearch;
  const setExerciseSearch = propSetSearch || setLocalSearch;
  const selectedCategoryFilter = propCategory !== undefined ? propCategory : localCategory;
  const setSelectedCategoryFilter = propSetCategory || setLocalCategory;

  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-500" /> Guide des Exercices
        </h2>
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-orange-500" />
          <input 
            type="text" 
            placeholder="Rechercher un exercice..." 
            value={exerciseSearch} 
            onChange={(e) => setExerciseSearch(e.target.value)} 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-orange-500" 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Core'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategoryFilter(cat)} 
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedCategoryFilter === cat ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="space-y-3 pt-1">
          {exercises
            .filter((ex) => (selectedCategoryFilter === 'Tous' || ex.category === selectedCategoryFilter) && (ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || (ex.targetMuscles && ex.targetMuscles.toLowerCase().includes(exerciseSearch.toLowerCase()))))
            .map((ex) => (
              <div 
                key={ex.id} 
                onClick={() => onSelectExercise(ex)} 
                className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 hover:border-orange-500/50 cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex items-center gap-4">
                  <MuscleMap category={CATEGORY_TO_MUSCLE_MAP[ex.category] || ex.category} size="sm" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{ex.name}</span>
                      <span className="text-xs bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded-md border border-orange-500/20">{ex.category}</span>
                    </div>
                    {ex.targetMuscles && <p className="text-xs text-neutral-400">🎯 {ex.targetMuscles}</p>}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
