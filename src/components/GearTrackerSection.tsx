import { useState, FormEvent } from 'react';
import { Footprints, Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface GearTrackerProps {
  shoes: any[];
  onAddShoe: (brand: string, model: string, maxKm: number) => void;
  onDeleteShoe: (shoeId: string) => void;
  onSetActiveShoe: (shoeId: string) => void;
}

export default function GearTrackerSection({ shoes, onAddShoe, onDeleteShoe, onSetActiveShoe }: GearTrackerProps) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [maxKm, setMaxKm] = useState(700);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) return;
    onAddShoe(brand.trim(), model.trim(), Number(maxKm));
    setBrand('');
    setModel('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-400" /> Mes Chaussures (Gear Tracker)
        </h3>
        <button 
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder="Marque (ex: Nike)" 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)} 
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
              required 
            />
            <input 
              type="text" 
              placeholder="Modèle (ex: Pegasus)" 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
              required 
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-400">Limite d'usure (km) :</span>
            <input 
              type="number" 
              value={maxKm} 
              onChange={(e) => setMaxKm(Number(e.target.value))} 
              className="w-24 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white text-center"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition">
            Enregistrer la paire
          </button>
        </form>
      )}

      <div className="space-y-3">
        {shoes.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4">Aucune paire enregistrée. Suis l'usure de tes chaussures pour éviter les blessures !</p>
        ) : (
          shoes.map((shoe) => {
            const percentage = Math.min(100, Math.round((shoe.current_km / shoe.max_km) * 100));
            const isCritical = percentage >= 85;

            return (
              <div key={shoe.id} className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{shoe.brand} {shoe.model}</span>
                      {shoe.is_active && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active 🏃‍♂️
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400">
                      {shoe.current_km} / {shoe.max_km} km ({percentage}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!shoe.is_active && (
                      <button 
                        type="button"
                        onClick={() => onSetActiveShoe(shoe.id)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs transition"
                        title="Définir comme paire active"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => onDeleteShoe(shoe.id)}
                      className="p-1.5 bg-neutral-900 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isCritical ? 'bg-red-500 animate-pulse' : percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {isCritical && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-semibold bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Amorti critique ! Pense à changer de paire.
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
