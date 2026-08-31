import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import {
  Zap, User, MessageCircle, Home, Users, Plus, X, Camera, Flame, MapPin, ShieldCheck, Award, Info, Trophy, MessageSquareText, Sparkles, Check
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CLUBS_LIST = [
  'Club Tournai (Bastion)', 
  'Club Tournai (les jeunesses)', 
  'Club Antoing', 
  'Club Péruwelz',
  'Club Leuze', 
  'Club Ath', 
  'Club Mouscron', 
  'Club Ronse', 
  'Club St-Ghislain', 
  'Club Mons', 
  'Club Jurbise'
];

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  
  const [boxSubTab, setBoxSubTab] = useState<'wods' | 'feed'>('wods');

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [showCguModal, setShowCguModal] = useState(false);

  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'chat' | 'profile' | 'leaderboard' | 'boxwars'>(() => {
    const savedTab = localStorage.getItem('fitpulse_active_tab');
    return (savedTab as any) || 'feed';
  });

  const [selectedClub, setSelectedClub] = useState<string>('🌐 Tous les clubs (Global)');
  const [posts, setPosts] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  
  const postImageFileInputRef = useRef<HTMLInputElement>(null);
  const onboardingAvatarInputRef = useRef<HTMLInputElement>(null);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postSessionType, setPostSessionType] = useState('Musculation Full Body');
  const [postCaption, setPostCaption] = useState('');
  const [postHashtags, setPostHashtags] = useState('#fitpulse #workout');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);

  const [selectedBuddyChat, setSelectedBuddyChat] = useState<any | null>(null);
  const [currentMessageInput, setCurrentMessageInput] = useState('');

  // États pour les WODs BoxWars
  const [boxWods, setBoxWods] = useState<any[]>([]);
  const [loadingBoxWods, setLoadingBoxWods] = useState(true);
  const [newWodTitle, setNewWodTitle] = useState('');
  const [newWodScore, setNewWodScore] = useState('');
  const [showWodModal, setShowWodModal] = useState(false);

  const [onboardingUsername, setOnboardingUsername] = useState('');
  const [onboardingAge, setOnboardingAge] = useState<number | ''>('');
  const [onboardingClub, setOnboardingClub] = useState(CLUBS_LIST[0]);
  const [onboardingGoal, setOnboardingGoal] = useState('Prise de masse / Force');
  const [onboardingAvatar, setOnboardingAvatar] = useState<string>('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150');
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);

  const fetchCloudPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
  };

  const fetchRealUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setRegisteredUsers(data);
  };

  const fetchTransformations = async (userId: string) => {
    const { data } = await supabase.from('transformations').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (data) setTransformations(data);
  };

  const fetchAllMessages = async () => {
    const { data } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (data) setAllMessages(data);
  };

  const fetchBoxWods = async () => {
    setLoadingBoxWods(true);
    const { data, error } = await supabase.from('wods').select('*').order('id', { ascending: false });
    if (!error && data) setBoxWods(data);
    setLoadingBoxWods(false);
  };

  const addPointsToUser = async (userId: string, pointsToAdd: number) => {
    const targetUser = registeredUsers.find(u => u.id === userId);
    const currentPoints = targetUser?.points || 0;
    const { error } = await supabase.from('profiles').update({ points: currentPoints + pointsToAdd }).eq('id', userId);
    if (!error) fetchRealUsers();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchTransformations(session.user.id);
    });
    fetchCloudPosts();
    fetchRealUsers();
    fetchAllMessages();
    fetchBoxWods();
  }, []);

  const handleTabChange = (tab: any) => {
    setCurrentTab(tab);
    localStorage.setItem('fitpulse_active_tab', tab);
  };

  const currentUserProfile = registeredUsers.find(u => u.id === user?.id);
  const currentUsername = currentUserProfile?.username || user?.user_metadata?.username || 'Athlète';

  const handleSendMessage = async () => {
    if (!currentMessageInput.trim() || !selectedBuddyChat || !user) return;
    const text = currentMessageInput.trim(); setCurrentMessageInput('');
    await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: selectedBuddyChat.id, sender_name: currentUsername, text }]);
    fetchAllMessages();
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const likedByList = post.liked_by || [];
    const hasLiked = likedByList.includes(user.id);
    const updatedLikedBy = hasLiked ? likedByList.filter((id: string) => id !== user.id) : [...likedByList, user.id];
    const newCount = hasLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1;
    
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount, liked_by: updatedLikedBy } : p));
    await supabase.from('posts').update({ likes_count: newCount, liked_by: updatedLikedBy }).eq('id', postId);
  };

  const handlePostImageFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPostImageUrl(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const fullCaption = `${postCaption} ${postHashtags}`.trim();
    const { error } = await supabase.from('posts').insert([{
      user_id: user.id,
      username: currentUsername,
      avatar_url: currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
      club_name: selectedClub === '🌐 Tous les clubs (Global)' ? 'Club Tournai (Bastion)' : selectedClub,
      session_type: postSessionType,
      caption: fullCaption,
      image_url: postImageUrl,
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      is_private: false
    }]);

    if (!error) {
      await addPointsToUser(user.id, 10);
      setIsPostModalOpen(false);
      setPostCaption('');
      setPostImageUrl(null);
      fetchCloudPosts();
    } else {
      alert("Erreur publication : " + error?.message);
    }
  };

  const handleAddBoxWod = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWodTitle || !newWodScore || !user) return;
    const { error } = await supabase.from('wods').insert([{
      title: newWodTitle,
      type: 'For Time',
      description: 'WOD CrossFit',
      score: newWodScore,
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

  const displayedPosts = posts.filter((post) => {
    if (selectedClub === '🌐 Tous les clubs (Global)') return true;
    return post.club_name === selectedClub;
  });

  // Calcul du classement des clubs pour la Ligue
  const clubScores: Record<string, number> = {};
  registeredUsers.forEach(u => {
    const club = u.home_club || 'Club Tournai (Bastion)';
    clubScores[club] = (clubScores[club] || 0) + (u.points || 0);
  });
  const sortedClubs = Object.entries(clubScores).sort((a, b) => b[1] - a[1]);

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center font-sans p-4 select-none">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">FitPulse & BoxWars</h1>
            <p className="text-xs text-orange-400 font-semibold">La Ligue des Salles & Suivi d'Entraînement</p>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (isSignUpMode) {
              if (!acceptCgu) { alert("Veuillez accepter les CGU."); return; }
              const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
              if (error) alert("Erreur : " + error.message);
              else if (data.session?.user) { setUser(data.session.user); window.location.reload(); }
            } else {
              const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
              if (error) alert("Erreur : " + error.message);
              else if (data.session?.user) { setUser(data.session.user); window.location.reload(); }
            }
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">E-mail :</label>
              <input type="email" required placeholder="ton.email@exemple.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Mot de passe :</label>
              <input type="password" required placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
            {isSignUpMode && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cgu" checked={acceptCgu} onChange={(e) => setAcceptCgu(e.target.checked)} className="rounded accent-orange-500" />
                <label htmlFor="cgu" className="text-xs text-neutral-300">J'accepte les conditions d'utilisation.</label>
              </div>
            )}
            <button type="submit" className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-2xl text-sm">
              {isSignUpMode ? "S'inscrire 🚀" : "Se connecter ⚡"}
            </button>
          </form>

          <div className="text-center">
            <button type="button" onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-xs text-orange-400 font-semibold">
              {isSignUpMode ? "Déjà un compte ? Connecte-toi" : "Pas encore de compte ? Inscris-toi"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasProfile = registeredUsers.some(u => u.id === user.id);
  if (user && registeredUsers.length >= 0 && !hasProfile) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center font-sans p-4 select-none">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <h1 className="text-lg font-black text-white text-center">Bienvenue sur FitPulse !</h1>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!onboardingUsername.trim()) { alert("Pseudo requis"); return; }
            setOnboardingSubmitting(true);
            await supabase.from('profiles').upsert({
              id: user.id, username: onboardingUsername.trim(), age: Number(onboardingAge) || 25,
              home_club: onboardingClub, goal: onboardingGoal, avatar_url: onboardingAvatar, points: 0, is_admin: user.email === 'antboucher@hotmail.fr'
            });
            setOnboardingSubmitting(false);
            fetchRealUsers(); setShowWelcomeGuide(true);
          }} className="space-y-3">
            <input type="text" required placeholder="Ton Pseudo" value={onboardingUsername} onChange={(e) => setOnboardingUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white" />
            <select value={onboardingClub} onChange={(e) => setOnboardingClub(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
              {CLUBS_LIST.map((club) => <option key={club} value={club}>{club}</option>)}
            </select>
            <button type="submit" disabled={onboardingSubmitting} className="w-full py-3 bg-orange-600 text-white font-bold rounded-2xl text-sm">Valider 🚀</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none antialiased relative">
      
      {showWelcomeGuide && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-orange-500/40 rounded-3xl max-w-sm w-full p-6 space-y-4 text-center">
            <h2 className="text-base font-extrabold text-white">Bienvenue dans l'aventure !</h2>
            <button onClick={() => { setShowWelcomeGuide(false); window.location.reload(); }} className="w-full py-3 bg-orange-600 text-white font-bold rounded-2xl text-xs">C'est parti ! 💪</button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto min-h-screen bg-neutral-950 flex flex-col shadow-2xl sm:border-x sm:border-neutral-900 relative">
        <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${currentTab === 'boxwars' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-500'} flex items-center justify-center`}>
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-base font-black tracking-tight leading-none text-white">
              {currentTab === 'boxwars' ? 'BOXWARS' : 'FitPulse'}
            </h1>
          </div>

          {currentTab !== 'boxwars' && (
            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1.5 flex-shrink-0" />
              <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} className="bg-transparent text-xs font-bold text-orange-400 focus:outline-none cursor-pointer pr-1">
                <option value="🌐 Tous les clubs (Global)">🌐 Tous les clubs (Global)</option>
                {CLUBS_LIST.map((club) => <option key={club} value={club} className="bg-neutral-900 text-white">{club}</option>)}
              </select>
            </div>
          )}
        </header>

        <main className="flex-1 w-full mx-auto px-4 py-3 pb-24">
          
          {/* ONGLET ACCUEIL / FEED */}
          {currentTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                <div>
                  <h2 className="font-extrabold text-sm text-white">Bonjour, {currentUsername} ! 🔥</h2>
                  <p className="text-xs text-neutral-400">Partage ta séance et gagne des points pour ton club.</p>
                </div>
                <button onClick={() => setIsPostModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Séance
                </button>
              </div>

              <div className="space-y-3">
                {displayedPosts.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-8">Aucune publication pour l'instant dans ce club. Sois le premier ! 🚀</p>
                ) : (
                  displayedPosts.map((post) => (
                    <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={post.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} alt="" className="w-9 h-9 rounded-full object-cover border border-orange-500/40" />
                          <div>
                            <div className="font-bold text-xs text-white">{post.username}</div>
                            <div className="text-[10px] text-orange-400">{post.club_name} • {post.session_type}</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>
                      {post.image_url && (
                        <div className="rounded-xl overflow-hidden h-48 border border-neutral-800">
                          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 text-xs text-neutral-400 border-t border-neutral-800/60">
                        <button onClick={() => handleToggleLike(post.id)} className="flex items-center gap-1.5 text-orange-400 font-bold hover:text-orange-300 transition">
                          <Flame className="w-4 h-4" /> {post.likes_count || 0} J'aime
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ONGLET LIGUE (CLASSEMENT CLUBS & INDIVIDUEL COMPLET) */}
          {currentTab === 'leaderboard' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-orange-950/60 to-neutral-900 border border-orange-500/30 rounded-3xl p-5 text-center space-y-2">
                <Trophy className="w-10 h-10 text-orange-500 mx-auto animate-bounce" />
                <h2 className="font-black text-base text-white">La Ligue des Salles 🏆</h2>
                <p className="text-xs text-neutral-300">Classement inter-clubs en direct. Chaque séance partagée rapporte 10 points à votre salle !</p>
              </div>

              {/* Classement des Clubs */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 px-1">🏛️ Classement des Clubs</h3>
                {sortedClubs.map(([clubName, totalPoints], idx) => (
                  <div key={clubName} className={`p-4 rounded-2xl border flex items-center justify-between ${idx === 0 ? 'bg-orange-500/10 border-orange-500/50 shadow-lg' : 'bg-neutral-900 border-neutral-800'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-sm w-6 text-center ${idx === 0 ? 'text-orange-400 text-base' : 'text-neutral-400'}`}>#{idx + 1}</span>
                      <div>
                        <div className="font-extrabold text-xs text-white">{clubName}</div>
                        <div className="text-[10px] text-neutral-400">{registeredUsers.filter(u => (u.home_club || 'Club Tournai (Bastion)') === clubName).length} athlètes actifs</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-orange-400">{totalPoints} pts</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Classement Individuel */}
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 px-1">🔥 Top Athlètes Individuels</h3>
                <div className="space-y-2">
                  {registeredUsers.sort((a, b) => (b.points || 0) - (a.points || 0)).map((u, idx) => (
                    <div key={u.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xs text-orange-500 w-5">#{idx + 1}</span>
                        <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} alt="" className="w-9 h-9 rounded-full object-cover border border-orange-500/30" />
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1">
                            {u.username} {u.is_verified && <span className="text-orange-500 text-[10px]">✓</span>}
                          </div>
                          <div className="text-[10px] text-neutral-400">{u.home_club || 'Club Tournai'}</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl">{u.points || 0} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET CHAT */}
          {currentTab === 'chat' && (
            <div className="space-y-3">
              <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-orange-500" /> Discussion avec {selectedBuddyChat ? selectedBuddyChat.username : 'tes partenaires'}
              </h2>
              {selectedBuddyChat ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-col h-[65vh] justify-between">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-xs font-bold text-white">{selectedBuddyChat.username}</span>
                    <button onClick={() => setSelectedBuddyChat(null)} className="text-xs text-orange-400 font-semibold">Retour</button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 py-2">
                    {allMessages.filter(m => (m.sender_id === user?.id && m.receiver_id === selectedBuddyChat.id) || (m.sender_id === selectedBuddyChat.id && m.receiver_id === user?.id)).map((m, i) => (
                      <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2.5 rounded-xl text-xs max-w-[80%] ${m.sender_id === user?.id ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-neutral-800">
                    <input type="text" placeholder="Écris ton message..." value={currentMessageInput} onChange={(e) => setCurrentMessageInput(e.target.value)} className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    <button onClick={handleSendMessage} className="bg-orange-600 px-4 py-2 rounded-xl text-xs font-bold text-white">Envoyer</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-neutral-400">Choisis un partenaire dans la liste pour discuter :</p>
                  {registeredUsers.filter(u => u.id !== user?.id).map(buddy => (
                    <div key={buddy.id} onClick={() => setSelectedBuddyChat(buddy)} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-orange-500/50 transition">
                      <div className="flex items-center gap-3">
                        <img src={buddy.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-xs text-white">{buddy.username}</div>
                          <div className="text-[10px] text-neutral-400">{buddy.home_club}</div>
                        </div>
                      </div>
                      <span className="text-xs text-orange-400 font-bold">Ouvrir le chat 💬</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ONGLET PROFIL COMPLET */}
          {currentTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
                <img src={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} alt="" className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-orange-500 shadow-xl" />
                <div>
                  <h2 className="font-extrabold text-base text-white">{currentUsername}</h2>
                  <p className="text-xs text-orange-400 font-semibold">{currentUserProfile?.home_club || 'Club partenaire'}</p>
                </div>
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-left space-y-2">
                  <p className="text-neutral-300"><strong>Objectif :</strong> {currentUserProfile?.goal || 'Musculation / Force'}</p>
                  <p className="text-neutral-300"><strong>Points Ligue :</strong> <span className="text-orange-400 font-bold">{currentUserProfile?.points || 0} pts</span></p>
                </div>
                <button onClick={async () => { await supabase.auth.signOut(); setUser(null); localStorage.clear(); window.location.reload(); }} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-red-400 font-bold rounded-2xl text-xs transition">
                  Se déconnecter 🚪
                </button>
              </div>
            </div>
          )}

          {/* --- ESPACE BOXWARS --- */}
          {currentTab === 'boxwars' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-900/60 to-neutral-900 border border-cyan-500/30 rounded-3xl p-5 text-white">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4" /> Univers CrossFit
                </div>
                <h2 className="text-xl font-black">BoxWars Live</h2>
                <p className="text-xs text-neutral-300 mt-1">Enregistre tes WODs, consulte les scores de la box et partage tes perfs en direct.</p>
              </div>

              <div className="flex gap-2 border-b border-neutral-800 pb-2">
                <button onClick={() => setBoxSubTab('wods')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${boxSubTab === 'wods' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400'}`}>Classement WODs</button>
                <button onClick={() => setBoxSubTab('feed')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${boxSubTab === 'feed' ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400'}`}>Actualité Box</button>
              </div>

              {boxSubTab === 'wods' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2"><Flame className="w-4 h-4 text-cyan-400" /> WODs Cloud</h3>
                    <button onClick={() => setShowWodModal(true)} className="bg-cyan-500 text-neutral-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5 stroke-[3]" /> Logger un score</button>
                  </div>

                  {showWodModal && (
                    <form onSubmit={handleAddBoxWod} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs text-cyan-400">Enregistrer un WOD</h4>
                        <button type="button" onClick={() => setShowWodModal(false)} className="text-neutral-400"><X className="w-4 h-4" /></button>
                      </div>
                      <input type="text" placeholder="Nom du WOD (ex: Fran)" value={newWodTitle} onChange={e => setNewWodTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" required />
                      <input type="text" placeholder="Score (ex: 4:15)" value={newWodScore} onChange={e => setNewWodScore(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white" required />
                      <button type="submit" className="w-full py-2.5 bg-cyan-500 text-neutral-950 font-bold rounded-xl text-xs">Valider et publier ⚡</button>
                    </form>
                  )}

                  {loadingBoxWods ? <p className="text-xs text-neutral-500 text-center py-4">Chargement...</p> : boxWods.map(wod => (
                    <div key={wod.id} className="bg-neutral-900 border border-neutral-800/80 p-3.5 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-xs text-white">{wod.title}</div>
                        <div className="text-[11px] text-neutral-400">Athlète : {wod.author || 'Inconnu'}</div>
                      </div>
                      <div className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-xl">{wod.score}</div>
                    </div>
                  ))}
                </div>
              )}

              {boxSubTab === 'feed' && (
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400"><MessageSquareText className="w-4 h-4" /> Annonce de la Box</div>
                  <p className="text-xs text-neutral-300">Rappel : Compétition inter-box ce week-end ! 🏆🔥</p>
                </div>
              )}
            </div>
          )}

        </main>

        {/* MODAL DE PUBLICATION DE SÉANCE */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" /> Partager une séance
                </h3>
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handlePublishPost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Type de séance :</label>
                  <select value={postSessionType} onChange={(e) => setPostSessionType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white">
                    <option value="Musculation Full Body">Musculation Full Body</option>
                    <option value="Pectoraux / Triceps">Pectoraux / Triceps</option>
                    <option value="Dos / Biceps">Dos / Biceps</option>
                    <option value="Jambes / Abdos">Jambes / Abdos</option>
                    <option value="Cardio / HIIT">Cardio / HIIT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Légende :</label>
                  <textarea rows={3} placeholder="Comment s'est passée ta séance ?" value={postCaption} onChange={(e) => setPostCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Photo (Galerie ou Appareil) :</label>
                  <button type="button" onClick={() => postImageFileInputRef.current?.click()} className="w-full py-3 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4 text-orange-500" /> Choisir une image
                  </button>
                  <input type="file" accept="image/*" ref={postImageFileInputRef} onChange={handlePostImageFileSelect} className="hidden" />
                </div>

                {postImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden h-36 border border-neutral-800">
                    <img src={postImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPostImageUrl(null)} className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white"><X className="w-4 h-4" /></button>
                  </div>
                )}

                <button type="submit" className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-sm shadow-xl">
                  Publier sur le fil (+10 pts 🚀)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* NAVIGATION DU BAS */}
        <nav className="sticky bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 px-2 py-2 flex justify-around items-center">
          <button onClick={() => handleTabChange('feed')} className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Home className="w-5 h-5" /><span className="text-[10px]">Accueil</span></button>
          <button onClick={() => handleTabChange('leaderboard')} className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'leaderboard' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Trophy className="w-5 h-5" /><span className="text-[10px]">Ligue</span></button>
          
          <button onClick={() => setIsPostModalOpen(true)} className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg transition transform hover:scale-105 active:scale-95 -mt-3">
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button onClick={() => handleTabChange('boxwars')} className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'boxwars' ? 'text-cyan-400 font-bold' : 'text-neutral-500'}`}>
            <Zap className="w-5 h-5" />
            <span className="text-[10px]">BoxWars</span>
          </button>

          <button onClick={() => handleTabChange('chat')} className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><MessageCircle className="w-5 h-5" /><span className="text-[10px]">Chat</span></button>

          <button onClick={() => handleTabChange('profile')} className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><User className="w-5 h-5" /><span className="text-[10px]">Profil</span></button>
        </nav>
      </div>
    </div>
  );
}
