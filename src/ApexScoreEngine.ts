export interface AthleteDayData {
  readinessScore: number;     // 0 à 100 (Sommeil + Fraîcheur)
  nutritionCompliance: boolean; // Est-ce que le Fuel-Lock a été suivi ?
  hydrationLiters: number;     // Litres d'eau bues dans la journée
  targetHydrationLiters: number; // Objectif (ex: 2.5L)
  weeklyLoad: number;          // Charge hebdo (0 à 100)
}

export function calculateApexScore(data: AthleteDayData) {
  // 1. Pilier SNC & Forme (50% du score)
  const sncScore = Math.max(0, Math.min(100, data.readinessScore));
  const loadPenalty = data.weeklyLoad > 85 ? 15 : 0; // Malus si surcharge
  const sncFinal = Math.max(0, sncScore - loadPenalty);

  // 2. Pilier Nutrition / Fuel-Lock (30% du score)
  const nutritionFinal = data.nutritionCompliance ? 100 : 40;

  // 3. Pilier Hydratation (20% du score)
  const hydrationRatio = Math.min(1, data.hydrationLiters / data.targetHydrationLiters);
  const hydrationFinal = hydrationRatio * 100;

  // Pondération globale type Yuka (50% / 30% / 20%)
  const rawScore = (sncFinal * 0.5) + (nutritionFinal * 0.3) + (hydrationFinal * 0.2);
  const finalScore = Math.round(rawScore);

  // Système de malus critique (si le SNC est < 40, on plafonne le score global à 49 max, comme Yuka avec les additifs rouges)
  let cappedScore = finalScore;
  if (data.readinessScore < 40) {
    cappedScore = Math.min(49, finalScore);
  }

  // Attribution du label et de la couleur
  let status = 'optimal';
  let badgeColor = 'emerald';
  let message = '⚡ Système nerveux et métabolisme parés pour la performance.';

  if (cappedScore < 50) {
    status = 'danger';
    badgeColor = 'red';
    message = '🚨 Surcharge critique détectée. Repos ou récupération obligatoire.';
  } else if (cappedScore < 75) {
    status = 'warning';
    badgeColor = 'amber';
    message = '⚠️ Forme mitigée. Réduis la voilure et surveille ta nutrition.';
  }

  return {
    score: cappedScore,
    status,
    badgeColor,
    message,
    breakdown: {
      snc: Math.round(sncFinal),
      nutrition: Math.round(nutritionFinal),
      hydration: Math.round(hydrationFinal)
    }
  };
}
