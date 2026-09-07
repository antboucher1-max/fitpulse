import { useState, useEffect } from 'react';
import { Activity, Dumbbell, Flame, Plus, Trash2, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface UnifiedSession {
  id: string;
  type: 'run' | 'gym' | 'fitcross';
  title: string;
  durationMins: number;
  rpe: number;
}

interface UnifiedTriptychProps {
  currentUserId?: string;
}

export default function UnifiedTriptychModule({ currentUserId }: UnifiedTriptychProps) {
  const [sessions, setSessions] = useState<UnifiedSession[]>(() => {
    const saved = localStorage.getItem('fitpulse_triptych_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: '1', type: 'run', title: 'Sortie Longue / Seuil', durationMins: 55, rpe: 8 },
      { id: '2', type: 'gym', title: 'Squat & Force Athlétique', durationMins: 75, rpe: 9 },
      { id: '3', type: 'fitcross', title: 'WOD Métabolique (Fran)', durationMins: 20, rpe: 10 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('fitpulse_triptych_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'run' | 'gym' | 'fitcross'>('run');
  const [newDuration, setNewDuration] = useState(45);
  const [newRpe, setNewRpe] = useState(7);
  const [saving, setSaving] = useState(false);

  const calculateUnifiedLoad = (sessionList: UnifiedSession[]) => {
    let totalLoad = 0;
    sessionList.forEach(session => {
      let multiplier = 1.0;
      if (session.type === 'run') multiplier = 1.2;
      if (session.type === 'gym') multiplier = 1.0;
      if (session.type === 'fitcross') multiplier = 1.4;
      totalLoad += session.durationMins * session.rpe * multiplier;
    });
    return Math.round(totalLoad);
  };

  const currentLoad = calculateUnifiedLoad(sessions);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: UnifiedSession = {
      id: Date.now().toString(),
      type: newType,
      title: newTitle.trim(),
      durationMins: Number(newDuration),
      rpe: Number(newRpe)
    };

    setSessions(prev => [newItem, ...prev]);
    setNewTitle('');
  };

  const handleRemove = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleSyncCloud = async () => {
    if (!currentUserId) return;
    setSaving(true);
    const { error } = await supabase.from('unified_loads').insert([{
      user_id: currentUserId,
      total_load: currentLoad,
      sessions_data: sessions,
      date: new Date().toISOString()
    }]);
    setSaving(false);
    if (!error) alert("⚡ Charge unifiée synchronisée sur le Cloud !");
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
          <Activity className="w-4 h-4" /> Le Triptyque Unifié
        </div>
        <span className="text-xs font-mono bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20 font-bold">
          {currentLoad} pts globaux
        </span>
      </div>

      {/* Mini Badges d'impact */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60 text-center">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Running</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">x1.2 Impact</span>
        </div>
        <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60 text-center">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Muscu</span>
          <span className="text-xs font-mono text-orange-400 font-bold">x1.0 Force</span>
        </div>
        <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60 text-center">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Fitcross</span>
          <span className="text-xs font-mono text-cyan-400 font-bold">x1.4 WOD</span>
        </div>
      </div>

      {/* Ajout rapide */}
      <form onSubmit={handleAddSession} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800/80 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input 
            type="text" 
            placeholder="Intitulé de la brique..." 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 sm:col-span-1"
            required
          />
          <select 
            value={newType} 
            onChange={(e: any) => setNewType(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="run">Running</option>
            <option value="gym">Musculation</option>
            <option value="fitcross">Fitcross</option>
          </select>
          <input 
            type="number" 
            placeholder="Min" 
            value={newDuration} 
            onChange={e => setNewDuration(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-orange-500"
          />
          <input 
            type="number" 
            placeholder="RPE (1-10)" 
            value={newRpe} 
            onChange={e => setNewRpe(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-orange-500"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Ajouter la brique
        </button>
      </form>

      {/* Liste compacte */}
      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
        {sessions.map(s => (
          <div key={s.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${s.type === 'run' ? 'bg-emerald-400' : s.type === 'gym' ? 'bg-orange-500' : 'bg-cyan-400'}`} />
              <div>
                <h4 className="font-bold text-xs text-white">{s.title}</h4>
                <p className="text-[10px] text-neutral-400">{s.durationMins} min • RPE {s.rpe}/10 • {String(s.type).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={() => handleRemove(s.id)} className="p-1 text-neutral-500 hover:text-red-400 rounded transition cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSyncCloud}
        disabled={saving}
        className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
      >
        <Zap className="w-3.5 h-3.5 text-orange-400" /> {saving ? "Sync..." : "Synchroniser le Triptyque"}
      </button>
    </div>
  );
}
