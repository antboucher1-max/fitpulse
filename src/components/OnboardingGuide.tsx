import { useState } from 'react';
import { Compass, Navigation, Zap, Calendar, X, CheckCircle2 } from 'lucide-react';

export default function OnboardingGuide() {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('fitpulse_onboarding_dismissed') !== 'true';
  });

  if (!isVisible) return null;

  const handleDismiss = () => {
    localStorage.setItem('fitpulse_onboarding_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <div className="bg-gradient-to-br from-orange-950/40 via-neutral-900 to-neutral-900 border border-orange-500/30 rounded-3xl p-5 space-y-4 shadow-2xl relative animate-fadeIn">
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white bg-neutral-900/80 rounded-full transition cursor-pointer"
        title="Masquer le guide"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Bienvenue sur FitPulse ⚡</h3>
          <p className="text-[11px] text-orange-400">Ton QG d'athlète hybride (Force & Course)</p>
        </div>
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed">
        FitPulse simplifie ton quotidien sportif en centralisant ton entraînement et ta communauté locale. Voici comment t'y retrouver en un coup d'œil :
      </p>

      <div className="grid grid-cols-1 gap-2.5 pt-1">
        <div className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-2xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Mode Running</h4>
            <p className="text-[11px] text-neutral-400">Gère tes footings avec suivi GPS, calcul de VMA et coach vocal intégré.</p>
          </div>
        </div>

        <div className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-2xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">BoxWars & WODs</h4>
            <p className="text-[11px] text-neutral-400">Enregistre tes scores de CrossFit ou de muscu et affronte ton spot local dans la ligue.</p>
          </div>
        </div>

        <div className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-2xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Plan Hybride & Récupération</h4>
            <p className="text-[11px] text-neutral-400">Génère ton plan d'entraînement sur-mesure et consulte ton générateur de WOD selon ton énergie.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleDismiss}
        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" /> J'ai compris, c'est parti 🚀
      </button>
    </div>
  );
}
