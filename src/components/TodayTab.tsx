import { useState } from 'react';
import { Play, Activity, Zap, Navigation, Flame, Calendar, ArrowRight, ShieldCheck, BatteryCharging, CheckCircle2, Users } from 'lucide-react';

export default function ContextualDashboard({ currentUserProfile, onNavigateTab }: { currentUserProfile: any, onNavigateTab: (tab: string) => void }) {
  // Simulation de l'état contextuel du jour
  const readinessScore = 78;
  const isTapering = true;
  const currentHour = new Date().getHours();
  
  // Détermination du message contextuel selon l'heure
  const getTimeGreeting = () => {
    if (currentHour < 12) return "Prêt pour lancer la journée ?";
    if (currentHour < 17) return "C'est l'heure de préparer la séance de fin de journée.";
    return "Soirée récup ou gros training ? C'est le moment.";
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      
      {/* 1. CARTE MAÎTRE : LE CONTEXTE DU JOUR (Dynamique selon la forme et l'agenda) */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* En-tête du flux */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              État de Forme • Optimal ({readinessScore}%)
            </span>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Accroche principale */}
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight">
            {getTimeGreeting()}
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {isTapering 
              ? "⚡ Semaine d'affûtage en cours. Volume réduit, privilégie l'intensité modérée et le stockage de glycogène."
              : "Feu vert pour une session active. Ton organisme a bien récupéré de la veille."}
          </p>
        </div>

        {/* Action Directe Recommandée (La "Next Best Action") */}
        <div className="pt-2 relative z-10">
          <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Séance Recommandée</span>
                <span className="text-xs font-black text-white">Footing Actif & Stratégie Gels (6 km)</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigateTab('running')}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg cursor-pointer"
            >
              Lancer <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LE FIL DE LA JOURNÉE (Timeline des briques clés sans encombrer) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bloc Nutrition / Ravitaillement contextuel */}
        <div 
          onClick={() => onNavigateTab('running')}
          className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 p-4 rounded-3xl space-y-2 cursor-pointer transition shadow-lg"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Objectif Glucides</h4>
            <p className="text-[10px] text-neutral-400">~65g / heure validés pour ce soir</p>
          </div>
        </div>

        {/* Bloc Carnet de Muscu / Repos */}
        <div 
          onClick={() => onNavigateTab('today')}
          className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 p-4 rounded-3xl space-y-2 cursor-pointer transition shadow-lg"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BatteryCharging className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Check-in Quotidien</h4>
            <p className="text-[10px] text-neutral-400">Sommeil : 7h30 • OK ⚡</p>
          </div>
        </div>
      </div>

      {/* 3. RACCOURCIS RAPIDES VERS LES OUTILS SECONDAIRES */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex items-center justify-around">
        <button 
          onClick={() => onNavigateTab('boxwars')}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] font-bold transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-cyan-400">
            <Flame className="w-4 h-4" />
          </div>
          BoxWars
        </button>

        <button 
          onClick={() => onNavigateTab('buddy')}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] font-bold transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-orange-400">
            <Users className="w-4 h-4" />
          </div>
          Match Partenaires
        </button>

        <button 
          onClick={() => onNavigateTab('readiness')}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] font-bold transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          Plan & Roadbook
        </button>
      </div>

    </div>
  );
}
