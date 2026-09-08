import { UnifiedSession } from '../context/AppStateContext';

// Calcule le bilan hebdomadaire hybride — la métrique différenciante de
// FitPulse : personne d'autre ne mesure l'équilibre entre course, muscu et
// crossfit sur une même semaine (Strava ne voit que la course, Hevy que la
// muscu). Le "score d'équilibre" est un indicateur simple (0 à 100) de à quel
// point les 3 disciplines ont été pratiquées de façon équilibrée cette
// semaine, plutôt qu'une seule discipline écrasant les deux autres.

export interface WeeklyRecapResult {
  totalSessions: number;
  totalLoad: number;
  totalMinutes: number;
  breakdown: Record<UnifiedSession['type'], { count: number; minutes: number; load: number }>;
  balanceScore: number; // 0 à 100 : 100 = parfaitement équilibré entre les 3 disciplines pratiquées
  dominantType: UnifiedSession['type'] | null;
}

const LOAD_MULTIPLIER: Record<UnifiedSession['type'], number> = {
  run: 1.2,
  gym: 1.0,
  fitcross: 1.4,
};

function isWithinLastNDays(session: UnifiedSession, days: number): boolean {
  if (!session.createdAt) return false;
  const t = new Date(session.createdAt).getTime();
  if (Number.isNaN(t)) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return t >= cutoff;
}

export function getWeeklyRecap(sessions: UnifiedSession[], days: number = 7): WeeklyRecapResult {
  const weekSessions = sessions.filter((s) => isWithinLastNDays(s, days));

  const breakdown: WeeklyRecapResult['breakdown'] = {
    run: { count: 0, minutes: 0, load: 0 },
    gym: { count: 0, minutes: 0, load: 0 },
    fitcross: { count: 0, minutes: 0, load: 0 },
  };

  let totalLoad = 0;
  let totalMinutes = 0;

  weekSessions.forEach((s) => {
    const minutes = Number(s.durationMins || 0);
    const load = Math.round(minutes * Number(s.rpe || 0) * LOAD_MULTIPLIER[s.type]);
    breakdown[s.type].count += 1;
    breakdown[s.type].minutes += minutes;
    breakdown[s.type].load += load;
    totalLoad += load;
    totalMinutes += minutes;
  });

  // Score d'équilibre : basé sur l'écart-type des charges relatives entre les
  // disciplines réellement pratiquées cette semaine (ignore les disciplines à
  // 0 séance plutôt que de les compter comme un déséquilibre — pratiquer 2
  // disciplines de façon équilibrée doit donner un bon score, pas être puni
  // de ne pas avoir fait la 3e).
  const practicedLoads = (Object.values(breakdown) as { load: number }[])
    .map((b) => b.load)
    .filter((load) => load > 0);

  let balanceScore = 0;
  if (practicedLoads.length === 1) {
    balanceScore = 40; // une seule discipline : équilibre faible par nature
  } else if (practicedLoads.length >= 2) {
    const mean = practicedLoads.reduce((a, b) => a + b, 0) / practicedLoads.length;
    const variance = practicedLoads.reduce((acc, v) => acc + (v - mean) ** 2, 0) / practicedLoads.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    // CV proche de 0 = très équilibré -> score proche de 100. CV élevé -> score bas.
    balanceScore = Math.max(0, Math.round(100 - coefficientOfVariation * 100));
  }

  const dominantType =
    (Object.entries(breakdown) as [UnifiedSession['type'], { load: number }][])
      .sort((a, b) => b[1].load - a[1].load)[0]?.[1].load > 0
      ? (Object.entries(breakdown) as [UnifiedSession['type'], { load: number }][]).sort(
          (a, b) => b[1].load - a[1].load
        )[0][0]
      : null;

  return {
    totalSessions: weekSessions.length,
    totalLoad,
    totalMinutes,
    breakdown,
    balanceScore,
    dominantType,
  };
}
