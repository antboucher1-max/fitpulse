import { useState, useEffect, FormEvent } from 'react';
import { Zap, Flame, Trophy, Plus, X, Dumbbell, Timer, MessageSquareText, Award, Swords, Play, Pause, RotateCcw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface BoxWarsTabProps {
  currentUserId?: string;
  currentUsername: string;
}

export default function BoxWarsTab({ currentUserId, currentUsername }: BoxWarsTabProps) {
  const [boxSubTab, setBoxSubTab] = useState<'wods' | 'prs' | 'timer' | 'battles' | 'feed'>('wods');
  
  // WODs states
  const [boxWods, setBoxWods] = useState<any[]>([]);
  const [loadingBoxWods, setLoadingBoxWods] = useState(true);
  const [newWodTitle, setNewWodTitle] = useState('');
  const [newWodType, setNewWodType] = useState('For Time');
  const [newWodScore, setNewWodScore] = useState('');
  const [newWodCategory, setNewWodCategory] = useState('Rx');
  const [showWodModal, setShowWodModal] = useState(false);

  // PRs states
  const [userPrs, setUserPrs] = useState<any[]>([]);
  const [newPrExercise, setNewPrExercise] = useState('Clean & Jerk');
  const [newPrWeight, setNewPrWeight] = useState('');
  const [showPrModal, setShowPrModal] = useState(false);

  // Timer & Intervals states (ex: 18 min de travail, pause toutes les 4 min)
  const [totalWorkTime, setTotalWorkTime] = useState<number>(18 * 60); // 18 minutes par défaut
  const [intervalRestTime, setIntervalRestTime] = useState<number>(60); // 1 min de pause par défaut
  const [intervalPeriod, setIntervalPeriod] = useState<number>(4 * 60); // Pause toutes les 4 minutes
  const [timerSeconds, setTimerSeconds] = useState<number>(18 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'work' | 'rest'>('work');
  const [currentIntervalTracker, setCurrentIntervalTracker] = useState<number>(0);

  // Box battles & announcements
  const [battles] = useState<any[]>([
    { id: 1, title: 'WOD Test : Diane', challenger: 'Antoine', opponent: 'Communauté', status: 'En cours ⚡', reward: '50 pts BoxWars' }
  ]);
  
  const [boxAnnouncements] = useState<any[]>([
    { id: 1, title: 'Compétition Inter-Box BoxWars', content: 'Rappel : Qualifications ce samedi à 10h ! Préparez vos gilets lestés.', date: '2026-06-06', author: 'Head Coach' },
    { id: 2, title: 'Record de la Box battu !', content: 'Félicitations pour le nouveau record sur le Clean & Jerk validé cette semaine !', date: '2026-06-04', author: 'Staff BoxWars' }
  ]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      alert("⏱️ Fin de la session d'entraînement ! Beau travail ! 🔥");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchBoxWods = async () => {
    setLoadingBoxWods(true);
    const { data, error } = await supabase.from('wods').select('*').order('id', { ascending: false });
    if (!error && data) setBoxWods(data);
    setLoadingBoxWods(false);
  };

  const fetchUserPrs = async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase.from('prs').select('*').eq('user_id', currentUserId);
    if (!error && data) setUserPrs(data);
  };

  useEffect(() => {
    fetchBoxWods();
    fetchUserPrs();
  }, [currentUserId]);

  const handleAddBoxWod = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWodTitle || !newWodScore || !currentUserId) return;
    const { error } = await supabase.from('wods').insert([{
      user_id: currentUserId,
      title: newWodTitle,
      type: newWodType,
      score: newWodScore,
      category: newWodCategory,
      author: currentUsername,
      pr: true
    }]);
    if (!error) {
      setNewWodTitle('');
      setNewWodScore('');
      setShowWodModal(false);
      fetchBoxWods();
    }
  };

  const handleAddPr = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPrExercise || !newPrWeight || !currentUserId) return;
    const { error } = await supabase.from('prs').insert([{
      user_id: currentUserId,
      exercise: newPrExercise,
      weight: Number(newPrWeight),
      date: new Date().toISOString().split('T')[0]
    }]);
    if (!error) {
      setNewPrExercise('Clean & Jerk');
      setNewPrWeight('');
      setShowPrModal(false);
      fetchUserPrs();
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-gradient-to-r from-cyan-950/90 to-neutral-900 border border-cyan-500/40 rounded-3xl p-5 text-white shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4" /> BoxWars Live Arena
        </div>
        <h2 className="text-xl font-black">L'Univers CrossFit & WODs</h2>
        <p className="text-xs text-neutral-300 mt-1">Valide tes scores, gère ton chrono d'intervalles et suis tes PRs.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-neutral-800 pb-2">
        <button onClick={() => setBoxSubTab('wods')} className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'wods' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}>WODs</button>
        <button onClick={() => setBoxSubTab('prs')} className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'prs' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}>Mes PRs 🎯</button>
        <button onClick={() => setBoxSubTab('timer')} className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'timer' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}>Chrono ⏱️</button>
        <button onClick={() => setBoxSubTab('battles')} className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'battles' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}>Battles ⚔️</button>
        <button onClick={() => setBoxSubTab('feed')} className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'feed' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}>Annonces</button>
      </div>

      {boxSubTab === 'wods' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><Flame className="w-4 h-4" /> Leaderboard WODs</h3>
            <button onClick={() => setShowWodModal(true)} className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 shadow-lg">
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Logger un score
            </button>
          </div>

          {showWodModal && (
            <form onSubmit={handleAddBoxWod} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3 shadow-2xl animate-scaleUp">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h4 className="font-bold text-xs text-cyan-400">Enregistrer une performance WOD</h4>
                <button type="button" onClick={() => setShowWodModal(false)} className="text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Nom du WOD :</label>
                <input type="text" placeholder="ex: Fran" value={newWodTitle} onChange={e => setNewWodTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Format :</label>
                  <select value={newWodType} onChange={e => setNewWodType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white">
                    <option value="For Time">For Time</option>
                    <option value="AMRAP">AMRAP</option>
                    <option value="EMOM">EMOM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Catégorie :</label>
                  <select value={newWodCategory} onChange={e => setNewWodCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white">
                    <option value="Rx">Rx</option>
                    <option value="Scaled">Scaled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Score :</label>
                <input type="text" placeholder="ex: 4:15" value={newWodScore} onChange={e => setNewWodScore(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500" required />
              </div>
              <button type="submit" className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg">Valider et publier ⚡</button>
            </form>
          )}

          {loadingBoxWods ? (
            <p className="text-xs text-neutral-500 text-center py-6">Chargement des scores...</p>
          ) : boxWods.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-6 bg-neutral-900 border border-neutral-800 rounded-2xl">Aucun score WOD enregistré pour le moment. Sois le premier ! 🚀</p>
          ) : (
            boxWods.map(wod => (
              <div key={wod.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center shadow-md">
                <div>
                  <div className="font-extrabold text-xs text-white flex items-center gap-2">
                    {wod.title} 
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${wod.category === 'Rx' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-neutral-800 text-neutral-400'}`}>
                      {wod.category || 'Rx'}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">Athlète : <span className="text-neutral-200 font-semibold">{wod.author || 'Inconnu'}</span> • <span className="italic">{wod.type}</span></div>
                </div>
                <div className="text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">{wod.score}</div>
              </div>
            ))
          )}
        </div>
      )}

      {boxSubTab === 'prs' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><Dumbbell className="w-4 h-4" /> Suivi de mes PRs</h3>
            <button onClick={() => setShowPrModal(true)} className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 shadow-lg">
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Ajouter un PR
            </button>
          </div>

          {showPrModal && (
            <form onSubmit={handleAddPr} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3 shadow-2xl animate-scaleUp">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h4 className="font-bold text-xs text-cyan-400">Enregistrer un Record Personnel</h4>
                <button type="button" onClick={() => setShowPrModal(false)} className="text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Mouvement :</label>
                <select value={newPrExercise} onChange={e => setNewPrExercise(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white">
                  <option value="Clean & Jerk">Clean & Jerk</option>
                  <option value="Snatch">Snatch</option>
                  <option value="Back Squat">Back Squat</option>
                  <option value="Deadlift">Deadlift</option>
                  <option value="Front Squat">Front Squat</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Poids (en kg) :</label>
                <input type="number" step="0.5" placeholder="ex: 100" value={newPrWeight} onChange={e => setNewPrWeight(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500" required />
              </div>
              <button type="submit" className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg">Enregistrer le PR 🎯</button>
            </form>
          )}

          {userPrs.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-6 bg-neutral-900 border border-neutral-800 rounded-2xl">Aucun PR enregistré. Note tes maxis d'haltérophilie ici !</p>
          ) : (
            userPrs.map(pr => (
              <div key={pr.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">🏋️</div>
                  <div>
                    <div className="font-extrabold text-xs text-white">{pr.exercise}</div>
                    <div className="text-[10px] text-neutral-400">Validé le {pr.date}</div>
                  </div>
                </div>
                <div className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl">{pr.weight} kg</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ONGLET CHRONO & INTERVALLRES / TEMPS DE PAUSE */}
      {boxSubTab === 'timer' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl text-center">
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Timer className="w-4 h-4" /> Minuteur WOD & Intervalles
          </div>

          <div className="py-6 bg-neutral-950 border border-neutral-800 rounded-3xl shadow-inner relative overflow-hidden">
            <div className={`text-5xl font-black tracking-widest ${isTimerRunning ? 'text-cyan-400 animate-pulse' : 'text-white'}`}>
              {formatTimer(timerSeconds)}
            </div>
            <div className="text-[10px] uppercase font-bold text-neutral-400 mt-2">
              Statut : <span className="text-cyan-400">En cours (18 min / Pause toutes les 4 min)</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            {!isTimerRunning ? (
              <button 
                onClick={() => setIsTimerRunning(true)} 
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-extrabold rounded-2xl text-xs transition shadow-lg active:scale-95"
              >
                <Play className="w-4 h-4 fill-neutral-950" /> Démarrer
              </button>
            ) : (
              <button 
                onClick={() => setIsTimerRunning(false)} 
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-2xl text-xs transition shadow-lg active:scale-95"
              >
                <Pause className="w-4 h-4 fill-neutral-950" /> Pause
              </button>
            )}
            <button 
              onClick={() => { setIsTimerRunning(false); setTimerSeconds(18 * 60); }} 
              className="flex items-center gap-2 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 text-xs text-left space-y-1">
            <p className="text-cyan-400 font-bold">💡 Format d'entraînement configuré :</p>
            <p className="text-neutral-300 text-[11px]">• Durée totale : <strong>18 minutes</strong> d'effort.</p>
            <p className="text-neutral-300 text-[11px]">• Gestion des pauses : Programmées toutes les <strong>4 minutes</strong> pour souffler avant de repartir !</p>
          </div>
        </div>
      )}

      {boxSubTab === 'battles' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><Swords className="w-4 h-4" /> BoxBattles & Défis</h3>
          </div>
          {battles.map(battle => (
            <div key={battle.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2 shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-white">⚔️ {battle.title}</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md font-bold">{battle.status}</span>
              </div>
              <p className="text-xs text-neutral-300">Affrontement direct entre <strong className="text-white">{battle.challenger}</strong> et la <strong className="text-white">{battle.opponent}</strong>.</p>
              <div className="flex justify-between items-center pt-2 text-[10px] text-neutral-400 border-t border-neutral-800">
                <span>Récompense : <strong className="text-cyan-400">{battle.reward}</strong></span>
                <button onClick={() => alert("Tu as rejoint le défi !")} className="bg-cyan-500 text-neutral-950 px-3 py-1 rounded-lg font-bold">Participer 🚀</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {boxSubTab === 'feed' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><MessageSquareText className="w-4 h-4" /> Annonces Officielles de la Box</h3>
          {boxAnnouncements.map(ann => (
            <div key={ann.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2 shadow-md">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-xs text-white flex items-center gap-2"><Award className="w-3.5 h-3.5 text-cyan-400" /> {ann.title}</h4>
                <span className="text-[10px] text-neutral-400">{ann.date}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{ann.content}</p>
              <div className="text-[10px] text-cyan-400 font-semibold pt-1">Publié par : {ann.author}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
