import { Target } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, className = "w-full h-36" }: AnatomicIllustrationProps) {
  const normalize = muscleGroup?.toLowerCase() || '';

  const getMuscleSvg = () => {
    if (normalize.includes('dos') || normalize.includes('back')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 fill-current opacity-90">
          <path d="M50 15 C40 15 35 25 32 35 L28 55 L35 58 L38 40 L45 38 L45 85 L55 85 L55 38 L62 40 L65 58 L72 55 L68 35 C65 25 60 15 50 15 Z" opacity="0.3" />
          <path d="M32 35 C30 42 33 55 38 58 L45 55 L45 40 Z" className="text-orange-500 fill-current animate-pulse" />
          <path d="M68 35 C70 42 67 55 62 58 L55 55 L55 40 Z" className="text-orange-500 fill-current animate-pulse" />
          <circle cx="50" cy="18" r="7" className="text-neutral-400 fill-current" />
        </svg>
      );
    } 
    
    if (normalize.includes('jambe') || normalize.includes('cuisse') || normalize.includes('quadriceps') || normalize.includes('leg')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 fill-current opacity-90">
          <path d="M50 10 C42 10 38 18 38 25 L38 50 L42 90 L48 90 L46 55 L54 55 L52 90 L58 90 L62 50 L62 25 C62 18 58 10 50 10 Z" opacity="0.3" />
          <ellipse cx="44" cy="45" rx="5" ry="12" className="text-orange-500 fill-current animate-pulse" />
          <ellipse cx="56" cy="45" rx="5" ry="12" className="text-orange-500 fill-current animate-pulse" />
          <circle cx="50" cy="15" r="6" className="text-neutral-400 fill-current" />
        </svg>
      );
    } 
    
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 fill-current opacity-90">
        <path d="M50 12 C42 12 37 20 37 28 L30 45 L36 47 L41 32 L47 32 L47 85 L53 85 L53 32 L59 32 L64 47 L70 45 L63 28 C63 20 58 12 50 12 Z" opacity="0.3" />
        <path d="M43 28 C43 26 47 25 50 26 C53 25 57 26 57 28 C57 33 43 33 43 28 Z" className="text-orange-500 fill-current animate-pulse" />
        <circle cx="50" cy="15" r="6" className="text-neutral-400 fill-current" />
      </svg>
    );
  };

  return (
    <div className={`relative bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-3 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent pointer-events-none" />
      <div className="w-20 h-20 flex items-center justify-center relative z-10">
        {getMuscleSvg()}
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-neutral-300 font-bold z-10">
        <span className="flex items-center gap-1.5 bg-neutral-900/90 px-2.5 py-1 rounded-xl border border-neutral-800">
          <Target className="w-3.5 h-3.5 text-orange-500" /> {muscleGroup}
        </span>
        <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">Anatomie 3D</span>
      </div>
    </div>
  );
}
