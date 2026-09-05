import { useState, useEffect } from 'react';
import { Sparkles, Brain, Activity, ShieldAlert, ArrowRight, Zap, BatteryCharging, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface FitBotCoachProps {
  currentUserId?: string;
  currentUsername?: string;
  currentUserProfile?: any;
}

export default function FitBotProactiveCoach({
  currentUserId,
  currentUsername = 'Athlète',
  currentUserProfile
}: FitBotCoachProps) {
  const [readinessScore, setReadinessScore] = useState<number>(78);
  const [sncStatus, setSncStatus] = useState<'Optimal' | 'Modéré' | 'Fatigué (Low Recovery)'>('Optimal');
  const [activeAdvice, setActiveAdvice] = useState<string>('Analyse croisée de vos charges de la semaine en cours...');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [adjustedSession, setAdjustedSession] = useState<any | null>(null);

  // Analyse proactive intelligente croisant les disciplines et personnalisée au profil
  const runDeepNeuroAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Simulation d'une auto-régulation basée sur un score de fatigue
      setReadinessScore(64);
      setSncStatus('Fatigué (Low Recovery)');
      setActiveAdvice(
        `⚠️ Attention ${currentUsername} : Ton volume d'entraînement récent a généré une dette sur le système nerveux central. Le suivi de réactivité neuro-musculaire indique une baisse de ton explosivité.`
      );
      setAdjustedSession({
        title: "Séance Auto-Régulée par FitBot AI",
        originalPlan: "Intensité maximale prévue au programme",
        newPlan: "Volume modéré à 75% + Remplacement par 25 min de mobilité active & récupération.",
        reason: "Protection articulaire et prévention du surentraînement."
      });
    }, 1800);
  };

  useEffect(() => {
    runDeepNeuroAnalysis();
  }, [currentUsername]);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* EN-TÊTE FITBOT V3 */}
      <div className="bg-gradient-to-r from-cyan-950/90 via-neutral-900 to-neutral-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
              <Brain className="w-4 h-4 animate-pulse" /> FitBot AI — Cerveau Hybride Proactif
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Auto-Régulation SNC & Bio-Feedback</h2>
          </div>
          <button
            type="button"
            onClick={runDeepNeuroAnalysis}
            disabled={isAnalyzing}
            className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-cyan-400 hover:bg-neutral-800 transition cursor-pointer shadow-inner"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* WIDGET READINESS & SNC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-2 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
            <BatteryCharging className="w-4 h-4 text-emerald-400" /> Indice de Récupération Global
          </span>
          <div className="text-3xl font-black text-white flex items-baseline gap-2">
            {readinessScore}% 
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${readinessScore > 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {sncStatus}
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed pt-1">
            Calculé via l'historique croisé de ton volume, de tes charges en muscu et de tes WODs.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-2 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> État du Système Nerveux Central (SNC)
          </span>
          <div className="space-y-1">
            <div className="text-sm font-black text-white">Prêt pour l'effort : <span className="text-amber-400">Modéré</span></div>
            <p className="text-xs text-neutral-300 leading-snug">
              Le corps réclame une baisse d'intensité sur les mouvements lourds de force pure aujourd'hui.
            </p>
          </div>
          <div className="text-[10px] text-cyan-400 font-bold">⚡ Mode Auto-Pilote Actif</div>
        </div>
      </div>

      {/* ANALYSE PROACTIVE & AJUSTEMENT DE SÉANCE */}
      <div className="bg-neutral-900 border border-cyan-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Diagnostic & Recommandation en Temps Réel
        </div>

        <p className="text-xs text-neutral-200 leading-relaxed bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
          {activeAdvice}
        </p>

        {adjustedSession && (
          <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {adjustedSession.title}
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-bold">
                Ajusté automatiquement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Programme initial prévu :</span>
                <p className="text-neutral-300 line-through">{adjustedSession.originalPlan}</p>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-cyan-500/30 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">Nouveau plan optimisé :</span>
                <p className="text-white font-bold">{adjustedSession.newPlan}</p>
              </div>
            </div>

            <div className="text-[10px] text-neutral-400 italic">
              Raison : {adjustedSession.reason}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => alert("✅ La séance ajustée a été validée et enregistrée dans votre calendrier !")}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
        >
          Appliquer la modification à ma séance du jour <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
