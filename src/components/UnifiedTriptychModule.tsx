import { useState } from 'react';
import { Activity, Dumbbell, Flame, Plus, Trash2, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface UnifiedSession {
  id: string;
  type: 'run' | 'gym' | 'fitcross';
  title: string;
  durationMins: number;
  rpe: number; // de 1 à 10
}

interface UnifiedTriptychProps {
  currentUserId?: string;
}

export default function UnifiedTriptychModule({ currentUserId }: UnifiedTriptychProps) {
  const [sessions, setSessions] = useState<UnifiedSession[]>([
    { id: '1', type: 'run', title: 'Sortie Longue / Seuil', durationMins: 55, rpe: 8 },
    { id: '2', type: 'gym', title: 'Squat & Force Athlétique', durationMins: 75, rpe: 9 },
    { id: '3', type: 'fitcross', title: 'WOD Métabolique (Fran)', durationMins: 20, rpe: 10 }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'run' | 'gym' | 'fitcross'>('run');
  const [newDuration, setNewDuration] = useState(45);
  const [newRpe, setNewRpe] = useState(7);
  const [saving, setSaving] = useState(false);

  // Moteur de calcul de la charge unifiée avec multiplicateurs d'impact
  const calculateUnifiedLoad = (sessionList: UnifiedSession[]) => {
    let totalLoad = 0;
    sessionList.forEach(session => {
      let multiplier = 1.0;
      if (session.type === 'run') multiplier = 1.2;      // Impact orthopédique et tendineux
      if (session.type === 'gym') multiplier = 1.0;      // Tension mécanique pure
      if (session.type === 'fitcross') multiplier = 1.4; // Métabolique et neuromusculaire combiné
      
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
    if (!currentUserId) {
      alert("Utilisateur non connecté.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('unified_loads').insert([{
      user_id: currentUserId,
      total_load: currentLoad,
      sessions_data: sessions,
      date: new Date().toISOString()
    }]);

    setSaving(false);
    if (!error) {
      alert("⚡ Charge unifiée synchronisée avec succès sur le Cloud Supabase !");
    } else {
      alert("Erreur lors de la synchronisation : " + error.message);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
          <Activity className="w-4 h-4" /> Pilier 1 : Le Triptyque Unifié
        </div>
        <span className="text-xs font-mono bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">
          Charge Totale : <strong className="text-white">{currentLoad} pts</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">🏃‍♂️</div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Running / Trail</span>
            <span className="text-xs font-bold text-white">Impact Tendineux (x1.2)</span>
          </div>
        </div>
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold"><Dumbbell className="w-4 h-4" /></div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Musculation</span>
            <span className="text-xs font-bold text-white">Tension Mécanique (x1.0)</span>
          </div>
        </div>
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold"><Flame className="w-4 h-4" /></div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Fitcross / WOD</span>
            <span className="text-xs font-bold text-white">Métabolique Pur (x1.4)</span>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout de session */}
      <form onSubmit={handleAddSession} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">Ajouter une brique d'entraînement :</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input 
            type="text" 
            placeholder="Nom (ex: Intervalles VMA)..." 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 sm:col-span-1"
            required
          />
          <select 
            value={newType} 
            onChange={(e: any) => setNewType(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            <option value="run">Running / Trail</option>
            <option value="gym">Musculation</option>
            <option value="fitcross">Fitcross / WOD</option>
          </select>
          <input 
            type="number" 
            placeholder="Durée (min)" 
            value={newDuration} 
            onChange={e => setNewDuration(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 text-center"
            min="5" max="360"
          />
          <input 
            type="number" 
            placeholder="RPE (1-10)" 
            value={newRpe} 
            onChange={e => setNewRpe(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 text-center"
            min="1" max="10"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1">
          <Plus className="w-4 h-4" /> Enregistrer dans la charge unifiée
        </button>
      </form>

      {/* Liste des sessions actives */}
      <div className="space-y-2">
        {sessions.map(s => (
          <div key={s.id} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${s.type === 'run' ? 'bg-emerald-400' : s.type === 'gym' ? 'bg-orange-500' : 'bg-cyan-400'}`} />
              <div>
                <h4 className="font-bold text-xs text-white">{s.title}</h4>
                <p className="text-[10px] text-neutral-400">{s.durationMins} min • RPE {s.rpe}/10 • Type : {s.toUpperCase?.() || s.type}</p>
              </div>
            </div>
            <button onClick={() => handleRemove(s.id)} className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSyncCloud}
        disabled={saving}
        className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-inner flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 text-orange-400" /> {saving ? "Synchronisation..." : "Sauvegarder le Triptyque sur le Cloud"}
      </button>
    </div>
  );
}
