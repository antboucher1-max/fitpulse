import { useState } from 'react';
import { Footprints, Droplet, Apple, Flame, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SurgicalAutomationModule() {
  // État Gear Tracker
  const [shoeKm, setShoeKm] = useState<number>(620);
  const maxShoeKm = 700;
  const lastRunKm = 12.5;

  // État Nutrition Post-WOD
  const bodyWeight = 70;
  const targetWater = Math.round((12.5 * 50) + 750);
  const targetCarbs = Math.round(bodyWeight * 1.2 + (12.5 * 4));
  const targetProtein = Math.round(bodyWeight * 0.4);

  // Moteur d'automatisation
  const processAutomatedPostWodSync = (kmAdded: number, currentKm: number, maxKm: number) => {
    const updatedKm = currentKm + kmAdded;
    const wearPercentage = Math.min(100, Math.round((updatedKm / maxKm) * 100));
    const isCritical = wearPercentage >= 85;

    return {
      newShoeKm: updatedKm,
      wearPercentage,
      alertMessage: isCritical ? "⚠️ Amorti critique atteint ! Risque de périostite accru sur votre prochaine sortie." : null
    };
  };

  const autoResult = processAutomatedPostWodSync(lastRunKm, shoeKm, maxShoeKm);

  const handleSimulateSync = () => {
    setShoeKm(autoResult.newShoeKm);
    alert(`🚀 Synchronisation automatique effectuée !\n- Compteur chaussures mis à jour : ${autoResult.newShoeKm} km\n- Ravitaillement post-effort verrouillé dans le Cloud.`);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest">
          <Footprints className="w-4 h-4" /> Pilier 4 : Automatisation Chirurgicale (Gear & Fuel-Lock)
        </div>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
          Zéro Friction
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bloc Gear Tracker Automatisé */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-400" /> Gear Tracker (Paire Active)
            </span>
            <span className="text-xs font-mono text-neutral-400">{shoeKm} / {maxShoeKm} km</span>
          </div>

          <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${autoResult.wearPercentage >= 85 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}
              style={{ width: `${autoResult.wearPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-neutral-400">
            Dernière sortie enregistrée : <strong className="text-white">+{lastRunKm} km</strong> (Usure actuelle : {autoResult.wearPercentage}%)
          </p>

          {autoResult.alertMessage && (
            <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-semibold bg-red-500/10 p-2 rounded-xl border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {autoResult.alertMessage}
            </div>
          )}
        </div>

        {/* Bloc Fuel-Lock Post-Effort */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-orange-500" /> Fuel-Lock Post-WOD
            </span>
            <span className="text-xs font-mono text-orange-400">Calcul Automatique</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
              <Droplet className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
              <span className="font-black text-white">{targetWater} ml</span>
              <span className="text-[9px] text-neutral-500 block">Eau + Sel</span>
            </div>
            <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
              <Apple className="w-3.5 h-3.5 text-orange-400 mx-auto mb-1" />
              <span className="font-black text-white">{targetCarbs} g</span>
              <span className="text-[9px] text-neutral-500 block">Glucides</span>
            </div>
            <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
              <Flame className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
              <span className="font-black text-white">{targetProtein} g</span>
              <span className="text-[9px] text-neutral-500 block">Protéines</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSimulateSync}
        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-xl flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" /> Exécuter l'Automatisation Chirurgicale & Verrouiller
      </button>
    </div>
  );
}
