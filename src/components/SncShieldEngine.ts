export interface TrainingLoadEntry {
  date: string; // Charge de la séance (ex: 50 à 150)
  loadScore: number;
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

// BUGFIX : `currentReadiness` est maintenant `number | null` plutôt que
// `number`. Avant, un score de 0 (= "aucun check-in fait aujourd'hui") était
// interprété comme "0% de récupération", ce qui déclenchait à tort le mode
// urgence/verrouillage. `null` signifie explicitement "donnée inconnue" et
// n'influence plus le niveau de risque — seule la charge d'entraînement réelle
// compte tant qu'aucun check-in n'a été fait.
export function analyzeSncShield(
  recentLoads: TrainingLoadEntry[],
  currentReadiness: number | null
): SncShieldAnalysis {
  const totalLoad = recentLoads.length > 0
    ? recentLoads.reduce((acc, curr) => acc + curr.loadScore, 0)
    : 0;

  const averageDailyLoad = recentLoads.length > 0 ? totalLoad / recentLoads.length : 0;

  const hasReadinessData = currentReadiness !== null;
  const readinessCritical = hasReadinessData && (currentReadiness as number) < 40;
  const readinessWarning = hasReadinessData && (currentReadiness as number) >= 40 && (currentReadiness as number) < 65;

  const loadCritical = recentLoads.length > 0 && averageDailyLoad > 110;
  const loadWarning = recentLoads.length > 0 && averageDailyLoad > 90;

  const isCritical = readinessCritical || loadCritical;
  const isWarning = !isCritical && (readinessWarning || loadWarning);

  if (isCritical) {
    return {
      riskLevel: 'critical',
      fatigueTrend: +28,
      shieldMessage: readinessCritical
        ? "🚨 SNC Shield activé en mode Urgence : ton score de récupération est très bas. Risque de micro-déchirure ou de stagnation imminent."
        : "🚨 SNC Shield activé en mode Urgence : ta charge d'entraînement récente est très élevée. Risque de surentraînement imminent.",
      forcedAction: 'lockdown_active',
      adjustedPlanTitle: "Protocole de Décharge Neuronale (Deload Forcé)",
      adjustedPlanDescription: "La haute intensité (VMA / Barres lourdes) est verrouillée pour les 48 prochaines heures. Remplacement par 30 min de mobilité articulaire et marche active."
    };
  } else if (isWarning) {
    return {
      riskLevel: 'warning',
      fatigueTrend: +14,
      shieldMessage: "⚠️ SNC Shield en mode Alerte : la fatigue s'accumule plus vite que ta capacité de surcompensation. Ralentis la cadence sur la prochaine séance.",
      forcedAction: 'deload_recommended',
      adjustedPlanTitle: "Séance Atténuée - Seuil Contrôlé",
      adjustedPlanDescription: "Volume réduit de 30%. Évite de chercher le record personnel (PR) aujourd'hui pour préserver le système nerveux."
    };
  } else if (!hasReadinessData) {
    // Cas neutre : pas d'alerte, mais on invite au check-in plutôt que de
    // prétendre que tout va bien sans données.
    return {
      riskLevel: 'safe',
      fatigueTrend: 0,
      shieldMessage: "🛡️ SNC Shield : ta charge d'entraînement récente ne montre pas de signal d'alerte. Fais ton check-in du jour pour une analyse complète incluant ta récupération.",
      forcedAction: 'none',
      adjustedPlanTitle: "Programme Initial Validé (analyse partielle)",
      adjustedPlanDescription: "Basé uniquement sur ta charge d'entraînement — le check-in du jour affinera cette recommandation."
    };
  } else {
    return {
      riskLevel: 'safe',
      fatigueTrend: -3,
      shieldMessage: "🛡️ SNC Shield nominal : ton homéostasie est stable. Le système nerveux répond parfaitement aux stimuli croisés.",
      forcedAction: 'none',
      adjustedPlanTitle: "Programme Initial Validé",
      adjustedPlanDescription: "Tous les voyants sont au vert. Tu peux exécuter ton plan d'entraînement prévu à pleine intensité."
    };
  }
}
