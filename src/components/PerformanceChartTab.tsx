import { useState } from 'react';
import { TrendingUp, Award, Zap } from 'lucide-react';

interface PerformanceChartProps {
  userPosts: any[];
}

export default function PerformanceChartTab({ userPosts }: PerformanceChartProps) {
  const [metric, setMetric] = useState<'vma' | '1rm' | 'sessions'>('sessions');

  // Extraction ou génération de points de données basés sur les posts de l'athlète
  // Pour l'exemple, on simule l'historique des 6 derniers mois ou on extrait des posts
  const dataPoints = [
    { label: 'Mars', vma: 12.5, rm: 90, sessions: 12 },
    { label: 'Avril', vma: 13.0, rm: 95, sessions: 15 },
    { label: 'Mai', vma: 13.2, rm: 100, sessions: 14 },
    { label: 'Juin', vma: 13.8, rm: 105, sessions: 18 },
    { label: 'Juillet', vma: 14.1, rm: 110, sessions: 16 },
    { label: 'Août', vma: 14.5, rm: 115, sessions: 20 },
  ];

  const currentValues = dataPoints.map(d => d[metric]);
  const maxVal = Math.max(...currentValues, 1);
  const minVal = Math.min(...currentValues, 0);

  // Génération des points du polygone SVG (coordonnées x, y sur un cadre 300x100)
  const width = 300;
  const height = 100;
  const points = dataPoints.map((d, index) => {
    const x = (index / (dataPoints.length - 1)) * width;
    const y = height - ((d[metric] - minVal) / (maxVal - minVal || 1)) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" /> Courbe de Progression
        </h3>
        
        {/* Sélecteur de métrique */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[10px]">
          <button 
            onClick={() => setMetric('sessions')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${metric === 'sessions' ? 'bg-orange-600 text-white' : 'text-neutral-400'}`}
          >
            Séances
          </button>
          <button 
            onClick={() => setMetric('1rm')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${metric === '1rm' ? 'bg-orange-600 text-white' : 'text-neutral-400'}`}
          >
            1RM (kg)
          </button>
          <button 
            onClick={() => setMetric('vma')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${metric === 'vma' ? 'bg-orange-600 text-white' : 'text-neutral-400'}`}
          >
            VMA
          </button>
        </div>
      </div>

      {/* Affichage de la valeur actuelle vs mois dernier */}
      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400">Record Actuel</span>
          <div className="text-2xl font-black text-white mt-0.5">
            {dataPoints[dataPoints.length - 1][metric]} <span className="text-xs font-normal text-orange-400">{metric === '1rm' ? 'kg' : metric === 'vma' ? 'km/h' : 'sessions'}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            +12% vs mois dernier 🚀
          </span>
        </div>
      </div>

      {/* Graphique SVG épuré */}
      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
        <div className="h-28 w-full flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Ligne de tendance */}
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {/* Points de données */}
            {dataPoints.map((d, index) => {
              const x = (index / (dataPoints.length - 1)) * width;
              const y = height - ((d[metric] - minVal) / (maxVal - minVal || 1)) * (height - 20) - 10;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  className="fill-neutral-950 stroke-orange-500 stroke-[3] transition-all hover:r-6 cursor-pointer"
                />
              );
            })}
          </svg>
        </div>

        {/* Labels des mois */}
        <div className="flex justify-between text-[10px] text-neutral-400 font-semibold px-1">
          {dataPoints.map((d, index) => (
            <span key={index}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
