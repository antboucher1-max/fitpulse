import { useState, useEffect, FormEvent } from 'react';
import { 
  Zap, Flame, Trophy, Plus, X, Dumbbell, Timer, MessageSquareText, Award, 
  Calendar, Users, UserCheck, ShieldCheck, Play, Pause, RotateCcw, Calculator, BookOpen, Send 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface BoxWarsTabProps {
  currentUserId?: string;
  currentUsername: string;
  registeredUsers: any[];
}

export default function BoxWarsTab({ currentUserId, currentUsername, registeredUsers }: BoxWarsTabProps) {
  // Navigation principale de BoxWars
  const [boxMainTab, setBoxMainTab] = useState<'training' | 'box' | 'planning'>('training');

  // Sous-onglets de TRAINING
  const [trainingSubTab, setTrainingSubTab] = useState<'wods' | 'timer' | 'rm' | 'skills'>('wods');
  
  // Sous-onglets de BOX
  const [boxSubTab, setBoxSubTab] = useState<'leaderboard' | 'feed' | 'chat' | 'friends'>('leaderboard');

  // Sous-onglets de PLANNING
  const [planningSubTab, setPlanningSubTab] = useState<'schedule' | 'coach'>('schedule');

  // États WODs / Journal
  const [boxWods, setBoxWods] = useState<any[]>([]);
  const [loadingBoxWods, setLoadingBoxWods] = useState(true);
  const [newWodTitle, setNewWodTitle] = useState('');
  const [newWodType, setNewWodType] = useState('For Time');
  const [newWodScore, setNewWodScore] = useState('');
  const [newWodCategory, setNewWodCategory] = useState('Rx');
  const [showWodModal, setShowWodModal] = useState(false);

  // États Timer (ex: blocs de travail de 18 min, pauses toutes les 4 min)
  const [timerSeconds, setTimerSeconds] = useState<number>(18 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // États Calculateur RM
  const [rmWeight, setRmWeight] = useState<number | ''>('');
  const [rmReps, setRmReps] = useState<number | ''>('');

  // États Skills / Mouvements
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<'gym' | 'halterophilie' | 'endurance'>('gym');

  // États Chat & Feed Box
  const [boxMessages, setBoxMessages] = useState<any[]>([]);
  const [boxChatInput, setBoxChatInput] = useState('');
  const [boxFeedPosts, setBoxFeedPosts] = useState<any[]>([
    { id: 1, author: 'Head Coach', content: 'Superbe ambiance ce matin sur le WOD Hero ! Bravo à tous.', date: 'Aujourd\'hui', likes: 12 }
  ]);
  const [newFeedText, setNewFeedText] = useState('');

  // États Planning & Coach
  const [wodSlots, setWodSlots] = useState<any[]>([
    { id: 1, time: '07:00 - WOD Matin', coach: 'Thomas', spotsLeft: 4, booked: false },
    { id: 2, time: '12:30 - WOD Entre Midi & Deux', coach: 'Antoine', spotsLeft: 2, booked: true },
    { id: 3, time: '18:00 - WOD Soir (Rx)', coach: 'Sarah', spotsLeft: 0, booked: false }
  ]);
  const [coachNotes, setCoachNotes] = useState('');

  const fetchBoxWods = async () => {
    setLoadingBoxWods(true);
    const { data, error } = await supabase.from('wods').select('*').order('id', { ascending: false });
    if (!error && data) setBoxWods(data);
    setLoadingBoxWods(false);
  };

  useEffect(() => {
    fetchBoxWods();
  }, []);

  // Gestion du Chrono
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      alert("⏱️ Fin de la session d'entraînement ! 🔥");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  return (
    <div className="space-y-4 pb-16">
      <div className="bg-gradient-to-r from-cyan-950/95 to-neutral-900 border border-cyan-500/40 rounded-3xl p-5 text-white shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4" /> BoxWars Arena Hub
        </div>
        <h2 className="text-xl font-black">Centre d'entraînement & Communauté</h2>
        <p className="text-xs text-neutral-300 mt-1">Gère tes WODs, planifie tes créneaux et échange avec les athlètes de la box.</p>
      </div>

      {/* Navigation principale de BoxWars (Training, Box, Planning) */}
      <div className="grid grid-cols-3 gap-2 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
        <button onClick={() => setBoxMainTab('training')} className={`py-2.5 rounded-xl text-xs font-black transition ${boxMainTab === 'training' ? 'bg-cyan-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'}`}>🏋️‍♂️ Training</button>
        <button onClick={() => setBoxMainTab('box')} className={`py-2.5 rounded-xl text-xs font-black transition ${boxMainTab === 'box' ? 'bg-cyan-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'}`}>🏛️ Box</button>
        <button onClick={() => setBoxMainTab('planning')} className={`py-2.5 rounded-xl text-xs font-black transition ${boxMainTab === 'planning' ? 'bg-cyan-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'}`}>📅 Planning</button>
      </div>

      {/* ================= SECTION TRAINING ================= */}
      {boxMainTab === 'training' && (
        <div className="space-y-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-neutral-800 pb-2">
            <button onClick={() => setTrainingSubTab('wods')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${trainingSubTab === 'wods' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Journal WODs</button>
            <button onClick={() => setTrainingSubTab('timer')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${trainingSubTab === 'timer' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Chrono ⏱️</button>
            <button onClick={() => setTrainingSubTab('rm')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${trainingSubTab === 'rm' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Calculateur RM 🧮</button>
            <button onClick={() => setTrainingSubTab('skills')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${trainingSubTab === 'skills' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Skills 🎯</button>
          </div>

          {trainingSubTab === 'wods' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><Flame className="w-4 h-4" /> Logger un score WOD</h3>
                <button onClick={() => setShowWodModal(true)} className="bg-cyan-500 text-neutral-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Ajouter un score
                </button>
              </div>

              {showWodModal && (
                <form onSubmit={handleAddBoxWod} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3 shadow-2xl animate-scaleUp">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                    <h4 className="font-bold text-xs text-cyan-400">Enregistrer une performance</h4>
                    <button type="button" onClick={() => setShowWodModal(false)} className="text-neutral-400"><X className="w-4 h-4" /></button>
                  </div>
                  <input type="text" placeholder="Nom du WOD (ex: Fran, Murph)" value={newWodTitle} onChange={e => setNewWodTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newWodType} onChange={e => setNewWodType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white">
                      <option value="For Time">For Time</option>
                      <option value="AMRAP">AMRAP</option>
                      <option value="EMOM">EMOM</option>
                    </select>
                    <select value={newWodCategory} onChange={e => setNewWodCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white">
                      <option value="Rx">Rx</option>
                      <option value="Scaled">Scaled</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Score (ex: 4:15)" value={newWodScore} onChange={e => setNewWodScore(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  <button type="submit" className="w-full py-3 bg-cyan-500 text-neutral-950 font-bold rounded-xl text-xs">Enregistrer ⚡</button>
                </form>
              )}

              {loadingBoxWods ? <p className="text-xs text-neutral-500 text-center py-4">Chargement...</p> : boxWods.map(wod => (
                <div key={wod.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-center shadow">
                  <div>
                    <div className="font-extrabold text-xs text-white">{wod.title} <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-bold">{wod.category || 'Rx'}</span></div>
                    <div className="text-[10px] text-neutral-400">Athlète : {wod.author || 'Inconnu'} • <span className="italic">{wod.type}</span></div>
                  </div>
                  <div className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl">{wod.score}</div>
                </div>
              ))}
            </div>
          )}

          {trainingSubTab === 'timer' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 text-center shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">⏱️ Chronomètre & Intervalles</h3>
              <div className="py-6 bg-neutral-950 border border-neutral-800 rounded-3xl shadow-inner">
                <div className={`text-5xl font-black tracking-widest ${isTimerRunning ? 'text-cyan-400 animate-pulse' : 'text-white'}`}>
                  {formatTimer(timerSeconds)}
                </div>
                <div className="text-[10px] uppercase font-bold text-neutral-400 mt-2">Bloc 18 min (Pause toutes les 4 min)</div>
              </div>
              <div className="flex justify-center gap-3">
                {!isTimerRunning ? (
                  <button onClick={() => setIsTimerRunning(true)} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-neutral-950 font-extrabold rounded-2xl text-xs"><Play className="w-4 h-4 fill-neutral-950" /> Démarrer</button>
                ) : (
                  <button onClick={() => setIsTimerRunning(false)} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-neutral-950 font-extrabold rounded-2xl text-xs"><Pause className="w-4 h-4 fill-neutral-950" /> Pause</button>
                )}
                <button onClick={() => { setIsTimerRunning(false); setTimerSeconds(18 * 60); }} className="flex items-center gap-2 px-5 py-3 bg-neutral-800 text-white font-bold rounded-2xl text-xs"><RotateCcw className="w-4 h-4" /> Reset</button>
              </div>
            </div>
          )}

          {trainingSubTab === 'rm' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><Calculator className="w-4 h-4" /> Calculateur de 1RM</h3>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Poids soulevé (kg) :</label>
                <input type="number" placeholder="ex: 100" value={rmWeight} onChange={e => setRmWeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Répétitions :</label>
                <input type="number" placeholder="ex: 5" value={rmReps} onChange={e => setRmReps(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              {rmWeight !== '' && rmReps !== '' && rmReps > 0 && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-neutral-400">Estimation de ton 1RM (Formule d'Epley) :</span>
                  <div className="text-lg font-black text-cyan-400">{Math.round(Number(rmWeight) * (1 + Number(rmReps) / 30))} kg</div>
                </div>
              )}
            </div>
          )}

          {trainingSubTab === 'skills' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setSelectedSkillCategory('gym')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${selectedSkillCategory === 'gym' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400'}`}>Gymnastique</button>
                <button onClick={() => setSelectedSkillCategory('halterophilie')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${selectedSkillCategory === 'halterophilie' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400'}`}>Haltéro</button>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                {selectedSkillCategory === 'gym' ? (
                  <>
                    <h4 className="font-extrabold text-xs text-white">🎯 Progressions Muscle-Up & Handstand Push-Up</h4>
                    <p className="text-xs text-neutral-300">Astuces et drills pour déverrouiller vos mouvements gymniques complexes au rig.</p>
                  </>
                ) : (
                  <>
                    <h4 className="font-extrabold text-xs text-white">🏋️ Technique Snatch & Clean & Jerk</h4>
                    <p className="text-xs text-neutral-300">Rappels biomécaniques sur le double knee bend, l'extension de hanche et la réception sous la barre.</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION BOX ================= */}
      {boxMainTab === 'box' && (
        <div className="space-y-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-neutral-800 pb-2">
            <button onClick={() => setBoxSubTab('leaderboard')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'leaderboard' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Classement</button>
            <button onClick={() => setBoxSubTab('feed')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'feed' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Feed</button>
            <button onClick={() => setBoxSubTab('chat')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'chat' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Chat Box 💬</button>
            <button onClick={() => setBoxSubTab('friends')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${boxSubTab === 'friends' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Amis</button>
          </div>

          {boxSubTab === 'leaderboard' && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">🏆 Classement Général de la Box</h3>
              {registeredUsers.map((u, idx) => (
                <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs text-cyan-400">#{idx + 1}</span>
                    <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-bold text-xs text-white">{u.username}</span>
                  </div>
                  <span className="text-xs font-black text-cyan-400">{u.points || 0} pts</span>
                </div>
              ))}
            </div>
          )}

          {boxSubTab === 'feed' && (
            <div className="space-y-3">
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl space-y-2">
                <input type="text" placeholder="Partager une actu avec la box..." value={newFeedText} onChange={e => setNewFeedText(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button onClick={() => { if (newFeedText.trim()) { setBoxFeedPosts([{ id: Date.now(), author: currentUsername, content: newFeedText, date: 'À l\'instant', likes: 0 }, ...boxFeedPosts]); setNewFeedText(''); } }} className="w-full py-2 bg-cyan-500 text-neutral-950 font-bold rounded-xl text-xs">Publier 🚀</button>
              </div>
              {boxFeedPosts.map(post => (
                <div key={post.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5 shadow">
                  <div className="flex justify-between text-[11px] text-cyan-400 font-bold">
                    <span>{post.author}</span>
                    <span className="text-neutral-500">{post.date}</span>
                  </div>
                  <p className="text-xs text-neutral-200">{post.content}</p>
                </div>
              ))}
            </div>
          )}

          {boxSubTab === 'chat' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-col h-[50vh] justify-between shadow-xl">
              <div className="text-xs font-bold text-cyan-400 border-b border-neutral-800 pb-2">💬 Chat en direct de la Box</div>
              <div className="flex-1 overflow-y-auto space-y-2 py-2">
                {boxMessages.length === 0 ? <p className="text-xs text-neutral-500 text-center py-6">Aucun message pour l'instant. Discute avec les membres !</p> : boxMessages.map((m, i) => (
                  <div key={i} className="bg-neutral-950 p-2.5 rounded-xl text-xs"><strong className="text-cyan-400">{m.user} : </strong>{m.text}</div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-neutral-800">
                <input type="text" placeholder="Écris ton message..." value={boxChatInput} onChange={e => setBoxChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && boxChatInput.trim()) { setBoxMessages([...boxMessages, { user: currentUsername, text: boxChatInput }]); setBoxChatInput(''); } }} className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button onClick={() => { if (boxChatInput.trim()) { setBoxMessages([...boxMessages, { user: currentUsername, text: boxChatInput }]); setBoxChatInput(''); } }} className="bg-cyan-500 px-4 py-2 rounded-xl text-xs font-bold text-neutral-950">Envoyer</button>
              </div>
            </div>
          )}

          {boxSubTab === 'friends' && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">👥 Mes Amis à la Box</h3>
              {registeredUsers.filter(u => u.id !== currentUserId).map(u => (
                <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-xs text-white">{u.username}</div>
                      <div className="text-[10px] text-neutral-400">{u.home_club}</div>
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">Connecté ✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION PLANNING ================= */}
      {boxMainTab === 'planning' && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-neutral-800 pb-2">
            <button onClick={() => setPlanningSubTab('schedule')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${planningSubTab === 'schedule' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Planning des WODs</button>
            <button onClick={() => setPlanningSubTab('coach')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${planningSubTab === 'coach' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-neutral-900 text-neutral-400'}`}>Espace Coach</button>
          </div>

          {planningSubTab === 'schedule' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">📅 Réservation des Créneaux WOD</h3>
              {wodSlots.map(slot => (
                <div key={slot.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex justify-between items-center shadow">
                  <div>
                    <div className="font-extrabold text-xs text-white">{slot.time}</div>
                    <div className="text-[10px] text-neutral-400">Coach : {slot.coach} • <span className="text-cyan-400 font-bold">{slot.spotsLeft} places restantes</span></div>
                  </div>
                  <button onClick={() => { setWodSlots(wodSlots.map(s => s.id === slot.id ? { ...s, booked: !s.booked, spotsLeft: s.booked ? s.spotsLeft + 1 : Math.max(0, s.spotsLeft - 1) } : s)); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${slot.booked ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500 text-neutral-950'}`}>
                    {slot.booked ? 'Annuler ✓' : 'Réserver 🚀'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {planningSubTab === 'coach' && (
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl space-y-3 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">🛡️ Espace Réservé aux Coachs</h3>
              <p className="text-xs text-neutral-300">Publie des consignes de programmation ou des retours de séance pour les athlètes de la box.</p>
              <textarea rows={3} placeholder="Notes de programmation du jour..." value={coachNotes} onChange={e => setCoachNotes(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-cyan-500" />
              <button onClick={() => { if (coachNotes.trim()) { alert("✅ Notes de programmation publiées avec succès !"); setCoachNotes(''); } }} className="w-full py-2.5 bg-cyan-500 text-neutral-950 font-bold rounded-xl text-xs">Diffuser aux athlètes 📢</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
