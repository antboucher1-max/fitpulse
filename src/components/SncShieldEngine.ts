export interface TrainingLoadEntry {
  date: string;
  loadScore: number; // Charge de la séance (ex: 50 à 150)
  type: 'running' | 'crossfit' | 'muscu';
}

export interface SncShieldAnalysis {
  riskLevel: 'safe' | 'warning' | 'critical';
  fatigueTrend: number; // Pourcentage de variation de la charge
  shieldMessage: string;
  forcedAction: 'none' | 'deload_recommended' | 'lockdown_active';
  adjustedPlanTitle: string;
  adjustedPlanDescription: string;
}

export function analyzeSncShield(recentLoads: TrainingLoadEntry[], currentReadiness: number): SncShieldAnalysis {
  // Gestion propre si le tableau d'historique est vide pour éviter le faux blocage à 400
  const totalLoad = recentLoads.length > 0 
    ? recentLoads.reduce((acc, curr) => acc + curr.loadScore, 0) 
    : 0;
  
  const averageDailyLoad = recentLoads.length > 0 ? totalLoad / recentLoads.length : 0;
  
  // Évaluation basée sur le score de readiness et l'historique réel si disponible
  const isCritical = currentReadiness < 40 || (recentLoads.length > 0 && averageDailyLoad > 110);
  const isWarning = (currentReadiness >= 40 && currentReadiness < 65) || (recentLoads.length > 0 && averageDailyLoad > 90);

  if (isCritical) {
    return {
      riskLevel: 'critical',
      fatigueTrend: +28,
      shieldMessage: "🚨 SNC Shield activé en mode Urgence : Vos récepteurs neuromusculaires affichent une saturation critique. Risque de micro-déchirure ou de stagnation imminent.",
      forcedAction: 'lockdown_active',
      adjustedPlanTitle: "Protocole de Décharge Neuronale (Deload Forcé)",
      adjustedPlanDescription: "La haute intensité (VMA / Barres lourdes) est verrouillée pour les 48 prochaines heures. Remplacement par 30 min de mobilité articulaire et marche active."
    };
  } else if (isWarning) {
    return {
      riskLevel: 'warning',
      fatigueTrend: +14,
      shieldMessage: "⚠️ SNC Shield en mode Alerte : La fatigue s'accumule plus vite que votre capacité de surcompensation. Ralentissez la cadence sur la prochaine séance.",
      forcedAction: 'deload_recommended',
      adjustedPlanTitle: "Séance Atténuée - Seuil Contrôlé",
      adjustedPlanDescription: "Volume réduit de 30%. Interdiction de chercher le record personnel (PR) aujourd'hui pour préserver le système nerveux."
    };
  } else {
    return {
      riskLevel: 'safe',
      fatigueTrend: -3,
      shieldMessage: "🛡️ SNC Shield nominal : Votre homéostasie est stable. Le système nerveux répond parfaitement aux stimuli croisés.",
      forcedAction: 'none',
      adjustedPlanTitle: "Programme Initial Validé",
      adjustedPlanDescription: "Tous les voyants sont au vert. Vous pouvez exécuter votre plan d'entraînement prévu à pleine intensité."
    };
  }
}
