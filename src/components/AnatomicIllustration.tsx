import { Target } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  exerciseName?: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, exerciseName = '', className = "w-full h-36" }: AnatomicIllustrationProps) {
  const muscle = (muscleGroup || '').toLowerCase();
  const name = (exerciseName || '').toLowerCase();

  // Rendu vectoriel anatomique net et précis selon le muscle ciblé
  const renderAnatomicShape = () => {
    // 1. ÉPAULES / DELTOÏDES (ex: Élévations latérales)
    if (muscle.includes('épaule') || name.includes('élévation') || name.includes('deltoïde')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <path d="M50 18 C43 18 39 24 38 32 L34 65 L42 67 L45 42 L50 44 L55 42 L58 67 L66 65 L62 32 C61 24 57 18 50 18 Z" fill="#262626" stroke="#404040" strokeWidth="1" />
          <circle cx="50" cy="20" r="6" fill="#525252" />
          {/* Deltoïdes en surbrillance rouge/orange */}
          <circle cx="36" cy="34" r="7" fill="#ea580c" className="animate-pulse" />
          <circle cx="64" cy="34" r="7" fill="#ea580c" className="animate-pulse" />
        </svg>
      );
    }

    // 2. BRAS / BICEPS / TRICEPS (ex: Curl, Extensions)
    if (muscle.includes('bras') || name.includes('curl') || name.includes('triceps')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <path d="M50 18 C43 18 39 24 38 32 L34 70 L42 70 L45 42 L50 44 L55 42 L58 70 L66 70 L62 32 C61 24 57 18 50 18 Z" fill="#262626" stroke="#404040" strokeWidth="1" />
          <circle cx="50" cy="20" r="6" fill="#525252" />
          {/* Biceps/Triceps en surbrillance */}
          <rect x="32" y="38" width="6" height="22" rx="3" fill="#ea580c" className="animate-pulse" />
          <rect x="62" y="38" width="6" height="22" rx="3" fill="#ea580c" className="animate-pulse" />
        </svg>
      );
    }

    // 3. PECTORAUX (ex: Développé couché)
    if (muscle.includes('pectoral') || name.includes('couché') || name.includes('bench')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <path d="M50 18 C43 18 39 24 38 32 L35 65 L43 67 L45 40 L50 42 L55 40 L57 67 L65 65 L62 32 C61 24 57 18 50 18 Z" fill="#262626" stroke="#404040" strokeWidth="1" />
          <circle cx="50" cy="20" r="6" fill="#525252" />
          {/* Pectoraux en surbrillance */}
          <path d="M44 32 C44 28 50 27 50 32 C50 37 44 37 44 32 Z" fill="#ea580c" className="animate-pulse" />
          <path d="M56 32 C56 28 50 27 50 32 C50 37 56 37 56 32 Z" fill="#ea580c" className="animate-pulse" />
        </svg>
      );
    }

    // 4. JAMBES / QUADRICEPS
    if (muscle.includes('jambe') || muscle.includes('cuisse') || name.includes('squat')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <path d="M50 15 C44 15 40 20 40 26 L40 48 L44 92 L50 92 L47 52 L53 52 L50 92 L56 92 L60 48 L60 26 C60 20 56 15 50 15 Z" fill="#262626" stroke="#404040" strokeWidth="1" />
          <circle cx="50" cy="17" r="5" fill="#525252" />
          {/* Cuisses en surbrillance */}
          <rect x="42" y="32" width="7" height="28" rx="3" fill="#ea580c" className="animate-pulse" />
          <rect x="51" y="32" width="7" height="28" rx="3" fill="#ea580c" className="animate-pulse" />
        </svg>
      );
    }

    // SILHOUETTE STANDARD CIBLÉE PAR DÉFAUT
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <path d="M50 18 C43 18 39 24 38 32 L35 65 L43 67 L45 40 L50 42 L55 40 L57 67 L65 65 L62 32 C61 24 57 18 50 18 Z" fill="#262626" stroke="#404040" strokeWidth="1" />
        <circle cx="50" cy="20" r="6" fill="#525252" />
        <circle cx="50" cy="38" r="9" fill="#ea580c" className="animate-pulse" />
      </svg>
    );
  };

  return (
    <div className={`relative bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-3 overflow-hidden shadow-xl ${className}`}>
      {/* Fond subtil type grille technique */}
      <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:14px_14px] opacity-30 pointer-events-none" />

      {/* Conteneur du schéma anatomique vectoriel */}
      <div className="w-24 h-24 flex items-center justify-center relative z-10 my-1">
        {renderAnatomicShape()}
      </div>

      <div className="w-full flex items-center justify-between text-xs text-neutral-300 font-bold z-10 pt-2 border-t border-neutral-800/80">
        <span className="flex items-center gap-1.5 truncate">
          <Target className="w-3.5 h-3.5 text-orange-500 shrink-0" /> <span className="truncate">{muscleGroup}</span>
        </span>
        <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase font-black tracking-wider shrink-0">
          Anatomy 3D ⚡
        </span>
      </div>
    </div>
  );
}
