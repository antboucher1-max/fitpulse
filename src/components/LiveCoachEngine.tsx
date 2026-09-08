import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Wind, Droplets, Compass, Sparkles } from 'lucide-react';
import { audioCoach } from '../utils/audioCoach';

interface LiveCoachEngineProps {
  currentKm: number;
  currentPaceSeconds: number; // ex: 300 sec/km (5'00")
  isRunActive: boolean;
}

export default function LiveCoachEngine({ currentKm, currentPaceSeconds, isRunActive }: LiveCoachEngineProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [headwindSpeed, setHeadwindSpeed] = useState(18); // km/h simulé par GPS/Météo
  const [humidity, setHumidity] = useState(78); // % d'humidité
  const [adjustedPaceBonus, setAdjustedPaceBonus] = useState(12); // secondes ajoutées par km à cause des conditions

  // Synthèse vocale centralisée dans utils/audioCoach.ts (était dupliquée
  // ici, dans GhostPacingEngine.tsx et RestTimerTab.tsx).
  const speakCoachMessage = (message: string) => {
    if (!voiceEnabled) return;
    audioCoach.speak(message);
  };

  // Déclenchement automatique des rappels vocaux à chaque kilomètre franchi
  useEffect(() => {
    if (isRunActive && currentKm > 0) {
      const mins = Math.floor(currentPaceSeconds / 60);
      const secs = currentPaceSeconds % 60;
      const paceString = `${mins} minutes ${secs > 0 ? `${secs} secondes` : ''}`;
      
      let coachingTip = `Kilomètre ${currentKm} validé. Allure moyenne : ${paceString} du kilomètre. `;
      
      if (headwindSpeed > 15) {
        coachingTip += `Attention, vent de face estimé à ${headwindSpeed} kilomètres heure sur ce secteur. Ne force pas sur le cardio, garde ta foulée souple.`;
      } else {
        coachingTip += `Conditions météo optimales, continue sur ce rythme.`;
      }

      speakCoachMessage(coachingTip);
    }
  }, [currentKm, isRunActive]);

  const formatPace = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}'${s < 10 ? '0' : ''}${s}/km`;
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-4 space-y-3 shadow-xl relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* En-tête du module */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">Coach Vocal & Météo Adaptative</h4>
            <p className="text-[10px] text-neutral-400">Analyse GPS temps réel active</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            voiceEnabled ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'
          }`}
          title="Activer / Désactiver la voix du coach"
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[10px]">{voiceEnabled ? 'Voix ON' : 'Muté'}</span>
        </button>
      </div>

      {/* Paramètres environnementaux en direct */}
      <div className="grid grid-cols-3 gap-2 relative z-10 pt-1">
        <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-2xl text-center space-y-0.5">
          <span className="text-[9px] uppercase font-bold text-neutral-400 flex items-center justify-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" /> Vent Réel
          </span>
          <div className="text-xs font-black text-white">{headwindSpeed} km/h</div>
          <span className="text-[9px] text-amber-400">Face (Obstacle)</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-2xl text-center space-y-0.5">
          <span className="text-[9px] uppercase font-bold text-neutral-400 flex items-center justify-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" /> Humidité
          </span>
          <div className="text-xs font-black text-white">{humidity}%</div>
          <span className="text-[9px] text-neutral-500">Indice transpiration</span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-2xl text-center space-y-0.5">
          <span className="text-[9px] uppercase font-bold text-neutral-400 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400" /> Correction Allure
          </span>
          <div className="text-xs font-black text-emerald-400">+{adjustedPaceBonus}s</div>
          <span className="text-[9px] text-neutral-500">Ajustement IA</span>
        </div>
      </div>

      {/* Message de statut du coach */}
      <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-2xl text-[11px] text-neutral-300 leading-relaxed flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
        <span>
          {voiceEnabled 
            ? "Le coach vocal analyse ton profil et te parlera à chaque fin de kilomètre pour ajuster ton effort face au vent." 
            : "Le coach vocal est actuellement mis en sourdine."}
        </span>
      </div>

    </div>
  );
}
