import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Send,
  Dumbbell,
  Zap,
  PlusSquare,
  Search,
  Trophy,
  User,
  Home,
  MessageSquare,
  Plus,
  Trash2,
  LogOut,
  Lock,
  Mail,
  Camera,
  Loader2,
  Clock,
  Flame,
  Share2,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Users,
  MessageCircle,
  X,
  SendHorizontal,
  ZoomIn,
  Move,
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  ArrowLeft,
  Calendar,
  Navigation,
  CheckCircle2,
  Building2,
  Sparkles,
  SwitchCamera,
  FolderOpen,
  Box,
  BookOpen,
  Info,
  Timer,
  Edit3,
  Check,
  Hash,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Image as ImageIcon,
  EyeOff,
  FileText,
  AlertTriangle,
  Flag,
  Bell
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ClubLocation {
  name: string;
  address?: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  distance?: number | null;
}

const CLUBS_DATABASE: ClubLocation[] = [
  { name: 'Club Tournai (Bastion)', address: 'Chaussée de Lille 322', city: 'Tournai', zip: '7500', lat: 50.6095, lng: 3.3762 },
  { name: 'Club Tournai (Froyennes)', address: 'Boulevard des Déportés 30', city: 'Tournai', zip: '7500', lat: 50.6051, lng: 3.3934 },
  { name: 'Club Mouscron', address: 'Rue de Menin 435', city: 'Mouscron', zip: '7700', lat: 50.7423, lng: 3.2091 },
  { name: 'Club Mons', address: 'Chaussée de Binche 113', city: 'Mons', zip: '7000', lat: 50.4542, lng: 3.9658 },
  { name: 'Club La Louvière', address: 'Rue de Bouvy 50', city: 'La Louvière', zip: '7100', lat: 50.4812, lng: 4.1905 },
  { name: 'Club Charleroi (Ville 2)', address: 'Rue de Couillet 31', city: 'Charleroi', zip: '6000', lat: 50.4131, lng: 4.4447 },
  { name: 'Club Waterloo', address: 'Chaussée de Bruxelles 254', city: 'Waterloo', zip: '1410', lat: 50.7224, lng: 4.3981 },
  { name: 'Club Wavre', address: 'Chaussée de Louvain 20', city: 'Wavre', zip: '1300', lat: 50.7183, lng: 4.6072 },
  { name: 'Club Namur (Bouge)', address: 'Chaussée de Louvain 445', city: 'Bouge (Namur)', zip: '5004', lat: 50.4735, lng: 4.8712 },
  { name: 'Club Liège (Saint-Lambert)', address: 'Place Saint-Lambert 32', city: 'Liège', zip: '4000', lat: 50.6452, lng: 5.5734 },
  { name: 'Club Liège (Ans)', address: 'Chaussée du Roi Albert 7/13', city: 'Ans', zip: '4430', lat: 50.6548, lng: 5.5291 },
  { name: 'Club Arlon (Hydrion)', address: "Parc Commercial de l'Hydrion 31b", city: 'Arlon', zip: '6700', lat: 49.6841, lng: 5.8173 }
];

const TIME_SLOTS = [
  '🌅 Matin (6h - 9h)',
  '☀️ Midi (12h - 14h)',
  '🌆 Soir (17h - 20h)',
  '🌙 Nocturne (20h+)',
  '📅 Week-end flexible'
];

interface ExerciseGuide {
  id: string;
  name: string;
  category: 'Pectoraux' | 'Dos' | 'Jambes' | 'Épaules' | 'Bras' | 'Core';
  equipment: string;
  targetMuscles: string;
  settings: string;
  execution: string;
  tips: string;
  image_url: string;
}

