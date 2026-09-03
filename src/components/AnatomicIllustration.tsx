import { Target, Dumbbell, Flame, Activity } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  exerciseName?: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, exerciseName = '', className = "w-full h-36" }: AnatomicIllustrationProps) {
  const normalizeMuscle = (muscleGroup || '').toLowerCase();
  const normalizeName = (exerciseName || '').toLowerCase();

  // Détermine la couleur et le style selon le groupe musculaire
  const getTheme = () => {
    if (normalizeMuscle.includes('pectoraux') || normalizeName.includes('couché') || normalizeName.includes('bench')) {
      return { color: 'text-orange-500', bg: 'from-orange-500/20 via-neutral-900 to-neutral-950', border: 'border-orange-500/40', label: 'Pectoraux • Force' };
    }
    if (normalizeMuscle.includes('dos') || normalizeName.includes('traction') || normalizeName.includes('rowing')) {
      return { color: 'text-amber-500', bg: 'from-amber-500/20 via-neutral-900 to-neutral-950', border: 'border-amber-500/40', label: 'Dos • Épaisseur' };
    }
    if (normalizeMuscle.includes('jambe') || normalizeMuscle.includes('cuisse') || normalizeName.includes('squat')) {
      return { color: 'text-emerald-500', bg: 'from-emerald-500/20 via-neutral-900 to-neutral-950', border: 'border-emerald-500/40', label: 'Membres inférieurs' };
    }
    if (normalizeMuscle.includes('épaule') || normalizeName.includes('élévation')) {
      return { color: 'text-cyan-500', bg: 'from-cyan-500/20 via-neutral-900 to-neutral-950', border: 'border-cyan-500/40', label: 'Deltoïdes & Stabilité' };
    }
    return { color: 'text-orange-500', bg: 'from-orange-500/20 via-neutral-900 to-neutral-950', border: 'border-orange-500/40', label: 'Renforcement Global' };
  };

  const theme = getTheme();

  return (
    <div className={`relative bg-gradient-to-br ${theme.bg} border ${theme.border} rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden shadow-xl ${className}`}>
      {/* Grille technique de fond style application haut de gamme */}
      <div className="absolute inset-0 bg-[radial-gradient(#383838_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-2 text-center">
        <div className={`w-12 h-12 rounded-2xl bg-neutral-900/90 border ${theme.border} flex items-center justify-center shadow-lg`}>
          <Dumbbell className={`w-6 h-6 ${theme.color}`} />
        </div>
        <div>
          <span className="text-sm font-black text-white tracking-wide block">{exerciseName || muscleGroup}</span>
          <span className="text-[11px] text-neutral-400 font-semibold">{theme.label}</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-neutral-300 font-bold z-10 pt-2 border-t border-neutral-800/80">
        <span className="flex items-center gap-1">
          <Target className={`w-3.5 h-3.5 ${theme.color}`} /> {muscleGroup}
        </span>
        <span className={`text-[9px] ${theme.color} bg-neutral-900 px-2 py-0.5 rounded-md border ${theme.border} uppercase tracking-wider font-black`}>
          Pro-Target ⚡
        </span>
      </div>
    </div>
  );
}
