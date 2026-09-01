import { useState } from 'react';
import { Calendar, Target, CheckCircle, ArrowRight } from 'lucide-react';

export default function TrainingPlanTab() {
  const [goal, setGoal] = useState('10 km');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [planGenerated, setPlanGenerated] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setPlanGenerated(true);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5 shadow-xl animate-fadeIn">
      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
        <Calendar className="w-4 h-4" /> Plan d'Entraînement Intelligent
      </div>

      {!planGenerated ? (
        <form onSubmit={handleGenerate} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400">Quel est ton objectif principal ?</label>
            <select 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none"
            >
              <option value="5 km">Préparer un 5 km</option>
              <option value="10 km">Préparer un 10 km</option>
              <option value="Semi-Marathon">Préparer un Semi-Marathon</option>
              <option value="Marathon">Préparer un Marathon</option>
              <option value="Endurance">Améliorer l'endurance fondamentale</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400">Séances disponibles par semaine :</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDaysPerWeek(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                    daysPerWeek === num ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {num} séances
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-extrabold rounded-2xl text-xs transition shadow-lg">
            Générer mon plan adaptatif 🚀
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Objectif Actif</span>
              <span className="text-sm font-black text-white">Plan {goal} ({daysPerWeek} séances/semaine)</span>
            </div>
            <button onClick={() => setPlanGenerated(false)} className="text-[11px] text-neutral-400 underline hover:text-white">
              Modifier
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Semaine 1 / 8 :</h4>
            
            <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold block">Séance 1 • Mardi</span>
                <span className="text-xs font-bold text-white">Endurance Fondamentale (EF)</span>
                <span className="text-[10px] text-neutral-400 block">45 min à 65% VMA</span>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-orange-400 font-bold block">Séance 2 • Jeudi</span>
                <span className="text-xs font-bold text-white">Fractionné Court (VMA)</span>
                <span className="text-[10px] text-neutral-400 block">10 x (30s / 30s)</span>
              </div>
              <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2.5 py-1 rounded-xl font-bold">À faire</span>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-amber-400 font-bold block">Séance 3 • Dimanche</span>
                <span className="text-xs font-bold text-white">Sortie Longue</span>
                <span className="text-[10px] text-neutral-400 block">1h15 allure progressive</span>
              </div>
              <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2.5 py-1 rounded-xl font-bold">À faire</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
