import { useState } from 'react';
import { generateBioSyncPrescription } from './BioSyncEngine';
import { Sparkles, ArrowLeft, Utensils, Zap, Clock, ShieldCheck } from 'lucide-react';

interface BioSyncTabProps {
  currentSncScore?: number;
  onBack: () => void;
}

export default function BioSyncTab({ currentSncScore = 75, onBack }: BioSyncTabProps) {
  const [sessionType, setSessionType] = useState<'running' | 'crossfit' | 'muscu' | 'repos'>('running');
  const [fridgeInput, setFridgeInput] = useState('riz blanc, œufs, avocat, épinards, poulet');
  const [prescription, setPrescription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunBioSync = () => {
    setIsLoading(true);
    setTimeout(() => {
      const items = fridgeInput.split(',').map(i => i.trim()).filter(Boolean);
      const res = generateBioSyncPrescription({
        sessionType,
        sncScore: currentSncScore,
        fridgeItems: items
      });
      setPrescription(res);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      <button 
        type="button" 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* En-tête */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" /> Bio-Sync Window (Chronobiologie)
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Exclusivité FitPulse 🧬
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed relative z-10">
          L'IA analyse ton type de séance et ton niveau de fatigue nerveuse (SNC) pour déterminer l'<strong>ordre chronologique exact</strong> d'ingestion des aliments de ton frigo. Zéro hasard, performance maximale.
        </p>
      </div>

      {/* Formulaire de saisie du frigo et du type de séance */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-300">Sélectionne la séance du jour :</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'running', label: '🏃‍♂️ Course / Endurance' },
              { id: 'crossfit', label: '🥵 CrossFit / WOD' },
              { id: 'muscu', label: '🏋️‍♂️ Musculation' },
              { id: 'repos', label: '🛌 Repos / Actif' },
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSessionType(s.id as any)}
                className={`p-2.5 rounded-2xl border text-xs font-black transition cursor-pointer ${
                  sessionType === s.id ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-300">Qu'y a-t-il dans ton frigo ? (Séparés par des virgules)</label>
          <input
            type="text"
            value={fridgeInput}
            onChange={(e) => setFridgeInput(e.target.value)}
            placeholder="Ex: riz blanc, œufs, avocat, épinards..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleRunBioSync}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-xl disabled:opacity-50"
        >
          {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Utensils className="w-4 h-4" />}
          {isLoading ? "Synchronisation métabolique..." : "Générer la Fenêtre Bio-Sync 🥗"}
        </button>
      </div>

      {/* Résultat de la prescription */}
      {prescription && (
        <div className="bg-neutral-900 border border-emerald-500/40 rounded-3xl p-6 space-y-5 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-emerald-300">{prescription.title}</h3>
              <p className="text-[10px] text-neutral-400 font-semibold">{prescription.metabolicPriority}</p>
            </div>
            <span className="text-xs bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-full text-white font-mono">
              SNC : {currentSncScore}%
            </span>
          </div>

          {/* Séquencement temporel (L'ordre exact) */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block">
              Séquencement d'ingestion recommandé :
            </span>
            <div className="space-y-2.5">
              {prescription.timingSteps.map((step: any) => (
                <div key={step.stepNumber} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Étape {step.stepNumber} : {step.timing}
                    </span>
                    <span className="font-bold text-white bg-neutral-900 px-2.5 py-0.5 rounded-lg border border-neutral-800">
                      {step.foodToEat}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed pt-1 border-t border-neutral-900">
                    🎯 <strong>Pourquoi ?</strong> {step.biologicalReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerte du Coach */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-200 leading-snug">
              {prescription.coachWarning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
