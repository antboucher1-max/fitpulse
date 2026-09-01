import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function WodTimerTab() {
  const [mode, setMode] = useState<'FOR_TIME' | 'AMRAP'>('FOR_TIME');
  const [time, setTime] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => mode === 'FOR_TIME' ? prev + 1 : (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-3xl text-center shadow-xl border border-neutral-800 animate-fadeIn mt-4">
      <h2 className="text-xl font-black text-white mb-6">Smart Timer</h2>
      
      <div className="flex justify-center gap-4 mb-6 bg-neutral-950 p-2 rounded-2xl">
        <button onClick={() => { setMode('FOR_TIME'); setTime(0); setIsRunning(false); }} className={`flex-1 py-3 rounded-xl font-bold text-xs transition ${mode === 'FOR_TIME' ? 'bg-cyan-600 text-white shadow-lg' : 'text-neutral-400'}`}>For Time</button>
        <button onClick={() => { setMode('AMRAP'); setTime(600); setIsRunning(false); }} className={`flex-1 py-3 rounded-xl font-bold text-xs transition ${mode === 'AMRAP' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400'}`}>AMRAP (10m)</button>
      </div>
      
      <div className={`text-7xl font-black tracking-widest my-8 font-mono ${isRunning ? 'text-cyan-400' : 'text-white'}`}>
        {formatTime(time)}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={() => setIsRunning(!isRunning)} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition">
          {isRunning ? <Pause className="fill-white" /> : <Play className="fill-white" />} {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setIsRunning(false); setTime(mode === 'AMRAP' ? 600 : 0); }} className="px-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl transition active:scale-95">
          <RotateCcw />
        </button>
      </div>
    </div>
  );
}
