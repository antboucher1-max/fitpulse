import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import {
  Zap, User, MessageCircle, Home, Plus, X, Camera, Flame, MapPin, Trophy, Navigation, Calendar, Activity, BarChart2
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

import { 
  TransformationPhoto, Post, Story, RealUser, FriendRequest, DBMessage 
} from './types';

import FeedTab from './components/FeedTab';
import BuddyTab from './components/BuddyTab';
import WodTimerTab from './components/WodTimerTab';
import CalculatorTab from './components/CalculatorTab';
import PaceCalculatorTab from './components/PaceCalculatorTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';
import LeaderboardTab from './components/LeaderboardTab';
import BoxWarsTab from './components/BoxWarsTab';
import RunningTab from './components/RunningTab';
import ReadinessCheckin from './components/ReadinessCheckin';
import TrainingPlanTab from './components/TrainingPlanTab';
import RoadbookTab from './components/RoadbookTab';

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
  const [authLoading, setAuthLoading] = useState(true);
   
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [acceptCgu, setAcceptCgu] = useState(false);

  // Navigation simplifiée : 'today' (Dashboard), 'training' (Plan, Roadbook, Outils), 'community' (Feed/Ligue)
  const [currentTab, setCurrentTab] = useState<'today' | 'training' | 'community' | 'profile' | 'chat'>(() => {
    const savedTab = localStorage.getItem('fitpulse_active_tab');
    return (savedTab as any) || 'today';
  });

  // Sous-onglet pour la section "Entraînement" (Plan vs Outils/Calculateurs)
  const [trainingSubTab, setTrainingSubTab] = useState<'plan' | 'roadbook' | 'calculators' | 'running'>('plan');

  const [selectedClub, setSelectedClub] = useState<string>('🌐 Tous les clubs (Global)');
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [userAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150');
   
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const postImageFileInputRef = useRef<HTMLInputElement>(null);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postSessionType, setPostSessionType] = useState('Musculation / Course');
  const [postCaption, setPostCaption] = useState('');
  const [postHashtags] = useState('#fitpulse');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(false);

  const [transformations, setTransformations] = useState<TransformationPhoto[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RealUser[]>([]);
  const [cloudStories] = useState<Story[]>([]);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
   
  const [viewedStoryIds] = useState<string[]>([]);
  const [viewingProfileUser, setViewingProfileUser] = useState<RealUser | null>(null);
  const [, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isOtherUserTyping] = useState(false);

  const [onboardingUsername, setOnboardingUsername] = useState('');
  const [onboardingAgeGroup, setOnboardingAgeGroup] = useState('26-35 ans');
  const [onboardingClub, setOnboardingClub] = useState(CLUBS_LIST[0]);
  const [onboardingGoal] = useState('Prise de masse / Force');
  const [onboardingGender, setOnboardingGender] = useState('Homme');
  const [onboardingTime, setOnboardingTime] = useState('Soir');
  const [onboardingDiscipline, setOnboardingDiscipline] = useState('Fitness / Musculation');
  const [onboardingAvatar] = useState<string>('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150');
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
   
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('fitpulse_read_timestamps');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newTransNote, setNewTransNote] = useState('');
  const [newTransWeight, setNewTransWeight] = useState<number | ''>('');
  const [newTransBefore, setNewTransBefore] = useState<string | null>(null);
  const [newTransAfter, setNewTransAfter] = useState<string | null>(null);
  const [newTransIsPrivate, setNewTransIsPrivate] = useState<boolean>(true);

  const [, setActiveCommentPostId] = useState<string | null>(null);

  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setFeedLoading(false);
  };

  const fetchRealUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setRegisteredUsers(data as RealUser[]);
  };

  const fetchTransformations = async (userId: string) => {
    const { data } = await supabase.from('transformations').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (data) setTransformations(data as TransformationPhoto[]);
  };

  const fetchFriendRequests = async (userId: string) => {
    const { data } = await supabase.from('friend_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (data) setFriendRequests(data as FriendRequest[]);
  };

  const fetchAllMessages = async () => {
    const { data } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (data) setAllMessages(data as DBMessage[]);
  };

  const addPointsToUser = async (userId: string, pointsToAdd: number) => {
    const targetUser = registeredUsers.find(u => u.id === userId);
    const currentPoints = (targetUser as any)?.points || 0;
    const newTotalPoints = currentPoints + pointsToAdd;

    const { error } = await supabase
      .from('profiles')
      .update({ points: newTotalPoints })
      .eq('id', userId);

    if (!error) {
      fetchRealUsers();
    }
  };

  const calculateUserStreak = (targetUserId: string) => {
    if (!user || !targetUserId) return 0;
    const convo = allMessages.filter(
      m => (m.sender_id === user.id && m.receiver_id === targetUserId) ||
           (m.sender_id === targetUserId && m.receiver_id === user.id)
    );
    if (convo.length === 0) return 0;

    const activeDays = new Set<string>();
    convo.forEach(m => {
      if (m.created_at) activeDays.add(m.created_at.split('T')[0]);
    });

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      if (activeDays.has(dateString)) streak++;
      else if (i > 0) break;
    }
    return streak > 0 ? streak : 1;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTransformations(session.user.id);
        fetchFriendRequests(session.user.id);
      }
      setAuthLoading(false);
    });

    fetchCloudPosts();
    fetchRealUsers();
    fetchAllMessages();

    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? (payload.new as Post) : p));
        } else if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new as Post, ...prev]);
        }
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('public:direct_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        setAllMessages(prev => [...prev, payload.new as DBMessage]);
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchRealUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const handleTabChange = (tab: any) => { 
    setCurrentTab(tab); 
    localStorage.setItem('fitpulse_active_tab', tab);
  };

  const handleOpenChatWithUser = (buddy: RealUser) => {
    setSelectedBuddyChat(buddy);
    const newTimestamps = { ...lastReadTimestamps, [buddy.id]: Date.now() };
    setLastReadTimestamps(newTimestamps);
    localStorage.setItem('fitpulse_read_timestamps', JSON.stringify(newTimestamps));
  };

  const currentUserProfile = registeredUsers.find(u => u.id === user?.id);
  const currentUsername = currentUserProfile?.username || user?.user_metadata?.username || 'Athlète';

  const handleSendMessage = async () => {
    if (!currentMessageInput.trim() || !selectedBuddyChat || !user) return;
    const text = currentMessageInput.trim(); setCurrentMessageInput('');
    await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: selectedBuddyChat.id, sender_name: currentUsername, text }]);
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const likedByList = post.liked_by || [];
    const hasLiked = likedByList.includes(user.id);
    const updatedLikedBy = hasLiked ? likedByList.filter(id => id !== user.id) : [...likedByList, user.id];
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
      avatar_url: currentUserProfile?.avatar_url || userAvatarUrl,
      club_name: selectedClub === '🌐 Tous les clubs (Global)' ? 'Club Tournai (Bastion)' : selectedClub,
      session_type: postSessionType,
      caption: fullCaption,
      image_url: postImageUrl,
      exercises: [],
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      comments: [],
      is_private: false
    }]);

    if (!error) {
      const pointsToAdd = 10;
      const currentMuscuPts = currentUserProfile?.points_muscu || 0;
      const currentGlobalPts = currentUserProfile?.points_global || currentUserProfile?.points || 0;

      await supabase.from('profiles').update({ 
        points_muscu: currentMuscuPts + pointsToAdd,
        points_global: currentGlobalPts + pointsToAdd,
        points: currentGlobalPts + pointsToAdd 
      }).eq('id', user.id);

      setIsPostModalOpen(false);
      setPostCaption('');
      setPostImageUrl(null);
      fetchCloudPosts();
      fetchRealUsers();
    } else {
      alert("Erreur lors de la publication : " + error?.message);
    }
  };

  const acceptedFriendIds = friendRequests.filter(req => req.status === 'accepted').map(req => (req.sender_id === user?.id ? req.receiver_id : req.sender_id));
  const activeChatUsers = registeredUsers.filter((u) => u.id !== user?.id && acceptedFriendIds.includes(u.id));
   
  const displayedPosts = posts.filter((post) => {
    if (selectedClub === '🌐 Tous les clubs (Global)') return true;
    return isMatchingClub(post.club_name, selectedClub);
  });

  const currentChatMessages = allMessages.filter((m) => selectedBuddyChat && user && ((m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id) || (m.sender_id === selectedBuddyChat.id && m.receiver_id === user.id)));

  const isAdmin = currentUserProfile?.is_admin || user?.email === 'antboucher@hotmail.fr';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center animate-pulse">
          ⚡
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center font-sans p-4 select-none">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl relative">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">FitPulse</h1>
            <p className="text-xs text-orange-400 font-semibold">La Ligue des Clubs & Suivi d'Entraînement</p>
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
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl relative">
          <button 
            type="button" 
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
              window.location.reload();
            }} 
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition mb-1"
          >
            ← Retour à la connexion
          </button>

          <h1 className="text-lg font-black text-white text-center">Bienvenue sur FitPulse !</h1>
           
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!onboardingUsername.trim()) { alert("Pseudo requis"); return; }
            setOnboardingSubmitting(true);
             
            try {
              const { error } = await supabase.from('profiles').upsert({
                id: user.id, 
                username: onboardingUsername.trim(), 
                home_club: onboardingClub, 
                goal: onboardingGoal, 
                gender: onboardingGender, 
                preferred_time: onboardingTime,
                avatar_url: onboardingAvatar, 
                points: 0, 
                is_admin: user.email === 'antboucher@hotmail.fr'
              });

              if (error) {
                alert("Erreur Supabase : " + error.message);
              } else {
                await fetchRealUsers();
                window.location.reload();
              }
            } catch (err: any) {
              alert("Erreur inattendue : " + (err.message || err));
            } finally {
              setOnboardingSubmitting(false);
            }
          }} className="space-y-3">
            <input type="text" required placeholder="Ton Pseudo" value={onboardingUsername} onChange={(e) => setOnboardingUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white" />
             
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Discipline principale :</label>
              <select value={onboardingDiscipline} onChange={(e) => setOnboardingDiscipline(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="Fitness / Musculation">💪 Fitness / Musculation</option>
                <option value="Course à pied">🏃‍♂️ Course à pied</option>
                <option value="Crossfit">⚡ Crossfit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Tranche d'âge :</label>
              <select value={onboardingAgeGroup} onChange={(e) => setOnboardingAgeGroup(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="Moins de 18 ans">Moins de 18 ans</option>
                <option value="18-25 ans">18-25 ans</option>
                <option value="26-35 ans">26-35 ans</option>
                <option value="36-45 ans">36-45 ans</option>
                <option value="46-55 ans">46-55 ans</option>
                <option value="Plus de 55 ans">Plus de 55 ans</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Genre :</label>
              <select value={onboardingGender} onChange={(e) => setOnboardingGender(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Créneau horaire habituel :</label>
              <select value={onboardingTime} onChange={(e) => setOnboardingTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="Matin">Matin</option>
                <option value="Midi">Midi</option>
                <option value="Soir">Soir</option>
              </select>
            </div>

            <select value={onboardingClub} onChange={(e) => setSelectedClub(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
              {CLUBS_LIST.map((club) => <option key={club} value={club}>{club}</option>)}
            </select>

            <button type="submit" disabled={onboardingSubmitting} className="w-full py-3 bg-orange-600 text-white font-bold rounded-2xl text-sm">
              {onboardingSubmitting ? "Validation en cours..." : "Valider 🚀"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none antialiased relative">
      <div className="w-full max-w-md mx-auto min-h-screen bg-neutral-950 flex flex-col shadow-2xl sm:border-x sm:border-neutral-900 relative">
        
        {/* HEADER ÉPURÉ */}
        <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-base font-black tracking-tight leading-none text-white">FitPulse</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1.5 flex-shrink-0" />
              <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} className="bg-transparent text-xs font-bold text-orange-400 focus:outline-none cursor-pointer pr-1">
                <option value="🌐 Tous les clubs (Global)">🌐 Tous les clubs (Global)</option>
                {CLUBS_LIST.map((club) => <option key={club} value={club} className="bg-neutral-900 text-white">{club}</option>)}
              </select>
            </div>
            <button onClick={() => handleTabChange('chat')} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* CONTENU PRINCIPAL SELON L'ONGLET ACTIF */}
        <main className="flex-1 w-full mx-auto px-4 py-3 pb-24 space-y-4">
          
          {/* 1. ONGLET "AUJOURD'HUI" (Dashboard central & Check-in de forme) */}
          {currentTab === 'today' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-orange-500/10 via-neutral-900 to-neutral-900 border border-orange-500/20 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">⚡ Statut de forme</span>
                  <span className="text-xs text-neutral-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <h2 className="text-lg font-black text-white">Bonjour, {currentUsername} !</h2>
                <p className="text-xs text-neutral-300">Remplis ton check-in matinal pour ajuster dynamiquement ta charge d'entraînement du jour.</p>
              </div>

              {/* Check-in de forme intégré directement sur le dashboard */}
              <ReadinessCheckin 
                currentUserId={user?.id} 
                onUpdatePlan={(rec) => alert(rec)} 
              />
            </div>
          )}

          {/* 2. ONGLET "ENTRAÎNEMENT & PROGRÈS" (Plan, Roadbook, Calculateurs VMA/1RM) */}
          {currentTab === 'training' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Sous-navigation interne pour trier les outils d'entraînement */}
              <div className="grid grid-cols-4 gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 text-center">
                <button 
                  onClick={() => setTrainingSubTab('plan')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition ${trainingSubTab === 'plan' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  Plan
                </button>
                <button 
                  onClick={() => setTrainingSubTab('roadbook')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition ${trainingSubTab === 'roadbook' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  Roadbook
                </button>
                <button 
                  onClick={() => setTrainingSubTab('running')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition ${trainingSubTab === 'running' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  GPS
                </button>
                <button 
                  onClick={() => setTrainingSubTab('calculators')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition ${trainingSubTab === 'calculators' ? 'bg-cyan-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  Outils
                </button>
              </div>

              {trainingSubTab === 'plan' && <TrainingPlanTab currentUserId={user?.id} />}
              {trainingSubTab === 'roadbook' && <RoadbookTab currentUserId={user?.id} />}
              {trainingSubTab === 'running' && (
                <RunningTab 
                  currentUserId={user?.id} 
                  currentUsername={currentUsername} 
                  selectedClub={selectedClub} 
                  currentUserProfile={currentUserProfile} 
                  userAvatarUrl={userAvatarUrl} 
                  onRefreshFeed={fetchCloudPosts} 
                />
              )}
              {trainingSubTab === 'calculators' && (
                <div className="space-y-4">
                  <CalculatorTab />
                  <PaceCalculatorTab />
                </div>
              )}
            </div>
          )}

          {/* 3. ONGLET "COMMUNAUTÉ & LIGUE" (Feed social, BoxWars, Classement) */}
          {currentTab === 'community' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
                <button onClick={() => setCurrentTab('community')} className="text-xs font-bold text-orange-400">📢 Fil d'actualité</button>
                <button onClick={() => setCurrentTab('profile')} className="text-xs font-bold text-neutral-400 hover:text-white">🏆 Ligue & Classement</button>
              </div>
              <FeedTab 
                stories={cloudStories} 
                posts={displayedPosts} 
                registeredUsers={registeredUsers} 
                friendRequests={friendRequests} 
                currentUserId={user?.id} 
                userDiscipline={currentUserProfile?.discipline} 
                feedLoading={feedLoading} 
                viewedStoryIds={viewedStoryIds} 
                calculateStreak={calculateUserStreak} 
                onOpenStory={(idx) => setActiveStoryIndex(idx)} 
                onCreateStoryClick={() => setIsPostModalOpen(true)} 
                onToggleLike={handleToggleLike} 
                onOpenComments={(id) => setActiveCommentPostId(id)} 
                onReportPost={() => {}} 
                onDeletePost={() => {}} 
                onSelectProfile={(u) => setViewingProfileUser(u)} 
                onStartRestTimer={() => {}} 
              />
            </div>
          )}

          {/* 4. ONGLET "PROFIL & STATS" */}
          {currentTab === 'profile' && (
            <ProfileTab 
              user={user} 
              currentUserProfile={currentUserProfile} 
              userAvatarUrl={currentUserProfile?.avatar_url || userAvatarUrl} 
              isAdmin={isAdmin} 
              registeredUsers={registeredUsers} 
              transformations={transformations} 
              newTransBefore={newTransBefore} 
              newTransAfter={newTransAfter} 
              newTransWeight={newTransWeight} 
              newTransNote={newTransNote} 
              newTransIsPrivate={newTransIsPrivate} 
              setNewTransWeight={setNewTransWeight} 
              setNewTransNote={setNewTransNote} 
              setNewTransIsPrivate={setNewTransIsPrivate} 
              onAvatarClick={() => profileAvatarInputRef.current?.click()} 
              onCameraStart={() => {}} 
              onBeforeFileSelect={() => {}} 
              onAfterFileSelect={() => {}} 
              onAddTransformation={async (e) => { e.preventDefault(); if (!user || newTransWeight === '') return; await supabase.from('transformations').insert([{ user_id: user.id, before_url: newTransBefore || '', after_url: newTransAfter || '', date: new Date().toISOString().split('T')[0], weight: Number(newTransWeight), note: newTransNote || 'Évolution', is_private: newTransIsPrivate }]); await addPointsToUser(user.id, 25); fetchTransformations(user.id); setNewTransWeight(''); setNewTransNote(''); }} 
              onShareTransformation={() => {}} 
              onUpdatePasswordSubmit={async (e) => { e.preventDefault(); await supabase.auth.updateUser({}); }} 
              password={password} 
              setPassword={setPassword} 
              confirmPassword={confirmPassword} 
              setConfirmPassword={setConfirmPassword} 
              isPrivateMode={isPrivateMode} 
              setIsPrivateMode={setIsPrivateMode} 
              onSignOut={async () => { await supabase.auth.signOut(); setUser(null); localStorage.clear(); window.location.reload(); }} 
              onToggleVerifyAdmin={async (uId, status) => { await supabase.from('profiles').update({ is_verified: !status }).eq('id', uId); fetchRealUsers(); }} 
              onUpdateProfile={async (updatedData) => { if (!user) return; await supabase.from('profiles').upsert({ id: user.id, ...updatedData }); fetchRealUsers(); }} 
              beforeFileInputRef={beforeFileInputRef} 
              afterFileInputRef={afterFileInputRef} 
            />
          )}

          {/* CHAT DÉDIÉ */}
          {currentTab === 'chat' && (
            <ChatTab 
              currentUserId={user?.id} 
              selectedBuddyChat={selectedBuddyChat} 
              setSelectedBuddyChat={handleOpenChatWithUser} 
              activeChatUsers={activeChatUsers} 
              currentChatMessages={currentChatMessages} 
              currentMessageInput={currentMessageInput} 
              onInputChange={(e) => setCurrentMessageInput(e.target.value)} 
              onSendMessage={handleSendMessage} 
              onSelectBuddy={(f) => handleOpenChatWithUser(f)} 
              onDeleteConversation={() => {}} 
              onReportConversation={() => {}} 
              isOtherUserTyping={isOtherUserTyping} 
              isMessageLimitReached={false} 
              lastReadTimestamps={lastReadTimestamps} 
              messagesEndRef={messagesEndRef} 
              allMessages={allMessages} 
            />
          )}

        </main>

        {/* MODALE DE PUBLICATION DE SÉANCE RAPIDE */}
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
                    <option value="Course à pied / Sortie longue">Course à pied / Sortie longue</option>
                    <option value="Fractionné / VMA">Fractionné / VMA</option>
                    <option value="Crossfit / WOD">Crossfit / WOD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Légende :</label>
                  <textarea rows={3} placeholder="Comment s'est passée ta séance ?" value={postCaption} onChange={(e) => setPostCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Photo :</label>
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

        {/* BARRE DE NAVIGATION INFÉRIEURE ÉPURÉE (3 ONGLES MAJEURS + BOUTON ACTION) */}
        <nav className="sticky bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 px-4 py-2 flex justify-around items-center">
          <button 
            onClick={() => handleTabChange('today')} 
            className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'today' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Aujourd'hui</span>
          </button>

          <button 
            onClick={() => handleTabChange('training')} 
            className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'training' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px]">Entraînement</span>
          </button>

          {/* BOUTON CENTRAL D'ACTION RAPIDE (+) */}
          <button 
            onClick={() => setIsPostModalOpen(true)} 
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg transition transform hover:scale-105 active:scale-95 -mt-3"
            title="Publier une séance"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button 
            onClick={() => handleTabChange('community')} 
            className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'community' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px]">Ligue</span>
          </button>

          <button 
            onClick={() => handleTabChange('profile')} 
            className={`flex flex-col items-center gap-1 transition active:scale-95 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profil</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
