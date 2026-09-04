import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import {
  Zap, User, MessageCircle, Home, Users, Plus, X, Camera, Flame, MapPin, Trophy, Navigation, Calendar, Skull, BatteryCharging, ArrowRight, Activity, Sparkles, Play, Dumbbell, Settings, ChevronRight, ChevronLeft, CheckCircle2, Bot, ArrowLeft, Share2
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

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
import GymLogTab from './components/GymLogTab';
import FitBotTab from './components/FitBotTab';
import SpotSearchInput from './components/SpotSearchInput';
import HybridCalendar from './components/HybridCalendar';
import OnboardingWizard from './components/OnboardingWizard';
import PaywallGate from './components/PaywallGate';
import FridgeScannerTab from './components/FridgeScannerTab';
import HybridShareCard from './components/HybridShareCard';
import LiveCoachEngine from './components/LiveCoachEngine';
import HuaweiSyncModal from './components/HuaweiSyncModal';

import FatigueDashboardCard from './components/FatigueDashboardCard';

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

  const [currentTab, setCurrentTab] = useState<'today' | 'community' | 'profile' | 'feed' | 'buddy' | 'workout' | 'exercises' | 'chat' | 'calculator' | 'paces' | 'live_tracker' | 'rest_timer' | 'notifications' | 'leaderboard' | 'boxwars' | 'running' | 'readiness' | 'hall_of_fame' | 'fitbot' | 'fridge_scanner'>(() => {
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
  const [isHybridShareOpen, setIsHybridShareOpen] = useState(false);
  const [isHuaweiSyncOpen, setIsHuaweiSyncOpen] = useState(false);
  
  const [isGymLogOpen, setIsGymLogOpen] = useState(false);
  const [isWodGeneratorOpen, setIsWodGeneratorOpen] = useState(false);

  const [gymLogsData, setGymLogsData] = useState<any[]>([]);

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

  const fetchGymLogsForUser = async (userId: string) => {
    const { data } = await supabase.from('gym_logs').select('*').eq('user_id', userId);
    if (data) setGymLogsData(data);
  };

  const calculateDynamicReadiness = () => {
    if (!user) return 88;
    const now = new Date().getTime();
    const myRecentPosts = posts.filter(p => p.user_id === user.id && (now - new Date(p.created_at).getTime() < 24 * 60 * 60 * 1000));
    
    let score = 88 - (myRecentPosts.length * 35);
    return Math.max(12, Math.min(100, score));
  };

  const currentReadinessScore = calculateDynamicReadiness();

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

  // Initialisation Auth & Données
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTransformations(session.user.id);
        fetchFriendRequests(session.user.id);
        fetchUserShoes(session.user.id);
        fetchGymLogsForUser(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTransformations(session.user.id);
        fetchFriendRequests(session.user.id);
        fetchUserShoes(session.user.id);
        fetchGymLogsForUser(session.user.id);
      }
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
        } else if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
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
      subscription.unsubscribe();
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

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer cette publication ?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    } else {
      alert("Erreur lors de la suppression : " + error.message);
    }
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
            <div className="w-12 h-12 rounded-2xl bg-orange-500/25 flex items-center justify-center text-orange-500 mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">FitPulse</h1>
            <p className="text-xs text-orange-400 font-semibold">Suivi d'entraînement, Communauté & Partenaires</p>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (isSignUpMode) {
              if (!acceptCgu) { alert("Veuillez accepter les conditions générales d'utilisation pour continuer."); return; }
              const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
              if (error) alert("Erreur : " + error.message);
              else if (data.session?.user) { setUser(data.session.user); }
            } else {
              const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
              if (error) alert("Erreur : " + error.message);
              else if (data.session?.user) { setUser(data.session.user); }
            }
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">E-mail :</label>
              <input type="email" required placeholder="ton.email@exemple.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Mot de passe :</label>
              <input type="password" required placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" />
            </div>

            {isSignUpMode && (
              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="cgu" checked={acceptCgu} onChange={(e) => setAcceptCgu(e.target.checked)} className="rounded accent-orange-500 mt-0.5 cursor-pointer" />
                <label htmlFor="cgu" className="text-[11px] text-neutral-300 leading-tight cursor-pointer">
                  J'accepte les <button type="button" onClick={() => alert("Conditions Générales d'Utilisation (CGU) :\n\n1. FitPulse est une application de suivi d'entraînement sportif.\n2. Vos données d'entraînement sont sécurisées et partagées uniquement au sein de votre communauté.\n3. Aucun remboursement des abonnements Pro n'est effectué après validation.")} className="text-orange-400 underline font-semibold">Conditions Générales d'Utilisation</button>.
                </label>
              </div>
            )}

            <button type="submit" className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-sm transition shadow-lg cursor-pointer">
              {isSignUpMode ? "Créer mon compte 🚀" : "Se connecter ⚡"}
            </button>
          </form>

          <div className="text-center">
            <button type="button" onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-xs text-orange-400 font-semibold cursor-pointer hover:underline">
              {isSignUpMode ? "Déjà un compte ? Connecte-toi" : "Pas encore de compte ? Inscris-toi gratuitement"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasProfile = registeredUsers.some(u => u.id === user.id);
  if (user && registeredUsers.length >= 0 && !hasProfile) {
    return (
      <OnboardingWizard 
        user={user} 
        onComplete={() => {
          fetchRealUsers();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none antialiased relative">
      <div className="w-full max-w-md mx-auto min-h-screen bg-neutral-950 flex flex-col shadow-2xl sm:border-x sm:border-neutral-900 relative">
        <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${currentTab === 'boxwars' ? 'bg-cyan-500/20 text-cyan-400' : currentTab === 'running' ? 'bg-emerald-500/20 text-emerald-400' : currentTab === 'hall_of_fame' ? 'bg-red-500/20 text-red-400' : currentTab === 'buddy' ? 'bg-orange-500/20 text-orange-400' : currentTab === 'fitbot' ? 'bg-cyan-500/20 text-cyan-400' : currentTab === 'fridge_scanner' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/20 text-orange-500'} flex items-center justify-center`}>
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-base font-black tracking-tight leading-none text-white">
              {currentTab === 'boxwars' ? 'BOXWARS' : currentTab === 'running' ? 'RUNNING' : currentTab === 'hall_of_fame' ? 'HALL OF FAME' : currentTab === 'buddy' ? 'BUDDIES & MATCH' : currentTab === 'fitbot' ? 'FITBOT AI' : currentTab === 'fridge_scanner' ? 'SCAN FRIGO' : 'FitPulse'}
            </h1>
          </div>

          {currentTab !== 'boxwars' && currentTab !== 'running' && currentTab !== 'readiness' && currentTab !== 'paces' && currentTab !== 'calculator' && currentTab !== 'hall_of_fame' && currentTab !== 'buddy' && currentTab !== 'fitbot' && currentTab !== 'fridge_scanner' && (
            <div className="w-[42%] sm:w-[40%]">
              <SpotSearchInput 
                selectedSpot={selectedClub} 
                onSelectSpot={(spot) => setSelectedClub(spot)} 
              />
            </div>
          )}

          {/* 🔔 BOUTON DE NOTIFICATION STYLE FACEBOOK / INSTA */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert("Aucune nouvelle notification pour le moment.")} 
              className="relative p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
              {/* Badge rouge dynamique pour les demandes d'amis en attente */}
              {(friendRequests.filter(r => r.receiver_id === user?.id && r.status === 'pending').length > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {friendRequests.filter(r => r.receiver_id === user?.id && r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 w-full mx-auto px-4 py-3 pb-32 space-y-3">
          {currentTab === 'running' && (
            <div className="space-y-4 animate-fadeIn">
              <OfflineRunGuard currentUserId={user?.id} />
              {/* ⚡ MODULE DE COACH VOCAL & MÉTÉO ADAPTATIVE INTÉGRÉ EN LIVE */}
              <LiveCoachEngine currentKm={5.2} currentPaceSeconds={295} isRunActive={true} />
            </div>
          )}

          {/* 🌟 ÉCRAN D'ACCUEIL ÉPURÉ (CORE LOOP) */}
          {currentTab === 'today' && (
            <div className="space-y-5 animate-fadeIn pb-12">
              
              {/* Étape 1 : Forme & Readiness */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Forme & Readiness du jour
                  </span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30">
                    Core Loop • Étape 1
                  </span>
                </div>
                <ReadinessCheckin currentUserId={user?.id} onUpdatePlan={(rec) => alert(rec)} />
              </div>

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

              {/* Étape 2 : Lancer l'entraînement hybride */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1 block">
                  Étape 2 : Lancer l'entraînement hybride
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setIsGymLogOpen(true)} 
                    className="py-4 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500/50 rounded-2xl text-xs font-black text-white transition cursor-pointer flex flex-col items-center gap-2 shadow-lg group"
                  >
                    <span className="text-xl">🏋️‍♂️</span>
                    <span className="group-hover:text-orange-400 transition">Muscu</span>
                  </button>

                  <button 
                    onClick={() => handleTabChange('boxwars')} 
                    className="py-4 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/50 rounded-2xl text-xs font-black text-white transition cursor-pointer flex flex-col items-center gap-2 shadow-lg group"
                  >
                    <span className="text-xl">🥵</span>
                    <span className="group-hover:text-cyan-400 transition">CrossFit</span>
                  </button>

                  <button 
                    onClick={() => handleTabChange('running')} 
                    className="py-4 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl text-xs font-black text-white transition cursor-pointer flex flex-col items-center gap-2 shadow-lg group"
                  >
                    <span className="text-xl">🏃‍♂️</span>
                    <span className="group-hover:text-emerald-400 transition">Course</span>
                  </button>
                </div>
              </div>

              {/* Étape 3 : Restitution IA & Scan Frigo */}
              <PaywallGate userId={user?.id} featureName="IA Coach Proactif & Scan Frigo">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => handleTabChange('fitbot')}
                    className="bg-neutral-900 hover:bg-neutral-850 border border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-4 flex items-center gap-3.5 shadow-lg cursor-pointer transition group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition">FitBot AI</h4>
                      <p className="text-[10px] text-neutral-400 truncate">Analyse de charge & conseils</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleTabChange('fridge_scanner')}
                    className="bg-neutral-900 hover:bg-neutral-850 border border-orange-500/30 hover:border-orange-400 rounded-3xl p-4 flex items-center gap-3.5 shadow-lg cursor-pointer transition group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                      <span className="text-base">📸</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-white group-hover:text-orange-300 transition">Scan Frigo</h4>
                      <p className="text-[10px] text-neutral-400 truncate">Recette post-WOD instantanée</p>
                    </div>
                  </div>
                </div>
              </PaywallGate>

              {/* ⚡ BOUTON D'ACCÈS CARTE VIRALE HYBRIDE */}
              <button
                type="button"
                onClick={() => setIsHybridShareOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:opacity-95 text-white font-black rounded-3xl text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer border border-orange-500/40"
              >
                <Share2 className="w-4 h-4" /> Générer ma Carte Hybrid Apex (Partage Viral) 🚀
              </button>

              {/* Vue d'ensemble de la semaine */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-xl">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2 ml-1">
                  <Calendar className="w-4 h-4 text-orange-500" /> Vue d'ensemble de la semaine
                </span>
                <HybridCalendar posts={posts} currentUserId={user?.id} onRefresh={fetchCloudPosts} />
              </div>

            </div>
          )}

          {currentTab === 'fitbot' && (
            <PaywallGate userId={user?.id} featureName="IA Coach Proactif">
              <FitBotTab currentUserProfile={currentUserProfile} currentReadinessScore={currentReadinessScore} onBack={() => handleTabChange('today')} />
            </PaywallGate>
          )}

          {currentTab === 'fridge_scanner' && (
            <PaywallGate userId={user?.id} featureName="Scan Post-WOD de la Faim">
              <FridgeScannerTab onBack={() => handleTabChange('today')} />
            </PaywallGate>
          )}

          {currentTab === 'community' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button onClick={() => setCurrentTab('feed')} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-orange-600 text-white shadow-md cursor-pointer">Fil d'Actu</button>
                <button onClick={() => setCurrentTab('leaderboard')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer">Classement</button>
                <button onClick={() => setCurrentTab('hall_of_fame')} className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"><Skull className="w-3.5 h-3.5" /> Galères</button>
                <button onClick={() => setCurrentTab('buddy')} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Match</button>
              </div>
              <FeedTab posts={displayedPosts} registeredUsers={registeredUsers} friendRequests={friendRequests} currentUserId={user?.id} userDiscipline={(currentUserProfile as any)?.discipline} feedLoading={feedLoading} calculateStreak={calculateUserStreak} onCreateStoryClick={() => setIsActionMenuOpen(true)} onToggleLike={handleToggleLike} onOpenComments={(id) => setActiveCommentPostId(id)} onReportPost={() => { alert("Publication signalée aux modérateurs."); }} onDeletePost={handleDeletePost} onSelectProfile={(u) => setViewingProfileUser(u)} onStartRestTimer={() => handleTabChange('rest_timer')} onNavigateTab={handleTabChange} />
            </div>
          )}

          {currentTab === 'feed' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button onClick={() => setCurrentTab('feed')} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-orange-600 text-white shadow-md cursor-pointer">Fil d'Actu</button>
                <button onClick={() => setCurrentTab('leaderboard')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer">Classement</button>
                <button onClick={() => setCurrentTab('hall_of_fame')} className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"><Skull className="w-3.5 h-3.5" /> Galères</button>
                <button onClick={() => setCurrentTab('buddy')} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Match</button>
              </div>
              <FeedTab posts={displayedPosts} registeredUsers={registeredUsers} friendRequests={friendRequests} currentUserId={user?.id} userDiscipline={(currentUserProfile as any)?.discipline} feedLoading={feedLoading} calculateStreak={calculateUserStreak} onCreateStoryClick={() => setIsActionMenuOpen(true)} onToggleLike={handleToggleLike} onOpenComments={(id) => setActiveCommentPostId(id)} onReportPost={() => { alert("Publication signalée aux modérateurs."); }} onDeletePost={handleDeletePost} onSelectProfile={(u) => setViewingProfileUser(u)} onStartRestTimer={() => handleTabChange('rest_timer')} onNavigateTab={handleTabChange} />
            </div>
          )}

          {currentTab === 'hall_of_fame' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button onClick={() => setCurrentTab('feed')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer">Fil d'Actu</button>
                <button onClick={() => setCurrentTab('leaderboard')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer">Classement</button>
                <button onClick={() => setCurrentTab('hall_of_fame')} className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1"><Skull className="w-3.5 h-3.5" /> Galères</button>
                <button onClick={() => setCurrentTab('buddy')} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Match</button>
              </div>
              <div className="bg-gradient-to-br from-red-950/40 via-neutral-900 to-neutral-900 border border-red-500/30 rounded-3xl p-5 space-y-2 shadow-2xl">
                <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider">
                  <Skull className="w-4 h-4" /> Hall of Fame des Pains & Gains 💀
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Ici, pas de filtre ni de performance parfaite. On célèbre les pires courbatures, les barres ratées et l'autodérision pure !
                </p>
              </div>
              <FeedTab posts={displayedPosts.filter(p => p.session_type?.includes('Pain & Gain'))} registeredUsers={registeredUsers} friendRequests={friendRequests} currentUserId={user?.id} userDiscipline={(currentUserProfile as any)?.discipline} feedLoading={feedLoading} calculateStreak={calculateUserStreak} onCreateStoryClick={() => setIsActionMenuOpen(true)} onToggleLike={handleToggleLike} onOpenComments={(id) => setActiveCommentPostId(id)} onReportPost={() => { alert("Publication signalée."); }} onDeletePost={handleDeletePost} onSelectProfile={(u) => setViewingProfileUser(u)} onStartRestTimer={() => handleTabChange('rest_timer')} onNavigateTab={handleTabChange} />
            </div>
          )}

          {currentTab === 'leaderboard' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button onClick={() => setCurrentTab('feed')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer">Fil d'Actu</button>
                <button onClick={() => setCurrentTab('leaderboard')} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-orange-600 text-white shadow-md cursor-pointer">Classement</button>
                <button onClick={() => setCurrentTab('hall_of_fame')} className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"><Skull className="w-3.5 h-3.5" /> Galères</button>
                <button onClick={() => setCurrentTab('buddy')} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-neutral-950 border border-neutral-800 text-orange-400 hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Match</button>
              </div>
              <LeaderboardTab registeredUsers={registeredUsers} />
            </div>
          )}
           
          {currentTab === 'buddy' && (
            <div className="space-y-4 animate-fadeIn pb-12">
              <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                <button onClick={() => setCurrentTab('feed')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer">Fil d'Actu</button>
                <button onClick={() => setCurrentTab('leaderboard')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white cursor-pointer">Classement</button>
                <button onClick={() => setCurrentTab('hall_of_fame')} className="flex-1 py-2 rounded-xl text-[11px] font-black bg-red-950/50 border border-red-500/40 text-red-400 hover:bg-red-900/40 cursor-pointer flex items-center justify-center gap-1 shadow-sm"><Skull className="w-3.5 h-3.5" /> Galères</button>
                <button onClick={() => setCurrentTab('buddy')} className="flex-1 py-2 rounded-xl text-[11px] font-black bg-orange-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Match</button>
              </div>
              <BuddyTab currentUserId={user?.id} registeredUsers={registeredUsers} friendRequests={friendRequests} onSendFriendRequest={async (receiverId) => { if (!user) return; await supabase.from('friend_requests').insert([{ sender_id: user.id, receiver_id: receiverId, status: 'pending' }]); fetchFriendRequests(user.id); }} onAcceptFriendRequest={async (reqId) => { await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', reqId); if (user) fetchFriendRequests(user.id); }} onRemoveFriend={async (reqId) => { await supabase.from('friend_requests').delete().eq('id', reqId); if (user) fetchFriendRequests(user.id); }} onSelectBuddyProfile={(u) => setViewingProfileUser(u)} />
            </div>
          )}

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

          {currentTab === 'rest_timer' && <WodTimerTab />}
          {currentTab === 'calculator' && <CalculatorTab />}
           
          {currentTab === 'paces' && (
            <PaceCalculatorTab currentVma={(currentUserProfile as any)?.vma || 14} onSaveVma={handleSaveVma} />
          )}

          {currentTab === 'readiness' && (
            <div className="space-y-4">
              <HybridCalendar posts={posts} currentUserId={user?.id} onRefresh={fetchCloudPosts} />
              <TrainingPlanTab currentUserId={user?.id} />
              <RoadbookTab currentUserId={user?.id} />
              <ReadinessCheckin currentUserId={user?.id} onUpdatePlan={(rec) => alert(rec)} />
            </div>
          )}
           
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
              onCameraStart={() => { profileAvatarInputRef.current?.click(); }} 
              onBeforeFileSelect={() => {
                const input = beforeFileInputRef.current;
                if (input?.files?.[0]) {
                  const file = input.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => setNewTransBefore(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} 
              onAfterFileSelect={() => {
                const input = afterFileInputRef.current;
                if (input?.files?.[0]) {
                  const file = input.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => setNewTransAfter(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} 
              onAddTransformation={async (e) => { 
                e.preventDefault(); 
                if (!user || newTransWeight === '') return; 
                await supabase.from('transformations').insert([{ 
                  user_id: user.id, 
                  before_url: newTransBefore || '', 
                  after_url: newTransAfter || '', 
                  date: new Date().toISOString().split('T')[0], 
                  weight: Number(newTransWeight), 
                  note: newTransNote || 'Évolution', 
                  is_private: newTransIsPrivate 
                }]); 
                await addPointsToUser(user.id, 25); 
                fetchTransformations(user.id); 
                setNewTransWeight(''); 
                setNewTransNote(''); 
                setNewTransBefore(null);
                setNewTransAfter(null);
              }} 
              onShareTransformation={() => { alert("Transformation partagée sur le fil !"); }} 
              onUpdatePasswordSubmit={async (e) => { 
                e.preventDefault(); 
                if (!password || password !== confirmPassword) {
                  alert("Les mots de passe ne correspondent pas.");
                  return;
                }
                const { error } = await supabase.auth.updateUser({ password }); 
                if (!error) {
                  alert("Mot de passe mis à jour avec succès !");
                  setPassword('');
                  setConfirmPassword('');
                } else {
                  alert("Erreur : " + error.message);
                }
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
                localStorage.removeItem('fitpulse_active_tab');
                window.location.reload(); 
              }} 
              onToggleVerifyAdmin={async (uId, status) => { await supabase.from('profiles').update({ is_verified: !status }).eq('id', uId); fetchRealUsers(); }} 
              onUpdateProfile={async (updatedData) => { if (!user) return; await supabase.from('profiles').upsert({ id: user.id, ...updatedData }); fetchRealUsers(); }} 
              beforeFileInputRef={beforeFileInputRef} 
              afterFileInputRef={afterFileInputRef} 
            />
          )}

          {currentTab === 'boxwars' && (
            <BoxWarsTab currentUserId={user?.id} currentUsername={currentUsername} registeredUsers={registeredUsers} posts={posts} onBack={() => handleTabChange('today')} />
          )}

          {currentTab === 'running' && (
            <RunningTab currentUserId={user?.id} currentUsername={currentUsername} selectedClub={selectedClub} currentUserProfile={currentUserProfile} userAvatarUrl={userAvatarUrl} onRefreshFeed={() => { fetchCloudPosts(); if (user) fetchUserShoes(user.id); }} onBack={() => handleTabChange('today')} />
          )}
        </main>

        {/* MODALE DE CARTE DE PARTAGE VIRAL HYBRIDE */}
        {isHybridShareOpen && (
          <HybridShareCard 
            username={currentUsername}
            runKm={10.5}
            runTime="48:15"
            squatKg={125}
            wodName="FRAN"
            wodScore="3:55"
            onClose={() => setIsHybridShareOpen(false)}
          />
        )}

        {/* MODALE DE SYNCHRONISATION MONTRE HUAWEI */}
        {isHuaweiSyncOpen && (
          <HuaweiSyncModal 
            currentUserId={user?.id}
            onClose={() => setIsHuaweiSyncOpen(false)}
            onSynced={() => {
              fetchCloudPosts();
              alert("Séance Huawei importée et publiée sur le fil avec succès ! 🚀");
            }}
          />
        )}

        {/* MODALE D'ACTION UNIVERSELLE EN LANGAGE NATUREL */}
        {isActionMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-end justify-center p-4 pb-24 sm:items-center animate-fadeIn" onClick={() => setIsActionMenuOpen(false)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative animate-slideUp" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" /> Saisie rapide FitPulse
                </h3>
                <button type="button" onClick={() => setIsActionMenuOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl cursor-pointer bg-neutral-800/50 hover:bg-neutral-800 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-400">
                  Dis ce que tu as fait (ex: "10km en 48 min" ou "4 séries de squat à 100kg") :
                </label>
                <textarea 
                  rows={3}
                  id="naturalInputText"
                  placeholder="Ex: Footing matinal de 8km avec de bonnes sensations..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <button 
                  type="button"
                  onClick={async () => {
                    const inputEl = document.getElementById('naturalInputText') as HTMLTextAreaElement;
                    const text = inputEl?.value?.trim();
                    if (!text || !user) return;

                    let sessionTypeDetected = "Musculation Full Body";
                    const lower = text.toLowerCase();
                    if (lower.includes('km') || lower.includes('course') || lower.includes('footing') || (lower.includes('min') && (lower.includes('allure') || lower.includes('vitesse')))) {
                      sessionTypeDetected = "Footing / VMA";
                    } else if (lower.includes('wod') || lower.includes('crossfit') || lower.includes('fran') || lower.includes('murph')) {
                      sessionTypeDetected = "WOD / Crossfit";
                    } else if (lower.includes('pain') || lower.includes('galère') || lower.includes('dur')) {
                      sessionTypeDetected = "💀 Pain & Gain (La Galère du Jour)";
                    }

                    const { error } = await supabase.from('posts').insert([{
                      user_id: user.id,
                      username: currentUsername,
                      avatar_url: currentUserProfile?.avatar_url || userAvatarUrl,
                      club_name: selectedClub === '🌐 Tous les spots (Global)' ? 'Tournai (Quais de l’Escaut & Parc)' : selectedClub,
                      session_type: sessionTypeDetected,
                      caption: text,
                      exercises: [],
                      likes_count: 0,
                      liked_by: [],
                      comments_count: 0,
                      comments: [],
                      is_private: false
                    }]);

                    if (!error) {
                      alert("Séance enregistrée et publiée avec succès ! 🚀");
                      setIsActionMenuOpen(false);
                      fetchCloudPosts();
                    } else {
                      alert("Erreur : " + error.message);
                    }
                  }}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  Enregistrer instantanément ⚡
                </button>
              </div>

              {/* Passerelle Matériel & GPS */}
              <div className="border-t border-neutral-800 pt-3 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Passerelle GPS & Matériel</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => { setIsActionMenuOpen(false); setIsHuaweiSyncOpen(true); }}
                    className="py-2.5 bg-neutral-950 border border-neutral-800 hover:border-red-500 rounded-xl text-[11px] font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Watch Huawei Sync
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = '.gpx,.fit,.tcx';
                      fileInput.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          alert(`Fichier ${file.name} importé avec succès !`);
                        }
                      };
                      fileInput.click();
                    }}
                    className="py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-[11px] font-bold text-neutral-300 transition cursor-pointer"
                  >
                    📁 Import GPX
                  </button>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-2 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500">Actions avancées</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setIsActionMenuOpen(false); setIsPostModalOpen(true); }} className="py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-bold text-neutral-300 transition cursor-pointer">
                    📝 Post détaillé
                  </button>
                  <button onClick={() => { setIsActionMenuOpen(false); setIsBoxWarsModalOpen(true); }} className="py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-bold text-cyan-400 transition cursor-pointer">
                    ⚡ BoxWars Score
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODALE CARNET DE MUSCULATION */}
        {isGymLogOpen && (
          <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
              <button 
                type="button" 
                onClick={() => { setIsGymLogOpen(false); if (user) fetchGymLogsForUser(user.id); }} 
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <Dumbbell className="w-4 h-4 text-orange-500" /> Carnet de Musculation
              </div>
              <div className="w-16" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-950">
              <GymLogTab currentUserId={user?.id} onStartRestTimer={() => { setIsGymLogOpen(false); if (user) fetchGymLogsForUser(user.id); handleTabChange('rest_timer'); }} />
            </div>
          </div>
        )}

        {/* MODALE GÉNÉRATEUR DE WOD */}
        {isWodGeneratorOpen && (
          <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
              <button 
                type="button" 
                onClick={() => setIsWodGeneratorOpen(false)} 
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <Flame className="w-4 h-4 text-cyan-400" /> Générateur de WOD
              </div>
              <div className="w-16" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-950">
              <PaywallGate userId={user?.id} featureName="Générateur de WOD Intelligent">
                <WodGenerator />
              </PaywallGate>
            </div>
          </div>
        )}

        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Partager une séance</h3>
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

        {isBoxWarsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2"><Zap className="w-5 h-5 text-cyan-400" /> Enregistrer un score BoxWars</h3>
                <button type="button" onClick={() => setIsBoxWarsModalOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;

                const formElement = e.currentTarget as HTMLFormElement;
                const selectWodType = (formElement.elements[0] as HTMLSelectElement).value;
                const scoreInput = (formElement.elements[1] as HTMLInputElement).value;
                const noteInput = (formElement.elements[2] as HTMLTextAreaElement).value;
                  
                const scaleMode = (formElement.elements.namedItem('scaleMode') as RadioNodeList).value;

                if (!scoreInput.trim()) { alert("Veuillez indiquer un score ou un temps !"); return; }

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

        {/* 📸 VUE PROFIL */}
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
          const userTransformations = transformations.filter(t => t.user_id === targetUserId);

          return (
            <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col overflow-y-auto animate-fadeIn">
              <div className="relative h-44 bg-gradient-to-r from-orange-600 via-neutral-800 to-cyan-600 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setViewingProfileUser(null)} 
                  className="absolute top-4 left-4 p-2.5 bg-black/60 hover:bg-black text-white rounded-full z-20 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                {(viewingProfileUser as any).cover_url && (
                  <img src={(viewingProfileUser as any).cover_url} alt="Couverture" className="w-full h-full object-cover opacity-80" />
                )}
              </div>

              <div className="px-4 pb-16 -mt-12 space-y-4 relative z-10 max-w-md mx-auto w-full">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4">
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                    <img src={viewingProfileUser.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} alt={viewingProfileUser.username} className="w-24 h-24 rounded-full object-cover border-4 border-neutral-900 shadow-2xl bg-neutral-800 -mt-12" />
                    <div className="w-full space-y-1">
                      <h2 className="text-xl font-black text-white">{viewingProfileUser.username}</h2>
                      <p className="text-xs text-orange-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {viewingProfileUser.home_club || 'Spot non renseigné'}
                      </p>
                      <div className="flex justify-center sm:justify-start gap-3 mt-2 text-xs text-neutral-300">
                        <span>Objectif : <strong className="text-white">{viewingProfileUser.goal || 'Muscu'}</strong></span>
                        <span>•</span>
                        <span>Ligue : <strong className="text-cyan-400">{(viewingProfileUser as any).points || 0} pts ⚡</strong></span>
                      </div>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex gap-2 pt-2">
                      {!friendship ? (
                        <button onClick={async () => { if (!user) return; await supabase.from('friend_requests').insert([{ sender_id: user.id, receiver_id: targetUserId, status: 'pending' }]); fetchFriendRequests(user.id); }} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer">
                          Ajouter en ami 🤝
                        </button>
                      ) : isAlreadyFriends ? (
                        <button onClick={async () => { await supabase.from('friend_requests').delete().eq('id', friendship.id); if (user) fetchFriendRequests(user.id); }} className="flex-1 py-2.5 bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 font-bold rounded-2xl text-xs border border-neutral-700 transition cursor-pointer">
                          Retirer des amis ✓
                        </button>
                      ) : isPendingSent ? (
                        <button disabled className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 font-bold rounded-2xl text-xs cursor-not-allowed">
                          Demande envoyée ⏳
                        </button>
                      ) : isPendingReceived ? (
                        <button onClick={async () => { await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', friendship.id); if (user) fetchFriendRequests(user.id); }} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl text-xs shadow-lg transition cursor-pointer">
                          Accepter la demande ✅
                        </button>
                      ) : null}

                      <button onClick={() => { setViewingProfileUser(null); handleOpenChatWithUser(viewingProfileUser); handleTabChange('chat'); }} className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs border border-neutral-700 transition cursor-pointer">
                        Message 💬
                      </button>
                    </div>
                  )}
                </div>

                {/* Transformations */}
                {userTransformations.length > 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Transformations Avant / Après ({userTransformations.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {userTransformations.map(trans => (
                        <div key={trans.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden p-2 space-y-2">
                          <div className="grid grid-cols-2 gap-1 h-28">
                            {trans.before_url && <img src={trans.before_url} alt="Avant" className="w-full h-full object-cover rounded-lg" />}
                            {trans.after_url && <img src={trans.after_url} alt="Après" className="w-full h-full object-cover rounded-lg" />}
                          </div>
                          <div className="text-[10px] text-neutral-400 flex justify-between font-bold px-1">
                            <span>{trans.weight} kg</span>
                            <span>{trans.date}</span>
                          </div>
                          <p className="text-[11px] text-neutral-200 px-1 truncate">{trans.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 ml-1">
                    Publications de {viewingProfileUser.username} ({userProfilePosts.length})
                  </h4>

                  {userProfilePosts.length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-neutral-500 text-xs">
                      Aucune publication pour le moment.
                    </div>
                  ) : (
                    userProfilePosts.map(post => (
                      <div key={post.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl space-y-3 shadow-xl">
                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-bold text-orange-400">{post.session_type}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>
                        {post.image_url && (
                          <div className="rounded-2xl overflow-hidden h-48 border border-neutral-800">
                            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 🧭 NAVIGATION DU BAS (BOTTOM NAV) */}
        <nav className="sticky bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 px-4 py-3 flex justify-around items-center">
          <button onClick={() => handleTabChange('today')} className={`flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer px-3 ${currentTab === 'today' || currentTab === 'running' || currentTab === 'readiness' || currentTab === 'boxwars' || currentTab === 'fridge_scanner' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Aujourd'hui</span>
          </button>

          <button onClick={() => handleTabChange('community')} className={`flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer px-3 ${currentTab === 'community' || currentTab === 'feed' || currentTab === 'leaderboard' || currentTab === 'hall_of_fame' || currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Communauté</span>
          </button>
          
          {/* BOUTON CENTRAL D'ACTION RAPIDE */}
          <button onClick={() => setIsActionMenuOpen(true)} className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] transition transform hover:scale-105 active:scale-95 -mt-4 cursor-pointer flex-shrink-0 z-50 border-[3px] border-neutral-950">
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* ONGLET MESSAGERIE DIRECTE DÉDIÉ */}
          <button onClick={() => handleTabChange('chat')} className={`flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer px-3 relative ${currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">Messages</span>
            {allMessages.filter(m => m.receiver_id === user?.id && !m.read).length > 0 && (
              <span className="absolute -top-1 right-2 bg-orange-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                {allMessages.filter(m => m.receiver_id === user?.id && !m.read).length}
              </span>
            )}
          </button>

          <button onClick={() => handleTabChange('profile')} className={`flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer px-3 ${currentTab === 'profile' || currentTab === 'fitbot' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profil & QG</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
