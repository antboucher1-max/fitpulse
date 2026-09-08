import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

// --- CLÉS DE PERSISTANCE (on garde les mêmes qu'avant pour ne rien perdre) ---
const SESSIONS_KEY = 'fitpulse_triptych_sessions';
const SHOES_KEY = 'fitpulse_gear_shoes';

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

  const addSession = (session: UnifiedSession) => {
    setSessions((prev) => [session, ...prev]);
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
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
