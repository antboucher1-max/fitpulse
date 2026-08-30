import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, Minus, Sparkles, Bot } from 'lucide-react';

export default function RestTimerTab() {
  const [secondsLeft, setSecondsLeft] = useState(90); // 1 min 30 par défaut
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(90);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

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
            <Timer className="w-5 h-5 text-orange-500" /> Chrono Repos
          </h2>
          <span className="text-xs text-orange-400 font-semibold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Entre les séries
          </span>
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
          <button onClick={() => adjustTime(-15)} className="p-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-2xl border border-neutral-800 text-xs font-bold transition">
            -15s
          </button>
          <button 
            onClick={toggleTimer} 
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition transform hover:scale-105 ${isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-orange-600 hover:bg-orange-500'}`}
          >
            {isActive ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
          </button>
          <button onClick={() => adjustTime(15)} className="p-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-2xl border border-neutral-800 text-xs font-bold transition">
            +15s
          </button>
        </div>

        {/* Raccourcis de durée */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <button onClick={() => resetTimer(45)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition">45s</button>
          <button onClick={() => resetTimer(60)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition">1 min</button>
          <button onClick={() => resetTimer(90)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition">1m30</button>
          <button onClick={() => resetTimer(120)} className="py-2.5 bg-neutral-950 hover:border-orange-500 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition">2 min</button>
        </div>

        <button onClick={() => resetTimer(totalTime)} className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl border border-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition">
          <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
        </button>
      </div>

      {/* ANNONCE / TEASING FITBOT */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-orange-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full border border-orange-500/30 uppercase">
              Bientôt disponible 🚀
            </span>
            <h3 className="text-sm font-black text-white mt-1">FitBot : Ton Coach IA</h3>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          La prochaine mise à jour de FitPulse intègrera <strong className="text-orange-400">FitBot</strong>, ton assistant intelligent personnel pour optimiser tes programmes de musculation, corriger tes mouvements et obtenir des conseils de nutrition sur-mesure !
        </p>

        <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Prépare-toi pour la prochaine mise à jour !
        </div>
      </div>
    </div>
  );
}
