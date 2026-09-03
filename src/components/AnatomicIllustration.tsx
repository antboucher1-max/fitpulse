import { Target } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, className = "w-full h-36" }: AnatomicIllustrationProps) {
  const normalize = muscleGroup?.toLowerCase() || '';

  const getIllustrationSvg = () => {
    // Si c'est du développé couché / Pectoraux (Vue de profil sur un banc avec barre)
    if (normalize.includes('pectoral') || normalize.includes('chest') || normalize.includes('développé')) {
      return (
        <svg viewBox="0 0 200 100" className="w-full h-full text-orange-500 fill-current">
          {/* Le banc */}
          <rect x="40" y="65" width="120" height="8" rx="3" className="text-neutral-700 fill-current" />
          <rect x="60" y="73" width="12" height="15" className="text-neutral-800 fill-current" />
          <rect x="130" y="73" width="12" height="15" className="text-neutral-800 fill-current" />
          {/* Supports de barre */}
          <rect x="35" y="30" width="6" height="40" className="text-neutral-600 fill-current" />
          
          {/* L'athlète allongé sur le banc (vue de profil) */}
          <ellipse cx="100" cy="55" rx="45" ry="10" className="text-neutral-500 fill-current opacity-80" />
          <circle cx="55" cy="53" r="7" className="text-neutral-400 fill-current" /> {/* Tête */}
          
          {/* La zone active ciblée : les pectoraux en surbrillance */}
          <ellipse cx="100" cy="53" rx="14" ry="7" className="text-orange-500 fill-current animate-pulse shadow-lg" />
          
          {/* La barre de développé couché */}
          <rect x="80" y="35" width="40" height="4" rx="2" className="text-white fill-current" />
          <circle cx="76" cy="37" r="6" className="text-neutral-400 fill-current" />
          <circle cx="124" cy="37" r="6" className="text-neutral-400 fill-current" />
        </svg>
      );
    }

    // Si c'est le dos (Tirage / Rowing)
    if (normalize.includes('dos') || normalize.includes('back')) {
      return (
        <svg viewBox="0 0 200 100" className="w-full h-full text-orange-500 fill-current">
          <circle cx="100" cy="30" r="9" className="text-neutral-400 fill-current" />
          {/* Buste penché ou assis */}
          <path d="M92 42 C85 55 85 75 90 90 L100 90 C105 75 105 55 108 42 Z" className="text-neutral-500 fill-current opacity-80" />
          {/* Cible dorsaux */}
          <path d="M91 45 C86 52 87 65 92 72 L98 68 C94 60 94 52 97 45 Z" className="text-orange-500 fill-current animate-pulse" />
          <path d="M109 45 C114 52 113 65 108 72 L102 68 C106 60 106 52 103 45 Z" className="text-orange-500 fill-current animate-pulse" />
        </svg>
      );
    }

    // Si ce sont les jambes / cuisses
    if (normalize.includes('jambe') || normalize.includes('cuisse') || normalize.includes('quadriceps') || normalize.includes('leg')) {
      return (
        <svg viewBox="0 0 200 100" className="w-full h-full text-orange-500 fill-current">
          <circle cx="100" cy="20" r="8" className="text-neutral-400 fill-current" />
          <rect x="94" y="30" width="12" height="30" rx="4" className="text-neutral-500 fill-current opacity-80" />
          {/* Cuisses ciblées */}
          <rect x="87" y="60" width="11" height="28" rx="5" className="text-orange-500 fill-current animate-pulse" />
          <rect x="102" y="60" width="11" height="28" rx="5" className="text-orange-500 fill-current animate-pulse" />
        </svg>
      );
    }

    // Vue générique muscu
    return (
      <svg viewBox="0 0 200 100" className="w-full h-full text-orange-500 fill-current">
        <circle cx="100" cy="30" r="9" className="text-neutral-400 fill-current" />
        <path d="M85 42 L115 42 L120 75 L110 75 L103 52 L97 52 L90 75 L80 75 Z" className="text-neutral-500 fill-current opacity-80" />
        <circle cx="100" cy="50" r="10" className="text-orange-500 fill-current animate-pulse" />
      </svg>
    );
  };

  return (
    <div className={`relative bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-3 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 to-transparent pointer-events-none" />
      <div className="w-full h-20 flex items-center justify-center relative z-10 px-4">
        {getIllustrationSvg()}
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-neutral-300 font-bold z-10">
        <span className="flex items-center gap-1.5 bg-neutral-900/95 px-2.5 py-1 rounded-xl border border-neutral-800">
          <Target className="w-3.5 h-3.5 text-orange-500" /> {muscleGroup}
        </span>
        <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">Anatomie 3D</span>
      </div>
    </div>
  );
}
