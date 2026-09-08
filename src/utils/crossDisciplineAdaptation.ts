import { UnifiedSession } from '../context/AppStateContext';

// Moteur d'adaptation VRAIMENT inter-discipline : contrairement à
// adaptiveTrainer.ts (qui ne regarde que les gym_logs Supabase et la fatigue
// des jambes pour ajuster une séance de course), celui-ci croise les 3
// disciplines du Triptyque unifié entre elles — une grosse séance de course
// peut rétrograder un squat lourd prévu, un gros WOD peut rétrograder une
// sortie longue prévue, etc. C'est la différenciation produit : aucune app
// grand public ne fait cette lecture croisée entre disciplines.
//
// Les deux moteurs sont complémentaires, pas redondants : adaptiveTrainer.ts
// travaille au niveau fin (groupe musculaire, via les logs Supabase détaillés),
// celui-ci travaille au niveau grossier (type de discipline, via le Triptyque),
// utilisable même sans connexion Supabase puisqu'il ne lit que le state local.

export interface CrossDisciplineAdaptation {
  isAdjusted: boolean;
  severity: 'none' | 'info' | 'warning';
  message: string;
}

const RECENT_WINDOW_HOURS = 36;

// Impact de chaque discipline récente sur chaque discipline prévue aujourd'hui.
// Valeurs élevées = la discipline récente fatigue beaucoup la discipline prévue.
const CROSS_IMPACT: Record<UnifiedSession['type'], Record<UnifiedSession['type'], number>> = {
  run: { run: 1.0, gym: 0.5, fitcross: 0.6 },
  gym: { run: 0.7, gym: 0.4, fitcross: 0.5 },
  fitcross: { run: 0.8, gym: 0.7, fitcross: 0.9 },
};

function getRecentSessions(sessions: UnifiedSession[]): UnifiedSession[] {
  const cutoff = Date.now() - RECENT_WINDOW_HOURS * 60 * 60 * 1000;
  return sessions.filter((s) => {
    if (!s.createdAt) return false;
    const t = new Date(s.createdAt).getTime();
    return !Number.isNaN(t) && t >= cutoff;
  });
}

function sessionLoad(session: UnifiedSession): number {
  return Number(session.durationMins || 0) * Number(session.rpe || 0);
}

/**
 * Évalue si la séance prévue aujourd'hui (plannedType) doit être adaptée
 * compte tenu des séances récentes (toutes disciplines confondues) des
 * dernières 36h.
 */
export function getCrossDisciplineAdaptation(
  sessions: UnifiedSession[],
  plannedType: UnifiedSession['type']
): CrossDisciplineAdaptation {
  const recent = getRecentSessions(sessions);

  let crossImpactLoad = 0;
  let dominantSource: UnifiedSession | null = null;

  recent.forEach((s) => {
    const impact = sessionLoad(s) * CROSS_IMPACT[s.type][plannedType];
    if (!dominantSource || impact > sessionLoad(dominantSource) * CROSS_IMPACT[dominantSource.type][plannedType]) {
      dominantSource = s;
    }
    crossImpactLoad += impact;
  });

  const disciplineLabel: Record<UnifiedSession['type'], string> = {
    run: 'course',
    gym: 'musculation',
    fitcross: 'crossfit/WOD',
  };

  if (crossImpactLoad > 900) {
    return {
      isAdjusted: true,
      severity: 'warning',
      message: dominantSource
        ? `Ta séance de ${disciplineLabel[(dominantSource as UnifiedSession).type]} récente ("${(dominantSource as UnifiedSession).title}") a généré une fatigue croisée importante. Envisage de réduire l'intensité de ta séance de ${disciplineLabel[plannedType]} aujourd'hui.`
        : `Charge croisée élevée détectée sur les dernières ${RECENT_WINDOW_HOURS}h. Envisage de réduire l'intensité aujourd'hui.`,
    };
  }

  if (crossImpactLoad > 500) {
    return {
      isAdjusted: true,
      severity: 'info',
      message: `Fatigue croisée modérée détectée sur les dernières ${RECENT_WINDOW_HOURS}h. Reste attentif à tes sensations sur ta séance de ${disciplineLabel[plannedType]}.`,
    };
  }

  return {
    isAdjusted: false,
    severity: 'none',
    message: `Aucune fatigue croisée significative détectée. Feu vert pour ta séance de ${disciplineLabel[plannedType]}.`,
  };
}
