import { useState, useEffect } from 'react';
import { Activity, Dumbbell, Flame, Plus, Trash2, Zap, RefreshCcw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAppState, UnifiedSession } from '../context/AppStateContext';

interface UnifiedTriptychProps {
  currentUserId?: string;
}

export default function UnifiedTriptychModule({ currentUserId }: UnifiedTriptychProps) {
  // Les sessions et la charge globale vivent maintenant dans AppStateContext,
  // partagées avec App.tsx (et bientôt tout le reste de l'app) sans polling :
  // toute modification ici se répercute instantanément partout ailleurs.
  const { sessions, setSessions, addSession, removeSession, trainingLoad: currentLoad } = useAppState();

  // Import automatique ponctuel des logs de musculation au premier montage
  // (fusionne avec les sessions déjà en state, sans écraser ce qui existe).
  useEffect(() => {
    const savedGymLogs = localStorage.getItem('fitpulse_gym_logs');
    if (!savedGymLogs) return;
    try {
      const parsedGym = JSON.parse(savedGymLogs);
      setSessions(prev => {
        const updated = [...prev];
        parsedGym.forEach((log: any) => {
          const title = log.exerciseName || log.sessionTitle || 'Séance Musculation (Auto)';
          if (!updated.some(s => s.title === title)) {
            updated.push({
              id: `gym-auto-${log.id || Math.random()}`,
              type: 'gym',
              title,
              durationMins: Number(log.durationMins || 60),
              rpe: Number(log.rpe || 8)
            });
          }
        });
        return updated;
      });
    } catch (e) { /* ignore */ }
    // NOTE : GymLogTab écrit encore dans localStorage plutôt que dans le state
    // partagé. Une fois GymLogTab migré sur AppStateContext lui aussi, cet
    // import ponctuel pourra être remplacé par une lecture directe du state,
    // sans passer par localStorage. En attendant, on ne fait plus de polling :
    // l'import se fait une fois au montage, ce qui suffit pour l'usage actuel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'run' | 'gym' | 'fitcross'>('run');
  const [newDuration, setNewDuration] = useState(45);
  const [newRpe, setNewRpe] = useState(7);
  const [saving, setSaving] = useState(false);

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

    addSession(newItem);
    setNewTitle('');
  };

  const handleRemove = (id: string) => {
    removeSession(id);
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
          <Activity className="w-4 h-4" /> Le Triptyque Unifié (Auto-Sync)
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

      {/* Ajout rapide optionnel */}
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
          <Plus className="w-3.5 h-3.5" /> Ajouter manuellement la brique
        </button>
      </form>

      {/* Liste compacte */}
      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
        {sessions.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4">Aucune brique active. Votre charge globale est à 0.</p>
        ) : (
          sessions.map(s => (
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
          ))
        )}
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
