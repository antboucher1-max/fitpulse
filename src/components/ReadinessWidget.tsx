import { useState } from 'react';
import { BatteryCharging, Battery, AlertOctagon, CheckCircle2, Moon, Zap, RefreshCw } from 'lucide-react';

interface ReadinessProps {
  recentLoadScore?: number; // Venu du module TRIMP
}

export default function ReadinessWidget({ recentLoadScore = 500 }: ReadinessProps) {
  // Facteurs de ressenti athlète (Notés de 1 à 5)
  const [sleepQuality, setSleepQuality] = useState<number>(4); // 1 = Insomnie, 5 = Nuit parfaite
  const [muscleSoreness, setMuscleSoreness] = useState<number>(2); // 1 = Cassé/Courbatures, 5 = Frais comme un gardon
  const [mentalStress, setMentalStress] = useState<number>(4); // 1 = Épuisé, 5 = Zen / Motivé

  // Calcul du Score de Récupération pondéré (sur 100)
  // Base subjective (sommeil + fraîcheur musculaire + mental) sur 15 ramenée à 70% + Impact de la charge (30%)
  const subjectiveScore = ((sleepQuality + muscleSoreness + mentalStress) / 15) * 70;
  const loadPenalty = recentLoadScore > 650 ? 15 : recentLoadScore > 500 ? 5 : 0;
  const readinessScore = Math.max(10, Math.min(100, Math.round(subjectiveScore + 30 - loadPenalty)));

  // Détermination du statut dynamique et des couleurs (Vert, Orange, Rouge)
  let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  let progressBarColor = "bg-emerald-500";
  let statusTitle = "Prêt pour la performance 🟢";
  let recommendation = "Ton corps est parfaitement récupéré. C'est le moment idéal pour envoyer une grosse séance de seuil ou un WOD intense !";

  if (readinessScore < 50) {
    statusColor = "text-red-400 bg-red-500/10 border-red-500/20";
    progressBarColor = "bg-red-500";
    statusTitle = "Repos forcé conseillé 🔴";
    recommendation = "Niveau de fatigue critique ou sommeil insuffisant. Risque de blessure élevé. Privilégie une récupération active ou une journée off.";
  } else if (readinessScore < 75) {
    statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    progressBarColor = "bg-amber-500";
    statusTitle = "Zone de vigilance 🟠";
    recommendation = "Fatigue modérée détectée. Tu peux t'entraîner mais évite l'échec musculaire ou les fractionnés trop violents.";
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-cyan-400" /> Score de Récupération (Readiness)
        </h3>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColor}`}>
          {statusTitle}
        </span>
      </div>

      {/* Jauge principale */}
      <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Indice Global de Forme</span>
            <div className="text-4xl font-black text-white mt-0.5">
              {readinessScore} <span className="text-sm font-normal text-neutral-400">/ 100</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            {readinessScore >= 75 ? (
              <Battery className="w-8 h-8 text-emerald-400" />
            ) : readinessScore >= 50 ? (
              <Zap className="w-8 h-8 text-amber-400" />
            ) : (
              <AlertOctagon className="w-8 h-8 text-red-400" />
            )}
          </div>
        </div>

        {/* Barre de progression dynamique */}
        <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`} 
            style={{ width: `${readinessScore}%` }}
          />
        </div>
      </div>

      {/* Mini-questionnaire interactif (Sliders / Sélecteurs rapides) */}
      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <span className="text-xs font-bold text-white block">Paramètres du jour :</span>
        
        <div className="space-y-3 text-xs">
          {/* Sommeil */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-cyan-400" /> Qualité du sommeil
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setSleepQuality(val)}
                  className={`w-7 h-7 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                    sleepQuality === val ? 'bg-cyan-600 text-white shadow-md' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Fraîcheur Musculaire */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" /> Absence de courbatures
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setMuscleSoreness(val)}
                  className={`w-7 h-7 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                    muscleSoreness === val ? 'bg-orange-600 text-white shadow-md' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conseil du Coach */}
      <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-white block">Avis de l'algorithme :</span>
          <p className="text-[11px] text-neutral-400 leading-relaxed">{recommendation}</p>
        </div>
      </div>
    </div>
  );
}
