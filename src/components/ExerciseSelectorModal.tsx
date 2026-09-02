import { useState } from 'react';
import { Search, X, Dumbbell, Info } from 'lucide-react';

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'Musculation' | 'CrossFit' | 'Isolation' | 'Haltérophilie';
  targetMuscle: 'Pectoraux' | 'Dos' | 'Jambes' | 'Épaules' | 'Bras' | 'Abdos' | 'Full Body';
  equipment: 'Barre' | 'Haltères' | 'Poids de corps' | 'Machine' | 'Poulie' | 'Kettlebell';
  instructions: string;
  imageUrl: string; // <-- NOUVEAU CHAMP VISUEL
}

const EXERCISE_DATABASE: ExerciseItem[] = [
  // PECTORAUX
  { id: 'bench_press', name: 'Développé couché (Bench Press)', category: 'Musculation', targetMuscle: 'Pectoraux', equipment: 'Barre', instructions: 'Allongé sur le banc, prise légèrement supérieure à la largeur des épaules. Descendre la barre au sternum en contrôlant.', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&q=80&fit=crop' },
  { id: 'incline_dumbbell_press', name: 'Développé incliné aux haltères', category: 'Musculation', targetMuscle: 'Pectoraux', equipment: 'Haltères', instructions: 'Banc incliné à 30-45 degrés. Pousser les haltères vers le haut en contractant les pectoraux en haut.', imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&q=80&fit=crop' },
  { id: 'dips', name: 'Dips aux barres parallèles', category: 'Musculation', targetMuscle: 'Pectoraux', equipment: 'Poids de corps', instructions: 'Incliner légèrement le torse vers l’avant pour cibler les pectoraux. Descendre jusqu’à un angle de 90 degrés aux coudes.', imageUrl: 'https://images.unsplash.com/photo-1599058917212-97d142f46bce?w=150&q=80&fit=crop' },
  { id: 'cable_flyes', name: 'Ecartés à la poulie vis-à-vis', category: 'Isolation', targetMuscle: 'Pectoraux', equipment: 'Poulie', instructions: 'Mouvement de câlin, garder une légère flexion des coudes pour protéger les articulations.', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80&fit=crop' },

  // DOS
  { id: 'deadlift', name: 'Soulevé de terre (Deadlift)', category: 'Haltérophilie', targetMuscle: 'Dos', equipment: 'Barre', instructions: 'Garder le dos droit, la barre proche des tibias, pousser à travers les talons pour redresser les hanches.', imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=150&q=80&fit=crop' },
  { id: 'pull_ups', name: 'Tractions (Pull-ups)', category: 'Musculation', targetMuscle: 'Dos', equipment: 'Poids de corps', instructions: 'Prise pronation, tirer la poitrine vers la barre en engageant les dorsaux.', imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=150&q=80&fit=crop' },
  { id: 'barbell_row', name: 'Rowing barre penché', category: 'Musculation', targetMuscle: 'Dos', equipment: 'Barre', instructions: 'Buste penché à 45 degrés, tirer la barre vers le nombril en serrant les omoplates.', imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150&q=80&fit=crop' },
  { id: 'lat_pulldown', name: 'Tirage vertical poulie haute', category: 'Musculation', targetMuscle: 'Dos', equipment: 'Poulie', instructions: 'Saisir la barre en pronation large, tirer vers le haut de la poitrine.', imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=150&q=80&fit=crop' },

  // JAMBES
  { id: 'back_squat', name: 'Squat barre nuque (Back Squat)', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Barre', instructions: 'Barre posée sur les trapèzes, descendre les fesses en arrière en gardant les genoux alignés avec les pointes de pieds.', imageUrl: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&q=80&fit=crop' },
  { id: 'romanian_deadlift', name: 'Soulevé de terre roumain (RDL)', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Barre', instructions: 'Jambes légèrement fléchies, pousser les fesses vers l’arrière pour étirer les ischio-jambiers.', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80&fit=crop' },
  { id: 'leg_press', name: 'Presse à cuisses 45°', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Machine', instructions: 'Pieds largeur d’épaules sur la plateforme, descendre de manière contrôlée sans décoller le bas du dos.', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&q=80&fit=crop' },
  { id: 'bulgarian_split_squat', name: 'Squats bulgares', category: 'Musculation', targetMuscle: 'Jambes', equipment: 'Haltères', instructions: 'Un pied posé sur un banc à l’arrière, descendre verticalement sur la jambe avant.', imageUrl: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=150&q=80&fit=crop' },

  // ÉPAULES & BRAS
  { id: 'overhead_press', name: 'Développé militaire (OHP)', category: 'Musculation', targetMuscle: 'Épaules', equipment: 'Barre', instructions: 'Debout, pousser la barre au-dessus de la tête en verrouillant les coudes en haut.', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80&fit=crop' },
  { id: 'lateral_raises', name: 'Élévations latérales', category: 'Isolation', targetMuscle: 'Épaules', equipment: 'Haltères', instructions: 'Monter les haltères sur les côtés jusqu’à hauteur des épaules, bras légèrement fléchis.', imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&q=80&fit=crop' },
  { id: 'barbell_curl', name: 'Curl barre biceps', category: 'Isolation', targetMuscle: 'Bras', equipment: 'Barre', instructions: 'Garder les coudes fixes le long du corps, fléchir les avant-bras en contractant les biceps.', imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&q=80&fit=crop' },
  { id: 'triceps_pushdown', name: 'Extension triceps poulie', category: 'Isolation', targetMuscle: 'Bras', equipment: 'Poulie', instructions: 'Pousser la corde ou la barre vers le bas en gardant les coudes serrés.', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80&fit=crop' },

  // CROSSFIT
  { id: 'clean_and_jerk', name: 'Épaulé-jeté (Clean & Jerk)', category: 'CrossFit', targetMuscle: 'Full Body', equipment: 'Barre', instructions: 'Mouvement olympique : amener la barre aux épaules puis la propulser au-dessus de la tête.', imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=150&q=80&fit=crop' },
  { id: 'kettlebell_swing', name: 'Kettlebell Swing', category: 'CrossFit', targetMuscle: 'Full Body', equipment: 'Kettlebell', instructions: 'Impulsion explosive du bassin pour projeter le kettlebell à hauteur d’yeux.', imageUrl: 'https://images.unsplash.com/photo-1519500528796-11f51b65af1e?w=150&q=80&fit=crop' }
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
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp relative">
        
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-shrink-0 bg-neutral-900/90 backdrop-blur-md z-10">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-500" /> Bibliothèque d'exercices
          </h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-xl cursor-pointer transition bg-neutral-800 hover:bg-neutral-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 flex-shrink-0 bg-neutral-950/50 border-b border-neutral-800 z-10">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Rechercher (ex: Squat, Dos)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MUSCLE_FILTERS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedMuscle === m 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-neutral-950">
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
                className="group bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500/50 p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all shadow-sm"
              >
                {/* VISUEL DE L'EXERCICE */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700 relative">
                  <img 
                    src={exercise.imageUrl} 
                    alt={exercise.name} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* INFOS */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-xs font-black text-white truncate">{exercise.name}</h4>
                  
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {exercise.targetMuscle}
                    </span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                      {exercise.equipment}
                    </span>
                  </div>
                </div>

                {/* BOUTON AJOUTER */}
                <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 group-hover:border-orange-500/50 group-hover:bg-orange-500/10 text-neutral-400 group-hover:text-orange-400 flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all">
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