const EXERCISES_DATABASE: ExerciseGuide[] = [
  { id: 'ex-1', name: 'Développé couché (Barre / Haltères)', category: 'Pectoraux', equipment: 'Banc & Barre', targetMuscles: 'Pectoraux, Triceps, Deltoïdes antérieurs', settings: 'Banc à plat. Pieds au sol.', execution: 'Descendre la barre au milieu de la poitrine, pousser en expirant.', tips: 'Garde les omoplates serrées.', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800' },
  { id: 'ex-2', name: 'Tirage vertical / Lat Pulldown', category: 'Dos', equipment: 'Poulie haute', targetMuscles: 'Grand dorsal, Biceps', settings: 'Ajuste les boudins.', execution: 'Tire la barre vers la poitrine.', tips: 'Ne te penche pas trop en arrière.', image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800' },
  { id: 'ex-3', name: 'Squat', category: 'Jambes', equipment: 'Barre libre ou Guidée', targetMuscles: 'Quadriceps, Fessiers', settings: 'Barre sur trapèzes.', execution: 'Descends comme pour t\'asseoir.', tips: 'Genoux dans l\'axe des pieds.', image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800' },
  { id: 'ex-4', name: 'Leg Press', category: 'Jambes', equipment: 'Presse', targetMuscles: 'Quadriceps', settings: 'Pieds au centre.', execution: 'Fléchis puis pousse.', tips: 'Ne décolle pas le bas du dos.', image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800' }
];

interface PersonalRecord { exercise: string; weight: number; reps: number; date: string; }
interface WeeklyPlan { day: string; focus: string; exercisesText: string; }
interface TransformationPhoto { id: string; user_id?: string; before_url: string; after_url: string; date: string; weight: number; note: string; is_private?: boolean; }
interface ExerciseEntry { name: string; sets: number; reps: number; weight: number; }
interface Comment { id: string; username: string; avatar_url: string; text: string; created_at: string; }

interface Post {
  id: string; user_id: string; username: string; avatar_url: string; partner_name?: string; image_url?: string; club_name: string; session_type: string; caption: string; exercises: ExerciseEntry[]; likes_count: number; liked_by?: string[]; comments_count: number; comments?: Comment[]; created_at: string; is_private?: boolean;
}

interface Story {
  id: string; user_id: string; username: string; avatar_url: string; image_url: string; caption?: string; club_name?: string; likes_count?: number; created_at: string;
}

interface RealUser {
  id: string; username: string; email: string; gender?: 'M' | 'F'; age: number; goal?: string; home_club: string; preferred_time?: string; avatar_url: string;
}

interface FriendRequest {
  id: string; sender_id: string; receiver_id: string; status: 'pending' | 'accepted';
}

interface DBMessage {
  id: string; sender_id: string; receiver_id: string; sender_name: string; text: string; created_at: string;
}

const WORKOUT_CHOICES = ['Push (Pectoraux, Épaules, Triceps)', 'Pull (Dos, Biceps)', 'Legs (Jambes, Fessiers)', 'Full Body (Corps entier)', 'Cardio & HIIT', 'Repos / Récupération'];
const POPULAR_HASHTAGS = ['#legday', '#pushday', '#pullday', '#pr', '#gym', '#cardio', '#hiit', '#nopainnogain', '#musculation', '#fitness'];

const DEFAULT_WEEKLY_PLAN: WeeklyPlan[] = [
  { day: 'Lundi', focus: 'Push (Pectoraux, Épaules, Triceps)', exercisesText: 'Développé couché, Chest Press, Élévations latérales' },
  { day: 'Mardi', focus: 'Pull (Dos, Biceps)', exercisesText: 'Tirage vertical, Rowing poulie basse, Curl Biceps' },
  { day: 'Mercredi', focus: 'Repos / Récupération', exercisesText: 'Stretching & Mobilité' },
  { day: 'Jeudi', focus: 'Legs (Jambes)', exercisesText: 'Squat machine, Leg Press, Mollets' },
  { day: 'Vendredi', focus: 'Full Body (Corps entier)', exercisesText: 'Développé incliné, Tractions, Dips' },
  { day: 'Samedi & Dimanche', focus: 'Repos & Cardio léger', exercisesText: 'Marche / Randonnée' }
];

const calculateAge = (birthDateString?: string): number => {
  if (!birthDateString) return 25;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return isNaN(age) ? 25 : age;
};

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
      };
    };
  });
};

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Auth States
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [homeClub, setHomeClub] = useState<string>('Club Tournai (Bastion)');
  const [preferredTime, setPreferredTime] = useState<string>(TIME_SLOTS[2]);
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);
  const [isCGUModalOpen, setIsCGUModalOpen] = useState(false);

  // App States
  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'exercises' | 'chat' | 'leaderboard' | 'profile'>('feed');
  const [selectedClub, setSelectedClub] = useState<string>('Club Tournai (Bastion)');
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const [userAvatarUrl, setUserAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);

  const [userStreak, setUserStreak] = useState<number>(() => { try { return parseInt(localStorage.getItem('fitpulse_streak') || '2', 10); } catch { return 2; } });
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(() => { try { return localStorage.getItem('fitpulse_private') === 'true'; } catch { return false; } });
  
  // Notifications
  const [lastNotifOpenTime, setLastNotifOpenTime] = useState<number>(() => { try { return parseInt(localStorage.getItem('fitpulse_last_notif') || '0', 10); } catch { return 0; } });
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const [transformations, setTransformations] = useState<TransformationPhoto[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RealUser[]>([]);
  const [cloudStories, setCloudStories] = useState<Story[]>([]);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  
  // Buddy Filters
  const [buddyTabSubMode, setBuddyTabSubMode] = useState<'discover' | 'my_friends' | 'requests'>('discover');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterWomenOnly, setFilterWomenOnly] = useState(false);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('all');
  const [selectedAgeGroupFilter, setSelectedAgeGroupFilter] = useState<string>('all');
  
  // Modals & Active items
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

  const [workoutType, setWorkoutType] = useState('Musculation (Push)');
  const [workoutCaption, setWorkoutCaption] = useState('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera State (Fixed)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'post' | 'story' | 'trans_before' | 'trans_after' | 'profile_avatar'>('post');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Chat & Invites
  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [inviteModalTarget, setInviteModalTarget] = useState<RealUser | null>(null);
  const [inviteType, setInviteType] = useState('Jambes (Leg Day)');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Transformations
  const [newTransNote, setNewTransNote] = useState('');
  const [newTransWeight, setNewTransWeight] = useState<number | ''>('');
  const [newTransBefore, setNewTransBefore] = useState<string | null>(null);
  const [newTransAfter, setNewTransAfter] = useState<string | null>(null);
  const [newTransIsPrivate, setNewTransIsPrivate] = useState<boolean>(true);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  // Cropper
  const [postImageZoom, setPostImageZoom] = useState(1);
  const [postImageOffset, setPostImageOffset] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [postCommentInput, setPostCommentInput] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tous');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseGuide | null>(null);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(90);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([{ exercise: 'Développé couché', weight: 100, reps: 5, date: '2026-08-10' }]);
  const [newPrExercise, setNewPrExercise] = useState('');
  const [newPrWeight, setNewPrWeight] = useState<number | ''>('');
  const [newPrReps, setNewPrReps] = useState<number | ''>('');
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>(DEFAULT_WEEKLY_PLAN);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editFocus, setEditFocus] = useState(WORKOUT_CHOICES[0]);
  const [editExercisesText, setEditExercisesText] = useState('');
  const [activeAnatomyExercise, setActiveAnatomyExercise] = useState<string | null>(null);
  
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>(() => { try { return JSON.parse(localStorage.getItem('fitpulse_liked_stories') || '{}'); } catch { return {}; } });
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('fitpulse_viewed_stories') || '[]'); } catch { return []; } });


  // --- SYNC PROFILES EFFECT ---
  const syncProfile = async (sessionUser: SupabaseUser) => {
    try {
      const profileData = {
        id: sessionUser.id,
        username: sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0],
        email: sessionUser.email,
        gender: sessionUser.user_metadata?.gender || 'M',
        birth_date: sessionUser.user_metadata?.birth_date || '1995-01-01',
        age: calculateAge(sessionUser.user_metadata?.birth_date),
        goal: sessionUser.user_metadata?.goal || 'Sportif',
        home_club: sessionUser.user_metadata?.home_club || selectedClub,
        preferred_time: sessionUser.user_metadata?.preferred_time || TIME_SLOTS[2],
        avatar_url: sessionUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
      
      // On tente d'insérer ou mettre à jour le profil dans une table "profiles". 
      // Si la table n'existe pas, ça renverra une erreur qu'on ignore silencieusement pour le POC.
      await supabase.from('profiles').upsert(profileData).catch(() => {});
    } catch(e) {}
  };


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        if (activeUser.user_metadata?.home_club) setSelectedClub(activeUser.user_metadata.home_club);
        if (activeUser.user_metadata?.avatar_url) setUserAvatarUrl(activeUser.user_metadata.avatar_url);
        syncProfile(activeUser);
        fetchTransformations(activeUser.id);
        fetchFriendRequests(activeUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        if (activeUser.user_metadata?.home_club) setSelectedClub(activeUser.user_metadata.home_club);
        if (activeUser.user_metadata?.avatar_url) setUserAvatarUrl(activeUser.user_metadata.avatar_url);
        syncProfile(activeUser);
        fetchTransformations(activeUser.id);
        fetchFriendRequests(activeUser.id);
      }
    });

    fetchCloudPosts();
    fetchDirectMessages();
    fetchCloudStories();
    fetchRealUsers();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        setAllMessages((prev) => [...prev, payload.new as DBMessage]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'direct_messages' }, (payload) => {
        setAllMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, (payload) => {
        setCloudStories((prev) => [payload.new as Story, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts((prev) => prev.map(p => p.id === payload.new.id ? payload.new as Post : p));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, () => {
        if (user) fetchFriendRequests(user.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      stopCameraStream();
    };
  }, [user?.id]);

  // FIX CAMERA LIFECYCLE
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: cameraTarget === 'profile_avatar' ? 'user' : 'environment' } },
        audio: false
      }).then(stream => {
        currentStream = stream;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(err => {
        alert("Erreur caméra : " + err.message);
        setIsCameraActive(false);
      });
    }
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCameraActive, cameraTarget, facingMode]);


  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [allMessages, selectedBuddyChat]);
  useEffect(() => { localStorage.setItem('fitpulse_streak', userStreak.toString()); }, [userStreak]);
  useEffect(() => { localStorage.setItem('fitpulse_private', isPrivateMode.toString()); }, [isPrivateMode]);
  useEffect(() => { localStorage.setItem('fitpulse_liked_stories', JSON.stringify(likedStories)); }, [likedStories]);
  useEffect(() => { localStorage.setItem('fitpulse_viewed_stories', JSON.stringify(viewedStoryIds)); }, [viewedStoryIds]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRestTimerActive && restTimeRemaining > 0) {
      timer = setInterval(() => setRestTimeRemaining((prev) => prev - 1), 1000);
    } else if (restTimeRemaining === 0 && isRestTimerActive) {
      setIsRestTimerActive(false);
      alert('⏰ Temps de repos terminé ! Prépare ta prochaine série 💪');
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRestTimerActive, restTimeRemaining]);

  // Notifications Derived State
  const notifications = allMessages.filter(m => m.receiver_id === user?.id && m.sender_id === 'system-notification');
  const unreadNotifsCount = notifications.filter(m => new Date(m.created_at).getTime() > lastNotifOpenTime).length;
  const chatMessagesCount = allMessages.filter(m => m.receiver_id === user?.id && m.sender_id !== 'system-notification' && m.sender_id !== 'system-bot').length; // simple approximation

  const acceptedFriendIds = friendRequests.filter(req => req.status === 'accepted').map(req => (req.sender_id === user?.id ? req.receiver_id : req.sender_id));

  // FETCH FUNCTIONS
  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setFeedLoading(false);
  };

  const fetchCloudStories = async () => {
    try {
      const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
      if (!error && data) setCloudStories(data as Story[]);
    } catch (err) {}
  };

  const fetchDirectMessages = async () => {
    const { data, error } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (!error && data) setAllMessages(data as DBMessage[]);
  };

  const fetchRealUsers = async () => {
    // 1. Essayer de récupérer depuis la table Profiles (si existante)
    const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
    
    let combinedUsers = new Map();

    if (!profilesError && profilesData && profilesData.length > 0) {
      profilesData.forEach((p) => {
        combinedUsers.set(p.id, {
          id: p.id,
          username: p.username,
          email: p.email || '',
          gender: p.gender || 'M',
          age: p.age || 25,
          goal: p.goal || 'Sportif',
          home_club: p.home_club || selectedClub,
          preferred_time: p.preferred_time || '🌆 Soir (17h - 20h)',
          avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        });
      });
    }

    // 2. Récupérer l'historique des posts pour compléter au cas où
    const { data: postsData } = await supabase.from('posts').select('user_id, username, club_name, avatar_url').limit(100);
    if (postsData) {
      postsData.forEach((p) => {
        if (!combinedUsers.has(p.user_id)) {
          combinedUsers.set(p.user_id, {
            id: p.user_id,
            username: p.username,
            email: `${p.username}@fitpulse.be`,
            gender: 'M',
            age: 28,
            goal: 'Prise de masse & Force',
            home_club: p.club_name || selectedClub,
            preferred_time: '🌆 Soir (17h - 20h)',
            avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          });
        }
      });
    }

    // 3. Toujours s'inclure soi-même
    if (user) {
      combinedUsers.set(user.id, {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'Moi',
        email: user.email || '',
        gender: user.user_metadata?.gender || 'M',
        age: calculateAge(user.user_metadata?.birth_date),
        goal: user.user_metadata?.goal || 'Sportif',
        home_club: user.user_metadata?.home_club || selectedClub,
        preferred_time: user.user_metadata?.preferred_time || '🌆 Soir (17h - 20h)',
        avatar_url: userAvatarUrl
      });
    }

    setRegisteredUsers(Array.from(combinedUsers.values()));
  };

  const fetchTransformations = async (userId: string) => {
    const { data, error } = await supabase.from('transformations').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (!error && data) setTransformations(data as TransformationPhoto[]);
  };

  const fetchFriendRequests = async (userId: string) => {
    const { data, error } = await supabase.from('friend_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (!error && data) setFriendRequests(data as FriendRequest[]);
  };

  // SEND NOTIFICATION SYSTEM
  const sendSystemNotification = async (receiverId: string, message: string) => {
    await supabase.from('direct_messages').insert([{
      sender_id: 'system-notification',
      receiver_id: receiverId,
      sender_name: '📣 Notification',
      text: message
    }]);
  };


  // AUTH
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !acceptCGU) { alert("Veuillez accepter les CGU pour continuer."); return; }
    setAuthLoading(true);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { first_name: firstName, last_name: lastName, username: username || `${firstName}_${lastName}`.toLowerCase(), birth_date: birthDate, gender, level, home_club: homeClub, preferred_time: preferredTime, avatar_url: userAvatarUrl } }
      });
      if (error) alert("Erreur d'inscription : " + error.message);
      else setSignupSuccessEmail(email);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Erreur de connexion : " + error.message);
    }
    setAuthLoading(false);
  };

  // ACTIONS
  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const likedByList = post.liked_by || [];
    const hasAlreadyLiked = likedByList.includes(user.id);

    let updatedLikedBy = [...likedByList];
    let newCount = post.likes_count;

    if (hasAlreadyLiked) {
      updatedLikedBy = updatedLikedBy.filter(id => id !== user.id);
      newCount = Math.max(0, newCount - 1);
    } else {
      updatedLikedBy.push(user.id);
      newCount += 1;
      
      // Notifier l'auteur si ce n'est pas nous-même
      if (post.user_id !== user.id) {
         const myName = user.user_metadata?.username || user.email?.split('@')[0] || 'Un athlète';
         sendSystemNotification(post.user_id, `❤️ ${myName} a aimé votre séance "${post.session_type}".`);
      }
    }

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount, liked_by: updatedLikedBy } : p));
    await supabase.from('posts').update({ likes_count: newCount, liked_by: updatedLikedBy }).eq('id', postId);
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    const { error } = await supabase.from('friend_requests').insert([{ sender_id: user.id, receiver_id: targetUserId, status: 'pending' }]);
    if (error) {
      alert("Erreur lors de l'envoi de la demande.");
    } else {
      alert("Demande d'ami envoyée avec succès !");
      fetchFriendRequests(user.id);
      const myName = user.user_metadata?.username || 'Quelqu\'un';
      sendSystemNotification(targetUserId, `👋 ${myName} souhaite devenir votre Buddy !`);
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
    if (!error && user) {
      alert("Demande acceptée ! Vous êtes désormais amis 🎉");
      fetchFriendRequests(user.id);
      const req = friendRequests.find(r => r.id === requestId);
      if (req) {
         const myName = user.user_metadata?.username || 'Un utilisateur';
         sendSystemNotification(req.sender_id, `✅ ${myName} a accepté votre demande d'ami !`);
      }
    }
  };

  const handleSendInvite = async () => {
    if (!inviteModalTarget || !user) return;
    const myName = user.user_metadata?.username || 'Un ami';
    const message = `🏋️ INVITATION PUSH UP : Salut ! Es-tu prêt(e) pour une grosse séance **${inviteType}** avec moi ?`;
    
    await supabase.from('direct_messages').insert([{
      sender_id: user.id,
      receiver_id: inviteModalTarget.id,
      sender_name: myName,
      text: message
    }]);

    alert(`Invitation pour ${inviteType} envoyée à ${inviteModalTarget.username} !`);
    setInviteModalTarget(null);
  };

  const handlePublishWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);
    let uploadedImageUrl = undefined;
    
    if (postImageFile && postImagePreview) {
      try {
        const finalBlob = await getCroppedImageBlob() || await compressImage(postImageFile, 800, 0.7);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData } = await supabase.storage.from('posts').upload(fileName, finalBlob, { contentType: 'image/jpeg' });
        if (uploadData) {
          const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      } catch (err: any) {}
    }
    
    const validExercises = workoutExercises.filter((ex) => ex.name.trim() !== '');
    const newPostData = {
      user_id: user.id, username: user.user_metadata?.username || 'Athlète', avatar_url: userAvatarUrl, image_url: uploadedImageUrl || null,
      club_name: selectedClub, session_type: workoutType, caption: workoutCaption, exercises: validExercises, likes_count: 0, liked_by: [], comments_count: 0, comments: [], is_private: isPrivateMode
    };
    
    const { data, error } = await supabase.from('posts').insert([newPostData]).select('*');
    if (!error && data) {
      setPosts([data[0] as Post, ...posts]);
      setUserStreak(prev => prev + 1);
      setWorkoutCaption(''); setPostImageFile(null); setPostImagePreview(null); setPostImageZoom(1); setPostImageOffset({ x: 0, y: 0 }); setWorkoutExercises([]);
      setCurrentTab('feed');
    }
    setIsUploading(false);
  };

  const startCameraHandler = (target: 'post' | 'story' | 'trans_before' | 'trans_after' | 'profile_avatar') => {
    setCameraTarget(target);
    setIsCameraActive(true); // Déclenche le useEffect qui gère getUserMedia
  };

  // FILTERED LISTS
  const displayedPostsFilter = posts.filter((post) => {
    if (post.is_private && post.user_id !== user?.id && !acceptedFriendIds.includes(post.user_id)) return false;
    return isMatchingClub(post.club_name, selectedClub);
  });

  const activeChatUsersList = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    const hasExchanged = allMessages.some(m => (m.sender_id === user?.id && m.receiver_id === u.id) || (m.sender_id === u.id && m.receiver_id === user?.id));
    return acceptedFriendIds.includes(u.id) || hasExchanged;
  });

  if (allMessages.some(m => m.sender_id === 'system-bot' && m.receiver_id === user?.id)) {
    activeChatUsersList.unshift({ id: 'system-bot', username: '⚠️ Modération Bot', email: '', home_club: 'Système', age: 99, avatar_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150' });
  }

  // INTERFACE
  if (!user) {
    if (signupSuccessEmail) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-500 mx-auto"><Mail className="w-8 h-8 animate-bounce" /></div>
            <h2 className="text-xl font-black">Vérifie ta boîte mail !</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">Un e-mail de confirmation a été envoyé à <strong className="text-orange-400">{signupSuccessEmail}</strong>.</p>
            <button onClick={() => { setSignupSuccessEmail(null); setIsSignUp(false); }} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition">Retour à la connexion</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-4"><div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500"><Zap className="w-7 h-7" /></div></div>
          <h1 className="text-2xl font-black text-center tracking-tight mb-1">FitPulse</h1>
          <p className="text-xs text-neutral-400 text-center mb-6">{isSignUp ? 'Création de ton profil athlète' : 'Connecte-toi à ton espace'}</p>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div><label className="block text-[11px] font-semibold text-neutral-400 mb-1">Prénom</label><input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500" /></div>
                  <div><label className="block text-[11px] font-semibold text-neutral-400 mb-1">Nom</label><input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div><label className="block text-[11px] font-semibold text-neutral-400 mb-1">Pseudo public</label><input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500" /></div>
                  <div><label className="block text-[11px] font-semibold text-neutral-400 mb-1">Date de naissance</label><input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500" /></div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Créneau horaire préféré</label>
                  <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500">
                    {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </>
            )}
            <div><label className="block text-[11px] font-semibold text-neutral-400 mb-1">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500" /></div>
            <div><label className="block text-[11px] font-semibold text-neutral-400 mb-1">Mot de passe</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500" /></div>

            {isSignUp && (
              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="cgu" checked={acceptCGU} onChange={(e) => setAcceptCGU(e.target.checked)} className="mt-0.5 accent-orange-500" />
                <label htmlFor="cgu" className="text-[11px] text-neutral-400 leading-tight">J'accepte les <button type="button" onClick={() => setIsCGUModalOpen(true)} className="text-orange-400 underline font-semibold">Conditions Générales d'Utilisation</button>.</label>
              </div>
            )}
            <button type="submit" disabled={authLoading} className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs">
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-xs text-neutral-400 hover:text-white mt-5 transition">
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>

        {isCGUModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
              <h3 className="text-sm font-black text-white">CGU & Tolérance Zéro</h3>
              <p className="text-[11px] text-neutral-300">Il est strictement interdit de publier des photos à caractère pornographique, obscène, contenant des nudités ou révélant des parties intimes sur le flux public. Tout manquement entraînera le bannissement définitif.</p>
              <button onClick={() => { setAcceptCGU(true); setIsCGUModalOpen(false); }} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl text-xs">Accepter</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500"><Zap className="w-5 h-5" /></div>
          <div><h1 className="text-base font-black tracking-tight leading-none">FitPulse</h1><span className="text-[10px] text-orange-400 font-semibold truncate block max-w-[150px]">{selectedClub}</span></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsNotifModalOpen(true); setLastNotifOpenTime(Date.now()); localStorage.setItem('fitpulse_last_notif', Date.now().toString()); }} className="relative p-1.5 text-neutral-400 hover:text-white transition">
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-neutral-950 rounded-full animate-pulse"></span>}
          </button>
          <div className="flex items-center gap-1 bg-orange-500/10 px-2.5 py-1.5 rounded-full border border-orange-500/20">
            <Flame className="w-3.5 h-3.5 text-orange-500" /><span className="text-xs font-black text-orange-500">{userStreak}</span>
          </div>
        </div>
      </header>

      {/* NOTIFICATION MODAL */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-4 shadow-2xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /> Notifications</h3>
              <button onClick={() => setIsNotifModalOpen(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">Aucune notification pour le moment.</div>
            ) : (
              <div className="space-y-2">
                {notifications.slice().reverse().map(n => (
                  <div key={n.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-200">
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isRestTimerActive && (
        <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between sticky top-[53px] z-30 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold"><Timer className="w-4 h-4 animate-spin" /> Repos : {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}</div>
          <button onClick={() => setIsRestTimerActive(false)} className="text-[11px] bg-black/30 hover:bg-black/50 px-2.5 py-1 rounded-lg">Arrêter</button>
        </div>
      )}

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 pb-24">
        {currentTab === 'feed' && (
          <div className="space-y-4">
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-3">
              <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
                <div onClick={() => { startCameraHandler('story'); setIsCreatingStory(true); }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
                  <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center p-0.5 group-hover:border-orange-500 transition">
                    <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">+</div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white border-2 border-neutral-950 shadow-md"><Plus className="w-3 h-3 stroke-[3]" /></div>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-300">Ta story</span>
                </div>

                {friendStoriesList.map((story, index) => {
                  const isViewed = viewedStoryIds.includes(story.id);
                  return (
                    <div key={story.id || index} onClick={() => { setActiveStoryIndex(index); setStoryProgress(0); setIsStoryPaused(false); }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                      <div className={`w-16 h-16 rounded-full ${isViewed ? 'border-2 border-dashed border-neutral-600 opacity-70' : 'bg-gradient-to-tr from-orange-500 via-pink-500 to-amber-400'} p-[2.5px]`}>
                        <div className="w-full h-full bg-neutral-950 rounded-full p-[2px]"><img src={story.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /></div>
                      </div>
                      <span className="text-[10px] font-medium truncate max-w-[64px] text-center">{story.username.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {feedLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : displayedPostsFilter.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900/50 rounded-3xl border border-neutral-800/60 p-6">Aucune publication pour l'instant dans ce club.</div>
            ) : (
              displayedPostsFilter.map((post) => {
                const isAlreadyLikedByMe = user ? (post.liked_by || []).includes(user.id) : false;
                return (
                  <article key={post.id} className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3.5 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                        <div>
                          <div className="flex items-center gap-1.5"><h3 className="font-bold text-sm leading-snug">{post.username}</h3>{post.is_private && <Lock className="w-3 h-3 text-neutral-500" />}</div>
                          <div className="flex items-center gap-1 text-[11px] text-orange-400 font-medium"><MapPin className="w-3 h-3" />{post.club_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleReportPost(post)} title="Signaler ce post" className="p-2 text-neutral-500 hover:text-orange-400 rounded-lg transition"><Flag className="w-4 h-4" /></button>
                        {post.user_id === user?.id && <button onClick={() => handleDeletePost(post.id)} title="Supprimer" className="p-2 text-neutral-500 hover:text-red-400 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-inner aspect-square flex items-center justify-center">
                      {post.image_url ? (
                        <><img src={post.image_url} alt="" className="w-full h-full object-cover pointer-events-none" /><div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500 animate-pulse" /><span className="text-xs font-black text-white">{post.session_type}</span></div></>
                      ) : (
                        <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 flex flex-col justify-center items-center text-center space-y-2"><Dumbbell className="w-10 h-10 text-orange-500 mb-1" /><span className="text-sm font-black text-white">{post.session_type}</span></div>
                      )}
                    </div>

                    {post.caption && <p className="text-xs text-neutral-200 leading-relaxed font-medium">{renderCaptionWithHashtags(post.caption)}</p>}

                    {post.exercises && post.exercises.length > 0 && (
                      <div className="bg-neutral-950/80 rounded-2xl p-3.5 border border-neutral-800/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5 text-orange-500" /> Exercices</span>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => startRestTimer(60)} className="px-2 py-0.5 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded text-[10px]">⏱ 60s</button>
                            <button onClick={() => startRestTimer(90)} className="px-2 py-0.5 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded text-[10px]">⏱ 90s</button>
                          </div>
                        </div>
                        {post.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900 last:border-none">
                            <span className="font-semibold text-neutral-200">{ex.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-orange-400 font-bold">{ex.sets} s × {ex.reps} r ({ex.weight} kg)</span>
                              <button onClick={() => setActiveAnatomyExercise(ex.name)} className="p-1 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg flex items-center gap-1 text-[10px] transition"><Activity className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-neutral-400 text-xs">
                      <button onClick={() => handleToggleLike(post.id)} className={`flex items-center gap-1.5 transition ${isAlreadyLikedByMe ? 'text-red-500 font-bold' : 'hover:text-white'}`}><Heart className={`w-4 h-4 ${isAlreadyLikedByMe ? 'fill-red-500 text-red-500' : ''}`} /><span>{post.likes_count}</span></button>
                      <button onClick={() => setActiveCommentPostId(post.id)} className="flex items-center gap-1.5 hover:text-white transition"><MessageSquare className="w-4 h-4" /><span>{post.comments_count || 0}</span></button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {currentTab === 'workout' && (
          <form onSubmit={handlePublishWorkout} className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black tracking-tight">Enregistrer une séance</h2>
                {isPrivateMode && <ShieldCheck className="w-5 h-5 text-green-500" />}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-400">Type de séance :</label>
                <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500">
                  {WORKOUT_CHOICES.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => startCameraHandler('post')} className="py-6 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition"><Camera className="w-6 h-6 text-orange-500" /><span className="text-xs font-semibold">Prendre photo</span></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="py-6 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition"><FolderOpen className="w-6 h-6 text-neutral-400" /><span className="text-xs font-semibold">Galerie</span></button>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              
              {postImagePreview && (
                <div className="space-y-3">
                  <div
                    ref={previewContainerRef}
                    className="relative rounded-2xl overflow-hidden border border-neutral-700 w-full aspect-square bg-neutral-950 flex items-center justify-center touch-none cursor-move"
                    onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
                    onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                  >
                    <img ref={imgRef} src={postImagePreview} alt="" style={{ transform: `translate(${postImageOffset.x}px, ${postImageOffset.y}px) scale(${postImageZoom})`, transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out', objectFit: 'cover', width: '100%', height: '100%', transformOrigin: 'center' }} className="pointer-events-none select-none" draggable={false} />
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-lg flex items-center gap-1.5 text-white/80 text-[10px]"><Move className="w-3 h-3" /> Pince/Glisse pour recadrer</div>
                    <button type="button" onClick={() => setPostImagePreview(null)} className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                    <ZoomIn className="w-5 h-5 text-neutral-400" />
                    <input type="range" min="1" max="4" step="0.05" value={postImageZoom} onChange={(e) => setPostImageZoom(Number(e.target.value))} className="flex-1 accent-orange-500" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-orange-400 uppercase tracking-wider">Exercices réalisés :</label>
                  <button type="button" onClick={handleAddExerciseRow} className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</button>
                </div>

                {workoutExercises.map((ex, index) => (
                  <div key={index} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Nom de l'exercice" value={ex.name} onChange={(e) => { const updated = [...workoutExercises]; updated[index].name = e.target.value; setWorkoutExercises(updated); }} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                      <button type="button" onClick={() => handleRemoveExerciseRow(index)} className="p-1.5 text-neutral-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><input type="number" placeholder="Séries" value={ex.sets} onChange={(e) => { const updated = [...workoutExercises]; updated[index].sets = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-xs text-white text-center" /></div>
                      <div><input type="number" placeholder="Reps" value={ex.reps} onChange={(e) => { const updated = [...workoutExercises]; updated[index].reps = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-xs text-white text-center" /></div>
                      <div><input type="number" placeholder="Poids" value={ex.weight} onChange={(e) => { const updated = [...workoutExercises]; updated[index].weight = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-xs text-white text-center" /></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <textarea rows={3} placeholder="Comment s'est passée la séance ?" value={workoutCaption} onChange={(e) => setWorkoutCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" />
                <div className="flex flex-wrap gap-2">
                  {POPULAR_HASHTAGS.map((tag) => (
                    <button key={tag} type="button" onClick={() => handleAddWorkoutHashtag(tag)} className="px-2.5 py-1 bg-neutral-950 hover:bg-orange-600/20 border border-neutral-800 hover:border-orange-500 text-neutral-300 text-[10px] rounded-lg">{tag}</button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Partager ma séance'}
              </button>
            </div>
          </form>
        )}

        {currentTab === 'exercises' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-black tracking-tight flex items-center gap-2"><BookOpen className="w-6 h-6 text-orange-500" /> Guide des Exercices</h2></div>
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-orange-500" />
                <input type="text" placeholder="Rechercher un exercice..." value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-orange-500" />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras'].map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategoryFilter(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedCategoryFilter === cat ? 'bg-orange-500 text-white border-orange-400 shadow-md' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'}`}>{cat}</button>
                ))}
              </div>
              <div className="space-y-3 pt-1">
                {EXERCISES_DATABASE.filter((ex) => (selectedCategoryFilter === 'Tous' || ex.category === selectedCategoryFilter) && (ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || ex.targetMuscles.toLowerCase().includes(exerciseSearch.toLowerCase()))).map((ex) => (
                  <div key={ex.id} onClick={() => setSelectedExerciseDetail(ex)} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 hover:border-orange-500/50 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={ex.image_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-neutral-800 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-white">{ex.name}</span><span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/20">{ex.category}</span></div>
                        <p className="text-[10px] text-neutral-400">🎯 {ex.targetMuscles}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'buddy' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div><h2 className="text-base font-black tracking-tight">Réseau & Athlètes</h2><span className="text-[10px] text-orange-400 font-semibold">{selectedClub}</span></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFilterWomenOnly(!filterWomenOnly)} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${filterWomenOnly ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white ring-2 ring-pink-400 shadow-md' : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'}`}><span>🚺</span> Entre femmes {filterWomenOnly && '✓'}</button>
              </div>
            </div>

            <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
              <button onClick={() => setBuddyTabSubMode('discover')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'discover' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Découvrir</button>
              <button onClick={() => setBuddyTabSubMode('my_friends')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'my_friends' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Mes Amis ({myFriendsList.length})</button>
              <button onClick={() => setBuddyTabSubMode('requests')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition relative ${buddyTabSubMode === 'requests' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Demandes {incomingRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{incomingRequests.length}</span>}</button>
            </div>

            {buddyTabSubMode === 'requests' ? (
              <div className="space-y-3 pt-1">
                {incomingRequests.length === 0 ? <div className="text-center py-8 text-neutral-500 text-xs">Aucune demande en attente.</div> : incomingRequests.map((req) => {
                    const senderUser = registeredUsers.find(u => u.id === req.sender_id) || { username: 'Athlète', home_club: selectedClub, avatar_url: '' };
                    return (
                      <div key={req.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={senderUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-700" />
                          <div><h3 className="font-bold text-xs text-white">{senderUser.username}</h3></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAcceptFriendRequest(req.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold">Accepter</button>
                          <button onClick={() => handleRejectFriendRequest(req.id)} className="p-2 bg-neutral-900 border border-neutral-800 text-red-400 rounded-xl"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    );
                })}
              </div>
            ) : (
              <>
                <div className="relative pt-1">
                  <Search className="absolute left-3.5 top-4.5 w-4 h-4 text-orange-500" />
                  <input type="text" placeholder="Rechercher par pseudo..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:border-orange-500 shadow-inner" />
                </div>

                <div className="space-y-3 pt-1">
                  {filteredBuddies.length === 0 ? <div className="text-center py-8 text-neutral-500 text-xs">Aucun autre athlète trouvé pour l'instant.</div> : filteredBuddies.map((realUser) => {
                      const isFriend = acceptedFriendIds.includes(realUser.id);
                      const existingReq = friendRequests.find(r => (r.sender_id === user?.id && r.receiver_id === realUser.id) || (r.sender_id === realUser.id && r.receiver_id === user?.id));
                      const isPending = existingReq && existingReq.status === 'pending';

                      return (
                        <div key={realUser.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={realUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                            <div>
                              <h3 className="font-bold text-sm text-white">{realUser.username} {realUser.gender === 'F' && '🚺'} <span className="text-xs font-normal text-neutral-400">({realUser.age} ans)</span></h3>
                              <span className="text-[11px] text-orange-400 font-medium block">● {realUser.home_club}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {realUser.preferred_time && <span className="text-[10px] text-amber-400/80 font-medium border border-amber-400/20 px-1.5 py-0.5 rounded bg-amber-400/10">🕒 {realUser.preferred_time.split(' ')[1]}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              {isFriend ? (
                                <button onClick={() => setInviteModalTarget(realUser)} className="px-2 py-1.5 bg-orange-600/20 border border-orange-500/50 hover:bg-orange-600 text-orange-400 hover:text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition">
                                  <Zap className="w-3.5 h-3.5" /> Push Up
                                </button>
                              ) : isPending ? (
                                <button disabled className="px-3 py-1.5 bg-neutral-900 text-neutral-400 rounded-xl text-xs font-medium">En attente</button>
                              ) : (
                                <button onClick={() => handleSendFriendRequest(realUser.id)} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Ajouter</button>
                              )}
                              <button onClick={() => { setSelectedBuddyChat(realUser); setCurrentTab('chat'); }} className="p-2 bg-neutral-900 border border-neutral-800 hover:border-orange-500 text-neutral-200 rounded-xl"><MessageCircle className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </>
            )}
          </div>
        )}

        {currentTab === 'chat' && (
          <div className="space-y-4">
            {selectedBuddyChat ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
                <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                  <button onClick={() => setSelectedBuddyChat(null)} className="p-1 text-neutral-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                  <h3 className="font-bold text-xs text-white">{selectedBuddyChat.username}</h3>
                  <button onClick={() => handleDeleteConversationForBuddy(selectedBuddyChat.id, selectedBuddyChat.username)} className="p-1.5 text-neutral-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {currentChatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${msg.sender_id === user?.id ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                {selectedBuddyChat.id !== 'system-bot' && (
                  <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
                    <input type="text" placeholder="Écrire un message..." value={currentMessageInput} onChange={(e) => setCurrentMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" />
                    <button onClick={() => handleSendMessage()} className="p-2.5 bg-orange-600 text-white rounded-xl"><SendHorizontal className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black tracking-tight">Messagerie</h2>
                  <span className="text-[10px] text-neutral-500">Conversations & Alertes 💬</span>
                </div>
                {activeChatUsersList.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">Aucun ami dans ton réseau. Va dans l'onglet **Buddy** pour ajouter des athlètes !</div>
                ) : (
                  activeChatUsersList.map((friend) => (
                    <div key={friend.id} onClick={() => setSelectedBuddyChat(friend)} className="p-3.5 bg-neutral-950 hover:bg-neutral-900/80 rounded-2xl border border-neutral-800 flex items-center justify-between cursor-pointer transition">
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-800" />
                        <div><h3 className="font-bold text-xs text-white">{friend.username}</h3></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* PROFIL ET LEADERBOARD RESTE INCHANGÉ ICI POUR LA COMPACITÉ */}
        {currentTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto group cursor-pointer" onClick={() => profileAvatarInputRef.current?.click()}>
                <img src={userAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-orange-500 shadow-xl" />
                <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition"><Camera className="w-6 h-6 text-white" /></div>
              </div>
              <input type="file" accept="image/*" ref={profileAvatarInputRef} onChange={(e) => handleImageSelect(e, 'profile_avatar')} className="hidden" />
              <div><h2 className="font-extrabold text-xl">{user.user_metadata?.first_name || user.email?.split('@')[0]}</h2></div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-500" /> Confidentialité
                </h3>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <div><span className="font-bold text-sm text-white block">Compte Privé</span></div>
                <button onClick={() => setIsPrivateMode(!isPrivateMode)} className={`relative w-12 h-6 rounded-full transition-colors ${isPrivateMode ? 'bg-orange-500' : 'bg-neutral-800'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPrivateMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <button onClick={() => supabase.auth.signOut()} className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-red-400 rounded-3xl text-sm font-bold transition border border-neutral-800 flex items-center justify-center gap-2 shadow-sm">
              <LogOut className="w-5 h-5" /> Déconnexion de l'espace
            </button>
          </div>
        )}
      </main>

      {/* MODAL PUSH UP (INVITATION) */}
      {inviteModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Lancer un Push Up !</h3>
              <button onClick={() => setInviteModalTarget(null)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-neutral-300">Invite <strong>{inviteModalTarget.username}</strong> à s'entraîner avec toi.</p>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Quelle séance ?</label>
                <select value={inviteType} onChange={(e) => setInviteType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500">
                  <option value="Jambes (Leg Day)">Jambes (Leg Day)</option>
                  <option value="Push (Pecs, Épaules, Triceps)">Push (Pecs, Épaules)</option>
                  <option value="Pull (Dos, Biceps)">Pull (Dos, Biceps)</option>
                  <option value="Cardio & HIIT">Cardio & HIIT</option>
                  <option value="Full Body">Full Body</option>
                </select>
              </div>
            </div>
            <button onClick={handleSendInvite} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Envoyer le défi
            </button>
          </div>
        </div>
      )}

      {/* MODAL CAMÉRA */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center p-4">
          <div className="w-full flex items-center justify-between z-10 pt-2">
            <span className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full border border-neutral-800">Caméra en direct</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={switchCameraFacing} className="p-2.5 bg-black/60 rounded-full text-white"><SwitchCamera className="w-5 h-5" /></button>
              <button type="button" onClick={stopCameraStream} className="p-2.5 bg-black/60 rounded-full text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="relative w-full flex-1 max-w-sm my-auto rounded-3xl overflow-hidden bg-neutral-950 flex items-center justify-center border border-neutral-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="w-full flex justify-center items-center pb-6 z-10">
            <button type="button" onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1">
              <div className="w-full h-full bg-orange-500 rounded-full shadow-lg" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/80 px-2 py-2 flex justify-around items-center">
        <button onClick={() => setCurrentTab('feed')} className={`flex flex-col items-center gap-1 ${currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Home className="w-5 h-5" /><span className="text-[10px]">Accueil</span></button>
        <button onClick={() => setCurrentTab('buddy')} className={`flex flex-col items-center gap-1 ${currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Users className="w-5 h-5" /><span className="text-[10px]">Buddy</span></button>
        <button onClick={() => setCurrentTab('exercises')} className={`flex flex-col items-center gap-1 ${currentTab === 'exercises' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><BookOpen className="w-5 h-5" /><span className="text-[10px]">Exercices</span></button>
        <button onClick={() => setCurrentTab('workout')} className={`flex flex-col items-center gap-1 ${currentTab === 'workout' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}>
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center -mt-2.5 shadow-lg"><Plus className="w-5 h-5" /></div>
          <span className="text-[10px]">Séance</span>
        </button>
        <button onClick={() => setCurrentTab('chat')} className={`flex flex-col items-center gap-1 ${currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}>
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Chat</span>
        </button>
        <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center gap-1 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><User className="w-5 h-5" /><span className="text-[10px]">Profil</span></button>
      </nav>
    </div>
  );
}
