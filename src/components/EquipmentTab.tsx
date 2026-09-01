import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EquipmentTab({ currentUserId }: { currentUserId?: string }) {
  const [shoes, setShoes] = useState<any[]>([]);
  const [modelName, setModelName] = useState('');
  const [maxKm, setMaxKm] = useState(800); // Seuil d'usure conseillé (ex: 800km)

  const fetchEquipment = async () => {
    if (!currentUserId) return;
    const { data } = await supabase.from('athlete_equipment').select('*').eq('user_id', currentUserId);
    if (data) setShoes(data);
  };

  useEffect(() => {
    fetchEquipment();
  }, [currentUserId]);

  const handleAddShoe = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !modelName.trim()) return;

    const { error } = await supabase.from('athlete_equipment').insert([{
      user_id: currentUserId,
      model: modelName.trim(),
      current_km: 0,
      max_km: maxKm,
      is_active: true
    }]);

    if (!error) {
      setModelName('');
      fetchEquipment();
    } else {
      alert("Erreur lors de l'ajout de l'équipement : " + error.message);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4" /> Gestionnaire de Matériel & Chaussures
      </div>

      <form onSubmit={handleAddShoe} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <h4 className="text-xs font-semibold text-white">Ajouter une nouvelle paire de chaussures</h4>
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Ex: Nike Pegasus 40" 
            value={modelName} 
            onChange={(e) => setModelName(e.target.value)} 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            required
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Km max conseillés (ex: 800)" 
              value={maxKm} 
              onChange={(e) => setMaxKm(Number(e.target.value))} 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
            <button type="submit" className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Mes paires enregistrées :</h4>
        {shoes.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4">Aucune paire enregistrée pour le moment.</p>
        ) : (
          shoes.map((item) => {
            const wearPercentage = Math.min(100, Math.round((item.current_km / item.max_km) * 100));
            const isWornOut = wearPercentage >= 85;

            return (
              <div key={item.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">{item.model}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWornOut ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {item.current_km} / {item.max_km} km
                  </span>
                </div>
                
                {/* Barre de progression d'usure */}
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isWornOut ? 'bg-red-500' : wearPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${wearPercentage}%` }}
                  />
                </div>

                {isWornOut && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-semibold pt-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Paire proche de l'usure maximale, risque de perte d'amorti !
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
