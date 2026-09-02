import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import {
  Zap, User, MessageCircle, Home, Users, Plus, X, Camera, Flame, MapPin, Trophy, Navigation, Calendar, Skull, BatteryCharging, ArrowRight, Activity, Sparkles, Play, Dumbbell, Settings
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

import { 
  TransformationPhoto, Post, RealUser, FriendRequest, DBMessage 
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
import OfflineRunGuard from './components/OfflineRunGuard';
import WodGenerator from './components/WodGenerator';
import OnboardingGuide from './components/OnboardingGuide';
import GymLogTab from './components/GymLogTab';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const RUNNING_SPOTS = [
  'Antoing (Canaux & Carrières)',
  'Binche (Remparts & Périphérie)',
  'Estaimpuis (Canal de l’Espierre)',
  'Farciennes (Sambre & Rives)',
  'Ham-sur-Heure-Nalinnes (Basses-Sambres & Rées)',
  'Manage (Canal historique du Centre)',
  'Mons (Grand-Place & Grand Large)',
  'Saint-Ghislain (Hauts-Borains & Canaux)',
  'Tournai (Quais de l’Escaut & Parc)'
];

const FITNESS_SPOTS = [
  'Ath (Centre & Zones Fitness)',
  'Beloeil (Entité & Salles de proximité)',
  'Colfontaine (Pôle sportif local)',
  'Genly (Espaces Forme & Muscu)',
  'Leuze-en-Hainaut (Centre & Salles)',
  'Mons (Pôles Fitness & Musculation)',
  'Mouscron (Salles de référence & Fitness)',
  'Péruwelz (Centres de remise en forme)',
  'Tournai (Pôles Fitness & Muscu / Froyennes)'
];

const CROSSFIT_SPOTS = [
  'Ath (Box & Affiliées)',
  'Beloeil (Entité CrossFit & Training)',
  'Bernissart (Espaces WOD & Fonctionnel)',
  'Binche (Boxes & Entraînement fonctionnel)',
  'Charleroi (Pôle CrossFit & Haltérophilie)',
  'Frasnes-lez-Gosselies (Zones WOD)',
  'Genly (Boxes & Entraînement intensif)',
  'Le Roeulx (Espaces CrossFit)',
  'Mons (Boxes & Affiliées principales)',
  'Montigny-le-Tilleul (Salles & Boxes)',
  'Mouscron (Boxes & Cross Training)',
  'Rumes (Espaces WOD locaux)',
  'Saint-Ghislain (Boxes & Entraînement fonctionnel)',
  'Soignies (Boxes & Haltérophilie)',
  'Tournai (Boxes & Affiliées principales)'
];

const getSpotsByDiscipline = (discipline: string) => {
  if (discipline === 'Course à pied') return RUNNING_SPOTS;
  if (discipline === 'Crossfit') return CROSSFIT_SPOTS;
  return FITNESS_SPOTS;
};

const isMatchingClub = (postClubName?: string, selectedClubName?: string): boolean => {
  if (!postClubName || !selectedClubName) return false;
  if (selectedClubName.includes('Tous les spots')) return true;
  if (postClubName === selectedClubName) return true;
  const normalize = (str: string) => str.toLowerCase().replace(/[()]/g, '').trim();
  const p = normalize(postClubName); const s = normalize(selectedClubName);
  return p === s || p.includes(s) || s.includes(p);
};

const isMarathonWeek = (targetMarathonDate?: string): boolean => {
  if (!targetMarathonDate) return false;
  const today = new Date().getTime();
  const marathonTime = new Date(targetMarathonDate).getTime();
  const diffDays = (marathonTime - today) / (1000 * 3600 * 24);
  return diffDays >= 0 && diffDays <= 7;
};

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
   
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [acceptCgu, setAcceptCgu] = useState(false);

  const [currentTab, setCurrentTab] = useState<'today' | 'community' | 'profile' | 'feed' | 'buddy' | 'workout' | 'exercises' | 'chat' | 'calculator' | 'paces' | 'live_tracker' | 'rest_timer' | 'notifications' | 'leaderboard' | 'boxwars' | 'running' | 'readiness' | 'hall_of_fame'>(() => {
    const savedTab = localStorage.getItem('fitpulse_active_tab');
    return (savedTab as any) || 'today';
  });

  const [selectedClub, setSelectedClub] = useState<string>('🌐 Tous les spots (Global)');
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [userAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150');
   
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const postImageFileInputRef = useRef<HTMLInputElement>(null);

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isBoxWarsModalOpen, setIsBoxWarsModalOpen] = useState(false);
  
  // NOUVEAUX ÉTATS POUR LES SOUS-MENUS DU DASHBOARD (LA BOÎTE À OUTILS)
  const [isGymLogOpen, setIsGymLogOpen] = useState(false);
  const [isWodGeneratorOpen, setIsWodGeneratorOpen] = useState(false);

  const [postSessionType, setPostSessionType] = useState('Musculation Full Body');
  const [postCaption, setPostCaption] = useState('');
  const [postHashtags] = useState('#fitpulse #workout');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(false);

  const [transformations, setTransformations] = useState<TransformationPhoto[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RealUser[]>([]);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  const [userShoes, setUserShoes] = useState<any[]>([]);
   
  const [viewingProfileUser, setViewingProfileUser] = useState<RealUser | null>(null);
  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isOtherUserTyping] = useState(false);

  const [onboardingUsername, setOnboardingUsername] = useState('');
  const [onboardingAgeGroup, setOnboardingAgeGroup] = useState('26-35 ans');
  const [onboardingDisciplines, setOnboardingDisciplines] = useState<string[]>(['Fitness / Musculation']);
  const [onboardingMainDiscipline, setOnboardingMainDiscipline] = useState<string>('Fitness / Musculation');
  const [onboardingSpot, setOnboardingSpot] = useState(FITNESS_SPOTS[0]);
  const [onboardingGoal] = useState('Prise de masse / Force');
  const [onboardingGender, setOnboardingGender] = useState('Homme');
  const [onboardingTime, setOnboardingTime] = useState('Soir');
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

  const fetchUserShoes = async (userId: string) => {
    const { data } = await supabase.from('running_shoes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) setUserShoes(data);
  };

  const handleAddShoe = async (brand: string, model: string, maxKm: number) => {
    if (!user) return;
    const isFirst = userShoes.length === 0;
    await supabase.from('running_shoes').insert([{
      user_id: user.id,
      brand,
      model,
      max_km: maxKm,
      current_km: 0,
      is_active: isFirst
    }]);
    fetchUserShoes(user.id);
  };

  const handleDeleteShoe = async (shoeId: string) => {
    if (!user) return;
    await supabase.from('running_shoes').delete().eq('id', shoeId);
    fetchUserShoes(user.id);
  };

  const handleSetActiveShoe = async (shoeId: string) => {
    if (!user) return;
    await supabase.from('running_shoes').update({ is_active: false }).eq('user_id', user.id);
    await supabase.from('running_shoes').update({ is_active: true }).eq('id', shoeId);
    fetchUserShoes(user.id);
  };

  const handleSaveVma = async (newVma: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ vma: newVma })
      .eq('id', user.id);

    if (!error) {
      fetchRealUsers();
    } else {
      alert("Erreur lors de la sauvegarde de la VMA : " + error.message);
    }
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
        fetchUserShoes(session.user.id);
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
      club_name: selectedClub === '🌐 Tous les spots (Global)' ? 'Tournai (Quais de l’Escaut & Parc)' : selectedClub,
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
      const currentMuscuPts = (currentUserProfile as any)?.points_muscu || 0;
      const currentGlobalPts = (currentUserProfile as any)?.points_global || (currentUserProfile as any)?.points || 0;

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
    if (selectedClub === '🌐 Tous les spots (Global)') return true;
    return isMatchingClub(post.club_name, selectedClub);
  });

  const currentChatMessages = allMessages.filter((m) => selectedBuddyChat && user && ((m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id) || (m.sender_id === selectedBuddyChat.id && m.receiver_id === user.id)));

  const isAdmin = currentUserProfile?.is_admin || user?.email === 'antboucher@hotmail.fr';

  const marathonDate = (currentUserProfile as any)?.next_marathon_date;
  const inTaperingWeek = isMarathonWeek(marathonDate);

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
            <p className="text-xs text-orange-400 font-semibold">Trouve tes partenaires & Spots d'entraînement</p>
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
    const currentAvailableSpots = getSpotsByDiscipline(onboardingMainDiscipline);

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

          <div className="text-center space-y-1">
            <h1 className="text-lg font-black text-white">Crée ton profil sportif</h1>
            <p className="text-xs text-neutral-400">Pour trouver tes partenaires de training.</p>
          </div>
           
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!onboardingUsername.trim()) { alert("Pseudo requis"); return; }
            setOnboardingSubmitting(true);
             
            try {
              const profileData: any = {
                id: user.id, 
                username: onboardingUsername.trim(), 
                home_club: onboardingSpot, 
                goal: onboardingGoal, 
                gender: onboardingGender, 
                preferred_time: onboardingTime,
                avatar_url: onboardingAvatar, 
                points: 0, 
                is_admin: user.email === 'antboucher@hotmail.fr'
              };

              try {
                profileData.discipline = onboardingMainDiscipline;
                profileData.disciplines = onboardingDisciplines.join(',');
              } catch (_) {}

              const { error } = await supabase.from('profiles').upsert(profileData);

              if (error) {
                const { error: retryError } = await supabase.from('profiles').upsert({
                  id: user.id, 
                  username: onboardingUsername.trim(), 
                  home_club: onboardingSpot, 
                  goal: onboardingGoal, 
                  gender: onboardingGender, 
                  preferred_time: onboardingTime,
                  avatar_url: onboardingAvatar, 
                  points: 0, 
                  is_admin: user.email === 'antboucher@hotmail.fr'
                });
                if (retryError) {
                  alert("Erreur Supabase : " + retryError.message);
                } else {
                  await fetchRealUsers();
                  window.location.reload();
                }
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
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Pseudo / Prénom :</label>
              <input type="text" required placeholder="Ex: Antoine" value={onboardingUsername} onChange={(e) => setOnboardingUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white" />
            </div>
             
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Disciplines pratiquées (Sélection multiple) :</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'Fitness / Musculation', label: '💪 Fitness / Musculation' },
                  { id: 'Course à pied', label: '🏃‍♂️ Course à pied' },
                  { id: 'Crossfit', label: '⚡ Crossfit' }
                ].map((item) => {
                  const isSelected = onboardingDisciplines.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        let updated: string[];
                        if (isSelected) {
                          if (onboardingDisciplines.length === 1) return;
                          updated = onboardingDisciplines.filter(d => d !== item.id);
                          if (onboardingMainDiscipline === item.id) {
                            setOnboardingMainDiscipline(updated[0]);
                          }
                        } else {
                          updated = [...onboardingDisciplines, item.id];
                        }
                        setOnboardingDisciplines(updated);
                        const newSpots = getSpotsByDiscipline(updated[0]);
                        setOnboardingSpot(newSpots[0]);
                      }}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <span className="text-[10px] bg-orange-500 text-neutral-950 px-2 py-0.5 rounded-full font-black">Actif</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {onboardingDisciplines.length > 1 && (
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Discipline dominante (pour le spot de référence) :</label>
                <select 
                  value={onboardingMainDiscipline} 
                  onChange={(e) => {
                    const mainDisc = e.target.value;
                    setOnboardingMainDiscipline(mainDisc);
                    const newSpots = getSpotsByDiscipline(mainDisc);
                    setOnboardingSpot(newSpots[0]);
                  }} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white"
                >
                  {onboardingDisciplines.map((disc) => (
                    <option key={disc} value={disc}>{disc}</option>
                  ))}
                </select>
              </div>
            )}

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
              <label className="block text-xs text-neutral-400 mb-1">Créneau horaire de Match (Dispo) :</label>
              <select value={onboardingTime} onChange={(e) => setOnboardingTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="Matin">🌅 Matin</option>
                <option value="Midi">☀️ Midi</option>
                <option value="Soir">🌙 Soir</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Spot d'entraînement principal :</label>
              <select value={onboardingSpot} onChange={(e) => setOnboardingSpot(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white">
                {currentAvailableSpots.map((spot) => <option key={spot} value={spot}>{spot}</option>)}
              </select>
            </div>

            <button type="submit" disabled={onboardingSubmitting} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-sm transition cursor-pointer">
              {onboardingSubmitting ? "Validation..." : "Rejoindre la communauté 🚀"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allAvailableSpotsForUserDiscipline = getSpotsByDiscipline((currentUserProfile as any)?.discipline || 'Fitness / Musculation');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none antialiased relative">
      <div className="w-full max-w-md mx-auto min-h-screen bg-neutral-950 flex flex-col shadow-2xl sm:border-x sm:border-neutral-900 relative">
        <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${currentTab === 'boxwars' ? 'bg-cyan-500/20 text-cyan-400' : currentTab === 'running' ? 'bg-emerald-500/20 text-emerald-400' : currentTab === 'hall_of_fame' ? 'bg-red-500/20 text-red-400' : currentTab === 'buddy' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/20 text-orange-500'} flex items-center justify-center`}>
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-base font-black tracking-tight leading-none text-white">
              {currentTab === 'boxwars' ? 'BOXWARS' : currentTab === 'running' ? 'RUNNING' : currentTab === 'hall_of_fame' ? 'HALL OF FAME' : currentTab === 'buddy' ? 'BUDDIES & MATCH' : 'FitPulse'}
            </h1>
          </div>

          {currentTab !== 'boxwars' && currentTab !== 'running' && currentTab !== 'readiness' && currentTab !== 'paces' && currentTab !== 'calculator' && currentTab !== 'hall_of_fame' && currentTab !== 'buddy' && (
            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1.5 flex-shrink-0" />
              <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} className="bg-transparent text-xs font-bold text-orange-400 focus:outline-none cursor-pointer pr-1">
                <option value="🌐 Tous les spots (Global)">🌐 Tous les spots (Global)</option>
                {allAvailableSpotsForUserDiscipline.map((spot) => <option key={spot} value={spot} className="bg-neutral-900 text-white">{spot}</option>)}
              </select>
            </div>
          )}
        </header>

        <main className="flex-1 w-full mx-auto px-4 py-3 pb-32 space-y-3">
          {currentTab === 'running' && <OfflineRunGuard currentUserId={user?.id} />}

          {/* DÉBUT DU NOUVEAU DASHBOARD NETTOYÉ */}
          {currentTab === 'today' && (
            <div className="space-y-6 animate-fadeIn pb-12">
              <OnboardingGuide />

              {inTaperingWeek && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-5 text-center space-y-1 shadow-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                    ⚡ Semaine de Tapering & Affûtage
                  </span>
                  <h3 className="text-base font-black text-white pt-2">Objectif Marathon en approche</h3>
                  <p className="text-xs text-neutral-400">
                    Volume réduit, préservation des fibres musculaires et remplissage des stocks de glycogène.
                  </p>
                </div>
              )}

              {/* 1. CARTE MAÎTRE : LA "NEXT BEST ACTION" (Ultra Focus) */}
              <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-orange-500/30 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* En-tête du flux */}
                <div className="flex items-center justify-between relative z-10 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      État de Forme • Optimal (78%)
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Accroche principale */}
                <div className="relative z-10 space-y-1 mb-6">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Prêt pour ta séance ?
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Ton organisme a bien récupéré. Feu vert pour une session active aujourd'hui.
                  </p>
                </div>

                {/* Bouton d'Action Directe (La "Next Best Action") */}
                <div className="relative z-10">
                  <div className="bg-neutral-950/90 border border-orange-500/50 rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-orange-400 block mb-0.5">Objectif du jour</span>
                        <span className="text-sm font-black text-white">Footing Actif & Stratégie Gels (6 km)</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTabChange('running')}
                      className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(234,88,12,0.4)] cursor-pointer"
                    >
                      Lancer l'entraînement <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. ANNONCE PROCHAINE MISE À JOUR : COACH FITBOT */}
              <div className="bg-gradient-to-r from-cyan-950/60 via-neutral-900 to-neutral-900 border border-cyan-500/40 rounded-3xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/30 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white">Prochainement sur FitPulse</h4>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-extrabold px-2 py-0.5 rounded-md border border-cyan-500/30">Bientôt 🚀</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug pt-0.5">
                    Arrivée imminente du <strong>Coach FitBot</strong> : tes conseils personnalisés en direct pour optimiser tes performances sportives et ta nutrition !
                  </p>
                </div>
              </div>

              {/* 3. LA BOÎTE À OUTILS (Sous-menus pour garder l'accueil clean) */}
              <div className="pt-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3 ml-2 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> Boîte à outils
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={() => setIsGymLogOpen(true)} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-2xl flex flex-col gap-2.5 items-start transition cursor-pointer">
                    <Dumbbell className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-200">Carnet Muscu</span>
                  </button>
                  <button onClick={() => setIsWodGeneratorOpen(true)} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-2xl flex flex-col gap-2.5 items-start transition cursor-pointer">
                    <Flame className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-200">WOD Generator</span>
                  </button>
                  <button onClick={() => handleTabChange('running')} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-2xl flex flex-col gap-2.5 items-start transition cursor-pointer">
                    <Zap className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-200">Ravitaillement</span>
                  </button>
                  <button onClick={() => handleTabChange('paces')} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-2xl flex flex-col gap-2.5 items-start transition cursor-pointer">
                    <Activity className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-200">Calculateur Allures</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {currentTab === 'community' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button 
                  onClick={() => setCurrentTab('feed')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-orange-600 text-white shadow-md cursor-pointer"
                >
                  Fil d'Actu
                </button>
                <button 
                  onClick={() => setCurrentTab('leaderboard')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Classement
                </button>
                <button 
                  onClick={() => setCurrentTab('hall_of_fame')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <Skull className="w-3.5 h-3.5" /> Galères
                </button>
                <button 
                  onClick={() => setCurrentTab('buddy')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> Match
                </button>
              </div>

              <FeedTab 
                posts={displayedPosts} 
                registeredUsers={registeredUsers} 
                friendRequests={friendRequests} 
                currentUserId={user?.id} 
                userDiscipline={(currentUserProfile as any)?.discipline} 
                feedLoading={feedLoading} 
                calculateStreak={calculateUserStreak} 
                onCreateStoryClick={() => setIsPostModalOpen(true)} 
                onToggleLike={handleToggleLike} 
                onOpenComments={(id) => setActiveCommentPostId(id)} 
                onReportPost={() => {}} 
                onDeletePost={() => {}} 
                onSelectProfile={(u) => setViewingProfileUser(u)} 
                onStartRestTimer={() => handleTabChange('rest_timer')}
                onNavigateTab={handleTabChange}
              />
            </div>
          )}

          {currentTab === 'feed' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button 
                  onClick={() => setCurrentTab('feed')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-orange-600 text-white shadow-md cursor-pointer"
                >
                  Fil d'Actu
                </button>
                <button 
                  onClick={() => setCurrentTab('leaderboard')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Classement
                </button>
                <button 
                  onClick={() => setCurrentTab('hall_of_fame')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <Skull className="w-3.5 h-3.5" /> Galères
                </button>
                <button 
                  onClick={() => setCurrentTab('buddy')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> Match
                </button>
              </div>

              <FeedTab 
                posts={displayedPosts} 
                registeredUsers={registeredUsers} 
                friendRequests={friendRequests} 
                currentUserId={user?.id} 
                userDiscipline={(currentUserProfile as any)?.discipline} 
                feedLoading={feedLoading} 
                calculateStreak={calculateUserStreak} 
                onCreateStoryClick={() => setIsPostModalOpen(true)} 
                onToggleLike={handleToggleLike} 
                onOpenComments={(id) => setActiveCommentPostId(id)} 
                onReportPost={() => {}} 
                onDeletePost={() => {}} 
                onSelectProfile={(u) => setViewingProfileUser(u)} 
                onStartRestTimer={() => handleTabChange('rest_timer')}
                onNavigateTab={handleTabChange}
              />
            </div>
          )}

          {currentTab === 'hall_of_fame' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button 
                  onClick={() => setCurrentTab('feed')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Fil d'Actu
                </button>
                <button 
                  onClick={() => setCurrentTab('leaderboard')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Classement
                </button>
                <button 
                  onClick={() => setCurrentTab('hall_of_fame')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <Skull className="w-3.5 h-3.5" /> Galères
                </button>
                <button 
                  onClick={() => setCurrentTab('buddy')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> Match
                </button>
              </div>

              <div className="bg-gradient-to-br from-red-950/40 via-neutral-900 to-neutral-900 border border-red-500/30 rounded-3xl p-5 space-y-2 shadow-2xl">
                <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider">
                  <Skull className="w-4 h-4" /> Hall of Fame des Pains & Gains 💀
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Ici, pas de filtre ni de performance parfaite. On célèbre les pires courbatures, les barres ratées, les réveils à la boue et l'autodérision pure de la communauté !
                </p>
              </div>

              <FeedTab 
                posts={displayedPosts.filter(p => p.session_type?.includes('Pain & Gain'))} 
                registeredUsers={registeredUsers} 
                friendRequests={friendRequests} 
                currentUserId={user?.id} 
                userDiscipline={(currentUserProfile as any)?.discipline} 
                feedLoading={feedLoading} 
                calculateStreak={calculateUserStreak} 
                onCreateStoryClick={() => setIsPostModalOpen(true)} 
                onToggleLike={handleToggleLike} 
                onOpenComments={(id) => setActiveCommentPostId(id)} 
                onReportPost={() => {}} 
                onDeletePost={() => {}} 
                onSelectProfile={(u) => setViewingProfileUser(u)} 
                onStartRestTimer={() => handleTabChange('rest_timer')}
                onNavigateTab={handleTabChange}
              />
            </div>
          )}

          {currentTab === 'leaderboard' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button 
                  onClick={() => setCurrentTab('feed')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Fil d'Actu
                </button>
                <button 
                  onClick={() => setCurrentTab('leaderboard')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-orange-600 text-white shadow-md cursor-pointer"
                >
                  Classement
                </button>
                <button 
                  onClick={() => setCurrentTab('hall_of_fame')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <Skull className="w-3.5 h-3.5" /> Galères
                </button>
                <button 
                  onClick={() => setCurrentTab('buddy')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> Match
                </button>
              </div>

              <LeaderboardTab registeredUsers={registeredUsers} />
            </div>
          )}
           
          {currentTab === 'buddy' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button 
                  onClick={() => setCurrentTab('feed')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Fil d'Actu
                </button>
                <button 
                  onClick={() => setCurrentTab('leaderboard')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Classement
                </button>
                <button 
                  onClick={() => setCurrentTab('hall_of_fame')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <Skull className="w-3.5 h-3.5" /> Galères
                </button>
                <button 
                  onClick={() => setCurrentTab('buddy')}
                  className="flex-1 py-2 rounded-xl text-[11px] font-black bg-orange-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> Match
                </button>
              </div>

              <BuddyTab 
                currentUserId={user?.id} 
                registeredUsers={registeredUsers} 
                friendRequests={friendRequests} 
                onSendFriendRequest={async (receiverId) => {
                  if (!user) return;
                  await supabase.from('friend_requests').insert([{ sender_id: user.id, receiver_id: receiverId, status: 'pending' }]);
                  fetchFriendRequests(user.id);
                }} 
                onAcceptFriendRequest={async (reqId) => {
                  await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', reqId);
                  if (user) fetchFriendRequests(user.id);
                }}
                onRemoveFriend={async (reqId) => {
                  await supabase.from('friend_requests').delete().eq('id', reqId);
                  if (user) fetchFriendRequests(user.id);
                }}
                onSelectBuddyProfile={(u) => setViewingProfileUser(u)} 
              />
            </div>
          )}

          {currentTab === 'rest_timer' && <WodTimerTab />}
          {currentTab === 'calculator' && <CalculatorTab />}
           
          {currentTab === 'paces' && (
            <PaceCalculatorTab 
              currentVma={(currentUserProfile as any)?.vma || 14} 
              onSaveVma={handleSaveVma} 
            />
          )}

          {currentTab === 'readiness' && (
            <div className="space-y-4">
              <TrainingPlanTab currentUserId={user?.id} />
              <RoadbookTab currentUserId={user?.id} />
              <ReadinessCheckin 
                currentUserId={user?.id} 
                onUpdatePlan={(rec) => alert(rec)} 
              />
            </div>
          )}

          {currentTab === 'chat' && <ChatTab currentUserId={user?.id} selectedBuddyChat={selectedBuddyChat} setSelectedBuddyChat={handleOpenChatWithUser} activeChatUsers={activeChatUsers} currentChatMessages={currentChatMessages} currentMessageInput={currentMessageInput} onInputChange={(e) => setCurrentMessageInput(e.target.value)} onSendMessage={handleSendMessage} onSelectBuddy={(f) => handleOpenChatWithUser(f)} onDeleteConversation={() => {}} onReportConversation={() => {}} isOtherUserTyping={isOtherUserTyping} isMessageLimitReached={false} lastReadTimestamps={lastReadTimestamps} messagesEndRef={messagesEndRef} allMessages={allMessages} />}
           
          {currentTab === 'profile' && (
            <ProfileTab 
              user={user} 
              currentUserProfile={currentUserProfile} 
              userAvatarUrl={currentUserProfile?.avatar_url || userAvatarUrl} 
              isAdmin={isAdmin} 
              registeredUsers={registeredUsers} 
              transformations={transformations} 
              posts={posts}
              shoes={userShoes}
              onAddShoe={handleAddShoe}
              onDeleteShoe={handleDeleteShoe}
              onSetActiveShoe={handleSetActiveShoe}
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
              onAddTransformation={async (e) => { 
                e.preventDefault(); 
                if (!user || newTransWeight === '') return; 
                await supabase.from('transformations').insert([{ user_id: user.id, before_url: newTransBefore || '', after_url: newTransAfter || '', date: new Date().toISOString().split('T')[0], weight: Number(newTransWeight), note: newTransNote || 'Évolution', is_private: newTransIsPrivate }]); 
                await addPointsToUser(user.id, 25); 
                fetchTransformations(user.id); 
                setNewTransWeight(''); 
                setNewTransNote(''); 
              }} 
              onShareTransformation={() => {}} 
              onUpdatePasswordSubmit={async (e) => { 
                e.preventDefault(); 
                await supabase.auth.updateUser({}); 
              }} 
              password={password} 
              setPassword={setPassword} 
              confirmPassword={confirmPassword} 
              setConfirmPassword={setConfirmPassword} 
              isPrivateMode={isPrivateMode} 
              setIsPrivateMode={setIsPrivateMode} 
              onSignOut={async () => { 
                await supabase.auth.signOut(); 
                setUser(null); 
                localStorage.clear(); 
                window.location.reload(); 
              }} 
              onToggleVerifyAdmin={async (uId, status) => { 
                await supabase.from('profiles').update({ is_verified: !status }).eq('id', uId); 
                fetchRealUsers(); 
              }} 
              onUpdateProfile={async (updatedData) => { 
                if (!user) return; 
                await supabase.from('profiles').upsert({ id: user.id, ...updatedData }); 
                fetchRealUsers(); 
              }} 
              beforeFileInputRef={beforeFileInputRef} 
              afterFileInputRef={afterFileInputRef} 
            />
          )}

          {currentTab === 'boxwars' && (
            <BoxWarsTab currentUserId={user?.id} currentUsername={currentUsername} registeredUsers={registeredUsers} posts={posts} />
          )}

          {currentTab === 'running' && (
            <RunningTab 
              currentUserId={user?.id} 
              currentUsername={currentUsername} 
              selectedClub={selectedClub} 
              currentUserProfile={currentUserProfile} 
              userAvatarUrl={userAvatarUrl} 
              onRefreshFeed={() => {
                fetchCloudPosts();
                if (user) fetchUserShoes(user.id);
              }} 
            />
          )}
        </main>

        {/* MODAL GLOBAL D'ACTION (LE NOUVEAU BOUTON "+") */}
        {isActionMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-end justify-center p-4 pb-24 sm:items-center animate-fadeIn" onClick={() => setIsActionMenuOpen(false)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative animate-slideUp" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-lg text-white">Que veux-tu faire ?</h3>
                <button type="button" onClick={() => setIsActionMenuOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl cursor-pointer bg-neutral-800/50 hover:bg-neutral-800 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => { setIsActionMenuOpen(false); setIsPostModalOpen(true); }}
                  className="flex items-center gap-4 p-4 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-2xl transition cursor-pointer text-left group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center group-hover:scale-110 transition">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Partager une séance</h4>
                    <p className="text-[11px] text-neutral-400">Muscu, Cardio, ou Galère du jour</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsActionMenuOpen(false); setIsBoxWarsModalOpen(true); }}
                  className="flex items-center gap-4 p-4 bg-neutral-950 border border-neutral-800 hover:border-cyan-500 rounded-2xl transition cursor-pointer text-left group"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Score BoxWars</h4>
                    <p className="text-[11px] text-neutral-400">Enregistrer un WOD ou un Challenge</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsActionMenuOpen(false); handleTabChange('readiness'); }}
                  className="flex items-center gap-4 p-4 bg-neutral-950 border border-neutral-800 hover:border-emerald-500 rounded-2xl transition cursor-pointer text-left group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                    <BatteryCharging className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Bilan / Récupération</h4>
                    <p className="text-[11px] text-neutral-400">Faire le check-in de ta forme du jour</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL : CARNET DE MUSCULATION (Caché du dashboard, ouvert depuis la boîte à outils) */}
        {isGymLogOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
              <div className="flex items-center gap-2 text-white font-black">
                <Dumbbell className="w-5 h-5 text-orange-500" /> Carnet de Musculation
              </div>
              <button type="button" onClick={() => setIsGymLogOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-950">
              <GymLogTab currentUserId={user?.id} onStartRestTimer={() => { setIsGymLogOpen(false); handleTabChange('rest_timer'); }} />
            </div>
          </div>
        )}

        {/* MODAL : GÉNÉRATEUR DE WOD (Caché du dashboard, ouvert depuis la boîte à outils) */}
        {isWodGeneratorOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
              <div className="flex items-center gap-2 text-white font-black">
                <Flame className="w-5 h-5 text-cyan-400" /> Générateur de WOD
              </div>
              <button type="button" onClick={() => setIsWodGeneratorOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-950">
              <WodGenerator />
            </div>
          </div>
        )}

        {/* MODAL : POSTER UNE SÉANCE */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" /> Partager une séance
                </h3>
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
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
                    <option value="💀 Pain & Gain (La Galère du Jour)">💀 Pain & Gain (La Galère du Jour)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Légende :</label>
                  <textarea rows={3} placeholder="Comment s'est passée ta séance ?" value={postCaption} onChange={(e) => setPostCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Photo (Galerie ou Appareil) :</label>
                  <button type="button" onClick={() => postImageFileInputRef.current?.click()} className="w-full py-3 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-2 cursor-pointer">
                    <Camera className="w-4 h-4 text-orange-500" /> Choisir une image
                  </button>
                  <input type="file" accept="image/*" ref={postImageFileInputRef} onChange={handlePostImageFileSelect} className="hidden" />
                </div>

                {postImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden h-36 border border-neutral-800">
                    <img src={postImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPostImageUrl(null)} className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                )}

                <button type="submit" className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-sm shadow-xl cursor-pointer">
                  Publier sur le fil (+10 pts 🚀)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL : SCORE BOXWARS */}
        {isBoxWarsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" /> Enregistrer un score BoxWars
                </h3>
                <button type="button" onClick={() => setIsBoxWarsModalOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;

                const formElement = e.currentTarget as HTMLFormElement;
                const selectWodType = (formElement.elements[0] as HTMLSelectElement).value;
                const scoreInput = (formElement.elements[1] as HTMLInputElement).value;
                const noteInput = (formElement.elements[2] as HTMLTextAreaElement).value;
                 
                const scaleMode = (formElement.elements.namedItem('scaleMode') as RadioNodeList).value;

                if (!scoreInput.trim()) {
                  alert("Veuillez indiquer un score ou un temps !");
                  return;
                }

                const fullCaption = `⚡ [BOXWARS] [${scaleMode}] ${selectWodType} : ${scoreInput} ${noteInput ? `- ${noteInput}` : ''}`.trim();

                const { error } = await supabase.from('posts').insert([{
                  user_id: user.id,
                  username: currentUsername,
                  avatar_url: currentUserProfile?.avatar_url || userAvatarUrl,
                  club_name: selectedClub === '🌐 Tous les spots (Global)' ? 'Tournai (Quais de l’Escaut & Parc)' : selectedClub,
                  session_type: 'BoxWars / WOD',
                  caption: fullCaption,
                  image_url: null,
                  exercises: [],
                  likes_count: 0,
                  liked_by: [],
                  comments_count: 0,
                  comments: [],
                  is_private: false
                }]);

                if (!error) {
                  const pointsToAdd = 15;
                  const currentMuscuPts = (currentUserProfile as any)?.points_muscu || 0;
                  const currentGlobalPts = (currentUserProfile as any)?.points_global || (currentUserProfile as any)?.points || 0;

                  await supabase.from('profiles').update({ 
                    points_muscu: currentMuscuPts + pointsToAdd,
                    points_global: currentGlobalPts + pointsToAdd,
                    points: currentGlobalPts + pointsToAdd 
                  }).eq('id', user.id);

                  setIsBoxWarsModalOpen(false);
                  fetchCloudPosts();
                  fetchRealUsers();
                } else {
                  alert("Erreur lors de la publication du score : " + error?.message);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Type de WOD / Challenge :</label>
                  <select className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white">
                    <option value="WOD du jour">WOD du jour</option>
                    <option value="Max Reps / Max Load">Max Reps / Max Load</option>
                    <option value="Challenge Libre">Challenge Libre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Score / Temps réalisé :</label>
                  <input type="text" placeholder="Ex: 8 rounds + 5 reps / 4:12" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Notes / Remarques :</label>
                  <textarea rows={2} placeholder="Comment s'est passé le wod ?" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none" />
                </div>

                <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                  <input type="radio" name="scaleMode" value="RX" id="rxMode" defaultChecked className="accent-cyan-500 w-4 h-4 cursor-pointer" />
                  <label htmlFor="rxMode" className="text-xs text-white font-bold mr-4 cursor-pointer">RX</label>
                   
                  <input type="radio" name="scaleMode" value="SCALED" id="scaledMode" className="accent-neutral-500 w-4 h-4 cursor-pointer" />
                  <label htmlFor="scaledMode" className="text-xs text-white font-bold cursor-pointer">Scaled</label>
                </div>

                <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-sm shadow-xl cursor-pointer">
                  Publier sur le fil BoxWars (+15 pts ⚡)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL : PROFIL D'UN UTILISATEUR */}
        {viewingProfileUser && (() => {
          const targetUserId = viewingProfileUser.id;
          const isSelf = user?.id === targetUserId;
           
          const friendship = friendRequests.find(
            req => (req.sender_id === user?.id && req.receiver_id === targetUserId) ||
                   (req.sender_id === targetUserId && req.receiver_id === user?.id)
          );

          const isAlreadyFriends = friendship?.status === 'accepted';
          const isPendingSent = friendship?.status === 'pending' && friendship.sender_id === user?.id;
          const isPendingReceived = friendship?.status === 'pending' && friendship.receiver_id === user?.id;

          const userProfilePosts = posts.filter(p => p.user_id === targetUserId);

          return (
            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
                 
                <div className="relative h-32 bg-gradient-to-r from-orange-600 via-neutral-800 to-cyan-600 flex-shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setViewingProfileUser(null)} 
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full z-10 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 pb-5 -mt-12 flex-1 overflow-y-auto space-y-4">
                   
                  <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
                    <img 
                      src={viewingProfileUser.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} 
                      alt={viewingProfileUser.username} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-neutral-900 shadow-xl bg-neutral-800"
                    />
                    <div className="flex-1 text-center sm:text-left pt-2">
                      <h2 className="text-lg font-black text-white">{viewingProfileUser.username}</h2>
                      <p className="text-xs text-orange-400 font-semibold">{viewingProfileUser.home_club || 'Spot non renseigné'}</p>
                      <div className="flex justify-center sm:justify-start gap-3 mt-2 text-[11px] text-neutral-400 font-bold">
                        <span>Objectif : <strong className="text-white">{viewingProfileUser.goal || 'Muscu'}</strong></span>
                        <span>•</span>
                        <span>Ligue : <strong className="text-cyan-400">{(viewingProfileUser as any).points || 0} pts ⚡</strong></span>
                      </div>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex gap-2 pt-1">
                      {!friendship ? (
                        <button 
                          onClick={async () => {
                            if (!user) return;
                            await supabase.from('friend_requests').insert([{ sender_id: user.id, receiver_id: targetUserId, status: 'pending' }]);
                            fetchFriendRequests(user.id);
                          }}
                          className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
                        >
                          Ajouter en ami 🤝
                        </button>
                      ) : isAlreadyFriends ? (
                        <button 
                          onClick={async () => {
                            await supabase.from('friend_requests').delete().eq('id', friendship.id);
                            if (user) fetchFriendRequests(user.id);
                          }}
                          className="flex-1 py-2.5 bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 font-bold rounded-2xl text-xs border border-neutral-700 transition cursor-pointer"
                        >
                          Retirer des amis ✓
                        </button>
                      ) : isPendingSent ? (
                        <button disabled className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 font-bold rounded-2xl text-xs cursor-not-allowed">
                          Demande envoyée ⏳
                        </button>
                      ) : isPendingReceived ? (
                        <button 
                          onClick={async () => {
                            await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', friendship.id);
                            if (user) fetchFriendRequests(user.id);
                          }}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl text-xs shadow-lg transition cursor-pointer"
                        >
                          Accepter la demande ✅
                        </button>
                      ) : null}

                      <button 
                        onClick={() => {
                          setViewingProfileUser(null);
                          handleOpenChatWithUser(viewingProfileUser);
                          handleTabChange('chat');
                        }}
                        className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs border border-neutral-700 transition cursor-pointer"
                      >
                        Message 💬
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-2">
                      Publications de {viewingProfileUser.username} ({userProfilePosts.length})
                    </h4>

                    {userProfilePosts.length === 0 ? (
                      <p className="text-xs text-neutral-500 text-center py-6">Aucune publication pour le moment.</p>
                    ) : (
                      userProfilePosts.map(post => (
                        <div key={post.id} className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span className="font-bold text-orange-400">{post.session_type}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-neutral-200">{post.caption}</p>
                          {post.image_url && (
                            <div className="rounded-xl overflow-hidden h-36 border border-neutral-800">
                              <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })()}

        {/* NOUVELLE BARRE DE NAVIGATION (UX Standardisée) */}
        <nav className="sticky bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 px-4 py-3 flex justify-around items-center">
          <button 
            onClick={() => handleTabChange('today')} 
            className={`flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer px-3 ${currentTab === 'today' || currentTab === 'running' || currentTab === 'readiness' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Aujourd'hui</span>
          </button>

          <button 
            onClick={() => handleTabChange('community')} 
            className={`flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer px-3 ${currentTab === 'community' || currentTab === 'feed' || currentTab === 'leaderboard' || currentTab === 'hall_of_fame' || currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Communauté</span>
          </button>
           
          <button 
            onClick={() => setIsActionMenuOpen(true)} 
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] transition transform hover:scale-105 active:scale-95 -mt-4 cursor-pointer flex-shrink-0 z-50 border-[3px] border-neutral-950"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button 
            onClick={() => handleTabChange('profile')} 
            className={`flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer px-3 ${currentTab === 'profile' || currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profil & QG</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
