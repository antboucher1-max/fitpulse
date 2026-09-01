import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TrainingLoadProps {
  posts: any[];
}

export default function TrainingLoadWidget({ posts }: TrainingLoadProps) {
  // Calculer une charge dynamique basée sur les publications récentes de l'utilisateur
  const recentPosts = posts.slice(0, 7); // Sur les 7 derniers posts / jours
  
  const totalLoad = recentPosts.reduce((acc, post) => {
    const text = (post.caption || '').toLowerCase();
    const sessionType = (post.session_type || '').toLowerCase();
    
    if (sessionType.includes('running') || text.includes('running') || text.includes('km')) return acc + 120;
    if (sessionType.includes('boxwars') || text.includes('wod') || text.includes('crossfit')) return acc + 100;
    return acc + 70; // Musculation classique / autres séances
  }, 350); // Valeur de base initiale

  // Déterminer le statut de fatigue et les conseils associés
  let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  let statusText = "Optimale 🟢 (Progression idéale)";
  let advice = "Ton corps assimile parfaitement la charge combinée (force + cardio). Continue ainsi !";

  if (totalLoad > 700) {
    statusColor = "text-red-400 bg-red-500/10 border-red-500/20";
    statusText = "Surcharge Critique 🔴 (Risque de blessure)";
    advice = "Attention, la fatigue accumulée (course + force + WODs) est très haute. Prévois une journée de repos ou de récupération active.";
  } else if (totalLoad > 550) {
    statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    statusText = "Élevée 🟠 (Zone de pic)";
    advice = "Gros volume cette semaine. Assure-toi de bien dormir et de surveiller ta nutrition pour récupérer.";
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" /> Charge d'Entraînement Globale (7j)
        </h3>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
          {statusText}
        </span>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400">Score de Fatigue (ATL)</span>
          <div className="text-3xl font-black text-white mt-0.5">
            {totalLoad} <span className="text-xs font-normal text-cyan-400">pts TRIMP</span>
          </div>
        </div>
        <div className="text-right max-w-[180px]">
          <p className="text-[11px] text-neutral-400 leading-tight">
            Combine course, crossfit & muscu en une seule métrique unifiée.
          </p>
        </div>
      </div>

      <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-start gap-3">
        {totalLoad > 700 ? (
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <span className="text-xs font-bold text-white block">Conseil du coach :</span>
          <p className="text-[11px] text-neutral-400 leading-relaxed">{advice}</p>
        </div>
      </div>
    </div>
  );
}
