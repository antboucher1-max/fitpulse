import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateReadinessScore, ReadinessInputs } from '../utils/readinessCalculator';

// --- TYPES ---

export interface UnifiedSession {
  id: string;
  type: 'run' | 'gym' | 'fitcross';
  title: string;
  durationMins: number;
  rpe: number;
}

export interface Shoe {
  id: string;
  brand: string;
  model: string;
  current_km: number;
  max_km: number;
  is_active?: boolean;
}

export interface ReadinessState {
  date: string; // format YYYY-MM-DD, permet de savoir si le check-in est celui d'aujourd'hui
  inputs: ReadinessInputs | null;
  score: number; // 0 si aucun check-in fait aujourd'hui
}

interface AppStateValue {
  // Charge d'entraînement unifiée (ex triptyque)
  sessions: UnifiedSession[];
  setSessions: React.Dispatch<React.SetStateAction<UnifiedSession[]>>;
  addSession: (session: UnifiedSession) => void;
  removeSession: (id: string) => void;
  trainingLoad: number; // calculé automatiquement à partir de `sessions`

  // Chaussures (Gear Tracker)
  shoes: Shoe[];
  setShoes: React.Dispatch<React.SetStateAction<Shoe[]>>;

  // Readiness du jour (remplace les 4 calculs différents qui existaient avant)
  readiness: ReadinessState;
  submitReadinessCheckin: (inputs: ReadinessInputs) => void;
  resetReadinessCheckin: () => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

// --- CLÉS DE PERSISTANCE (on garde les mêmes qu'avant pour ne rien perdre) ---
const SESSIONS_KEY = 'fitpulse_triptych_sessions';
const SHOES_KEY = 'fitpulse_gear_shoes';
const READINESS_KEY = 'fitpulse_readiness'; // ancienne clé : `fitpulse_readiness_${userId}`, simplifiée ici

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function loadReadiness(): ReadinessState {
  const saved = loadFromStorage<ReadinessState | null>(READINESS_KEY, null);
  // Le check-in n'est valable que pour la journée en cours (comportement repris
  // à l'identique de CleanReadinessTab / ReadinessTab, mais à un seul endroit désormais).
  if (saved && saved.date === todayStr()) {
    return saved;
  }
  return { date: todayStr(), inputs: null, score: 0 };
}

// --- CALCUL DE LA CHARGE UNIFIÉE (logique reprise telle quelle d'App.tsx / UnifiedTriptychModule) ---
function calculateUnifiedLoad(sessions: UnifiedSession[]): number {
  let totalLoad = 0;
  sessions.forEach((session) => {
    let multiplier = 1.0;
    if (session.type === 'run') multiplier = 1.2;
    if (session.type === 'gym') multiplier = 1.0;
    if (session.type === 'fitcross') multiplier = 1.4;
    totalLoad += Number(session.durationMins || 0) * Number(session.rpe || 0) * multiplier;
  });
  return Math.round(totalLoad);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<UnifiedSession[]>(() =>
    loadFromStorage<UnifiedSession[]>(SESSIONS_KEY, [])
  );
  const [shoes, setShoes] = useState<Shoe[]>(() =>
    loadFromStorage<Shoe[]>(SHOES_KEY, [])
  );
  const [readiness, setReadiness] = useState<ReadinessState>(loadReadiness);

  // Persistance automatique (remplace les setInterval de scrutation : on écrit
  // directement dans localStorage à chaque changement d'état, plus besoin de relire
  // en boucle pour "détecter" un changement puisque tous les composants partagent
  // désormais le même state React).
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(SHOES_KEY, JSON.stringify(shoes));
  }, [shoes]);

  useEffect(() => {
    localStorage.setItem(READINESS_KEY, JSON.stringify(readiness));
  }, [readiness]);

  const addSession = (session: UnifiedSession) => {
    setSessions((prev) => [session, ...prev]);
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const submitReadinessCheckin = (inputs: ReadinessInputs) => {
    const score = calculateReadinessScore(inputs);
    setReadiness({ date: todayStr(), inputs, score });
  };

  const resetReadinessCheckin = () => {
    setReadiness({ date: todayStr(), inputs: null, score: 0 });
  };

  const trainingLoad = calculateUnifiedLoad(sessions);

  const value: AppStateValue = {
    sessions,
    setSessions,
    addSession,
    removeSession,
    trainingLoad,
    shoes,
    setShoes,
    readiness,
    submitReadinessCheckin,
    resetReadinessCheckin,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState() doit être utilisé à l\'intérieur d\'un <AppStateProvider>.');
  }
  return ctx;
}
