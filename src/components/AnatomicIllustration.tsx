import { Target } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  exerciseName?: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, exerciseName = '', className = "w-full h-36" }: AnatomicIllustrationProps) {
  // Convertit le nom de l'exercice au format de la base de données open-source (ex: "Bench Press" -> "Barbell_Bench_Press")
  const getAnatomicImageUrl = () => {
    const query = exerciseName.toLowerCase().trim();

    // Quelques correspondances directes avec la base open-source gratuite
    if (query.includes('couché') || query.includes('bench')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press/0.jpg';
    }
    if (query.includes('incliné')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press/0.jpg';
    }
    if (query.includes('squat')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg';
    }
    if (query.includes('soulevé') || query.includes('deadlift')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg';
    }
    if (query.includes('curl') || query.includes('biceps')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Biceps_Curl/0.jpg';
    }
    if (query.includes('traction') || query.includes('pull-up')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull-up/0.jpg';
    }
    if (query.includes('développé militaire') || query.includes('overhead')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Military_Press/0.jpg';
    }

    // Image anatomique par défaut générique si l'exercice n'a pas de correspondance exacte
    return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushup/0.jpg';
  };

  return (
    <div className={`relative bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-2 overflow-hidden shadow-xl ${className}`}>
      {/* Conteneur de l'image anatomique 3D open-source */}
      <div className="w-full h-28 flex items-center justify-center relative rounded-xl overflow-hidden bg-neutral-900/90 border border-neutral-800/60 p-1">
        <img 
          src={getAnatomicImageUrl()} 
          alt={exerciseName || muscleGroup} 
          className="w-full h-full object-contain filter brightness-95 hover:scale-105 transition duration-300"
          onError={(e) => {
            // Solution de repli si une image ne charge pas
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      <div className="w-full flex items-center justify-between text-xs text-neutral-300 font-bold pt-2 px-1">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-orange-500" /> {muscleGroup}
        </span>
        <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase font-black tracking-wider">
          Anatomy 3D ⚡
        </span>
      </div>
    </div>
  );
}
