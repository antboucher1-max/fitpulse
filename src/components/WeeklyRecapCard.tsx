import { useState } from 'react';
import { TrendingUp, Share2, Flame, Dumbbell, Navigation, Zap, Scale } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { getWeeklyRecap } from '../utils/weeklyRecap';

const TYPE_META = {
  run: { label: 'Course', icon: Navigation, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  gym: { label: 'Musculation', icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  fitcross: { label: 'Fitcross', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
} as const;

function getBalanceLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Athlète hybride équilibré 🏆', color: 'text-emerald-400' };
  if (score >= 50) return { label: 'Bon équilibre', color: 'text-amber-400' };
  if (score > 0) return { label: 'Une discipline domine largement', color: 'text-orange-400' };
  return { label: 'Aucune donnée cette semaine', color: 'text-neutral-500' };
}

export default function WeeklyRecapCard() {
  const { sessions } = useAppState();
  const recap = getWeeklyRecap(sessions, 7);
  const [shared, setShared] = useState(false);

  const balance = getBalanceLabel(recap.balanceScore);

  const buildShareText = () => {
    const lines = [
      `⚡ Mon bilan hybride de la semaine sur FitPulse`,
      ``,
      `📊 ${recap.totalSessions} séances • ${recap.totalLoad} pts de charge • ${Math.round(recap.totalMinutes / 60 * 10) / 10}h au total`,
    ];
    (Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).forEach((type) => {
      const b = recap.breakdown[type];
      if (b.count > 0) lines.push(`${TYPE_META[type].label} : ${b.count} séance${b.count > 1 ? 's' : ''}`);
    });
    lines.push(``, `⚖️ Score d'équilibre : ${recap.balanceScore}/100 — ${balance.label}`, `#HybridAthlete #FitPulse`);
    return lines.join('\n');
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mon bilan hybride de la semaine', text });
        setShared(true);
      } catch {
        // partage annulé, on ne fait rien
      }
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
    }
    setTimeout(() => setShared(false), 2500);
  };

  if (recap.totalSessions === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-2">
        <TrendingUp className="w-8 h-8 text-neutral-600 mx-auto" />
        <p className="text-xs text-neutral-400">
          Aucune séance enregistrée cette semaine. Ton bilan hybride apparaîtra ici dès ta première session.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/30 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
          <TrendingUp className="w-4 h-4" /> Ton Bilan Hybride de la Semaine
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white transition cursor-pointer"
          title="Partager"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5 relative z-10">
        {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).map((type) => {
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          const b = recap.breakdown[type];
          return (
            <div key={type} className={`p-3 rounded-2xl border text-center space-y-1 ${meta.bg}`}>
              <Icon className={`w-4 h-4 mx-auto ${meta.color}`} />
              <div className={`text-lg font-black ${meta.color}`}>{b.count}</div>
              <div className="text-[9px] text-neutral-400 uppercase font-bold">{meta.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" /> Charge totale
          </span>
          <span className="font-black text-white">{recap.totalLoad} pts</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-cyan-400" /> Score d'équilibre
          </span>
          <span className={`font-black ${balance.color}`}>{recap.balanceScore}/100</span>
        </div>
        <p className={`text-[11px] font-bold pt-1 border-t border-neutral-900 ${balance.color}`}>{balance.label}</p>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-xl flex items-center justify-center gap-2 relative z-10"
      >
        <Share2 className="w-4 h-4" /> {shared ? 'Copié / Partagé ! 🚀' : 'Partager mon bilan'}
      </button>
    </div>
  );
}
