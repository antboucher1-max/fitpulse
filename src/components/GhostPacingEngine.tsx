import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Wind, Activity, Zap, Play, Square } from 'lucide-react';
import { audioCoach } from '../utils/audioCoach';

interface GhostPacingProps {
  currentVma: number;
}

export default function GhostPacingEngine({ currentVma }: GhostPacingProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(12.5); // km/h
  const [windFactor, setWindFactor] = useState<'Face (+12 km/h)' | 'Dos (-8 km/h)' | 'Calme'>('Face (+12 km/h)');
  const [coachingAdvice, setCoachingAdvice] = useState('Prêt à lancer le Ghost Pacing intelligent ?');

  // Synthèse vocale centralisée dans utils/audioCoach.ts (était dupliquée
  // ici, dans LiveCoachEngine.tsx et RestTimerTab.tsx).
  const speak = (text: string) => {
    if (!voiceEnabled) return;
    audioCoach.speak(text);
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        // Simulation dynamique de l'ajustement d'allure selon le vent et l'effort
        const adjustedPace = windFactor.includes('Face') ? 'Ralentis de 5 secondes au kilomètre, vent de face détecté.' : 'Bon rythme, tu es dans ta cible d’affûtage marathon.';
        setCoachingAdvice(adjustedPace);
        speak(adjustedPace);
      }, 15000); // Conseil toutes les 15 secondes en simulation
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, windFactor, voiceEnabled]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-black text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4" /> Mode Ghost Pacing Intelligent (Audio & Vent)
        </div>
        <button 
          type="button"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="p-2 bg-neutral-950 rounded-xl text-neutral-300 hover:text-white transition cursor-pointer"
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
          <span className="text-neutral-400 flex items-center gap-1 font-bold"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Vent Réel (Météo)</span>
          <select 
            value={windFactor} 
            onChange={(e: any) => setWindFactor(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white mt-1 cursor-pointer"
          >
            <option value="Face (+12 km/h)">Vent de face fort (+12 km/h)</option>
            <option value="Dos (-8 km/h)">Vent de dos favorable</option>
            <option value="Calme">Conditions calmes</option>
          </select>
        </div>

        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-400 flex items-center gap-1 font-bold"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Allure Cible</span>
          <span className="text-lg font-black text-white">{currentSpeed} <strong className="text-xs font-normal text-neutral-400">km/h</strong></span>
        </div>
      </div>

      {/* Boîte de conseil proactif de l'IA */}
      <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
          🗣️
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 block">Conseil vocal en direct</span>
          <p className="text-xs text-neutral-200 leading-snug">{coachingAdvice}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          const nextState = !isRunning;
          setIsRunning(nextState);
          if (nextState) {
            speak("Démarrage du Ghost Pacing. Analyse météo et cardiaque activée. Bonne course !");
          } else {
            speak("Session de course en pause.");
          }
        }}
        className={`w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
          isRunning ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'
        }`}
      >
        {isRunning ? <><Square className="w-4 h-4 fill-current" /> Arrêter la course</> : <><Play className="w-4 h-4 fill-current" /> Lancer le Ghost Pacing Vocal</>}
      </button>
    </div>
  );
}
