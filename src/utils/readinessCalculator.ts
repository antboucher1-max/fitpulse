// Calculateur unique du score de récupération (readiness).
//
// Avant ce fichier, la même idée était calculée différemment à 4 endroits
// (CleanReadinessTab, ReadinessTab, ReadinessCheckin, ReadinessWidget), avec
// des poids différents et donc des résultats différents pour les mêmes
// réponses utilisateur. Ce fichier devient la seule source de vérité.

export interface ReadinessInputs {
  sleepHours: number;
  sleepQuality: number; // 1 à 5 (5 = excellente)
  soreness: number; // 1 à 5 (5 = aucune courbature, fraîcheur totale)
  stressLevel: number; // 1 à 5 (5 = zen, aucun stress)
}

export interface ReadinessStatus {
  label: string;
  color: string; // classe Tailwind text-*
}

/**
 * Calcule un score de récupération de 0 à 100 à partir des réponses du
 * check-in matinal. Pondération : sommeil 40%, qualité du sommeil 25%,
 * fraîcheur musculaire 20%, état mental 15%.
 */
export function calculateReadinessScore(inputs: ReadinessInputs): number {
  const sleepScore = Math.min(100, (inputs.sleepHours / 8) * 40);
  const qualityScore = (inputs.sleepQuality / 5) * 25;
  const sorenessScore = (inputs.soreness / 5) * 20;
  const stressScore = (inputs.stressLevel / 5) * 15;

  const total = sleepScore + qualityScore + sorenessScore + stressScore;
  return Math.max(0, Math.min(100, Math.round(total)));
}

/**
 * Traduit un score en statut lisible (label + couleur), utilisé partout où
 * le score doit être affiché avec un badge de couleur.
 */
export function getReadinessStatus(score: number): ReadinessStatus {
  if (score >= 75) return { label: 'Récupération optimale', color: 'text-emerald-400' };
  if (score >= 45) return { label: 'Récupération moyenne', color: 'text-amber-400' };
  return { label: 'Fatigue élevée', color: 'text-red-400' };
}
