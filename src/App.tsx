import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Plus, Bell, X, Bot, PlusSquare, Calculator, User, MessageCircle, Home, Users, Loader2, Key, Mail
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

import { 
  ClubLocation, ExerciseGuide, PersonalRecord, WeeklyPlan, TransformationPhoto, ExerciseEntry, Comment, Post, Story, RealUser, FriendRequest, DBMessage, LiveWorkoutSet, LiveWorkoutExercise, AIChatMessage 
} from './types';
import { askFitBotAI } from './services/gemini';

// Import de nos composants modulaires
import FeedTab from './components/FeedTab';
import LiveTrackerTab from './components/LiveTrackerTab';
import FitBotTab from './components/FitBotTab';
import ExercisesTab from './components/ExercisesTab';
import ChatTab from './components/ChatTab';
import CalculatorTab from './components/CalculatorTab';
import ProfileTab from './components/ProfileTab';

// Configuration Supabase
const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TIME_SLOTS = ['🌅 Matin (6h - 9h)', '☀️ Midi (12h - 14h)', '🌆 Soir (17h - 20h)', '🌙 Nocturne (20h+)', '📅 Week-end flexible'];

const EXERCISES_DATABASE: ExerciseGuide[] = [
  { id: 'ex-1', name: 'Développé couché (Barre / Haltères)', category: 'Pectoraux', equipment: 'Banc de musculation & Barre olympique', targetMuscles: 'Pectoraux, Triceps, Deltoïdes antérieurs', settings: 'Régler le banc à plat. Allonge-toi les yeux sous la barre. Pieds bien à plat au sol.', execution: 'Saisir la barre un peu plus large que les épaules. Descendre de manière contrôlée jusqu’au milieu de la poitrine, puis pousser en expirant.', tips: 'Garde les omoplates serrées contre le banc et évite de cambrer excessivement le dos.', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', detailedDescription: 'Le développé couché est l’exercice roi pour bâtir de la masse musculaire sur la partie supérieure du corps.' },
  { id: 'ex-2', name: 'Développé chest press (Machine)', category: 'Pectoraux', equipment: 'Machine Chest Press convergente', targetMuscles: 'Pectoraux, Triceps', settings: 'Régler la hauteur du siège pour que les poignées soient alignées au milieu de ta poitrine.', execution: 'Garde le dos bien collé au dossier. Pousse les poignées vers l’avant en tendant les bras sans verrouiller les coudes, puis reviens lentement.', tips: 'Idéal pour l’isolation et la sécurité en fin de séance.', image_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800', detailedDescription: 'La machine chest press guide parfaitement la trajectoire du mouvement pour se concentrer sur la contraction.' },
  { id: 'ex-5', name: 'Squat', category: 'Jambes', equipment: 'Barre libre ou Guidée / Smith Machine', targetMuscles: 'Quadriceps, Fessiers, Ischio-jambiers', settings: 'Place la barre sur tes trapèzes (haut du dos). Élargissement des pieds largeur d’épaules.', execution: 'Fléchis les genoux et descends les fesses vers l’arrière comme pour t’asseoir sur une chaise, le dos bien droit.', tips: 'Garde les genoux bien alignés dans l’axe des pointes de pieds.', image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', detailedDescription: 'Le squat est l’exercice fondamental pour le bas du corps et la force globale.' }
];

const calculateAge = (birthDateString?: string): number => {
  if (!birthDateString) return 25;
  const birthDate = new Date(birthDateString); const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return isNaN(age) ? 25 : age;
};

const getAgeRangeLabel = (birthDateString?: string): string => {
  const age = calculateAge(birthDateString);
  if (age >= 18 && age <= 25) return '18 - 25 ans';
  if (age >= 26 && age <= 35) return '26 - 35 ans';
  if (age >= 36 && age <= 45) return '36 - 45 ans';
  if (age >= 46) return '46+ ans';
  return '25 ans';
};

const isMatchingClub = (postClubName?: string, selectedClubName?: string): boolean => {
  if (!postClubName || !selectedClubName) return false;
  if (postClubName === selectedClubName) return true;
  const normalize = (str: string) => str.toLowerCase().replace(/[()]/g, '').trim();
  const p = normalize(postClubName); const s = normalize(selectedClubName);
  return p === s || p.includes(s) || s.includes(p);
};

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [level, setLevel] = useState<'Débutant' | 'Intermédiaire' | 'Avancé'>('Intermédiaire');
  const [homeClub, setHomeClub] = useState<string>('Club Tournai (Bastion)');
  const [preferredTime, setPreferredTime] = useState<string>(TIME_SLOTS[2]);
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isCGUModalOpen, setIsCGUModalOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'exercises' | 'chat' | 'leaderboard' | 'profile' | 'calculator' | 'live_tracker' | 'fitbot'>(() => {
    try { return (sessionStorage.getItem('fitpulse_current_tab') as any) || 'feed'; } catch { return 'feed'; }
  });

  const [selectedClub, setSelectedClub] = useState<string>('Club Tournai (Bastion)');
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);

  const [userStreak, setUserStreak] = useState<number>(() => { try { return parseInt(localStorage.getItem('fitpulse_streak') || '2', 10); } catch { return 2; } });
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(() => { try { return localStorage.getItem('fitpulse_private') === 'true'; } catch { return false; } });
  
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(90);

  const [isLiveActive, setIsLiveActive] = useState<boolean>(() => { try { return localStorage.getItem('fitpulse_live_active') === 'true'; } catch { return false; } });
  const [liveWorkoutName, setLiveWorkoutName] = useState<string>('Séance Full Body');
  const [liveExercises, setLiveExercises] = useState<LiveWorkoutExercise[]>([]);
  const [selectedExToAdd, setSelectedExToAdd] = useState(EXERCISES_DATABASE[0].name);
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState<number>(0);

  const [aiChatMessages, setAiChatMessages] = useState<AIChatMessage[]>([{ sender: 'bot', text: "Salut l'athlète ! Je suis **FitBot**. Comment puis-je t'aider aujourd'hui ?" }]);
  const [aiInputText, setAiInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, number>>({});
  const [lastNotifOpenTime, setLastNotifOpenTime] = useState<number>(0);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const [transformations, setTransformations] = useState<TransformationPhoto[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RealUser[]>([]);
  const [cloudStories, setCloudStories] = useState<Story[]>([]);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  
  const [viewingProfileUser, setViewingProfileUser] = useState<RealUser | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [storyCommentInput, setStoryCommentInput] = useState('');
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyUploading, setStoryUploading] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const [targetWeight, setTargetWeight] = useState<number | ''>(100);
  const [barbellWeight, setBarbellWeight] = useState<number>(20);

  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newTransNote, setNewTransNote] = useState('');
  const [newTransWeight, setNewTransWeight] = useState<number | ''>('');
  const [newTransBefore, setNewTransBefore] = useState<string | null>(null);
  const [newTransAfter, setNewTransAfter] = useState<string | null>(null);
  const [newTransIsPrivate, setNewTransIsPrivate] = useState<boolean>(true);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [postCommentInput, setPostCommentInput] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tous');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseGuide | null>(null);
  
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);

  // Fonctions Métier
  const convertJJMMAAAAtoYYYYMMDD = (input: string): string => {
    const parts = input.split('/');
    if (parts.length === 3 && parts[2].length === 4) { return `${parts[2]}-${parts[1]}-${parts[0]}`; }
    return '1995-01-01';
  };

  const handleTabChange = (tab: any) => { setCurrentTab(tab); try { sessionStorage.setItem('fitpulse_current_tab', tab); } catch (e) {} };
  const startRestTimer = (seconds: number) => { setRestTimeRemaining(seconds); setIsRestTimerActive(true); };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < friendStoriesList.length - 1) { setActiveStoryIndex(activeStoryIndex + 1); setStoryProgress(0); setStoryCommentInput(''); } 
    else { setActiveStoryIndex(null); }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) { setActiveStoryIndex(activeStoryIndex - 1); setStoryProgress(0); setStoryCommentInput(''); } 
    else { setStoryProgress(0); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Supprimer cette publication ?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) { setPosts((prev) => prev.filter((p) => p.id !== postId)); alert("Publication supprimée."); }
  };

  const handleReportPost = async (post: Post) => {
    if (!window.confirm("Signaler cette publication ?")) return;
    if (user) {
      let adminId = registeredUsers.find(u => u.username.toLowerCase() === 'antbou')?.id;
      if (!adminId) {
        const { data } = await supabase.from('posts').select('user_id').ilike('username', 'antbou').limit(1);
        if (data && data.length > 0) adminId = data[0].user_id;
      }
      if (adminId) {
        await supabase.from('direct_messages').insert([{ sender_id: 'system-bot', receiver_id: adminId, sender_name: '⚠️ Bot', text: `🚨 SIGNALEMENT : ${user.user_metadata?.username} a signalé le post de ${post.username}.` }]);
      }
    }
    alert("🚨 Publication signalée.");
  };

  const handleUpdateProfileAvatar = async (fileOrUrl: File | string) => {
    if (!user) return;
    let finalAvatarUrl = typeof fileOrUrl === 'string' ? fileOrUrl : '';
    if (typeof fileOrUrl !== 'string') {
      try {
        const fileName = `avatar-${user.id}-${Date.now()}.jpg`;
        const { data } = await supabase.storage.from('posts').upload(fileName, await compressImage(fileOrUrl, 400, 0.7), { contentType: 'image/jpeg', upsert: true });
        if (data) finalAvatarUrl = supabase.storage.from('posts').getPublicUrl(fileName).data.publicUrl;
      } catch (err) {}
    }
    if (finalAvatarUrl) { 
      setUserAvatarUrl(finalAvatarUrl); 
      await supabase.auth.updateUser({ data: { ...user.user_metadata, avatar_url: finalAvatarUrl } }); 
      await supabase.from('profiles').update({ avatar_url: finalAvatarUrl }).eq('id', user.id);
      setRegisteredUsers(prev => prev.map(u => u.id === user.id ? { ...u, avatar_url: finalAvatarUrl } : u));
      alert('🌟 Photo de profil mise à jour !'); 
    }
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader(); reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image(); img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width; let height = img.height;
          if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
        };
      };
    });
  };

  const fetchCloudPosts = async () => { setFeedLoading(true); const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }); if (!error && data) setPosts(data as Post[]); setFeedLoading(false); };
  const fetchCloudStories = async () => { try { const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false }); if (!error && data && data.length > 0) setCloudStories(data as Story[]); } catch (err) {} };
  const fetchDirectMessages = async () => { const { data, error } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true }); if (!error && data) setAllMessages(data as DBMessage[]); };
  
  const syncProfile = async (sessionUser: SupabaseUser) => {
    try {
      const bDate = sessionUser.user_metadata?.birth_date || '1995-01-01';
      await supabase.from('profiles').upsert({ id: sessionUser.id, username: sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0], email: sessionUser.email, gender: sessionUser.user_metadata?.gender || 'M', birth_date: bDate, age: calculateAge(bDate), goal: sessionUser.user_metadata?.goal || 'Sportif', home_club: sessionUser.user_metadata?.home_club || selectedClub, preferred_time: sessionUser.user_metadata?.preferred_time || TIME_SLOTS[2], avatar_url: sessionUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', last_seen: new Date().toISOString() });
    } catch(e) {}
  };

  const fetchRealUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
    let combinedUsers = new Map();
    if (!profilesError && profilesData && profilesData.length > 0) {
      profilesData.forEach((p) => { combinedUsers.set(p.id, { id: p.id, username: p.username, email: p.email || '', gender: p.gender || 'M', birth_date: p.birth_date || '1995-01-01', age: p.age || 25, goal: p.goal || 'Sportif', home_club: p.home_club || selectedClub, preferred_time: p.preferred_time || '🌆 Soir (17h - 20h)', avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', last_seen: p.last_seen, is_verified: p.is_verified || false, is_admin: p.is_admin || false }); });
    }
    const { data: postsData } = await supabase.from('posts').select('user_id, username, club_name, avatar_url').limit(100);
    if (postsData) {
      postsData.forEach((p) => { if (!combinedUsers.has(p.user_id)) { combinedUsers.set(p.user_id, { id: p.user_id, username: p.username, email: `${p.username}@fitpulse.be`, gender: 'M', birth_date: '1995-01-01', age: 28, goal: 'Prise de masse & Force', home_club: p.club_name || selectedClub, preferred_time: '🌆 Soir (17h - 20h)', avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', is_verified: false, is_admin: false }); } });
    }
    if (user) { combinedUsers.set(user.id, { id: user.id, username: user.user_metadata?.username || user.email?.split('@')[0] || 'Moi', email: user.email || '', gender: user.user_metadata?.gender || 'M', birth_date: user.user_metadata?.birth_date || '1995-01-01', age: calculateAge(user.user_metadata?.birth_date), goal: user.user_metadata?.goal || 'Sportif', home_club: user.user_metadata?.home_club || selectedClub, preferred_time: user.user_metadata?.preferred_time || '🌆 Soir (17h - 20h)', avatar_url: userAvatarUrl, last_seen: new Date().toISOString() }); }
    setRegisteredUsers(Array.from(combinedUsers.values()));
  };

  const fetchTransformations = async (userId: string) => { const { data, error } = await supabase.from('transformations').select('*').eq('user_id', userId).order('date', { ascending: false }); if (!error && data) setTransformations(data as TransformationPhoto[]); };
  const fetchFriendRequests = async (userId: string) => { const { data, error } = await supabase.from('friend_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`); if (!error && data) setFriendRequests(data as FriendRequest[]); };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !acceptCGU) { alert("Veuillez accepter les CGU."); return; }
    const formattedBirthDate = isSignUp ? convertJJMMAAAAtoYYYYMMDD(birthDateInput) : '1995-01-01';
    setAuthLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName, username: username || `${firstName}_${lastName}`.toLowerCase(), birth_date: formattedBirthDate, gender, level, home_club: homeClub, preferred_time: preferredTime, avatar_url: userAvatarUrl } } });
      if (error) alert("Erreur d'inscription : " + error.message); else setSignupSuccessEmail(email);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Erreur de connexion : " + error.message);
    }
    setAuthLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setAuthLoading(false);
    if (error) alert("Erreur : " + error.message); else setForgotPasswordSent(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) { alert("Mots de passe non concordants."); return; }
    setAuthLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setAuthLoading(false);
    if (error) alert("Erreur : " + error.message);
    else { alert("🔒 Mot de passe mis à jour !"); setIsResetPasswordMode(false); setPassword(''); setConfirmPassword(''); }
  };

  const handleSendAIChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || aiInputText;
    if (!textToSend.trim()) return;
    if (!customText) setAiInputText('');
    const newHistory: AIChatMessage[] = [...aiChatMessages, { sender: 'user', text: textToSend }];
    setAiChatMessages([...newHistory, { sender: 'bot', text: "Hmm, réfléchissons... 🧠" }]);
    const botReply = await askFitBotAI(textToSend);
    setAiChatMessages([...newHistory, { sender: 'bot', text: botReply }]);
  };

  const toggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert("Non supporté."); return; }
    if (isListening) { setIsListening(false); return; }
    const recognition = new (window as any).SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (ev: any) => { setAiInputText(ev.results[0][0].transcript); setIsListening(false); handleSendAIChat(undefined, ev.results[0][0].transcript); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSendMessage = async () => {
    if (!currentMessageInput.trim() || !selectedBuddyChat || !user) return;
    const text = currentMessageInput.trim(); setCurrentMessageInput('');
    await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: selectedBuddyChat.id, sender_name: user.user_metadata?.username || 'Moi', text }]);
    fetchDirectMessages();
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

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user || !storyImageFile) return; setStoryUploading(true); let uploadedStoryUrl = storyImagePreview || '';
    try {
      const compressedBlob = await compressImage(storyImageFile, 800, 0.7); const fileName = `story-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data: uploadData } = await supabase.storage.from('posts').upload(fileName, compressedBlob, { contentType: 'image/jpeg' });
      if (uploadData) { const { data } = supabase.storage.from('posts').getPublicUrl(fileName); uploadedStoryUrl = data.publicUrl; }
    } catch (err) {}
    const myName = user.user_metadata?.first_name || user.user_metadata?.username || 'Moi';
    const uniqueStoryId = 'story-' + Date.now();
    const newStory: Story = { id: uniqueStoryId, user_id: user.id, username: myName, avatar_url: userAvatarUrl, image_url: uploadedStoryUrl, caption: storyCaption, club_name: selectedClub, likes_count: 0, created_at: new Date().toISOString() };
    await supabase.from('stories').insert([{ id: uniqueStoryId, user_id: user.id, username: myName, avatar_url: userAvatarUrl, image_url: uploadedStoryUrl, caption: storyCaption, club_name: selectedClub }]);
    setCloudStories([newStory, ...cloudStories]); setStoryImageFile(null); setStoryImagePreview(null); setStoryCaption(''); setIsCreatingStory(false);
    setStoryUploading(false);
  };

  const handleAddPostComment = async (e: React.FormEvent) => {
    e.preventDefault(); if (!postCommentInput.trim() || !activeCommentPostId || !user) return;
    const newComment: Comment = { id: 'c-' + Date.now(), username: user.user_metadata?.username || 'Moi', avatar_url: userAvatarUrl, text: postCommentInput.trim(), created_at: new Date().toISOString() };
    const targetPost = posts.find(p => p.id === activeCommentPostId); if (!targetPost) return;
    const updatedComments = [...(targetPost.comments || []), newComment];
    await supabase.from('posts').update({ comments: updatedComments, comments_count: updatedComments.length }).eq('id', activeCommentPostId);
    setPosts(prev => prev.map(p => p.id === activeCommentPostId ? { ...p, comments: updatedComments, comments_count: updatedComments.length } : p));
    setPostCommentInput('');
  };

  const handleAddTransformation = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user || !newTransBefore || !newTransAfter || newTransWeight === '') return;
    let beforeUrl = newTransBefore; let afterUrl = newTransAfter;
    try {
      if (newTransBefore.startsWith('blob:')) { const resB = await fetch(newTransBefore); const { data } = await supabase.storage.from('posts').upload(`trans-b-${Date.now()}.jpg`, await compressImage(new File([await resB.blob()], 'b.jpg', { type: 'image/jpeg' }), 800, 0.7), { contentType: 'image/jpeg' }); if (data) beforeUrl = supabase.storage.from('posts').getPublicUrl(data.path).data.publicUrl; }
      if (newTransAfter.startsWith('blob:')) { const resA = await fetch(newTransAfter); const { data } = await supabase.storage.from('posts').upload(`trans-a-${Date.now()}.jpg`, await compressImage(new File([await resA.blob()], 'a.jpg', { type: 'image/jpeg' }), 800, 0.7), { contentType: 'image/jpeg' }); if (data) afterUrl = supabase.storage.from('posts').getPublicUrl(data.path).data.publicUrl; }
    } catch (err) {}
    const newItem = { user_id: user.id, before_url: beforeUrl, after_url: afterUrl, date: new Date().toISOString().split('T')[0], weight: Number(newTransWeight), note: newTransNote || 'Évolution', is_private: newTransIsPrivate };
    const { data, error } = await supabase.from('transformations').insert([newItem]).select('*');
    if (!error && data) { setTransformations([data[0] as TransformationPhoto, ...transformations]); setNewTransBefore(null); setNewTransAfter(null); setNewTransNote(''); setNewTransWeight(''); alert('📸 Transformation enregistrée !'); }
  };

  // Variables dérivées
  const acceptedFriendIds = friendRequests.filter(req => req.status === 'accepted').map(req => (req.sender_id === user?.id ? req.receiver_id : req.sender_id));
  const botUser: RealUser = { id: 'system-bot', username: '⚠️ Modération Bot', email: 'bot@fitpulse', home_club: 'Système', age: 99, avatar_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150' };
  const hasBotMessages = allMessages.some(m => m.sender_id === 'system-bot' && m.receiver_id === user?.id);
  const activeChatUsers = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    const hasExchanged = allMessages.some(m => (m.sender_id === user?.id && m.receiver_id === u.id) || (m.sender_id === u.id && m.receiver_id === user?.id));
    return acceptedFriendIds.includes(u.id) || hasExchanged;
  });
  if (hasBotMessages) activeChatUsers.unshift(botUser);

  const displayedPosts = posts.filter((post) => {
    if (post.is_private && post.user_id !== user?.id && !acceptedFriendIds.includes(post.user_id)) return false;
    return isMatchingClub(post.club_name, selectedClub);
  });

  const friendStoriesList = cloudStories.filter((s) => {
    const storyDate = new Date(s.created_at).getTime();
    return !isNaN(storyDate) ? storyDate >= Date.now() - 24 * 3600 * 1000 : true;
  });

  const unreadChatCount = activeChatUsers.filter(friend => {
    const lastRead = lastReadTimestamps[friend.id] || 0;
    const friendMsgs = allMessages.filter(m => m.sender_id === friend.id && m.receiver_id === user?.id);
    return friendMsgs.some(m => new Date(m.created_at).getTime() > lastRead);
  }).length;

  const notifications = allMessages.filter(m => m.receiver_id === user?.id && m.sender_id === 'system-notification');
  const unreadNotifsCount = notifications.filter(m => new Date(m.created_at).getTime() > lastNotifOpenTime).length;
  const currentUserProfile = registeredUsers.find(u => u.id === user?.id);
  const isAdmin = currentUserProfile?.is_admin || user?.email === 'antbou@fitpulse.be';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) { setSelectedClub(session.user.user_metadata?.home_club || selectedClub); setUserAvatarUrl(session.user.user_metadata?.avatar_url || userAvatarUrl); syncProfile(session.user); fetchTransformations(session.user.id); fetchFriendRequests(session.user.id); }
    });
    fetchCloudPosts(); fetchDirectMessages(); fetchCloudStories(); fetchRealUsers();
  }, []);

  if (isResetPasswordMode) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex justify-center"><div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500"><Key className="w-7 h-7" /></div></div>
          <h1 className="text-xl font-black text-center tracking-tight">Nouveau mot de passe</h1>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <input type="password" required placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
            <input type="password" required placeholder="Confirmer" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
            <button type="submit" disabled={authLoading} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm">Mettre à jour</button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    if (signupSuccessEmail) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 mx-auto"><Mail className="w-8 h-8" /></div>
            <h2 className="text-xl font-black">Vérifie ta boîte mail !</h2>
            <button onClick={() => { setSignupSuccessEmail(null); setIsSignUp(false); }} className="w-full py-3 bg-neutral-800 text-white font-bold rounded-xl text-sm">Retour</button>
          </div>
        </div>
      );
    }
    if (isForgotPassword) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h1 className="text-xl font-black text-center mb-4">Mot de passe oublié</h1>
            {forgotPasswordSent ? (
              <p className="text-center text-sm text-neutral-300">Lien envoyé à {email}.</p>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white" />
                <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl text-sm">Envoyer</button>
              </form>
            )}
            <button onClick={() => setIsForgotPassword(false)} className="w-full text-center text-sm text-neutral-400 mt-4">Retour</button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-4"><div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500"><Zap className="w-7 h-7" /></div></div>
          <h1 className="text-2xl font-black text-center tracking-tight mb-1">FitPulse</h1>
          <form onSubmit={handleAuth} className="space-y-4 mt-6">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="text" required placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white" />
                  <input type="text" required placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="text" required placeholder="Pseudo" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white" />
                  <input type="text" required placeholder="JJ/MM/AAAA" value={birthDateInput} onChange={(e) => setBirthDateInput(e.target.value)} maxLength={10} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white" />
                </div>
                <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white">{TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </>
            )}
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white" />
            <input type="password" required placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white" />
            
            {!isSignUp && <div className="text-right"><button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-orange-400">Mot de passe oublié ?</button></div>}
            {isSignUp && (
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="cgu" checked={acceptCGU} onChange={(e) => setAcceptCGU(e.target.checked)} className="accent-orange-500 w-4 h-4" />
                <label htmlFor="cgu" className="text-xs text-neutral-400">J'accepte les CGU</label>
              </div>
            )}
            <button type="submit" disabled={authLoading} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm flex justify-center">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-sm text-neutral-400 mt-5">{isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500"><Zap className="w-5 h-5" /></div>
          <div><h1 className="text-base font-black tracking-tight leading-none">FitPulse</h1><span className="text-xs text-orange-400 font-semibold truncate block max-w-[150px]">{selectedClub}</span></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsNotifModalOpen(true); setLastNotifOpenTime(Date.now()); }} className="relative p-1.5 text-neutral-400 hover:text-white">
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && <span className="absolute top-1 right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-neutral-950 animate-pulse">{unreadNotifsCount}</span>}
          </button>
        </div>
      </header>

      {/* Affichage conditionnel des composants modulaires */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 pb-24">
        {currentTab === 'feed' && (
          <FeedTab 
            stories={friendStoriesList}
            posts={displayedPosts}
            registeredUsers={registeredUsers}
            currentUserId={user.id}
            feedLoading={feedLoading}
            viewedStoryIds={viewedStoryIds}
            onOpenStory={(idx) => setActiveStoryIndex(idx)}
            onCreateStoryClick={() => setIsCreatingStory(true)}
            onToggleLike={handleToggleLike}
            onOpenComments={(id) => setActiveCommentPostId(id)}
            onReportPost={handleReportPost}
            onDeletePost={handleDeletePost}
            onSelectProfile={(u) => setViewingProfileUser(u)}
            onStartRestTimer={startRestTimer}
          />
        )}

        {currentTab === 'fitbot' && (
          <FitBotTab 
            messages={aiChatMessages}
            inputText={aiInputText}
            setInputText={setAiInputText}
            isListening={isListening}
            toggleVoice={toggleVoiceDictation}
            onSend={(e) => handleSendAIChat(e)}
            messagesEndRef={aiMessagesEndRef}
          />
        )}

        {currentTab === 'exercises' && (
          <ExercisesTab 
            exercises={EXERCISES_DATABASE}
            exerciseSearch={exerciseSearch}
            setExerciseSearch={setExerciseSearch}
            selectedCategoryFilter={selectedCategoryFilter}
            setSelectedCategoryFilter={setSelectedCategoryFilter}
            onSelectExercise={(ex) => setSelectedExerciseDetail(ex)}
          />
        )}

        {currentTab === 'calculator' && (
          <CalculatorTab 
            targetWeight={targetWeight}
            setTargetWeight={setTargetWeight}
            barbellWeight={barbellWeight}
            setBarbellWeight={setBarbellWeight}
            plateBreakdown={plateBreakdown}
          />
        )}

        {currentTab === 'live_tracker' && (
          <LiveTrackerTab 
            liveWorkoutName={liveWorkoutName}
            setLiveWorkoutName={setLiveWorkoutName}
            liveElapsedSeconds={liveElapsedSeconds}
            liveExercises={liveExercises}
            selectedExToAdd={selectedExToAdd}
            setSelectedExToAdd={setSelectedExToAdd}
            exercisesDatabase={EXERCISES_DATABASE}
            onAddExercise={() => setLiveExercises([...liveExercises, { id: 'lex-' + Date.now(), name: selectedExToAdd, sets: [{ setNumber: 1, weight: 50, reps: 10, completed: false }] }])}
            onAddSet={(exId) => setLiveExercises(liveExercises.map(ex => ex.id === exId ? { ...ex, sets: [...ex.sets, { setNumber: ex.sets.length + 1, weight: 50, reps: 10, completed: false }] } : ex))}
            onToggleSet={(exId, sIdx) => setLiveExercises(liveExercises.map(ex => ex.id === exId ? { ...ex, sets: ex.sets.map((s, i) => i === sIdx ? { ...s, completed: !s.completed } : s) } : ex))}
            onUpdateWeight={(exId, sIdx, val) => setLiveExercises(liveExercises.map(item => item.id === exId ? { ...item, sets: item.sets.map((s, i) => i === sIdx ? { ...s, weight: val } : s) } : item))}
            onUpdateReps={(exId, sIdx, val) => setLiveExercises(liveExercises.map(item => item.id === exId ? { ...item, sets: item.sets.map((s, i) => i === sIdx ? { ...s, reps: val } : s) } : item))}
            onFinishWorkout={handleFinishLiveWorkout}
            onQuitLive={() => setIsLiveActive(false)}
          />
        )}

        {currentTab === 'chat' && (
          <ChatTab 
            currentUserId={user.id}
            selectedBuddyChat={selectedBuddyChat}
            setSelectedBuddyChat={setSelectedBuddyChat}
            activeChatUsers={activeChatUsers}
            currentChatMessages={currentChatMessages}
            currentMessageInput={currentMessageInput}
            onInputChange={(e) => setCurrentMessageInput(e.target.value)}
            onSendMessage={handleSendMessage}
            onSelectBuddy={(f) => setSelectedBuddyChat(f)}
            onDeleteConversation={handleDeleteConversationForBuddy}
            onReportConversation={handleReportConversation}
            isOtherUserTyping={isOtherUserTyping}
            isMessageLimitReached={isMessageLimitReached}
            lastReadTimestamps={lastReadTimestamps}
            messagesEndRef={messagesEndRef}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileTab 
            user={user}
            currentUserProfile={currentUserProfile}
            userAvatarUrl={userAvatarUrl}
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
            onCameraStart={(target) => {}}
            onBeforeFileSelect={(e) => {}}
            onAfterFileSelect={(e) => {}}
            onAddTransformation={handleAddTransformation}
            onShareTransformation={(item) => {}}
            onUpdatePasswordSubmit={handleUpdatePassword}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isPrivateMode={isPrivateMode}
            setIsPrivateMode={setIsPrivateMode}
            onSignOut={() => supabase.auth.signOut()}
            onToggleVerifyAdmin={async (uId, status) => { await supabase.from('profiles').update({ is_verified: !status }).eq('id', uId); fetchRealUsers(); }}
            beforeFileInputRef={beforeFileInputRef}
            afterFileInputRef={afterFileInputRef}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800 px-2 py-2 flex justify-around items-center">
        <button onClick={() => handleTabChange('feed')} className={`flex flex-col items-center gap-1 ${currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Home className="w-5 h-5" /><span className="text-[10px]">Accueil</span></button>
        <button onClick={() => handleTabChange('fitbot')} className={`flex flex-col items-center gap-1 ${currentTab === 'fitbot' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Bot className="w-5 h-5" /><span className="text-[10px]">FitBot IA</span></button>
        <button onClick={() => handleTabChange('workout')} className={`flex flex-col items-center gap-1 ${currentTab === 'workout' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><PlusSquare className="w-5 h-5" /><span className="text-[10px]">Séance</span></button>
        <button onClick={() => handleTabChange('calculator')} className={`flex flex-col items-center gap-1 ${currentTab === 'calculator' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Calculator className="w-5 h-5" /><span className="text-[10px]">Calculateur</span></button>
        <button onClick={() => handleTabChange('chat')} className={`flex flex-col items-center gap-1 ${currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><MessageCircle className="w-5 h-5" /><span className="text-[10px]">Chat</span></button>
        <button onClick={() => handleTabChange('profile')} className={`flex flex-col items-center gap-1 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><User className="w-5 h-5" /><span className="text-[10px]">Profil</span></button>
      </nav>
    </div>
  );
}
