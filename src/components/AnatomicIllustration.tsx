import { Target, Dumbbell } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  exerciseName?: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, exerciseName = '', className = "w-full h-36" }: AnatomicIllustrationProps) {
  const getAnatomicImageUrl = () => {
    const name = (exerciseName || '').toLowerCase().trim();
    const muscle = (muscleGroup || '').toLowerCase().trim();

    if (name.includes('couché') || name.includes('bench')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press/0.jpg';
    }
    if (name.includes('incliné')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press/0.jpg';
    }
    if (name.includes('squat')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg';
    }
    if (name.includes('soulevé') || name.includes('deadlift')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg';
    }
    if (name.includes('curl') || name.includes('biceps')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Biceps_Curl/0.jpg';
    }
    if (name.includes('traction') || name.includes('pull-up')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull-up/0.jpg';
    }
    if (name.includes('élévation') || name.includes('latérale') || name.includes('épaule')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lateral_Raise/0.jpg';
    }
    if (muscle.includes('dos') || name.includes('rowing')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Row/0.jpg';
    }
    if (muscle.includes('jambe') || muscle.includes('quadriceps')) {
      return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg';
    }

    // Image de repli sécurisée (Pushup)
    return 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushup/0.jpg';
  };

  return (
    <div className={`relative bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-2 overflow-hidden shadow-xl ${className}`}>
      {/* Conteneur image avec fond blanc cassé pour contraster avec le fond sombre de l'app */}
      <div className="w-full h-32 flex items-center justify-center relative rounded-xl overflow-hidden bg-white/5 border border-neutral-800 p-1">
        <img 
          src={getAnatomicImageUrl()} 
          alt={exerciseName || muscleGroup} 
          className="w-full h-full object-contain filter contrast-125 brightness-95 hover:scale-105 transition duration-300"
          onError={(e) => {
            // Si le lien externe échoue, on masque l'image pour éviter le carré cassé
            (e.currentTarget as HTMLElement).style.display = 'none';
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
