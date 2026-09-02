// src/exercisesDatabase.ts

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'Musculation' | 'CrossFit' | 'Isolation' | 'Haltérophilie';
  targetMuscle: 'Pectoraux' | 'Dos' | 'Jambes' | 'Épaules' | 'Bras' | 'Abdos' | 'Full Body';
  equipment: 'Barre' | 'Haltères' | 'Poids de corps' | 'Machine' | 'Poulie' | 'Kettlebell';
  instructions: string;
}

export const EXERCISE_DATABASE: ExerciseItem[] = [
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
