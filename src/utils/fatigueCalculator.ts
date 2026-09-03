export interface GymLogEntry {
  id: string;
  muscle_group: string;
  exercise_name: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
}

export interface MuscleFatigueStatus {
  muscle: string;
  fatigueScore: number; // de 0 à 100
  status: 'frais' | 'en récupération' | 'saturé';
  color: string;
}

// Fonction pour calculer la fatigue musculaire sur les 48/72 dernières heures
export function calculateMuscleFatigue(logs: GymLogEntry[]): Record<string, MuscleFatigueStatus> {
  const fatigueMap: Record<string, number> = {};
  const now = new Date().getTime();
  const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

  // Parcourir les logs récents pour accumuler la charge (Tonnage = Poids x Reps x Sets)
  logs.forEach(log => {
    const logDate = new Date(log.date).getTime();
    const diffTime = now - logDate;

    // On pèse plus lourdement les séances de moins de 48-72h
    if (diffTime <= TWO_DAYS_MS && diffTime >= 0) {
      const muscle = (log.muscle_group || 'Global').toLowerCase();
      const tonnage = (Number(log.weight) || 0) * (Number(log.reps) || 0) * (Number(log.sets) || 1);
      
      // Facteur de récence (plus c'est récent, plus l'impact est fort)
      const recencyFactor = 1 - (diffTime / TWO_DAYS_MS);
      
      fatigueMap[muscle] = (fatigueMap[muscle] || 0) + (tonnage * recencyFactor);
    }
  });

  // Normalisation des scores de fatigue (0 à 100)
  const result: Record<string, MuscleFatigueStatus> = {};
  
  const musclesList = ['pectoraux', 'dos', 'jambes', 'quadriceps', 'épaules', 'bras'];
  
  musclesList.forEach(m => {
    const rawScore = fatigueMap[m] || 0;
    // Score arbitraire normalisé (ajustable selon les charges de l'athlète)
    const normalizedScore = Math.min(Math.round((rawScore / 5000) * 100), 100);
    
    let status: 'frais' | 'en récupération' | 'saturé' = 'frais';
    let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

    if (normalizedScore > 40 && normalizedScore <= 75) {
      status = 'en récupération';
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else if (normalizedScore > 75) {
      status = 'saturé';
      color = 'text-red-400 bg-red-500/10 border-red-500/20';
    }

    result[m] = {
      muscle: m,
      fatigueScore: normalizedScore,
      status,
      color
    };
  });

  return result;
}

// Calculateur de charge globale ACWR (Acute:Chronic Workload Ratio simplifié)
export function calculateACWR(logs: GymLogEntry[]) {
  const now = new Date().getTime();
  let acuteLoad = 0; // Charge sur 7 jours
  let chronicLoad = 0; // Charge sur 28 jours (moyenne hebdomadaire)

  logs.forEach(log => {
    const logDate = new Date(log.date).getTime();
    const daysAgo = (now - logDate) / (1000 * 60 * 60 * 24);
    const load = (Number(log.weight) || 0) * (Number(log.reps) || 0) * (Number(log.sets) || 1);

    if (daysAgo <= 7) {
      acuteLoad += load;
    }
    if (daysAgo <= 28) {
      chronicLoad += load / 4; // Moyenne par semaine sur 4 semaines
    }
  });

  const ratio = chronicLoad === 0 ? 0 : Number((acuteLoad / chronicLoad).toFixed(2));
  
  let riskLevel = 'Optimal (0.8 - 1.3)';
  let riskColor = 'text-emerald-400';

  if (ratio > 1.5) {
    riskLevel = 'Risque élevé de surentraînement ⚠️';
    riskColor = 'text-red-400';
  } else if (ratio < 0.8) {
    riskLevel = 'Sous-charge / Repos';
    riskColor = 'text-cyan-400';
  }

  return { acuteLoad, chronicLoad, ratio, riskLevel, riskColor };
}
