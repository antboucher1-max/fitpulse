import { Zap, Navigation, Flame, ArrowRight, BatteryCharging, Dumbbell, Users, Activity } from 'lucide-react';
import { useAppState, AthleteDiscipline } from '../context/AppStateContext';
import { getReadinessStatus } from '../utils/readinessCalculator';

interface TodayTabProps {
  currentUserProfile?: any;
  onNavigateTab: (tab: 'home' | 'training' | 'health' | 'nutrition' | 'community' | 'profile') => void;
}

const DISCIPLINE_OPTIONS: Array<{ id: AthleteDiscipline; label: string }> = [
  { id: 'hybride', label: '⚡ Hybride' },
  { id: 'musculation', label: '🏋️ Muscu' },
  { id: 'course', label: '🏃 Course' },
  { id: 'crossfit', label: '📦 CrossFit' },
];

// Nouvel écran d'accueil : une seule "prochaine action" contextuelle plutôt
// qu'un mur de modules empilés. Le détail complet reste accessible via les
// autres onglets et via la section "Vue avancée" dépliable dans App.tsx.
export default function TodayTab({ currentUserProfile, onNavigateTab }: TodayTabProps) {
  const { readiness, trainingLoad, discipline, setDiscipline } = useAppState();
  const hasCheckedIn = readiness.inputs !== null;
  const status = getReadinessStatus(readiness.score);
  const currentHour = new Date().getHours();

  const getTimeGreeting = () => {
    if (currentHour < 12) return "Prêt pour lancer la journée ?";
    if (currentHour < 17) return "C'est l'heure de préparer la séance de fin de journée.";
    return "Soirée récup ou gros training ? C'est le moment.";
  };

  // Recommandation simple basée sur le vrai score du jour, pas une valeur fixe.
  const getRecommendation = () => {
    if (!hasCheckedIn) {
      return {
        title: "Fais ton check-in du matin",
        subtitle: "Aucune donnée de récupération pour aujourd'hui",
        action: () => onNavigateTab('health'),
      };
    }
    if (readiness.score < 45) {
      return {
        title: "Récupération active conseillée",
        subtitle: `Score du jour : ${readiness.score}% — ${status.label}`,
        action: () => onNavigateTab('health'),
      };
    }
    return {
      title: "Feu vert pour ta séance du jour",
      subtitle: `Score du jour : ${readiness.score}% — ${status.label}`,
      action: () => onNavigateTab('training'),
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">

      {/* 1. CARTE MAÎTRE : LE CONTEXTE DU JOUR */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${hasCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              {hasCheckedIn ? `État de Forme • ${status.label} (${readiness.score}%)` : 'État de Forme • Non renseigné'}
            </span>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="relative z-10 space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight">
            {getTimeGreeting()}
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Charge d'entraînement actuelle : <strong className="text-white">{trainingLoad} pts</strong>.
          </p>
        </div>

        {/* Action Directe Recommandée */}
        <div className="pt-2 relative z-10">
          <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">{recommendation.subtitle}</span>
                <span className="text-xs font-black text-white">{recommendation.title}</span>
              </div>
            </div>
            <button
              onClick={recommendation.action}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg cursor-pointer"
            >
              Aller <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. DISCIPLINE PRINCIPALE : personnalise ce qui s'affiche par défaut dans "Entraînement" */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-2.5">
        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Ta discipline principale</span>
        <div className="grid grid-cols-4 gap-1.5">
          {DISCIPLINE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setDiscipline(opt.id)}
              className={`py-2 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                discipline === opt.id
                  ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-neutral-500">
          Filtre les modules affichés par défaut dans l'onglet Entraînement. Rien n'est supprimé, tu peux toujours tout révéler manuellement.
        </p>
      </div>

      {/* 3. RACCOURCIS RAPIDES VERS LES AUTRES ONGLETS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex items-center justify-around">
        <button
          onClick={() => onNavigateTab('training')}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] font-bold transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-orange-400">
            <Dumbbell className="w-4 h-4" />
          </div>
          Entraînement
        </button>

        <button
          onClick={() => onNavigateTab('community')}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] font-bold transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-cyan-400">
            <Users className="w-4 h-4" />
          </div>
          Clubs & Ligue
        </button>

        <button
          onClick={() => onNavigateTab('health')}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] font-bold transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          Santé & SNC
        </button>
      </div>

    </div>
  );
}
