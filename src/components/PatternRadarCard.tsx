import { Radar, ShieldAlert } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { detectSorenessAfterFatiguePattern, PATTERN_DISCLAIMER } from '../utils/sorenessPatternRadar';

// Innovation #4 : radar de motifs personnel. Ne s'affiche que si un motif
// réel est détecté (au moins 2 occurrences) — pas de fausse alerte
// permanente. Reste volontairement prudent dans le langage (voir
// PATTERN_DISCLAIMER), conformément à l'avertissement santé des CGU.
export default function PatternRadarCard() {
  const { readinessHistory, sessions } = useAppState();
  const pattern = detectSorenessAfterFatiguePattern(readinessHistory, sessions);

  if (!pattern) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-wider">
          <Radar className="w-4 h-4" /> Radar de Motifs Personnel
        </div>
        <p className="text-xs text-neutral-500">
          Pas encore assez d'historique pour détecter un motif fiable. Continue tes check-ins quotidiens — cette analyse se construit avec le temps.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/20 border border-amber-500/30 rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
        <Radar className="w-4 h-4" /> Radar de Motifs Personnel
      </div>
      <p className="text-xs text-neutral-200 leading-relaxed">{pattern.message}</p>
      <div className="flex items-start gap-2 pt-2 border-t border-amber-500/20">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-neutral-400 leading-relaxed">{PATTERN_DISCLAIMER}</p>
      </div>
    </div>
  );
}
