import { useState } from 'react';
import { Zap, Activity, Dumbbell, RefreshCw, Flame, BatteryWarning, ArrowLeft } from 'lucide-react';

const WOD_DATABASE = {
  high: [
    { title: "Le Faiseur de Veuves", type: "AMRAP 20 min", focus: "Full Body / Cardio", description: "5 Pull-ups, 10 Push-ups, 15 Air Squats. Un maximum de tours en 20 minutes." },
    { title: "Force Pure : Push", type: "Heavy Lifting", focus: "Hypertrophie", description: "Bench Press 5x5 lourd. Strict Press 4x8. Dips lestés 3xMax." },
    { title: "Engine Builder", type: "EMOM 24 min", focus: "Cardio Hybride", description: "Min 1: 15 Cal Row. Min 2: 15 Burpees. Min 3: 20 Kettlebell Swings. Min 4: Repos." }
  ],
  medium: [
    { title: "Cross-Training Express", type: "For Time", focus: "Conditioning", description: "21-15-9 : Kettlebell Swings (24/16kg) & Box Jumps." },
    { title: "Pump & Run", type: "Hybride", focus: "Haut du corps + Aérobie", description: "Circuit 4 tours : 15 Pompes, 15 Tirages anneaux, suivi de 10 min de footing souple." },
    { title: "Core & Stability", type: "Circuit 15 min", focus: "Sangle abdominale", description: "45s effort / 15s repos : Plank, Russian Twists, Hollow Hold, Superman." }
  ],
  low: [
    { title: "Active Recovery Flow", type: "Mobilité", focus: "Récupération", description: "20 minutes de Yoga flow continu, focus sur l'ouverture de hanches et la colonne." },
    { title: "Flush Run", type: "Cardio Léger", focus: "Décrassage", description: "20 à 30 minutes de footing très lent (Zone 2) + 5 min d'étirements." },
    { title: "Joint Prep", type: "Renforcement profond", focus: "Prévention blessure", description: "Travail unilatéral léger : fentes bulgares au poids du corps, rotations d'épaules élastique." }
  ]
};

interface WodGeneratorProps {
  onAcceptWod?: (wod: any) => void;
  onBack?: () => void;
}

export default function WodGenerator({ onAcceptWod, onBack }: WodGeneratorProps) {
  const [generatedWod, setGeneratedWod] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulatedReadiness, setSimulatedReadiness] = useState<'high' | 'medium' | 'low'>('medium');

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedWod(null);

    // Simulation d'un temps de calcul de l'IA basé sur la récupération
    setTimeout(() => {
      const wods = WOD_DATABASE[simulatedReadiness];
      const randomWod = wods[Math.floor(Math.random() * wods.length)];
      setGeneratedWod(randomWod);
      setIsGenerating(false);
    }, 1200);
  };

  const handleAccept = () => {
    if (onAcceptWod && generatedWod) {
      onAcceptWod(generatedWod);
    }
    alert("Séance enregistrée dans ton planning du jour ! 🚀");
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl relative">
      
      {/* 🔙 BOUTON RETOUR */}
      {onBack && (
        <button 
          type="button" 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer w-fit mb-1"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" /> Générateur de Séance
        </h3>
        {generatedWod && (
          <button onClick={() => setGeneratedWod(null)} className="text-[10px] text-neutral-400 font-bold hover:text-white flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Réinitialiser
          </button>
        )}
      </div>

      {!generatedWod ? (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-neutral-400">
            Pas d'inspi aujourd'hui ? Indique ton niveau d'énergie actuel et laisse l'algorithme te proposer un WOD ou une séance croisée adaptée.
          </p>

          <div className="flex gap-2">
            <button onClick={() => setSimulatedReadiness('high')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${simulatedReadiness === 'high' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-700'}`}>
              En pleine forme
            </button>
            <button onClick={() => setSimulatedReadiness('medium')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${simulatedReadiness === 'medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-700'}`}>
              Moyen
            </button>
            <button onClick={() => setSimulatedReadiness('low')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${simulatedReadiness === 'low' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-700'}`}>
              Courbaturé
            </button>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analyse de ta récupération...</>
            ) : (
              <><Dumbbell className="w-4 h-4" /> Propose-moi une séance ⚡</>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3 animate-scaleUp">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              {generatedWod.type}
            </span>
            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
              {simulatedReadiness === 'high' ? <Flame className="w-3 h-3 text-emerald-500" /> : simulatedReadiness === 'low' ? <BatteryWarning className="w-3 h-3 text-red-500" /> : <Activity className="w-3 h-3 text-orange-500" />}
              Focus : {generatedWod.focus}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-black text-white">{generatedWod.title}</h4>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              {generatedWod.description}
            </p>
          </div>

          <button 
            onClick={handleAccept}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition border border-neutral-700 cursor-pointer"
          >
            Accepter cette séance ✅
          </button>
        </div>
      )}
    </div>
  );
}
