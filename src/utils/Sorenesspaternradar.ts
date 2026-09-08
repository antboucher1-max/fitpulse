import { ReadinessHistoryEntry } from '../context/AppStateContext';
import { UnifiedSession } from '../context/AppStateContext';

// Détecte des motifs récurrents dans l'historique PERSONNEL de l'utilisateur
// entre (sommeil court + grosse séance) et (courbatures élevées quelques
// jours après). Ce n'est PAS un diagnostic médical — juste une observation
// statistique sur les propres données de la personne, formulée avec
// prudence (voir constant DISCLAIMER plus bas et son usage obligatoire dans
// l'UI). Conforme à l'avertissement santé des CGU : FitPulse n'est pas un
// dispositif médical.

export interface DetectedPattern {
  occurrences: number;
  message: string;
}

const MIN_OCCURRENCES_TO_REPORT = 2; // on ne remonte un motif qu'à partir de 2 répétitions

export const PATTERN_DISCLAIMER =
  "Observation basée sur tes propres données, pas un diagnostic. Si tu ressens une douleur persistante, consulte un professionnel de santé.";

/**
 * Cherche si, historiquement, les jours suivant (sommeil < 6h OU qualité de
 * sommeil <= 2) ET une séance à forte charge (rpe >= 8, durée >= 40min), le
 * niveau de courbatures déclaré 2 à 3 jours plus tard était bas (<= 2/5).
 */
export function detectSorenessAfterFatiguePattern(
  readinessHistory: ReadinessHistoryEntry[],
  sessions: UnifiedSession[]
): DetectedPattern | null {
  let occurrences = 0;

  readinessHistory.forEach((entry) => {
    const wasFatigued = entry.inputs.sleepHours < 6 || entry.inputs.sleepQuality <= 2;
    if (!wasFatigued) return;

    const entryDate = new Date(entry.date).getTime();
    const hadHeavySessionThatDay = sessions.some((s) => {
      if (!s.createdAt) return false;
      const sDate = new Date(s.createdAt).getTime();
      const sameDayApprox = Math.abs(sDate - entryDate) < 24 * 60 * 60 * 1000;
      return sameDayApprox && Number(s.rpe) >= 8 && Number(s.durationMins) >= 40;
    });
    if (!hadHeavySessionThatDay) return;

    // Cherche un readiness 2 à 3 jours plus tard avec courbatures basses
    const followUp = readinessHistory.find((later) => {
      const laterDate = new Date(later.date).getTime();
      const diffDays = (laterDate - entryDate) / (24 * 60 * 60 * 1000);
      return diffDays >= 1.5 && diffDays <= 3.5 && later.inputs.soreness <= 2;
    });

    if (followUp) occurrences += 1;
  });

  if (occurrences < MIN_OCCURRENCES_TO_REPORT) return null;

  return {
    occurrences,
    message: `${occurrences} fois dans ton historique, une séance intense après une nuit courte a été suivie de courbatures marquées 2 à 3 jours plus tard. Ce n'est pas systématique, mais garde un œil dessus.`,
  };
}
