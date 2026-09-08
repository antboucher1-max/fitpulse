// Calculateurs nutritionnels centralisés.
//
// Avant ce fichier, 3 endroits calculaient des besoins nutritionnels avec des
// formules différentes : NutritionTab.tsx, NutritionDashboard.tsx, et
// NutritionPlannerTab.tsx (ce dernier n'était importé nulle part — code mort,
// à supprimer du projet).
//
// NutritionTab et NutritionDashboard répondent en réalité à deux questions
// différentes et complémentaires, donc on ne les fusionne pas artificiellement :
//   - "Combien dois-je consommer PENDANT une séance à venir ?" (planification)
//   - "Combien dois-je consommer APRÈS une course terminée ?" (récupération)
// Mais les deux partagent maintenant la même constante pour les protéines
// post-effort, au lieu de deux valeurs codées en dur indépendamment.

export const RECOVERY_PROTEIN_G_PER_KG = 0.4; // g de protéines par kg de poids de corps, fenêtre post-effort

// --- PLANIFICATION D'UNE SÉANCE À VENIR (ravitaillement pendant l'effort) ---

export type SessionIntensityType = 'endurance' | 'seuil' | 'longue' | 'foot';

export interface PreWorkoutFuelingInput {
  durationHours: number;
  ambientTempC: number;
  sessionType: SessionIntensityType;
}

export interface PreWorkoutFuelingResult {
  carbsPerHour: number;
  totalCarbsGrams: number;
  waterMlPerHour: number;
  totalWaterMl: number;
  sodiumMgPerHour: number;
  totalSodiumMg: number;
}

export function calculatePreWorkoutFueling(input: PreWorkoutFuelingInput): PreWorkoutFuelingResult {
  const { durationHours, ambientTempC, sessionType } = input;

  let carbsPerHour = 50;
  if (sessionType === 'seuil') carbsPerHour = 75;
  if (sessionType === 'longue' || sessionType === 'foot') carbsPerHour = 85;

  const waterMlPerHour = ambientTempC > 25 ? 800 : ambientTempC > 18 ? 650 : 500;
  const sodiumMgPerHour = ambientTempC > 25 ? 700 : 500;

  return {
    carbsPerHour,
    totalCarbsGrams: Math.round(carbsPerHour * durationHours),
    waterMlPerHour,
    totalWaterMl: Math.round(waterMlPerHour * durationHours),
    sodiumMgPerHour,
    totalSodiumMg: Math.round(sodiumMgPerHour * durationHours),
  };
}

// Cibles génériques de récupération quand on ne connaît que le poids de
// l'athlète (pas de distance/durée précise d'une séance réalisée). Utilisé
// par NutritionTab pour sa fenêtre anabolique après une séance planifiée.
export interface GenericPostWorkoutTargets {
  proteinGrams: number;
  carbsGrams: number;
}

export function calculateGenericPostWorkoutTargets(bodyWeightKg: number): GenericPostWorkoutTargets {
  return {
    proteinGrams: Math.round(bodyWeightKg * RECOVERY_PROTEIN_G_PER_KG),
    carbsGrams: Math.round(bodyWeightKg * 0.8),
  };
}

// --- RÉCUPÉRATION APRÈS UNE COURSE RÉELLEMENT TERMINÉE ---

export interface PostWorkoutRecoveryInput {
  distanceKm: number;
  durationSecs: number;
  bodyWeightKg: number;
}

export interface PostWorkoutRecoveryResult {
  targetWaterMl: number;
  targetCarbsGrams: number;
  targetProteinGrams: number;
}

export function calculatePostWorkoutRecovery(input: PostWorkoutRecoveryInput): PostWorkoutRecoveryResult {
  const { distanceKm, durationSecs, bodyWeightKg } = input;
  const durationHours = durationSecs / 3600;

  return {
    targetWaterMl: Math.round(durationHours * 750 + bodyWeightKg * 50),
    targetCarbsGrams: Math.round(bodyWeightKg * 1.2 + distanceKm * 4),
    targetProteinGrams: Math.round(bodyWeightKg * RECOVERY_PROTEIN_G_PER_KG),
  };
}
