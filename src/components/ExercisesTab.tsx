import { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            .map((ex) => {
              const isExpanded = expandedId === ex.id;
              return (
                <div
                  key={ex.id}
                  className="bg-neutral-950 rounded-2xl border border-neutral-800 hover:border-orange-500/50 transition overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedId(isExpanded ? null : ex.id);
                      onSelectExercise(ex);
                    }}
                    className="w-full p-4 flex items-center justify-between cursor-pointer text-left"
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
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-neutral-800/80 pt-3 animate-fadeIn">
                      {ex.execution && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Comment faire
                          </span>
                          <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                            {ex.execution}
                          </p>
                        </div>
                      )}

                      {ex.commonMistakes && ex.commonMistakes.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> À éviter
                          </span>
                          <ul className="space-y-1.5">
                            {ex.commonMistakes.map((mistake, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-neutral-300 leading-relaxed bg-red-950/10 border border-red-500/20 p-2.5 rounded-xl flex items-start gap-2"
                              >
                                <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                                <span>{mistake}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ex.tips && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block mb-1">💡 Conseil</span>
                          <p className="text-xs text-neutral-300 leading-relaxed">{ex.tips}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
