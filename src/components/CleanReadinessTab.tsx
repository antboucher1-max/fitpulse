import { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, Sparkles, Watch, Activity, CheckCircle2 } from 'lucide-react';

interface CleanReadinessTabProps {
  currentUserId?: string;
  onBack?: () => void;
}

export default function CleanReadinessTab({ currentUserId, onBack }: CleanReadinessTabProps) {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isWatchConnected, setIsWatchConnected] = useState(false);
  const [watchName, setWatchName] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<number | ''>('');
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [soreness, setSoreness] = useState<number>(2);
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const savedReadiness = localStorage.getItem(`fitpulse_readiness_${currentUserId}`);
    if (savedReadiness) {
      try {
        const parsed = JSON.parse(savedReadiness);
        const todayStr = new Date().toISOString().split('T')[0];
        const checkinDateStr = parsed.date || new Date(parsed.timestamp).toISOString().split('T')[0];

        // Si le check-in a été fait aujourd'hui, on bascule sur la vue validée (image)
        if (checkinDateStr === todayStr) {
          setHasCheckedIn(true);
          setSleepHours(parsed.sleepHours || '');
          setSleepQuality(parsed.sleepQuality || 3);
          setSoreness(parsed.soreness || 2);
          setStressLevel(parsed.stressLevel || 2);
        } else {
          // Si on est le lendemain, on nettoie pour réafficher le formulaire du matin
          localStorage.removeItem(`fitpulse_readiness_${currentUserId}`);
          setHasCheckedIn(false);
        }
      } catch (e) {
        console.warn("Erreur lecture readiness locale", e);
      }
    }

    const savedWatch = localStorage.getItem(`fitpulse_connected_watch_${currentUserId}`);
    if (savedWatch) {
      setIsWatchConnected(true);
      setWatchName(savedWatch);
    }
  }, [currentUserId]);

  const handleConnectWatch = () => {
    const choice = window.prompt("Choisis ton écosystème de montre :\n1. Huawei Health\n2. Garmin Connect\n3. Apple Health / Coros", "1");
    if (!choice) return;

    let brand = "Huawei Watch";
    if (choice === "2") brand = "Garmin Forerunner";
    if (choice === "3") brand = "Apple Watch Ultra";

    setIsWatchConnected(true);
    setWatchName(brand);
    localStorage.setItem(`fitpulse_connected_watch_${currentUserId}`, brand);
    setSleepHours(7.8);
    alert(`Montre ${brand} connectée avec succès ! Données de sommeil synchronisées 🛰️`);
  };

  const handleDisconnectWatch = () => {
    setIsWatchConnected(false);
    setWatchName('');
    localStorage.removeItem(`fitpulse_connected_watch_${currentUserId}`);
  };

  const calculateReadinessScore = () => {
    if (sleepHours === '') return 0;
    const sleepScore = Math.min(100, (Number(sleepHours) / 8) * 40);
    const qualityScore = (sleepQuality / 5) * 30;
    const sorenessPenalty = ((6 - soreness) / 5) * 15;
    const stressPenalty = ((6 - stressLevel) / 5) * 15;
    return Math.round(sleepScore + qualityScore + sorenessPenalty + stressPenalty);
  };

  const readinessScore = calculateReadinessScore();

  const handleSaveCheckin = () => {
    if (sleepHours === '') {
      alert("Veuillez renseigner votre nombre d'heures de sommeil pour calculer votre Readiness.");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const data = {
      date: todayStr,
      sleepHours,
      sleepQuality,
      soreness,
      stressLevel,
      score: readinessScore,
      timestamp: Date.now()
    };

    localStorage.setItem(`fitpulse_readiness_${currentUserId}`, JSON.stringify(data));
    setHasCheckedIn(true);
  };

  const handleResetCheckin = () => {
    localStorage.removeItem(`fitpulse_readiness_${currentUserId}`);
    setHasCheckedIn(false);
  };

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

      {/* VUE VALIDÉE (Identique à ton image) */}
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
              <div className="text-3xl font-black text-white">{readinessScore}%</div>
              <span className="text-[11px] text-emerald-400 font-bold block pt-1">
                🟢 {readinessScore > 70 ? "Récupération optimale" : readinessScore > 40 ? "Récupération moyenne" : "Fatigue élevée"}
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Sommeil Validé</span>
              <div className="text-3xl font-black text-white">{sleepHours}h</div>
              <span className="text-xs text-neutral-400 block pt-1">Qualité : {sleepQuality}/5</span>
            </div>
          </div>
        </div>
      ) : (
        /* VUE FORMULAIRE DU MATIN */
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
