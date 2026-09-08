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

// --- INNOVATION 1 : TRANSPARENCE DU CALCUL ---
// Contrairement aux scores "boîte noire" des apps concurrentes (Whoop,
// Strava...), FitPulse peut se permettre de montrer le détail du calcul
// puisqu'il repose sur une vraie formule pondérée, pas un modèle propriétaire
// opaque. Cette fonction retourne la décomposition complète, utilisée par un
// bouton "Voir le calcul" dans l'UI.
export interface ReadinessBreakdownItem {
  label: string;
  weightPercent: number;
  points: number; // points obtenus sur ce critère
  maxPoints: number; // points max possibles sur ce critère
  detail: string; // explication lisible de comment le point a été calculé
}

export interface ReadinessBreakdown {
  items: ReadinessBreakdownItem[];
  total: number;
}

export function calculateReadinessBreakdown(inputs: ReadinessInputs): ReadinessBreakdown {
  const sleepScore = Math.min(100, (inputs.sleepHours / 8) * 40);
  const qualityScore = (inputs.sleepQuality / 5) * 25;
  const sorenessScore = (inputs.soreness / 5) * 20;
  const stressScore = (inputs.stressLevel / 5) * 15;

  const items: ReadinessBreakdownItem[] = [
    {
      label: 'Durée de sommeil',
      weightPercent: 40,
      points: Math.round(sleepScore),
      maxPoints: 40,
      detail: `${inputs.sleepHours}h / 8h objectif`,
    },
    {
      label: 'Qualité du sommeil',
      weightPercent: 25,
      points: Math.round(qualityScore),
      maxPoints: 25,
      detail: `${inputs.sleepQuality}/5 déclaré`,
    },
    {
      label: 'Fraîcheur musculaire',
      weightPercent: 20,
      points: Math.round(sorenessScore),
      maxPoints: 20,
      detail: `${inputs.soreness}/5 déclaré (5 = aucune courbature)`,
    },
    {
      label: 'État mental / stress',
      weightPercent: 15,
      points: Math.round(stressScore),
      maxPoints: 15,
      detail: `${inputs.stressLevel}/5 déclaré (5 = zen)`,
    },
  ];

  const total = Math.max(0, Math.min(100, Math.round(sleepScore + qualityScore + sorenessScore + stressScore)));

  return { items, total };
}

// --- INNOVATION 2 : LA "DETTE DE RÉCUPÉRATION" ---
// Reformule le score en métaphore de compte bancaire : plus intuitif à
// comprendre qu'un pourcentage abstrait ("je suis dans le rouge, il faut
// rembourser" plutôt que "j'ai 42%"). Le calcul sous-jacent ne change pas,
// seule la présentation change.
export interface RecoveryDebtInfo {
  balance: number; // -100 (dette max) à +100 (solde excellent), dérivé du score
  label: string;
  emoji: string;
  advice: string;
}

export function getRecoveryDebtInfo(score: number): RecoveryDebtInfo {
  // Le score (0-100) est recentré autour de 50 pour donner un "solde" qui
  // peut être positif (crédit de forme) ou négatif (dette de récupération).
  const balance = Math.round((score - 50) * 2);

  if (balance >= 40) {
    return { balance, label: 'Gros crédit de forme', emoji: '🟢', advice: "Ton corps a de la marge. C'est le moment d'aller chercher l'intensité." };
  }
  if (balance >= 0) {
    return { balance, label: 'Solde positif', emoji: '🟡', advice: 'Compte à l\'équilibre. Séance normale, reste à l\'écoute de tes sensations.' };
  }
  if (balance >= -40) {
    return { balance, label: 'Début de dette', emoji: '🟠', advice: 'Ton compte commence à être dans le rouge. Une nuit correcte suffirait à le rééquilibrer.' };
  }
  return { balance, label: 'Dette de récupération importante', emoji: '🔴', advice: 'Dette élevée. Rembourse avant de repartir sur une grosse charge : sommeil et repos actif en priorité.' };
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
