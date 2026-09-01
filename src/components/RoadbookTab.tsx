import { useState, useEffect, FormEvent } from 'react';
import { Flag, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RoadbookTab({ currentUserId }: { currentUserId?: string }) {
  const [raceName, setRaceName] = useState('Semi de Tournai');
  const [distanceKm, setDistanceKm] = useState<number>(21.1);
  const [targetPaceMin, setTargetPaceMin] = useState<number>(5);
  const [targetPaceSec, setTargetPaceSec] = useState<number>(0);
  const [savedRoadbooks, setSavedRoadbooks] = useState<any[]>([]);
  const [selectedRoadbook, setSelectedRoadbook] = useState<any>(null);

  const fetchRoadbooks = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('race_roadbooks')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });
    if (data) setSavedRoadbooks(data);
  };

  useEffect(() => {
    fetchRoadbooks();
  }, [currentUserId]);

  const handleCreateRoadbook = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    const totalSecondsPerKm = targetPaceMin * 60 + targetPaceSec;

    const { data, error } = await supabase
      .from('race_roadbooks')
      .insert([{
        user_id: currentUserId,
        race_name: raceName,
        distance_km: distanceKm,
        target_pace_seconds: totalSecondsPerKm
      }])
      .select()
      .single();

    if (!error && data) {
      setSelectedRoadbook(data);
      fetchRoadbooks();
    } else {
      alert("Erreur lors de la création du roadbook : " + error?.message);
    }
  };

  const generateSplits = (totalDist: number, paceSec: number) => {
    const splits = [];
    let cumulativeTime = 0;
    const maxKm = Math.ceil(totalDist);

    for (let km = 1; km <= maxKm; km++) {
      const isPartial = km > totalDist;
      const factor = isPartial ? totalDist - (km - 1) : 1;
      const kmTime = paceSec * factor;
      cumulativeTime += kmTime;

      const formatTime = (totalSec: number) => {
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = Math.floor(totalSec % 60);
        if (hrs > 0) {
          return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      };

      splits.push({
        km: isPartial ? totalDist : km,
        splitTime: formatTime(kmTime),
        cumulativeTime: formatTime(cumulativeTime)
      });
    }
    return splits;
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Flag className="w-4 h-4" /> Roadbook & Stratégie de Course
        </div>
      </div>

      {!selectedRoadbook ? (
        <div className="space-y-4">
          <form onSubmit={handleCreateRoadbook} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Nom de la course :</label>
              <input 
                type="text" 
                value={raceName} 
                onChange={(e) => setRaceName(e.target.value)} 
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Distance (km) :</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={distanceKm} 
                  onChange={(e) => setDistanceKm(Number(e.target.value))} 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Allure cible (min/km) :</label>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={targetPaceMin} 
                    onChange={(e) => setTargetPaceMin(Number(e.target.value))} 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2.5 text-xs text-white text-center" 
                  />
                  <span className="text-neutral-400 text-xs">min</span>
                  <input 
                    type="number" 
                    value={targetPaceSec} 
                    onChange={(e) => setTargetPaceSec(Number(e.target.value))} 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2.5 text-xs text-white text-center" 
                  />
                  <span className="text-neutral-400 text-xs">s</span>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-extrabold rounded-2xl text-xs transition shadow-lg">
              Calculer mon plan de course 🎯
            </button>
          </form>

          {savedRoadbooks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Roadbooks enregistrés :</h4>
              {savedRoadbooks.map((rb) => (
                <div key={rb.id} className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{rb.race_name}</span>
                    <span className="text-[10px] text-neutral-400">{rb.distance_km} km • Allure : {Math.floor(rb.target_pace_seconds / 60)}:{(rb.target_pace_seconds % 60).toString().padStart(2, '0')}/km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedRoadbook(rb)} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
                      Voir
                    </button>
                    <button onClick={async () => {
                      await supabase.from('race_roadbooks').delete().eq('id', rb.id);
                      fetchRoadbooks();
                    }} className="p-1.5 text-neutral-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Stratégie Active</span>
              <span className="text-sm font-black text-white">{selectedRoadbook.race_name} ({selectedRoadbook.distance_km} km)</span>
            </div>
            <button onClick={() => setSelectedRoadbook(null)} className="text-[11px] text-neutral-400 underline hover:text-white">
              Retour
            </button>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-2.5">Km</th>
                  <th className="p-2.5">Temps km</th>
                  <th className="p-2.5 text-right">Chronomètre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {generateSplits(selectedRoadbook.distance_km, selectedRoadbook.target_pace_seconds).map((split, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/50">
                    <td className="p-2.5 font-bold text-emerald-400">Km {split.km}</td>
                    <td className="p-2.5 text-neutral-300">{split.splitTime}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-white">{split.cumulativeTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
