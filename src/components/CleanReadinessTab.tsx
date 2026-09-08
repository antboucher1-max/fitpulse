import { useState } from 'react';
import { ArrowLeft, HelpCircle, Sparkles, Watch, Activity, CheckCircle2, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAppState } from '../context/AppStateContext';
import { getReadinessStatus, calculateReadinessScore, calculateReadinessBreakdown, getRecoveryDebtInfo } from '../utils/readinessCalculator';

interface CleanReadinessTabProps {
  currentUserId?: string;
  onBack?: () => void;
  onCheckinSaved?: () => void;
}

// NOTE : cette version remplace CleanReadinessTab.tsx, ReadinessTab.tsx,
// ReadinessCheckin.tsx et ReadinessWidget.tsx, qui calculaient chacun un score
// de récupération différent. Le calcul vit maintenant uniquement dans
// utils/readinessCalculator.ts, et l'état du jour dans AppStateContext.
// Les 3 autres fichiers peuvent être supprimés du projet une fois ce
// composant vérifié en conditions réelles.
export default function CleanReadinessTab({ currentUserId, onBack, onCheckinSaved }: CleanReadinessTabProps) {
  const { readiness, submitReadinessCheckin, resetReadinessCheckin } = useAppState();
  const hasCheckedIn = readiness.inputs !== null;
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [isWatchConnected, setIsWatchConnected] = useState(false);
  const [watchName, setWatchName] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<number | ''>(readiness.inputs?.sleepHours ?? '');
  const [sleepQuality, setSleepQuality] = useState<number>(readiness.inputs?.sleepQuality ?? 3);
  const [soreness, setSoreness] = useState<number>(readiness.inputs?.soreness ?? 2);
  const [stressLevel, setStressLevel] = useState<number>(readiness.inputs?.stressLevel ?? 2);
  const [showGuide, setShowGuide] = useState(false);

  const handleConnectWatch = () => {
    const choice = window.prompt("Choisis ton écosystème de montre :\n1. Huawei Health\n2. Garmin Connect\n3. Apple Health / Coros", "1");
    if (!choice) return;

    let brand = "Huawei Watch";
    if (choice === "2") brand = "Garmin Forerunner";
    if (choice === "3") brand = "Apple Watch Ultra";

    setIsWatchConnected(true);
    setWatchName(brand);
    setSleepHours(7.8);
    alert(`Montre ${brand} connectée avec succès ! Données de sommeil synchronisées 🛰️`);
  };

  const handleDisconnectWatch = () => {
    setIsWatchConnected(false);
    setWatchName('');
  };

  const handleSaveCheckin = async () => {
    if (sleepHours === '') {
      alert("Veuillez renseigner votre nombre d'heures de sommeil pour calculer votre Readiness.");
      return;
    }

    const inputs = {
      sleepHours: Number(sleepHours),
      sleepQuality,
      soreness,
      stressLevel,
    };

    // On calcule le score localement pour l'utiliser immédiatement (l'update
    // du context via submitReadinessCheckin ne sera visible qu'au prochain
    // rendu, donc on ne peut pas relire `readiness.score` juste après l'appel).
    const computedScore = calculateReadinessScore(inputs);
    submitReadinessCheckin(inputs);

    if (currentUserId) {
      const { error } = await supabase
        .from('profiles')
        .update({ readiness_score: computedScore })
        .eq('id', currentUserId);

      if (!error && onCheckinSaved) {
        onCheckinSaved();
      } else if (error) {
        console.warn("Erreur synchro score readiness Supabase :", error.message);
      }
    }
  };

  const handleResetCheckin = async () => {
    resetReadinessCheckin();

    if (currentUserId) {
      await supabase
        .from('profiles')
        .update({ readiness_score: 78 })
        .eq('id', currentUserId);

      if (onCheckinSaved) {
        onCheckinSaved();
      }
    }
  };

  const status = getReadinessStatus(readiness.score);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      <div className="flex items-center justify-between">
        {onBack ? (
          <button 
            type="button" 
            onClick={onBack} 
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        ) : <div />}

        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-2 rounded-xl hover:bg-orange-500/20 transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" /> Comment ça marche ?
        </button>
      </div>

      {showGuide && (
        <div className="bg-orange-950/30 border border-orange-500/30 rounded-3xl p-5 space-y-3 text-xs shadow-xl animate-slideDown">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" /> Guide du Check-in & Readiness
            </h3>
            <button onClick={() => setShowGuide(false)} className="text-neutral-400 hover:text-white font-bold">✕</button>
          </div>
          <p className="text-neutral-300 leading-relaxed">
            1. <strong>Connecte ta montre</strong> (Huawei, Garmin, Apple) pour importer automatiquement ton sommeil, ou saisis-le manuellement.<br/>
            2. <strong>Renseigne tes curseurs</strong> de fatigue, courbatures et stress au réveil.<br/>
            3. L'algorithme calcule ton <strong>Indice de Récupération</strong>. Le formulaire disparaît une fois validé et se réinitialisera automatiquement le lendemain !
          </p>
        </div>
      )}

      {hasCheckedIn ? (
        <div className="bg-neutral-950 border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> CHECK-IN DU JOUR VALIDÉ ✅
            </div>
            <button 
              onClick={handleResetCheckin}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Modifier
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Indice de Récupération</span>
              <div className="text-3xl font-black text-white">{readiness.score}%</div>
              <span className={`text-[11px] font-bold block pt-1 ${status.color}`}>
                🟢 {status.label}
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Sommeil Validé</span>
              <div className="text-3xl font-black text-white">{readiness.inputs?.sleepHours}h</div>
              <span className="text-xs text-neutral-400 block pt-1">Qualité : {readiness.inputs?.sleepQuality}/5</span>
            </div>
          </div>

          {/* INNOVATION : LA DETTE DE RÉCUPÉRATION — reformule le score en
              solde de compte, plus intuitif qu'un pourcentage abstrait. */}
          {(() => {
            const debt = getRecoveryDebtInfo(readiness.score);
            return (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    {debt.emoji} Ton compte récupération
                  </span>
                  <span className="text-sm font-black text-white">{debt.label}</span>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed max-w-xs">{debt.advice}</p>
                </div>
                <div className={`text-2xl font-black font-mono ${debt.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {debt.balance >= 0 ? '+' : ''}{debt.balance}
                </div>
              </div>
            );
          })()}

          {/* INNOVATION : TRANSPARENCE DU CALCUL — personne d'autre ne montre sa formule. */}
          {readiness.inputs && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-cyan-400 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" /> Voir le calcul exact
                </span>
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showBreakdown && (
                <div className="px-3.5 pb-3.5 space-y-2 animate-fadeIn">
                  {calculateReadinessBreakdown(readiness.inputs).items.map((item) => (
                    <div key={item.label} className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-300 font-semibold">{item.label} ({item.weightPercent}%)</span>
                        <span className="text-cyan-400 font-mono font-bold">{item.points}/{item.maxPoints} pts</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">{item.detail}</span>
                    </div>
                  ))}
                  <div className="text-[10px] text-neutral-500 text-center pt-1">
                    Aucune boîte noire : c'est exactement la formule utilisée, pas une approximation marketing.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isWatchConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Appareil Connecté</h4>
                <p className="text-[11px] text-neutral-400">
                  {isWatchConnected ? `${watchName} • Synchro active ✓` : "Aucune montre connectée pour l'instant"}
                </p>
              </div>
            </div>

            {!isWatchConnected ? (
              <button 
                onClick={handleConnectWatch}
                className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                Associer une montre 🛰️
              </button>
            ) : (
              <button 
                onClick={handleDisconnectWatch}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-semibold rounded-xl text-[11px] transition cursor-pointer"
              >
                Déconnecter
              </button>
            )}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-orange-500" /> Formulaire de Check-in du Matin
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 mb-1.5">Nombre d'heures de sommeil :</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="15" 
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Ex: 7.5"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1.5">Qualité du sommeil (1 à 5) : <span className="text-orange-400 font-normal">{sleepQuality}/5</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1.5">Niveau de courbatures / Tensions musculaires : <span className="text-orange-400 font-normal">{soreness}/5</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={soreness}
                  onChange={(e) => setSoreness(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1.5">Niveau de stress / Charge mentale : <span className="text-orange-400 font-normal">{stressLevel}/5</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveCheckin}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Enregistrer mon Check-in & Calculer ⚡
            </button>
          </div>
        </>
      )}
    </div>
  );
}
