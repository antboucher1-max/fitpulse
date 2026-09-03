import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';

interface FloatingWodTimerProps {
  onClose?: () => void;
}

export default function FloatingWodTimer({ onClose }: FloatingWodTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [targetSeconds, setTargetSeconds] = useState(60); // 1 min par défaut pour le repos

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (mode === 'countdown') {
            if (prev <= 1) {
              setIsActive(false);
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'countdown' ? targetSeconds : 0);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-orange-500/50 rounded-2xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md animate-slideUp">
      <div className="flex items-center gap-2 pl-2">
        <Timer className="w-5 h-5 text-orange-500 animate-pulse" />
        <div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Chrono WOD</span>
          <span className="text-lg font-black text-white font-mono">{formatTime(seconds)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
        <button
          onClick={toggleTimer}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition cursor-pointer ${
            isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-orange-600 hover:bg-orange-500'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={resetTimer}
          className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
