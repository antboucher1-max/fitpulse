import { Target } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, className = "w-full h-36" }: AnatomicIllustrationProps) {
  const normalize = muscleGroup?.toLowerCase() || '';

  // Style "Lyfta/ExRx" : silhouette anatomique technique grise avec accent rouge/orange sur le muscle cible
  const getAnatomicSketch = () => {
    if (normalize.includes('pectoral') || normalize.includes('chest') || normalize.includes('développé')) {
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">import { Target } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  exerciseName?: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, exerciseName = '', className = "w-full h-36" }: AnatomicIllustrationProps) {
  // Mappage d'exemples d'images d'exercices libres au style anatomique 3D gris/rouge
  const getExerciseImageUrl = () => {
    const name = exerciseName.toLowerCase();
    const muscle = muscleGroup.toLowerCase();

    if (name.includes('développé couché') || name.includes('bench press')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80'; // Remplaçable par un lien d'image anatomique directe
    }
    if (name.includes('élévation') || name.includes('épaule')) {
      return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80';
    }
    
    // Par défaut, une illustration ou un rendu propre basé sur le muscle
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80';
  };

  return (
    <div className={`relative bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-2 overflow-hidden shadow-md ${className}`}>
      {/* Conteneur de l'illustration anatomique */}
      <div className="w-full h-24 flex items-center justify-center relative rounded-xl overflow-hidden bg-neutral-950">
        <img 
          src={getExerciseImageUrl()} 
          alt={exerciseName || muscleGroup} 
          className="w-full h-full object-contain opacity-90 hover:scale-105 transition duration-300"
        />
      </div>

      <div className="w-full flex items-center justify-between text-[10px] text-neutral-300 font-bold pt-2 px-1">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3 text-orange-500" /> {muscleGroup}
        </span>
        <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase font-black">
          Anatomy 3D
        </span>
      </div>
    </div>
  );
}
          {/* Corps / Banc esquissé en gris technique */}
          <path d="M40 85 L80 85 L75 105 L45 105 Z" fill="#262626" stroke="#404040" strokeWidth="1.5" />
          <path d="M45 45 C45 35 75 35 75 45 L70 85 L50 85 Z" fill="#333333" stroke="#525252" strokeWidth="1.5" />
          <circle cx="60" cy="25" r="9" fill="#404040" stroke="#737373" strokeWidth="1.5" />
          {/* Bras */}
          <path d="M45 50 L25 55" stroke="#525252" strokeWidth="6" strokeLinecap="round" />
          <path d="M75 50 L95 55" stroke="#525252" strokeWidth="6" strokeLinecap="round" />
          {/* Pectoraux en surbrillance rouge/orange vif (style Lyfta) */}
          <path d="M48 48 C48 44 60 42 60 48 C60 55 48 55 48 48 Z" fill="#ea580c" className="animate-pulse" />
          <path d="M72 48 C72 44 60 42 60 48 C60 55 72 55 72 48 Z" fill="#ea580c" className="animate-pulse" />
          {/* Barre */}
          <rect x="15" y="52" width="90" height="4" rx="2" fill="#d4d4d4" />
        </svg>
      );
    }

    if (normalize.includes('dos') || normalize.includes('back')) {
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <circle cx="60" cy="22" r="9" fill="#404040" stroke="#737373" strokeWidth="1.5" />
          <path d="M48 35 L72 35 L78 95 L42 95 Z" fill="#333333" stroke="#525252" strokeWidth="1.5" />
          {/* Grand dorsal en surbrillance */}
          <path d="M49 38 C45 45 46 65 52 75 L58 70 C54 60 53 48 51 38 Z" fill="#ea580c" className="animate-pulse" />
          <path d="M71 38 C75 45 74 65 68 75 L62 70 C66 60 67 48 69 38 Z" fill="#ea580c" className="animate-pulse" />
        </svg>
      );
    }

    if (normalize.includes('jambe') || normalize.includes('cuisse') || normalize.includes('quadriceps') || normalize.includes('leg')) {
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <circle cx="60" cy="20" r="8" fill="#404040" stroke="#737373" strokeWidth="1.5" />
          <rect x="52" y="30" width="16" height="35" rx="4" fill="#333333" stroke="#525252" strokeWidth="1.5" />
          {/* Quadriceps en surbrillance */}
          <rect x="46" y="68" width="12" height="32" rx="5" fill="#ea580c" className="animate-pulse" />
          <rect x="62" y="68" width="12" height="32" rx="5" fill="#ea580c" className="animate-pulse" />
        </svg>
      );
    }

    // Vue anatomique universelle
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
        <circle cx="60" cy="25" r="9" fill="#404040" stroke="#737373" strokeWidth="1.5" />
        <path d="M48 38 L72 38 L75 95 L45 95 Z" fill="#333333" stroke="#525252" strokeWidth="1.5" />
        <circle cx="60" cy="50" r="12" fill="#ea580c" className="animate-pulse" />
      </svg>
    );
  };

  return (
    <div className={`relative bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-2 overflow-hidden shadow-inner ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent pointer-events-none" />
      
      {/* Conteneur de l'illustration technique */}
      <div className="w-full h-24 flex items-center justify-center relative z-10">
        {getAnatomicSketch()}
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-neutral-300 font-bold z-10">
        <span className="flex items-center gap-1 bg-neutral-900/90 px-2 py-0.5 rounded-lg border border-neutral-800">
          <Target className="w-3 h-3 text-orange-500" /> {muscleGroup}
        </span>
        <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest font-black">
          Anatomy 3D
        </span>
      </div>
    </div>
  );
}
