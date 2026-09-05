import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, Clock } from 'lucide-react';

interface WodTimerTabProps {
  onBack?: () => void;
}

export default function WodTimerTab({ onBack }: WodTimerTabProps) {
  const [mode, setMode] = useState<'FOR_TIME' | 'AMRAP'>('FOR_TIME');
  const [time, setTime] = useState(0); 
  const [amrapDuration, setAmrapDuration] = useState(600); // 10 minutes par défaut (en secondes)
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (mode === 'FOR_TIME') {
            return prev + 1;
          } else {
            if (prev > 0) return prev - 1;
            setIsRunning(false);
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleModeChange = (newMode: 'FOR_TIME' | 'AMRAP', durationSecs = 600) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'FOR_TIME') {
      setTime(0);
    } else {
      setAmrapDuration(durationSecs);
      setTime(durationSecs);
    }
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-3xl text-center shadow-xl border border-neutral-800 animate-fadeIn mt-4 relative">
      {onBack && (
        <button 
          type="button" 
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      )}

      <h2 className="text-xl font-black text-white mb-6 pt-2">Smart Timer</h2>
      
      {/* Sélecteur de mode */}
      <div className="flex justify-center gap-2 mb-4 bg-neutral-950 p-2 rounded-2xl">
        <button 
          onClick={() => handleModeChange('FOR_TIME')} 
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${mode === 'FOR_TIME' ? 'bg-cyan-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
        >
          For Time (Chrono)
        </button>
        <button 
          onClick={() => handleModeChange('AMRAP', amrapDuration)} 
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${mode === 'AMRAP' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
        >
          AMRAP (Compte à rebours)
        </button>
      </div>

      {/* Options de durée si mode AMRAP */}
      {mode === 'AMRAP' && (
        <div className="space-y-2 mb-4">
          <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-orange-500" /> Choisir la durée de l'AMRAP :
          </span>
          <div className="flex justify-center gap-2">
            {[300, 600, 900, 1200].map((secs) => (
              <button
                key={secs}
                type="button"
                onClick={() => {
                  setAmrapDuration(secs);
                  setTime(secs);
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  amrapDuration === secs 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {secs / 60} min
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className={`text-7xl font-black tracking-widest my-8 font-mono ${isRunning ? (mode === 'AMRAP' ? 'text-orange-400 animate-pulse' : 'text-cyan-400') : 'text-white'}`}>
        {formatTime(time)}
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setIsRunning(!isRunning)} 
          className={`flex-1 py-4 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition cursor-pointer ${
            isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isRunning ? <Pause className="fill-white w-5 h-5" /> : <Play className="fill-white w-5 h-5" />} 
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button 
          onClick={() => { 
            setIsRunning(false); 
            setTime(mode === 'AMRAP' ? amrapDuration : 0); 
          }} 
          className="px-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl transition active:scale-95 cursor-pointer flex items-center justify-center"
          title="Réinitialiser"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
