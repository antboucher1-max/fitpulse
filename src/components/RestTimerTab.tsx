import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, Minus, Sparkles, Bot, Volume2, VolumeX } from 'lucide-react';

export default function RestTimerTab() {
  const [secondsLeft, setSecondsLeft] = useState(90); // 1 min 30 par défaut
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(90);
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  // Synthèse vocale pour le coach de repos
  const speakMessage = (text: string) => {
    if (!isVoiceActive) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        // Annonces vocales à 30s, 10s et fin
        if (secondsLeft === 30) {
          speakMessage("Plus que 30 secondes de repos. Prépare ta prochaine série.");
        } else if (secondsLeft === 10) {
          speakMessage("10 secondes.");
        }
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      speakMessage("Temps de repos terminé. Au travail !");
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 300]);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, isVoiceActive]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = (duration: number) => {
    setIsActive(false);
    setSecondsLeft(duration);
    setTotalTime(duration);
  };

  const adjustTime = (amount: number) => {
    const newTime = Math.max(10, secondsLeft + amount);
    setSecondsLeft(newTime);
    setTotalTime(newTime);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = ((totalTime - secondsLeft) / totalTime) * 100;

  return (
    <div className="space-y-5 pb-16 animate-fadeIn">
      {/* Chronomètre Principal */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-center space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-orange-500" /> Chrono Repos Intelligent
          </h2>
          <button 
            onClick={() => setIsVoiceActive(!isVoiceActive)} 
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${isVoiceActive ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-neutral-800 text-neutral-400'}`}
            title="Activer/Désactiver le coach vocal"
          >
            {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isVoiceActive ? 'Coach Vocal ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Cercle du chrono */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-neutral-950 rounded-full border-4 border-neutral-800 shadow-inner">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 transition-all duration-1000" style={{ clipPath: `circle(${progressPercent}% at center)` }} />
          <div className="space-y-1 z-10">
            <span className="text-4xl font-black text-white tracking-wider block">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Restant</span>
          </div>
        </div>

        {/* Boutons de contrôle + / - */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => adjustTime(-15)} className="p-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-2xl border border-neutral-800 text-xs font-bold transition cursor-pointer">
            -15s
          </button>
          <button 
            onClick={toggleTimer} 
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition transform hover:scale-105 cursor-pointer ${isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-orange-600 hover:bg-orange-500'}`}
          >
            {isActive ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
          </button>
          <button onClick={() => adjustTime(15)} className="p-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-2xl border border-neutral-800 text-xs font-bold transition cursor-pointer">
            +15s
          </button>
        </div>

        {/* Raccourcis de durée */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <button onClick={() => resetTimer(45)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition cursor-pointer">45s</button>
          <button onClick={() => resetTimer(60)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition cursor-pointer">1 min</button>
          <button onClick={() => resetTimer(90)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition cursor-pointer">1m30</button>
          <button onClick={() => resetTimer(120)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition cursor-pointer">2 min</button>
        </div>

        <button onClick={() => resetTimer(totalTime)} className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl border border-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer">
          <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
        </button>
      </div>

      {/* ENCART FITBOT ACTIF */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-orange-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
         
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full border border-orange-500/30 uppercase">
              FitBot Active Coach ⚡
            </span>
            <h3 className="text-sm font-black text-white mt-1">Gestion du Système Nerveux</h3>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Le chronomètre vocal t'avertit à 30s et 10s de la fin de ta récupération pour maintenir ton rythme cardiaque optimal entre tes séries de force et d'hypertrophie.
        </p>

        <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-orange-400">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Optimisation de la récupération inter-séries activée.
        </div>
      </div>
    </div>
  );
}
