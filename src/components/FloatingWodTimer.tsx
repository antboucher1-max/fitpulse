import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';

interface FloatingWodTimerProps {
  onClose?: () => void;
}

export default function FloatingWodTimer({ onClose }: FloatingWodTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [targetSeconds] = useState(60);

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
    <div className="bg-neutral-900 border border-orange-500/50 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
      <div className="flex items-center gap-2 pl-1">
        <Timer className="w-4 h-4 text-orange-500 animate-pulse" />
        <div>
          <span className="text-[9px] text-neutral-400 font-bold uppercase block tracking-wider">Chrono WOD</span>
          <span className="text-base font-black text-white font-mono">{formatTime(seconds)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 pl-1 border-l border-neutral-800">
        <button
          onClick={toggleTimer}
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white transition cursor-pointer ${
            isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-orange-600 hover:bg-orange-500'
          }`}
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={resetTimer}
          className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-neutral-800/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
