import { Dumbbell, Target, Flame, Activity } from 'lucide-react';

interface AnatomicIllustrationProps {
  muscleGroup: string;
  className?: string;
}

export default function AnatomicIllustration({ muscleGroup, className = "w-full h-36" }: AnatomicIllustrationProps) {
  const normalize = muscleGroup?.toLowerCase() || '';

  // Configuration visuelle selon la famille de muscles
  const getBadgeDetails = () => {
    if (normalize.includes('dos') || normalize.includes('back')) {
      return { icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Grand Dorsal & Trapèzes' };
    }
    if (normalize.includes('jambe') || normalize.includes('cuisse') || normalize.includes('quadriceps') || normalize.includes('leg')) {
      return { icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Quadriceps & Ischio-jambiers' };
    }
    if (normalize.includes('pectoral') || normalize.includes('chest') || normalize.includes('développé')) {
      return { icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Pectoraux & Faisceaux' };
    }
    if (normalize.includes('épaule') || normalize.includes('shoulder') || normalize.includes('deltoïde')) {
      return { icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'Deltoïdes & Coiffe' };
    }
    if (normalize.includes('bras') || normalize.includes('biceps') || normalize.includes('triceps')) {
      return { icon: Dumbbell, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Biceps & Triceps' };
    }
    return { icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Renforcement Global' };
  };

  const details = getBadgeDetails();
  const IconComponent = details.icon;

  return (
    <div className={`relative bg-neutral-950 border border-neutral-800/80 rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner ${className}`}>
      {/* Effet de lueur d'arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center space-y-2">
        <div className={`w-14 h-14 rounded-2xl ${details.bg} ${details.border} border flex items-center justify-center shadow-lg transform hover:scale-105 transition`}>
          <IconComponent className={`w-7 h-7 ${details.color}`} />
        </div>
        <div className="text-center">
          <span className="text-xs font-black text-white tracking-wide block">{muscleGroup}</span>
          <span className="text-[10px] text-neutral-400 font-medium">{details.label}</span>
        </div>
      </div>

      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-neutral-400 font-bold z-10">
        <span className="flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-800">
          <Target className="w-3 h-3 text-orange-500" /> Focus Cible
        </span>
        <span className={`text-[9px] ${details.color} ${details.bg} px-2 py-0.5 rounded-md border ${details.border} font-black uppercase tracking-wider`}>
          Pro-Anatomy ⚡
        </span>
      </div>
    </div>
  );
}
