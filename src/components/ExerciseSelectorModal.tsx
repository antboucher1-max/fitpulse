import { useState } from 'react';
import { Search, X, Dumbbell } from 'lucide-react';

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'Musculation' | 'CrossFit' | 'Isolation' | 'Haltérophilie';
  targetMuscle: 'Pectoraux' | 'Dos' | 'Jambes' | 'Épaules' | 'Bras' | 'Abdos' | 'Full Body';
  equipment: 'Barre' | 'Haltères' | 'Poids de corps' | 'Machine' | 'Poulie' | 'Kettlebell';
  instructions: string;
}

const EXERCISE_DATABASE: ExerciseItem[] = [
  // PECTORAUX
  { id: 'bench_press', name: 'Développé couché (Bench Press)', category: 'Musculation', targetMuscle: 'Pectoraux', equipment: 'Barre', instructions: 'Allongé sur le banc, prise légèrement supérieure à la largeur des épaules. Descendre la barre au sternum en contrôlant.' },
  { id: 'incline_dumbbell_press', name: 'Développé incliné aux haltères', category: 'Musculation', targetMuscle: 'Pectoraux', equipment: 'Haltères', instructions: 'Banc incliné à 30-45 degrés. Pousser les haltères vers le haut en contractant les pectoraux en haut.' },
  { id: 'dips', name: 'Dips aux barres parallèles', category: 'Musculation', targetMuscle: 'Pectoraux', equipment: 'Poids de corps', instructions: 'Incliner légèrement le torse vers l’avant pour cibler les pectoraux. Descendre jusqu’à un angle de 90 degrés aux coudes.' },
  { id: 'cable_flyes', name: 'Ecartés à la poulie vis-à-vis', category: 'Isolation', targetMuscle: 'Pectoraux', equipment: 'Poulie', instructions: 'Mouvement de câlin, garder une légère flexion des coudes pour protéger les articulations.' },

  // DOS
  { id: 'deadlift', name: 'Soulevé de terre (Deadlift)', category: 'Haltérophilie', targetMuscle: 'Dos', equipment: 'Barre', instructions: 'Garder le dos droit, la barre proche des tibias, pousser à travers les talons pour redresser les hanches.' },
  { id: 'pull_ups', name: 'Tractions (Pull-ups)', category: 'Musculation', targetMuscle: 'Dos', equipment: 'Poids de corps', instructions: 'Prise pronation, tirer la poitrine vers la barre en engageant les dorsaux.' },
  { id: 'barbell_row', name: 'Rowing barre penché (Barbell Row)', category: 'Musculation', targetMuscle: 'Dos', equipment: 'Barre', instructions: 'Buste penché à 45 degrés, tirer la barre vers le nombril en serrant les omoplates.' },
  { id: 'lat_pulldown', name: 'Tirage vertical poulie haute', category: 'Musculation', targetMuscle: 'Dos', equipment: 'Poulie', instructions: 'Saisir la barre en pronation large, tirer vers le haut de la poitrine.' },

  // JAMBES
  { id: 'back_squat', name: 'Squat barre nuque (Back Squat)', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Barre', instructions: 'Barre posée sur les trapèzes, descendre les fesses en arrière en gardant les genoux alignés avec les pointes de pieds.' },
  { id: 'romanian_deadlift', name: 'Soulevé de terre roumain (RDL)', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Barre', instructions: 'Jambes légèrement fléchies, pousser les fesses vers l’arrière pour étirer les ischio-jambiers.' },
  { id: 'leg_press', name: 'Presse à cuisses 45°', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Machine', instructions: 'Pieds largeur d’épaules sur la plateforme, descendre de manière contrôlée sans décoller le bas du dos.' },
  { id: 'bulgarian_split_squat', name: 'Squats bulgares aux haltères', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Haltères', instructions: 'Un pied posé sur un banc à l’arrière, descendre verticalement sur la jambe avant.' },

  // ÉPAULES & BRAS
  { id: 'overhead_press', name: 'Développé militaire (OHP)', category: 'Musculation', targetMuscle: 'Épaules', equipment: 'Barre', instructions: 'Debout, pousser la barre au-dessus de la tête en verrouillant les coudes en haut.' },
  { id: 'lateral_raises', name: 'Élévations latérales aux haltères', category: 'Isolation', targetMuscle: 'Épaules', equipment: 'Haltères', instructions: 'Monter les haltères sur les côtés jusqu’à hauteur des épaules, bras légèrement fléchis.' },
  { id: 'barbell_curl', name: 'Curl barre biceps', category: 'Isolation', targetMuscle: 'Bras', equipment: 'Barre', instructions: 'Garder les coudes fixes le long du corps, fléchir les avant-bras en contractant les biceps.' },
  { id: 'triceps_pushdown', name: 'Extension triceps à la poulie', category: 'Isolation', targetMuscle: 'Bras', equipment: 'Poulie', instructions: 'Pousser la corde ou la barre vers le bas en gardant les coudes serrés contre les côtes.' },

  // CROSSFIT & FONCTIONNEL
  { id: 'clean_and_jerk', name: 'Épaulé-jeté (Clean & Jerk)', category: 'CrossFit', targetMuscle: 'Full Body', equipment: 'Barre', instructions: 'Mouvement olympique explosif : amener la barre aux épaules (clean) puis la propulser au-dessus de la tête (jerk).' },
  { id: 'snatch', name: 'Arraché (Snatch)', category: 'CrossFit', targetMuscle: 'Full Body', equipment: 'Barre', instructions: 'Amener la barre du sol au-dessus de la tête en un seul mouvement fluide et rapide.' },
  { id: 'burpees', name: 'Burpees over bar', category: 'CrossFit', targetMuscle: 'Full Body', equipment: 'Poids de corps', instructions: 'Se jeter au sol, poitrine au tapis, se relever et sauter par-dessus l’obstacle.' },
  { id: 'kettlebell_swing', name: 'Kettlebell Swing', category: 'CrossFit', targetMuscle: 'Full Body', equipment: 'Kettlebell', instructions: 'Impulsion explosive du bassin pour projeter le kettlebell à hauteur d’yeux.' }
];

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseItem) => void;
}

const MUSCLE_FILTERS = ['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Full Body'];

export default function ExerciseSelectorModal({ isOpen, onClose, onSelectExercise }: ExerciseSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Tous');

  if (!isOpen) return null;

  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Tous' || ex.targetMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
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
