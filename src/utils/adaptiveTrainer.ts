import { GymLogEntry } from './fatigueCalculator';

export interface AdaptiveRecommendation {
  originalSession: string;
  recommendedSession: string;
  isModified: boolean;
  reason: string;
  badgeColor: string;
}

export function getAdaptiveTrainingPlan(logs: GymLogEntry[], scheduledTodayTitle: string): AdaptiveRecommendation {
  const now = new Date().getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Vérifier si une grosse séance de jambes a été faite au cours des dernières 36 heures
  let recentHeavyLegs = false;
  
  logs.forEach(log => {
    const logDate = new Date(log.date).getTime();
    const diffTime = now - logDate;
    const muscle = (log.muscle_group || '').toLowerCase();

    if (diffTime <= ONE_DAY_MS * 1.5 && diffTime >= 0) {
      if (muscle.includes('jambe') || muscle.includes('quadriceps') || muscle.includes('squat')) {
        const tonnage = (Number(log.weight) || 0) * (Number(log.reps) || 0) * (Number(log.sets) || 1);
        if (tonnage > 1000) { // Seuil de fatigue significative
          recentHeavyLegs = true;
        }
      }
    }
  });

  const sessionLower = scheduledTodayTitle.toLowerCase();

  // Si l'athlète a prévu du fractionné ou de la VMA mais a les jambes fatiguées par la muscu
  if (recentHeavyLegs && (sessionLower.includes('fractionné') || sessionLower.includes('vma') || sessionLower.includes('seuil'))) {
    return {
      originalSession: scheduledTodayTitle,
      recommendedSession: 'Récupération active & Footing souple (30-45 min)',
      isModified: true,
      reason: '⚠️ Grosse séance de jambes détectée hier. L\'algorithme a rétrogradé la VMA pour protéger tes fibres musculaires.',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    };
  }

  return {
    originalSession: scheduledTodayTitle,
    recommendedSession: scheduledTodayTitle,
    isModified: false,
    reason: '✅ Organisme prêt. Le plan d\'entraînement initial est maintenu.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  };
}
