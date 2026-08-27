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
  Flag
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
  {
    id: 'ex-1',
    name: 'Développé couché (Barre / Haltères)',
    category: 'Pectoraux',
    equipment: 'Banc de musculation & Barre olympique',
    targetMuscles: 'Pectoraux, Triceps, Deltoïdes antérieurs',
    settings: 'Régler le banc à plat. Allonge-toi les yeux sous la barre. Pieds bien à plat au sol.',
    execution: 'Saisir la barre un peu plus large que les épaules. Descendre la barre de manière contrôlée jusqu’au milieu de la poitrine, puis pousser en expirant.',
    tips: 'Garde les omoplates serrées contre le banc et évite de cambrer excessivement le dos.',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
  },
  {
    id: 'ex-2',
    name: 'Développé chest press (Machine)',
    category: 'Pectoraux',
    equipment: 'Machine Chest Press convergente',
    targetMuscles: 'Pectoraux, Triceps',
    settings: 'Régler la hauteur du siège pour que les poignées soient alignées au milieu de ta poitrine.',
    execution: 'Garde le dos bien collé au dossier. Pousse les poignées vers l’avant en tendant les bras sans verrouiller les coudes, puis reviens lentement.',
    tips: 'Idéal pour l’isolation et la sécurité en fin de séance.',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
  },
  {
    id: 'ex-3',
    name: 'Tirage vertical / Lat Pulldown',
    category: 'Dos',
    equipment: 'Poulie haute avec barre large',
    targetMuscles: 'Grand dorsal, Biceps, Ronds majeurs',
    settings: 'Ajuste les boudins de cuisses pour être bien calé. Saisis la barre avec une prise large.',
    execution: 'Tire la barre vers le haut de ta poitrine en sortant la poitrine et en tirant les coudes vers le bas et l’arrière. Reviens en contrôlant la charge.',
    tips: 'Évite de te pencher trop en arrière ; garde le buste légèrement incliné.',
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800'
  },
  {
    id: 'ex-4',
    name: 'Rowing poulie basse / Seated Row',
    category: 'Dos',
    equipment: 'Poulie basse',
    targetMuscles: 'Trapèzes, Rhomboïdes, Grand dorsal, Biceps',
    settings: 'Place tes pieds sur les cale-pieds, genoux légèrement fléchis. Saisis la poignée.',
    execution: 'Tire la poignée vers ton nombril en gardant le dos droit. Resserre tes omoplates en fin de mouvement.',
    tips: 'Ne arrondis surtout pas le bas du dos lors de la phase de relâchement.',
    image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800'
  },
  {
    id: 'ex-5',
    name: 'Squat à la machine (Guided / Smith)',
    category: 'Jambes',
    equipment: 'Machine Smith / Guidée ou Squat libre',
    targetMuscles: 'Quadriceps, Fessiers, Ischio-jambiers',
    settings: 'Place la barre sur tes trapèzes (haut du dos). Élargissement des pieds largeur d’épaules.',
    execution: 'Fléchis les genoux et descends les fesses vers l’arrière comme pour t’asseoir sur une chaise, le dos bien droit, puis remonte en poussant sur les talons.',
    tips: 'Garde les genoux bien alignés dans l’axe des pointes de pieds.',
    image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800'
  },
  {
    id: 'ex-6',
    name: 'Leg Press (Presse à cuisses)',
    category: 'Jambes',
    equipment: 'Machine Leg Press inclinée',
    targetMuscles: 'Quadriceps, Fessiers',
    settings: 'Assieds-toi, place tes pieds au milieu de la plateforme largeur d’épaules. Déverrouille les sécurités.',
    execution: 'Fléchis les jambes pour ramener le chariot vers toi (angle à 90° aux genoux) puis pousse puissamment sans tendre complètement les coudes.',
    tips: 'Ne décolle jamais le bas du dos ou les talons du dossier pendant le mouvement.',
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'
  }
];

interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

interface WeeklyPlan {
  day: string;
  focus: string;
  exercisesText: string;
}

interface TransformationPhoto {
  id: string;
  user_id?: string;
  before_url: string;
  after_url: string;
  date: string;
  weight: number;
  note: string;
  is_private?: boolean;
}

const WORKOUT_CHOICES = [
  'Push (Pectoraux, Épaules, Triceps)',
  'Pull (Dos, Biceps)',
  'Legs (Jambes, Fessiers)',
  'Full Body (Corps entier)',
  'Cardio & HIIT',
  'Repos / Récupération'
];

const POPULAR_HASHTAGS = [
  '#legday',
  '#pushday',
  '#pullday',
  '#pr',
  '#gym',
  '#cardio',
  '#hiit',
  '#nopainnogain',
  '#musculation',
  '#fitness'
];

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
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) ? 25 : age;
};

const isMatchingClub = (postClubName?: string, selectedClubName?: string): boolean => {
  if (!postClubName || !selectedClubName) return false;
  if (postClubName === selectedClubName) return true;
  const normalize = (str: string) => str.toLowerCase().replace(/[()]/g, '').trim();
  const p = normalize(postClubName);
  const s = normalize(selectedClubName);
  return p === s || p.includes(s) || s.includes(p);
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
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
      };
    };
  });
};

interface ExerciseEntry {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface Comment {
  id: string;
  username: string;
  avatar_url: string;
  text: string;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  partner_name?: string;
  image_url?: string;
  club_name: string;
  session_type: string;
  caption: string;
  exercises: ExerciseEntry[];
  likes_count: number;
  liked_by?: string[];
  comments_count: number;
  comments?: Comment[];
  created_at: string;
  is_private?: boolean;
}

interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  image_url: string;
  caption?: string;
  club_name?: string;
  likes_count?: number;
  created_at: string;
}

interface RealUser {
  id: string;
  username: string;
  email: string;
  gender?: 'M' | 'F';
  birth_date?: string;
  age: number;
  goal?: string;
  home_club: string;
  preferred_time?: string;
  avatar_url: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
}

interface DBMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

export default function App() {
  // 1. DÉCLARATION DES ÉTATS (useState)
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [level, setLevel] = useState<'Débutant' | 'Intermédiaire' | 'Avancé'>('Intermédiaire');
  const [homeClub, setHomeClub] = useState<string>('Club Tournai (Bastion)');
  const [preferredTime, setPreferredTime] = useState<string>(TIME_SLOTS[2]);
  const [acceptCGU, setAcceptCGU] = useState(false);

  const [authLoading, setAuthLoading] = useState(false);
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);
  const [isCGUModalOpen, setIsCGUModalOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'exercises' | 'chat' | 'leaderboard' | 'profile'>('feed');
  const [selectedClub, setSelectedClub] = useState<string>('Club Tournai (Bastion)');

  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchGoal, setMatchGoal] = useState('Tous');
  const [matchTime, setMatchTime] = useState('Tous');

  const [userAvatarUrl, setUserAvatarUrl] = useState<string>(() => {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  });
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);

  const [userStreak, setUserStreak] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('fitpulse_streak') || '2', 10); } catch { return 2; }
  });
  
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(() => {
    try { return localStorage.getItem('fitpulse_private') === 'true'; } catch { return false; }
  });

  const [lastChatOpenTime, setLastChatOpenTime] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('fitpulse_last_chat') || '0', 10); } catch { return 0; }
  });

  const [transformations, setTransformations] = useState<TransformationPhoto[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  const [newTransNote, setNewTransNote] = useState('');
  const [newTransWeight, setNewTransWeight] = useState<number | ''>('');
  const [newTransBefore, setNewTransBefore] = useState<string | null>(null);
  const [newTransAfter, setNewTransAfter] = useState<string | null>(null);
  const [newTransIsPrivate, setNewTransIsPrivate] = useState<boolean>(true);

  const [likedStories, setLikedStories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fitpulse_liked_stories');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fitpulse_viewed_stories');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeAnatomyExercise, setActiveAnatomyExercise] = useState<string | null>(null);

  const [restTimerSeconds, setRestTimerSeconds] = useState(90);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(90);

  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([
    { exercise: 'Développé couché', weight: 100, reps: 5, date: '2026-08-10' },
    { exercise: 'Squat', weight: 140, reps: 5, date: '2026-08-12' },
    { exercise: 'Leg Press', weight: 220, reps: 10, date: '2026-08-18' }
  ]);
  const [newPrExercise, setNewPrExercise] = useState('');
  const [newPrWeight, setNewPrWeight] = useState<number | ''>('');
  const [newPrReps, setNewPrReps] = useState<number | ''>('');

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>(DEFAULT_WEEKLY_PLAN);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editFocus, setEditFocus] = useState(WORKOUT_CHOICES[0]);
  const [editExercisesText, setEditExercisesText] = useState('');

  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tous');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseGuide | null>(null);

  const [registeredUsers, setRegisteredUsers] = useState<RealUser[]>([]);
  const [buddyTabSubMode, setBuddyTabSubMode] = useState<'discover' | 'my_friends' | 'requests'>('discover');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterWomenOnly, setFilterWomenOnly] = useState(false);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('all');
  const [selectedAgeGroupFilter, setSelectedAgeGroupFilter] = useState<string>('all');

  const [cloudStories, setCloudStories] = useState<Story[]>([]);
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
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'post' | 'story' | 'trans_before' | 'trans_after' | 'profile_avatar'>('post');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [postCommentInput, setPostCommentInput] = useState('');

  // États pour le recadrage (zoom/drag)
  const [postImageZoom, setPostImageZoom] = useState(1);
  const [postImageOffset, setPostImageOffset] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // États Pincement Tactile
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);
  
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);


  // 2. VARIABLES DÉRIVÉES ET FILTRES
  const acceptedFriendIds = friendRequests
    .filter(req => req.status === 'accepted')
    .map(req => (req.sender_id === user?.id ? req.receiver_id : req.sender_id));

  const botUser: RealUser = {
    id: 'system-bot',
    username: '⚠️ Modération Bot',
    email: 'bot@fitpulse',
    home_club: 'Système',
    age: 99,
    avatar_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150'
  };

  const hasBotMessages = allMessages.some(m => m.sender_id === 'system-bot' && m.receiver_id === user?.id);

  const activeChatUsers = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    const hasExchanged = allMessages.some(m => (m.sender_id === user?.id && m.receiver_id === u.id) || (m.sender_id === u.id && m.receiver_id === user?.id));
    return acceptedFriendIds.includes(u.id) || hasExchanged;
  });

  if (hasBotMessages) {
    activeChatUsers.unshift(botUser);
  }

  const myFriendsList = registeredUsers.filter((u) => acceptedFriendIds.includes(u.id));
  const incomingRequests = friendRequests.filter(req => req.receiver_id === user?.id && req.status === 'pending');

  const filteredBuddies = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    if (buddyTabSubMode === 'my_friends' && !acceptedFriendIds.includes(u.id)) return false;
    if (filterWomenOnly && u.gender === 'M') return false;
    
    if (selectedGoalFilter !== 'all' && u.goal && !u.goal.toLowerCase().includes(selectedGoalFilter.toLowerCase())) {
      return false;
    }

    if (selectedAgeGroupFilter !== 'all') {
      const age = u.age;
      if (selectedAgeGroupFilter === '18-25' && (age < 18 || age > 25)) return false;
      if (selectedAgeGroupFilter === '26-35' && (age < 26 || age > 35)) return false;
      if (selectedAgeGroupFilter === '36-45' && (age < 36 || age > 45)) return false;
      if (selectedAgeGroupFilter === '46+' && age < 46) return false;
    }

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.home_club.toLowerCase().includes(q);
    }

    return true;
  });

  const matchedBuddiesList = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    if (filterWomenOnly && u.gender === 'M') return false;
    const matchG = matchGoal === 'Tous' || (u.goal && u.goal.toLowerCase().includes(matchGoal.toLowerCase()));
    const matchT = matchTime === 'Tous' || (u.preferred_time && u.preferred_time.includes(matchTime));
    return matchG && matchT;
  });

  const displayedPosts = posts.filter((post) => {
    if (post.is_private) {
      if (post.user_id !== user?.id && !acceptedFriendIds.includes(post.user_id)) {
        return false;
      }
    }
    return isMatchingClub(post.club_name, selectedClub);
  });

  const currentChatMessages = allMessages.filter(
    (m) => selectedBuddyChat && user && ((m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id) || (m.sender_id === selectedBuddyChat.id && m.receiver_id === user.id))
  );

  const friendStoriesList = cloudStories.filter((s) => {
    const storyDate = new Date(s.created_at).getTime();
    const isUnder24h = !isNaN(storyDate) ? storyDate >= Date.now() - 24 * 3600 * 1000 : true;
    return isUnder24h;
  });

  const activeViewingStory = activeStoryIndex !== null ? friendStoriesList[activeStoryIndex] : null;

  const activePostForComments = posts.find((p) => p.id === activeCommentPostId);

  const unreadChatCount = allMessages.filter(
    (m) => m.receiver_id === user?.id && new Date(m.created_at).getTime() > lastChatOpenTime
  ).length;


  // 3. FONCTIONS HANDLERS / MÉTHODES

  // Fonctions Fetch
  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setFeedLoading(false);
  };

  const fetchCloudStories = async () => {
    try {
      const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setCloudStories(data as Story[]);
      }
    } catch (err) {}
  };

  const fetchDirectMessages = async () => {
    const { data, error } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (!error && data) setAllMessages(data as DBMessage[]);
  };

  const fetchRealUsers = async () => {
    const { data, error } = await supabase.from('posts').select('user_id, username, club_name, avatar_url').limit(100);
    if (!error && data) {
      const uniqueMap = new Map();
      
      if (user) {
        const myBirth = user.user_metadata?.birth_date;
        uniqueMap.set(user.id, {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Moi',
          email: user.email || '',
          gender: user.user_metadata?.gender || 'M',
          birth_date: myBirth,
          age: calculateAge(myBirth),
          goal: 'Prise de masse & Force',
          home_club: user.user_metadata?.home_club || selectedClub,
          preferred_time: user.user_metadata?.preferred_time || '🌆 Soir (17h - 20h)',
          avatar_url: userAvatarUrl
        });
      }

      data.forEach((p) => {
        if (!uniqueMap.has(p.user_id)) {
          uniqueMap.set(p.user_id, {
            id: p.user_id,
            username: p.username,
            email: `${p.username}@fitpulse.be`,
            gender: 'M',
            birth_date: undefined,
            age: 28,
            goal: 'Prise de masse & Force',
            home_club: p.club_name || selectedClub,
            preferred_time: '🌆 Soir (17h - 20h)',
            avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          });
        }
      });
      setRegisteredUsers(Array.from(uniqueMap.values()));
    }
  };

  const fetchTransformations = async (userId: string) => {
    const { data, error } = await supabase.from('transformations').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (!error && data) {
      setTransformations(data as TransformationPhoto[]);
    }
  };

  const fetchFriendRequests = async (userId: string) => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (!error && data) {
      setFriendRequests(data as FriendRequest[]);
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < friendStoriesList.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setStoryProgress(0);
      setStoryCommentInput('');
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setStoryProgress(0);
      setStoryCommentInput('');
    } else {
      setStoryProgress(0);
    }
  };

  // --- Gestion du Recadrage (Drag & Drop + Pinch-to-Zoom) ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDraggingImage(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStartPos({ x: clientX - postImageOffset.x, y: clientY - postImageOffset.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingImage) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPostImageOffset({ x: clientX - dragStartPos.x, y: clientY - dragStartPos.y });
  };

  const handleDragEnd = () => {
    setIsDraggingImage(false);
  };

  const getPinchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setInitialPinchDistance(getPinchDistance(e.touches));
      setInitialPinchZoom(postImageZoom);
      setIsDraggingImage(false);
    } else if (e.touches.length === 1) {
      handleDragStart(e);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      const currentDistance = getPinchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.min(Math.max(1, initialPinchZoom * scale), 4);
      setPostImageZoom(newZoom);
    } else if (e.touches.length === 1 && isDraggingImage) {
      handleDragMove(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingImage(false);
    setInitialPinchDistance(null);
  };

  const getCroppedImageBlob = async (): Promise<Blob | null> => {
    if (!imgRef.current || !previewContainerRef.current) return null;
    const img = imgRef.current;
    const container = previewContainerRef.current;

    const canvas = document.createElement('canvas');
    const outputWidth = 800;
    const outputHeight = (container.clientHeight / container.clientWidth) * outputWidth;
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const coverRatio = Math.max(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight);
    const baseWidth = img.naturalWidth * coverRatio;
    const baseHeight = img.naturalHeight * coverRatio;
    const baseX = (container.clientWidth - baseWidth) / 2;
    const baseY = (container.clientHeight - baseHeight) / 2;

    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    const finalX = centerX + (baseX - centerX) * postImageZoom + postImageOffset.x;
    const finalY = centerY + (baseY - centerY) * postImageZoom + postImageOffset.y;
    const finalWidth = baseWidth * postImageZoom;
    const finalHeight = baseHeight * postImageZoom;

    const scaleMultiplier = outputWidth / container.clientWidth;

    ctx.drawImage(
      img,
      finalX * scaleMultiplier,
      finalY * scaleMultiplier,
      finalWidth * scaleMultiplier,
      finalHeight * scaleMultiplier
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });
  };
  // ------------------------------------------------

  const handleAddExerciseRow = () => {
    setWorkoutExercises([...workoutExercises, { name: '', sets: 3, reps: 10, weight: 50 }]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const renderCaptionWithHashtags = (text: string) => {
    if (!text) return null;
    return text.split(' ').map((word, i) => {
      if (word.startsWith('#')) {
        return <span key={i} className="text-orange-500 font-bold">{word} </span>;
      }
      return word + ' ';
    });
  };

  const startRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setRestTimeRemaining(seconds);
    setIsRestTimerActive(true);
  };

  const handleAddPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrExercise.trim() || newPrWeight === '' || newPrReps === '') return;
    const newRecord: PersonalRecord = {
      exercise: newPrExercise.trim(),
      weight: Number(newPrWeight),
      reps: Number(newPrReps),
      date: new Date().toISOString().split('T')[0]
    };
    setPersonalRecords([newRecord, ...personalRecords]);
    setNewPrExercise('');
    setNewPrWeight('');
    setNewPrReps('');
    alert('🏆 Nouveau record enregistré avec succès !');
  };

  const handleSaveWeeklyPlanEdit = (index: number) => {
    const updated = [...weeklyPlan];
    updated[index] = {
      ...updated[index],
      focus: editFocus,
      exercisesText: editExercisesText
    };
    setWeeklyPlan(updated);
    setEditingDayIndex(null);
  };

  const handleAddWorkoutHashtag = (tag: string) => {
    if (workoutCaption.includes(tag)) return;
    setWorkoutCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleAddStoryHashtag = (tag: string) => {
    if (storyCaption.includes(tag)) return;
    setStoryCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, targetType?: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (targetType === 'trans_before') {
        setNewTransBefore(previewUrl);
      } else if (targetType === 'trans_after') {
        setNewTransAfter(previewUrl);
      } else if (targetType === 'profile_avatar') {
        handleUpdateProfileAvatar(file);
      } else if (cameraTarget === 'post') {
        setPostImageFile(file);
        setPostImagePreview(previewUrl);
        setPostImageZoom(1);
        setPostImageOffset({ x: 0, y: 0 });
      } else if (cameraTarget === 'profile_avatar') {
        handleUpdateProfileAvatar(file);
      } else {
        setStoryImageFile(file);
        setStoryImagePreview(previewUrl);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessageInput.trim() || !selectedBuddyChat || !user) return;
    const text = currentMessageInput.trim();
    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    
    const newMessage = {
      sender_id: user.id,
      receiver_id: selectedBuddyChat.id,
      sender_name: myName,
      text: text
    };

    const { data, error } = await supabase.from('direct_messages').insert([newMessage]).select();
    if (!error && data) {
      setAllMessages((prev) => [...prev, data[0] as DBMessage]);
      setCurrentMessageInput('');
    }
  };

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
    }

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount, liked_by: updatedLikedBy } : p));

    await supabase
      .from('posts')
      .update({ likes_count: newCount, liked_by: updatedLikedBy })
      .eq('id', postId);
  };

  const handleToggleStoryLike = async (storyId: string) => {
    const isLiked = likedStories[storyId];
    setLikedStories((prev) => ({ ...prev, [storyId]: !isLiked }));
    const story = friendStoriesList.find((s) => s.id === storyId);
    if (!story || !user) return;
    if (!isLiked) {
      const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
      await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: story.user_id, sender_name: myName, text: `❤️ A aimé ta story !` }]);
    }
  };

  const handleSendStoryComment = async (e?: React.FormEvent, quickEmoji?: string) => {
    if (e) e.preventDefault();
    const textToSend = quickEmoji || storyCommentInput.trim();
    if (!textToSend || activeStoryIndex === null || !user) return;
    const story = friendStoriesList[activeStoryIndex];
    if (!story) return;
    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: story.user_id, sender_name: myName, text: `📸 En réponse à ta story : "${textToSend}"` }]);
    setStoryCommentInput('');
    setIsStoryPaused(false);
    alert('Réponse envoyée en message direct !');
  };

  const startCamera = async (target: 'post' | 'story' | 'trans_before' | 'trans_after' | 'profile_avatar') => {
    setCameraTarget(target);
    setIsCameraActive(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: target === 'profile_avatar' ? 'user' : 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      alert("Impossible d'accéder à la caméra : " + err.message);
      setIsCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const switchCameraFacing = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {}
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const previewUrl = URL.createObjectURL(blob);
      if (cameraTarget === 'trans_before') {
        setNewTransBefore(previewUrl);
      } else if (cameraTarget === 'trans_after') {
        setNewTransAfter(previewUrl);
      } else if (cameraTarget === 'profile_avatar') {
        const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleUpdateProfileAvatar(file);
      } else if (cameraTarget === 'post') {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPostImageFile(file);
        setPostImagePreview(previewUrl);
        setPostImageZoom(1);
        setPostImageOffset({ x: 0, y: 0 });
      } else {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setStoryImageFile(file);
        setStoryImagePreview(previewUrl);
        setIsCreatingStory(true);
      }
      stopCameraStream();
    }, 'image/jpeg', 0.85);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !acceptCGU) {
      alert("Veuillez accepter les conditions générales d'utilisation pour continuer.");
      return;
    }
    setAuthLoading(true);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, username: username || `${firstName}_${lastName}`.toLowerCase(), birth_date: birthDate, gender, level, home_club: homeClub, preferred_time: preferredTime, avatar_url: userAvatarUrl } }
      });
      if (error) {
        alert("Erreur d'inscription : " + error.message);
      } else {
        setSignupSuccessEmail(email);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Erreur de connexion : " + error.message);
    }
    setAuthLoading(false);
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !storyImageFile) return;
    setStoryUploading(true);
    let uploadedStoryUrl = storyImagePreview || '';
    try {
      const compressedBlob = await compressImage(storyImageFile, 800, 0.7);
      const fileName = `story-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data: uploadData } = await supabase.storage.from('posts').upload(fileName, compressedBlob, { contentType: 'image/jpeg' });
      if (uploadData) {
        const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
        uploadedStoryUrl = publicUrlData.publicUrl;
      }
    } catch (err) {}

    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    const newStory: Story = {
      id: 'story-' + Date.now(),
      user_id: user.id,
      username: myName,
      avatar_url: userAvatarUrl,
      image_url: uploadedStoryUrl,
      caption: storyCaption,
      club_name: selectedClub,
      likes_count: 0,
      created_at: new Date().toISOString()
    };
    const { error: storyError } = await supabase.from('stories').insert([{ user_id: user.id, username: myName, avatar_url: userAvatarUrl, image_url: uploadedStoryUrl, caption: storyCaption, club_name: selectedClub }]);
    if (storyError) {
      alert("Erreur publication story : " + storyError.message);
    } else {
      setCloudStories([newStory, ...cloudStories]);
      setStoryImageFile(null);
      setStoryImagePreview(null);
      setStoryCaption('');
      setIsCreatingStory(false);
    }
    setStoryUploading(false);
  };

  const handlePublishWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Erreur : Utilisateur non connecté.");
      return;
    }
    setIsUploading(true);
    let uploadedImageUrl = undefined;
    
    if (postImageFile && postImagePreview) {
      try {
        const finalBlob = await getCroppedImageBlob() || await compressImage(postImageFile, 800, 0.7);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('posts').upload(fileName, finalBlob, { contentType: 'image/jpeg' });
        if (uploadError) {
          alert("Erreur image : " + uploadError.message);
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      } catch (err: any) {
        console.error(err);
      }
    }
    
    const validExercises = workoutExercises.filter((ex) => ex.name.trim() !== '');
    const newPostData = {
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'Athlète',
      avatar_url: userAvatarUrl,
      image_url: uploadedImageUrl || null,
      club_name: selectedClub,
      session_type: workoutType,
      caption: workoutCaption,
      exercises: validExercises,
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      comments: [],
      is_private: isPrivateMode
    };
    const { data, error } = await supabase.from('posts').insert([newPostData]).select('*');
    if (error) {
      alert("Erreur publication Supabase : " + error.message);
    } else if (data && data.length > 0) {
      setPosts([data[0] as Post, ...posts]);
      setUserStreak(prev => prev + 1);
      setWorkoutCaption('');
      setPostImageFile(null);
      setPostImagePreview(null);
      setPostImageZoom(1);
      setPostImageOffset({ x: 0, y: 0 });
      setWorkoutExercises([]);
      setCurrentTab('feed');
      fetchCloudPosts();
    }
    setIsUploading(false);
  };

  const handleAddPostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCommentInput.trim() || !activeCommentPostId || !user) return;
    
    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    const newComment: Comment = {
      id: 'c-' + Date.now(),
      username: myName,
      avatar_url: userAvatarUrl,
      text: postCommentInput.trim(),
      created_at: new Date().toISOString()
    };

    const targetPost = posts.find(p => p.id === activeCommentPostId);
    if (!targetPost) return;

    const updatedComments = [...(targetPost.comments || []), newComment];
    const newCount = updatedComments.length;

    const { error } = await supabase
      .from('posts')
      .update({ comments: updatedComments, comments_count: newCount })
      .eq('id', activeCommentPostId);

    if (!error) {
      setPosts(prev => prev.map(p => {
        if (p.id === activeCommentPostId) {
          return { ...p, comments: updatedComments, comments_count: newCount };
        }
        return p;
      }));
      setPostCommentInput('');
    } else {
      alert("Erreur lors de l'enregistrement du commentaire : " + error.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Supprimer cette publication ?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert("Publication supprimée avec succès.");
    } else {
      alert("Erreur lors de la suppression : " + error.message);
    }
  };

  const handleReportPost = async (post: Post) => {
    if (!window.confirm("Signaler cette publication pour contenu inapproprié ou non conforme aux CGU ?")) return;
    
    if (user) {
      let adminId = registeredUsers.find(u => u.username.toLowerCase() === 'antbou')?.id;
      
      if (!adminId) {
        const { data } = await supabase.from('posts').select('user_id').ilike('username', 'antbou').limit(1);
        if (data && data.length > 0) {
          adminId = data[0].user_id;
        }
      }
      
      if (adminId) {
        const myName = user.user_metadata?.username || user.email?.split('@')[0] || 'Un utilisateur';
        const alertText = `🚨 SIGNALEMENT : ${myName} a signalé le post de ${post.username}. Message du post : "${post.caption || 'Photo uniquement'}".`;
        
        await supabase.from('direct_messages').insert([{
          sender_id: 'system-bot',
          receiver_id: adminId,
          sender_name: '⚠️ FitPulse Bot',
          text: alertText
        }]);
      }
    }

    alert("🚨 Publication signalée aux modérateurs. Merci pour votre aide pour garder la communauté propre.");
  };

  const handleDeleteConversationForBuddy = async (buddyId: string, buddyName: string) => {
    if (!user) return;
    if (!window.confirm(`Effacer toute la conversation avec ${buddyName} ?`)) return;

    await supabase
      .from('direct_messages')
      .delete()
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${buddyId}),and(sender_id.eq.${buddyId},receiver_id.eq.${user.id})`
      );

    setAllMessages((prev) =>
      prev.filter(
        (m) =>
          !(
            (m.sender_id === user.id && m.receiver_id === buddyId) ||
            (m.sender_id === buddyId && m.receiver_id === user.id)
          )
      )
    );
  };

  const handleAddTransformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTransBefore || !newTransAfter || newTransWeight === '') return;

    let beforeUrl = newTransBefore;
    let afterUrl = newTransAfter;

    try {
      if (newTransBefore.startsWith('blob:')) {
        const resB = await fetch(newTransBefore);
        const blobB = await resB.blob();
        const fileB = new File([blobB], `trans-before-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const compressedB = await compressImage(fileB, 800, 0.7);
        const nameB = `trans-before-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadB } = await supabase.storage.from('posts').upload(nameB, compressedB, { contentType: 'image/jpeg' });
        if (uploadB) {
          const { data: urlB } = supabase.storage.from('posts').getPublicUrl(nameB);
          beforeUrl = urlB.publicUrl;
        }
      }

      if (newTransAfter.startsWith('blob:')) {
        const resA = await fetch(newTransAfter);
        const blobA = await resA.blob();
        const fileA = new File([blobA], `trans-after-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const compressedA = await compressImage(fileA, 800, 0.7);
        const nameA = `trans-after-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadA } = await supabase.storage.from('posts').upload(nameA, compressedA, { contentType: 'image/jpeg' });
        if (uploadA) {
          const { data: urlA } = supabase.storage.from('posts').getPublicUrl(nameA);
          afterUrl = urlA.publicUrl;
        }
      }
    } catch (err) {}

    const newItem = {
      user_id: user.id,
      before_url: beforeUrl,
      after_url: afterUrl,
      date: new Date().toISOString().split('T')[0],
      weight: Number(newTransWeight),
      note: newTransNote || 'Évolution physique',
      is_private: newTransIsPrivate
    };

    const { data, error } = await supabase.from('transformations').insert([newItem]).select('*');
    if (error) {
      alert("Erreur enregistrement carnet : " + error.message);
    } else if (data && data.length > 0) {
      setTransformations([data[0] as TransformationPhoto, ...transformations]);
      setNewTransBefore(null);
      setNewTransAfter(null);
      setNewTransNote('');
      setNewTransWeight('');
      alert('📸 Transformation enregistrée dans ton carnet !');
    }
  };

  const handleShareTransformationToFeed = async (item: TransformationPhoto) => {
    if (!user) return;
    const myName = user.user_metadata?.username || user.email?.split('@')[0] || 'Athlète';
    const newPostData = {
      user_id: user.id,
      username: myName,
      avatar_url: userAvatarUrl,
      image_url: item.after_url,
      club_name: selectedClub,
      session_type: 'Transformation #transformation',
      caption: `Bilan évolution (${item.weight} kg) : ${item.note} #pr #gym`,
      exercises: [],
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      comments: [],
      is_private: isPrivateMode
    };
    const { data, error } = await supabase.from('posts').insert([newPostData]).select('*');
    if (error) {
      alert("Erreur de partage bilan : " + error.message);
    } else if (data && data.length > 0) {
      setPosts([data[0] as Post, ...posts]);
      alert('✨ Bilan partagé avec succès sur le fil d’actualité !');
      fetchCloudPosts();
    }
  };

  const handleUpdateProfileAvatar = async (fileOrUrl: File | string) => {
    if (!user) return;
    let finalAvatarUrl = typeof fileOrUrl === 'string' ? fileOrUrl : '';

    if (typeof fileOrUrl !== 'string') {
      try {
        const compressed = await compressImage(fileOrUrl, 400, 0.7);
        const fileName = `avatar-${user.id}-${Date.now()}.jpg`;
        const { data: uploadData } = await supabase.storage.from('posts').upload(fileName, compressed, { contentType: 'image/jpeg', upsert: true });
        if (uploadData) {
          const { data: publicUrl } = supabase.storage.from('posts').getPublicUrl(fileName);
          finalAvatarUrl = publicUrl.publicUrl;
        }
      } catch (err) {}
    }

    if (finalAvatarUrl) {
      setUserAvatarUrl(finalAvatarUrl);
      await supabase.auth.updateUser({
        data: { ...user.user_metadata, avatar_url: finalAvatarUrl }
      });
      alert('🌟 Photo de profil mise à jour et enregistrée avec succès !');
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    const { error } = await supabase.from('friend_requests').insert([
      { sender_id: user.id, receiver_id: targetUserId, status: 'pending' }
    ]);
    if (error) {
      alert("Erreur lors de l'envoi de la demande : " + error.message);
    } else {
      alert("Demande d'ami envoyée avec succès !");
      fetchFriendRequests(user.id);
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    if (!error && user) {
      alert("Demande acceptée ! Vous êtes désormais amis 🎉");
      fetchFriendRequests(user.id);
    } else if (error) {
      alert("Erreur : " + error.message);
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    const { error } = await supabase.from('friend_requests').delete().eq('id', requestId);
    if (!error && user) {
      fetchFriendRequests(user.id);
    }
  };

  // 4. EFFETS SECONDAIRES DE FIN (Session & Sockets)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) setSelectedClub(activeUser.user_metadata.home_club);
      if (activeUser?.user_metadata?.avatar_url) setUserAvatarUrl(activeUser.user_metadata.avatar_url);
      if (activeUser) {
        fetchTransformations(activeUser.id);
        fetchFriendRequests(activeUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) setSelectedClub(activeUser.user_metadata.home_club);
      if (activeUser?.user_metadata?.avatar_url) setUserAvatarUrl(activeUser.user_metadata.avatar_url);
      if (activeUser) {
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


  // 5. RENDU LOGIN ET APPLICATION
  if (!user) {
    if (signupSuccessEmail) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
              <Mail className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-black">Vérifie ta boîte mail !</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Un e-mail de confirmation a été envoyé à <strong className="text-orange-400">{signupSuccessEmail}</strong>. 
            </p>
            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 text-[11px] text-neutral-400">
              Clique sur le lien de validation dans l'e-mail. Dès que ce sera fait, tu seras connecté automatiquement ici !
            </div>
            <button 
              onClick={() => { setSignupSuccessEmail(null); setIsSignUp(false); }}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500">
              <Zap className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center tracking-tight mb-1">FitPulse</h1>
          <p className="text-xs text-neutral-400 text-center mb-6">{isSignUp ? 'Création de ton profil athlète' : 'Connecte-toi à ton espace'}</p>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Prénom</label>
                    <input type="text" required placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Nom</label>
                    <input type="text" required placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Pseudo public</label>
                    <input type="text" required placeholder="Alex_Fit" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Date de naissance</label>
                    <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Créneau horaire préféré</label>
                  <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Email</label>
              <input type="email" required placeholder="alex@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Mot de passe</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
            </div>

            {isSignUp && (
              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="cgu" checked={acceptCGU} onChange={(e) => setAcceptCGU(e.target.checked)} className="mt-0.5 accent-orange-500" />
                <label htmlFor="cgu" className="text-[11px] text-neutral-400 leading-tight">
                  J'accepte les <button type="button" onClick={() => setIsCGUModalOpen(true)} className="text-orange-400 underline font-semibold">Conditions Générales d'Utilisation (CGU)</button> et la charte de modération.
                </label>
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

        {/* MODAL CGU */}
        {isCGUModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" /> Conditions Générales d'Utilisation (CGU)
                </h3>
                <button onClick={() => setIsCGUModalOpen(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 text-[11px] text-neutral-300 leading-relaxed">
                <p><strong>1. Objet :</strong> L'application FitPulse est une plateforme communautaire de mise en relation et de suivi sportif entre membres de clubs de fitness.</p>
                <p><strong>2. Tolérance zéro - Contenu explicite :</strong> Il est strictement interdit de publier des photos à caractère pornographique, obscène, contenant des nudités ou révélant des parties intimes sur le flux public. Tout manquement entraînera la suppression immédiate du compte et le bannissement définitif.</p>
                <p><strong>3. Limitation de responsabilité :</strong> L'utilisation des programmes et des suggestions de partenaires se fait sous l'entière responsabilité de l'utilisateur. FitPulse décline toute responsabilité en cas de blessure ou d'accident lors des séances.</p>
                <p><strong>4. Données personnelles :</strong> Les données de profil et le carnet personnel "Avant / Après" sont strictement privés ou partagés selon les choix de l'utilisateur.</p>
              </div>

              <button onClick={() => { setAcceptCGU(true); setIsCGUModalOpen(false); }} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition">
                J'ai compris et j'accepte
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. RENDU APPLICATION CONNECTÉE
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none">FitPulse</h1>
            <span className="text-[10px] text-orange-400 font-semibold truncate block max-w-[150px]">{selectedClub}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-orange-500/10 px-2.5 py-1.5 rounded-full border border-orange-500/20">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-black text-orange-500">{userStreak}</span>
          </div>
          <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-[11px] rounded-lg px-2 py-1.5 text-neutral-300 focus:outline-none focus:border-orange-500 max-w-[130px] truncate">
            {CLUBS_DATABASE.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
          </select>
        </div>
      </header>

      {/* CHRONOMÈTRE DE REPOS FLOTTANT */}
      {isRestTimerActive && (
        <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between sticky top-[53px] z-30 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Timer className="w-4 h-4 animate-spin" />
            Repos en cours : {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <button onClick={() => setIsRestTimerActive(false)} className="text-[11px] bg-black/30 hover:bg-black/50 px-2.5 py-1 rounded-lg">
            Arrêter
          </button>
        </div>
      )}

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 pb-24">
        {currentTab === 'feed' && (
          <div className="space-y-4">
            {/* STORIES ROW */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-3">
              <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
                <div onClick={() => { setCameraTarget('story'); setIsCreatingStory(true); }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
                  <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center p-0.5 group-hover:border-orange-500 transition">
                    <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">+</div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white border-2 border-neutral-950 shadow-md">
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-300">Ta story</span>
                </div>

                {friendStoriesList.map((story, index) => {
                  const isViewed = viewedStoryIds.includes(story.id);
                  return (
                    <div key={story.id || index} onClick={() => { setActiveStoryIndex(index); setStoryProgress(0); setIsStoryPaused(false); }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                      {isViewed ? (
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-600 p-[2px] opacity-70 hover:opacity-100 transition">
                          <div className="w-full h-full bg-neutral-950 rounded-full p-[1px]">
                            <img src={story.avatar_url} alt="" className="w-full h-full rounded-full object-cover grayscale-[30%]" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 via-pink-500 to-amber-400 p-[2.5px] shadow-sm hover:scale-105 transition transform">
                          <div className="w-full h-full bg-neutral-950 rounded-full p-[2px]">
                            <img src={story.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          </div>
                        </div>
                      )}
                      <span className={`text-[10px] font-medium truncate max-w-[64px] text-center ${isViewed ? 'text-neutral-500' : 'text-neutral-200'}`}>
                        {story.username.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Posts Feed */}
            {feedLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900/50 rounded-3xl border border-neutral-800/60 p-6">Aucune publication pour l'instant dans ce club.</div>
            ) : (
              displayedPosts.map((post) => {
                const isAlreadyLikedByMe = user ? (post.liked_by || []).includes(user.id) : false;
                return (
                  <article key={post.id} className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3.5 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm leading-snug">{post.username}</h3>
                            {post.is_private && (
                              <span title="Publication privée (Visible par les amis uniquement)">
                                <Lock className="w-3 h-3 text-neutral-500" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-orange-400 font-medium">
                            <MapPin className="w-3 h-3" />{post.club_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => handleReportPost(post)} title="Signaler ce post" className="p-2 text-neutral-500 hover:text-orange-400 rounded-lg transition">
                          <Flag className="w-4 h-4" />
                        </button>
                        {post.user_id === user?.id && (
                          <button onClick={() => handleDeletePost(post.id)} title="Supprimer" className="p-2 text-neutral-500 hover:text-red-400 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-inner aspect-[4/5] flex items-center justify-center">
                      {post.image_url ? (
                        <>
                          <img src={post.image_url} alt="" className="w-full h-full object-cover pointer-events-none" />
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                            <span className="text-xs font-black text-white">{post.session_type}</span>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 flex flex-col justify-center items-center text-center space-y-2">
                          <Dumbbell className="w-10 h-10 text-orange-500 mb-1" />
                          <span className="text-sm font-black text-white">{post.session_type}</span>
                          <span className="text-[11px] text-neutral-400">Séance validée à {post.club_name}</span>
                        </div>
                      )}
                    </div>

                    {post.caption && <p className="text-xs text-neutral-200 leading-relaxed font-medium">{renderCaptionWithHashtags(post.caption)}</p>}

                    {/* EXERCICES & REPOS */}
                    {post.exercises && post.exercises.length > 0 && (
                      <div className="bg-neutral-950/80 rounded-2xl p-3.5 border border-neutral-800/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Dumbbell className="w-3.5 h-3.5 text-orange-500" /> Exercices réalisés
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => startRestTimer(60)} className="px-2 py-0.5 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded text-[10px] transition">⏱ 60s</button>
                            <button onClick={() => startRestTimer(90)} className="px-2 py-0.5 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded text-[10px] transition">⏱ 90s</button>
                          </div>
                        </div>
                        {post.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900 last:border-none">
                            <span className="font-semibold text-neutral-200">{ex.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-orange-400 font-bold">{ex.sets} séries × {ex.reps} reps ({ex.weight} kg)</span>
                              <button onClick={() => setActiveAnatomyExercise(ex.name)} className="p-1 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg flex items-center gap-1 text-[10px] transition">
                                <Activity className="w-3 h-3" /> Muscles 2D
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-neutral-400 text-xs">
                      <button onClick={() => handleToggleLike(post.id)} className={`flex items-center gap-1.5 transition ${isAlreadyLikedByMe ? 'text-red-500 font-bold' : 'hover:text-white'}`}>
                        <Heart className={`w-4 h-4 ${isAlreadyLikedByMe ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>
                      <button onClick={() => setActiveCommentPostId(post.id)} className="flex items-center gap-1.5 hover:text-white transition"><MessageSquare className="w-4 h-4" /><span>{post.comments_count || 0}</span></button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {/* TAB WORKOUT / SEANCE */}
        {currentTab === 'workout' && (
          <form onSubmit={handlePublishWorkout} className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black tracking-tight">Enregistrer une séance</h2>
                {isPrivateMode && (
                  <span title="Cette séance sera publiée en Privé">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </span>
                )}
              </div>

              {/* Avertissement anti-nudité */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-[11px] text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Rappel CGU : Tolérance zéro pour la nudité ou les photos explicites sur le flux public. Tout contrevenant sera banni.</span>
              </div>

              {/* Type de séance */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-400">Type de séance :</label>
                <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500">
                  {WORKOUT_CHOICES.map((choice) => (
                    <option key={choice} value={choice}>{choice}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => startCamera('post')} className="py-6 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-orange-400 bg-neutral-950 transition">
                  <Camera className="w-6 h-6 text-orange-500" /><span className="text-xs font-semibold">Prendre photo</span>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="py-6 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-orange-400 bg-neutral-950 transition">
                  <FolderOpen className="w-6 h-6 text-neutral-400" /><span className="text-xs font-semibold">Galerie</span>
                </button>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              
              {/* === RECADRAGE DE L'IMAGE === */}
              {postImagePreview && (
                <div className="space-y-3">
                  <div
                    ref={previewContainerRef}
                    className="relative rounded-2xl overflow-hidden border border-neutral-700 w-full aspect-[4/5] bg-neutral-950 flex items-center justify-center touch-none cursor-move"
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      ref={imgRef}
                      src={postImagePreview}
                      alt=""
                      style={{
                        transform: `translate(${postImageOffset.x}px, ${postImageOffset.y}px) scale(${postImageZoom})`,
                        transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out',
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                        transformOrigin: 'center'
                      }}
                      className="pointer-events-none select-none"
                      draggable={false}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-lg flex items-center gap-1.5 text-white/80 text-[10px]">
                      <Move className="w-3 h-3" /> Glisse/Pince pour recadrer
                    </div>
                    <button type="button" onClick={() => setPostImagePreview(null)} className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                  
                  {/* Slider de Zoom */}
                  <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                    <ZoomIn className="w-5 h-5 text-neutral-400" />
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.05"
                      value={postImageZoom}
                      onChange={(e) => setPostImageZoom(Number(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                  </div>
                </div>
              )}
              
              {/* Liste dynamique des exercices réalisés */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-orange-400 uppercase tracking-wider">Exercices de la séance :</label>
                  <button type="button" onClick={handleAddExerciseRow} className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Ajouter un exercice
                  </button>
                </div>

                {workoutExercises.map((ex, index) => (
                  <div key={index} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Nom de l'exercice (ex: Développé couché)" 
                        value={ex.name} 
                        onChange={(e) => {
                          const updated = [...workoutExercises];
                          updated[index].name = e.target.value;
                          setWorkoutExercises(updated);
                        }} 
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500" 
                      />
                      <button type="button" onClick={() => handleRemoveExerciseRow(index)} className="p-1.5 text-neutral-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[9px] text-neutral-400 block mb-0.5">Séries</span>
                        <input type="number" placeholder="Séries" value={ex.sets} onChange={(e) => { const updated = [...workoutExercises]; updated[index].sets = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-orange-500" />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-400 block mb-0.5">Reps</span>
                        <input type="number" placeholder="Reps" value={ex.reps} onChange={(e) => { const updated = [...workoutExercises]; updated[index].reps = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-orange-500" />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-400 block mb-0.5">Poids (kg)</span>
                        <input type="number" placeholder="Poids" value={ex.weight} onChange={(e) => { const updated = [...workoutExercises]; updated[index].weight = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="block text-[11px] font-semibold text-neutral-400">Description & Hashtags :</label>
                <textarea rows={3} placeholder="Comment s'est passée la séance ?" value={workoutCaption} onChange={(e) => setWorkoutCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" />
                
                <div className="pt-1.5 pb-2">
                  <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1 mb-2">
                    <Hash className="w-3 h-3 text-orange-500" /> Ajouter des hashtags rapides :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_HASHTAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddWorkoutHashtag(tag)}
                        className="px-2.5 py-1.5 bg-neutral-950 hover:bg-orange-600/20 border border-neutral-800 hover:border-orange-500 text-neutral-300 hover:text-orange-400 rounded-lg text-[10px] font-semibold transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Partager ma séance'}
              </button>
              {isPrivateMode && <p className="text-center text-[10px] text-neutral-500 mt-2">🔒 Ton profil est privé. Seuls tes Buddies verront ce post.</p>}
            </div>
          </form>
        )}

        {/* TAB 3: EXERCICES */}
        {currentTab === 'exercises' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-orange-500" /> Guide des Exercices
                  </h2>
                  <span className="text-xs text-neutral-400">Photos explicatives, réglages et posture</span>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-orange-500" />
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-orange-500 shadow-inner"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      selectedCategoryFilter === cat
                        ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-1">
                {EXERCISES_DATABASE.filter((ex) => {
                  const matchCat = selectedCategoryFilter === 'Tous' || ex.category === selectedCategoryFilter;
                  const matchSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || ex.targetMuscles.toLowerCase().includes(exerciseSearch.toLowerCase());
                  return matchCat && matchSearch;
                }).map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedExerciseDetail(ex)}
                    className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 hover:border-orange-500/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <img src={ex.image_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-neutral-800 flex-shrink-0" />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-orange-400 transition">{ex.name}</span>
                          <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/20 font-medium">{ex.category}</span>
                        </div>
                        <p className="text-xs text-neutral-400">🎯 Cible : {ex.targetMuscles}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition flex-shrink-0">
                      <Info className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUDDY */}
        {currentTab === 'buddy' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black tracking-tight">Réseau & Athlètes</h2>
                <span className="text-[10px] text-orange-400 font-semibold">{selectedClub}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMatchModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md hover:opacity-90 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Match Partner
                </button>
                <button
                  onClick={() => setFilterWomenOnly(!filterWomenOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    filterWomenOnly
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white ring-2 ring-pink-400 shadow-md'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <span>🚺</span> Entre femmes {filterWomenOnly && '✓'}
                </button>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 text-xs text-orange-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <span>Pour apparaître dans cet onglet et être trouvé par tes amis, assurez-vous d'avoir enregistré une première séance ou un post !</span>
            </div>
            
            <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
              <button
                onClick={() => setBuddyTabSubMode('discover')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'discover' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                Découvrir
              </button>
              <button
                onClick={() => setBuddyTabSubMode('my_friends')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'my_friends' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                Mes Amis ({myFriendsList.length})
              </button>
              <button
                onClick={() => setBuddyTabSubMode('requests')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition relative ${buddyTabSubMode === 'requests' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                Demandes {incomingRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{incomingRequests.length}</span>}
              </button>
            </div>

            {buddyTabSubMode === 'requests' ? (
              <div className="space-y-3 pt-1">
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">Aucune demande d'ami en attente.</div>
                ) : (
                  incomingRequests.map((req) => {
                    const senderUser = registeredUsers.find(u => u.id === req.sender_id) || { username: 'Athlète FitPulse', home_club: selectedClub, avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
                    return (
                      <div key={req.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={senderUser.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-700" />
                          <div>
                            <h3 className="font-bold text-xs text-white">{senderUser.username}</h3>
                            <span className="text-[10px] text-neutral-400">Souhaite devenir ton Buddy</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAcceptFriendRequest(req.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Accepter
                          </button>
                          <button onClick={() => handleRejectFriendRequest(req.id)} className="p-2 bg-neutral-900 border border-neutral-800 text-red-400 hover:bg-neutral-800 rounded-xl">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-400">Filtrer par objectif :</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { label: 'Tous', value: 'all' },
                      { label: '💪 Prise de masse', value: 'masse' },
                      { label: '🔥 Cardio & HIIT', value: 'cardio' },
                      { label: '🧘 Remise en forme', value: 'remise' }
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setSelectedGoalFilter(goal.value)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition border ${
                          selectedGoalFilter === goal.value
                            ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-semibold text-neutral-400 block pt-1">Tranche d'âge :</span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { label: 'Tous les âges', value: 'all' },
                      { label: '18 - 25 ans', value: '18-25' },
                      { label: '26 - 35 ans', value: '26-35' },
                      { label: '36 - 45 ans', value: '36-45' },
                      { label: '46+ ans', value: '46+' }
                    ].map((group) => (
                      <button
                        key={group.value}
                        onClick={() => setSelectedAgeGroupFilter(group.value)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition border ${
                          selectedAgeGroupFilter === group.value
                            ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative pt-1">
                  <Search className="absolute left-3.5 top-4.5 w-4 h-4 text-orange-500" />
                  <input
                    type="text"
                    placeholder="Rechercher par pseudo..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>

                <div className="space-y-3 pt-1">
                  {filteredBuddies.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 text-xs">
                      Aucun autre athlète trouvé dans ce club pour l'instant. Publiez une première séance chacun pour vous retrouver !
                    </div>
                  ) : (
                    filteredBuddies.map((realUser) => {
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
                                {realUser.goal && <span className="text-[10px] text-neutral-400 italic">🎯 {realUser.goal}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isFriend ? (
                              <button className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-green-400 rounded-xl text-xs font-bold flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" /> Ami
                              </button>
                            ) : isPending ? (
                              <button disabled className="px-3 py-1.5 bg-neutral-900 text-neutral-400 rounded-xl text-xs font-medium">
                                En attente
                              </button>
                            ) : (
                              <button onClick={() => handleSendFriendRequest(realUser.id)} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1">
                                <UserPlus className="w-3.5 h-3.5" /> Ajouter
                              </button>
                            )}
                            <button onClick={() => { setSelectedBuddyChat(realUser); setCurrentTab('chat'); }} className="p-2 bg-neutral-900 border border-neutral-800 hover:border-orange-500 text-neutral-200 rounded-xl">
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: CHAT */}
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
                
                {/* On cache la barre d'envoi si on discute avec le Bot Système */}
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
                {activeChatUsers.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    Aucun ami dans ton réseau. Va dans l'onglet **Buddy** pour ajouter des athlètes !
                  </div>
                ) : (
                  activeChatUsers.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedBuddyChat(friend)}
                      className="p-3.5 bg-neutral-950 hover:bg-neutral-900/80 rounded-2xl border border-neutral-800 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-800" />
                        <div>
                          <h3 className="font-bold text-xs text-white">{friend.username}</h3>
                          <span className="text-[10px] text-neutral-500">{friend.home_club}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversationForBuddy(friend.id, friend.username);
                        }}
                        title="Effacer la conversation"
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LEADERBOARD & RECORDS + PLANIFICATEUR MODIFIABLE */}
        {currentTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* PRs */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Mes Records Personnels (PRs)</h2>
              <p className="text-xs text-neutral-400">Suivi de tes charges maximales par exercice.</p>

              <form onSubmit={handleAddPR} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                <span className="text-[11px] font-bold text-orange-400 block">Ajouter un nouveau record</span>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Exercice" value={newPrExercise} onChange={(e) => setNewPrExercise(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                  <input type="number" placeholder="Poids (kg)" value={newPrWeight} onChange={(e) => setNewPrWeight(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                  <input type="number" placeholder="Reps" value={newPrReps} onChange={(e) => setNewPrReps(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                </div>
                <button type="submit" className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition">Enregistrer le PR</button>
              </form>

              <div className="space-y-2 pt-1">
                {personalRecords.map((pr, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                    <div>
                      <span className="text-xs font-bold text-white block">{pr.exercise}</span>
                      <span className="text-[10px] text-neutral-400">Atteint le {pr.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black font-mono text-orange-400">{pr.weight} kg ({pr.reps} reps)</span>
                      <span>🏆</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PLANIFICATEUR DE SEMAINE AVEC CHOIX PRÉDÉFINIS */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500" /> Planificateur de la semaine</h2>
              <div className="space-y-2.5">
                {weeklyPlan.map((plan, i) => (
                  <div key={i} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400">{plan.day}</span>
                      {editingDayIndex === i ? (
                        <button onClick={() => handleSaveWeeklyPlanEdit(i)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Enregistrer</button>
                      ) : (
                        <button onClick={() => { setEditingDayIndex(i); setEditFocus(plan.focus); setEditExercisesText(plan.exercisesText); }} className="p-1 text-neutral-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                      )}
                    </div>

                    {editingDayIndex === i ? (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-400 mb-1">Choix du type de séance :</label>
                          <select value={editFocus} onChange={(e) => setEditFocus(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                            {WORKOUT_CHOICES.map((choice) => (
                              <option key={choice} value={choice}>{choice}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-400 mb-1">Exercices personnalisés :</label>
                          <input type="text" placeholder="ex: Développé couché, Écartés..." value={editExercisesText} onChange={(e) => setEditExercisesText(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-[11px] bg-neutral-900 px-2.5 py-1 rounded-lg text-neutral-200 font-medium inline-block">{plan.focus}</span>
                        <p className="text-[11px] text-neutral-400">Exercices : {plan.exercisesText}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROFIL */}
        {currentTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto group cursor-pointer" onClick={() => profileAvatarInputRef.current?.click()}>
                <img src={userAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-orange-500 shadow-xl" />
                <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[9px] text-white font-bold mt-1">Modifier</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-1.5 border border-neutral-800">
                  <div className="bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {userStreak}
                  </div>
                </div>
              </div>
              <input type="file" accept="image/*" ref={profileAvatarInputRef} onChange={(e) => handleImageSelect(e, 'profile_avatar')} className="hidden" />
              
              <div>
                <h2 className="font-extrabold text-xl">{user.user_metadata?.first_name || user.email?.split('@')[0]}</h2>
                <span className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 inline-block mt-2">{selectedClub}</span>
              </div>
            </div>

            {/* SECTION AVANT / APRÈS PERSONNEL & CONFIDENTIALITÉ STRICTE */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-500" /> Carnet Avant / Après
                </h3>
                <span className="text-[10px] text-neutral-400">100% Privé (Visible que par toi)</span>
              </div>

              {/* Formulaire ajout avant/après */}
              <form onSubmit={handleAddTransformation} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                <span className="text-[11px] font-bold text-orange-400 block">Ajouter un point d'évolution</span>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setCameraTarget('trans_before'); startCamera('trans_before'); }} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center justify-center gap-1.5 hover:border-orange-500">
                    <Camera className="w-4 h-4 text-orange-500" /> {newTransBefore ? 'Photo Avant (✓)' : 'Photo Avant'}
                  </button>
                  <button type="button" onClick={() => { setCameraTarget('trans_after'); startCamera('trans_after'); }} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center justify-center gap-1.5 hover:border-orange-500">
                    <Camera className="w-4 h-4 text-orange-500" /> {newTransAfter ? 'Photo Après (✓)' : 'Photo Après'}
                  </button>
                </div>
                <input type="file" accept="image/*" ref={beforeFileInputRef} onChange={(e) => handleImageSelect(e, 'trans_before')} className="hidden" />
                <input type="file" accept="image/*" ref={afterFileInputRef} onChange={(e) => handleImageSelect(e, 'trans_after')} className="hidden" />

                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.1" placeholder="Poids actuel (kg)" value={newTransWeight} onChange={(e) => setNewTransWeight(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                  <input type="text" placeholder="Note (ex: Fin de sèche)" value={newTransNote} onChange={(e) => setNewTransNote(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
                </div>

                <div className="flex items-center justify-between bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-orange-500" />
                    <span className="text-[11px] font-semibold text-neutral-200">Visible uniquement par moi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewTransIsPrivate(!newTransIsPrivate)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${newTransIsPrivate ? 'bg-orange-500' : 'bg-neutral-800'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${newTransIsPrivate ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <button type="submit" className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition">Enregistrer dans mon carnet</button>
              </form>

              {/* Liste des transformations enregistrées */}
              <div className="space-y-3 pt-1">
                {transformations.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 text-xs">Aucune photo avant/après enregistrée pour l'instant.</div>
                ) : (
                  transformations.map((item) => (
                    <div key={item.id} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-orange-400">📅 {item.date} — {item.weight} kg</span>
                        <div className="flex items-center gap-1.5 text-neutral-400 italic">
                          <EyeOff className="w-3.5 h-3.5 text-orange-500" />
                          <span>Privé (Visible que par toi)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-800">
                          <img src={item.before_url} alt="Avant" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] text-white px-2 py-0.5 rounded">Avant</span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-800">
                          <img src={item.after_url} alt="Après" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] text-white px-2 py-0.5 rounded">Après</span>
                        </div>
                      </div>
                      <button onClick={() => handleShareTransformationToFeed(item)} className="w-full py-2 bg-neutral-900 hover:bg-orange-600/20 border border-neutral-800 hover:border-orange-500 text-neutral-300 hover:text-orange-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" /> Partager ce bilan sur le fil
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" /> Confidentialité
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <div>
                  <span className="font-bold text-sm text-white block">Compte Privé</span>
                  <p className="text-[10px] text-neutral-400 max-w-[200px] mt-1">Si activé, tes nouvelles séances seront visibles uniquement par tes amis (Buddies).</p>
                </div>
                <button 
                  onClick={() => setIsPrivateMode(!isPrivateMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isPrivateMode ? 'bg-orange-500' : 'bg-neutral-800'}`}
                >
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

      {/* MODAL LECTURE DE STORY */}
      {activeViewingStory && activeStoryIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none">
          <div className="w-full flex items-center gap-1.5 pt-2 z-20">
            {friendStoriesList.map((_, idx) => (
              <div key={idx} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-white transition-all ease-linear" style={{ width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${storyProgress}%` : '0%' }} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 z-20">
            <div className="flex items-center gap-2.5">
              <img src={activeViewingStory.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
              <div>
                <h4 className="font-bold text-xs text-white">{activeViewingStory.username}</h4>
                <span className="text-[10px] text-neutral-400">{activeViewingStory.club_name}</span>
              </div>
            </div>
            <button onClick={() => { setActiveStoryIndex(null); setIsStoryPaused(false); }} className="p-2 bg-black/60 rounded-full text-white"><X className="w-6 h-6" /></button>
          </div>

          <div className="absolute inset-0 z-10 flex" style={{ bottom: '90px' }}>
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevStory} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNextStory} />
          </div>

          <div className="flex-1 flex items-center justify-center py-4 z-0 pointer-events-none">
            <img src={activeViewingStory.image_url} alt="" className="max-h-[60vh] max-w-full rounded-2xl object-contain border border-neutral-800" />
          </div>

          {activeViewingStory.caption && (
            <div className="bg-neutral-950/80 backdrop-blur-lg px-3.5 py-2 rounded-xl border border-neutral-800 text-center mb-2 z-20">
              <p className="text-xs text-neutral-100 font-medium">{renderCaptionWithHashtags(activeViewingStory.caption)}</p>
            </div>
          )}

          <div className="z-30 space-y-2">
            <div className="flex justify-center gap-4 py-1">
              {['🔥', '💪', '👏', '❤️'].map((emoji) => (
                <button key={emoji} onClick={() => handleSendStoryComment(undefined, emoji)} className="text-xl bg-neutral-900/80 p-1.5 rounded-full border border-neutral-800">{emoji}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={(e) => handleSendStoryComment(e)} className="flex-1 flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-1.5">
                <input type="text" placeholder="Répondre..." value={storyCommentInput} onFocus={() => setIsStoryPaused(true)} onBlur={() => !storyCommentInput && setIsStoryPaused(false)} onChange={(e) => setStoryCommentInput(e.target.value)} className="flex-1 bg-transparent text-xs text-white focus:outline-none" />
                {storyCommentInput.trim() && <button type="submit" className="text-orange-400 p-1"><SendHorizontal className="w-4 h-4" /></button>}
              </form>
              <button onClick={() => handleToggleStoryLike(activeViewingStory.id)} className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-white">
                <Heart className={`w-5 h-5 ${likedStories[activeViewingStory.id] ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PUBLIER STORY */}
      {isCreatingStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-500" /> Ajouter à ma story (24h)</h3>
              <button onClick={() => setIsCreatingStory(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePublishStory} className="space-y-3.5">
              <input type="file" accept="image/*" ref={storyFileInputRef} onChange={handleImageSelect} className="hidden" />
              {storyImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 h-56 flex items-center justify-center">
                  <img src={storyImagePreview} alt="" className="max-h-full object-contain" />
                  <button type="button" onClick={() => setStoryImagePreview(null)} className="absolute top-2 right-2 p-1 bg-black/80 text-white rounded-full"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => startCamera('story')} className="py-8 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition">
                    <Camera className="w-6 h-6 text-orange-500" /><span className="text-xs font-semibold">Prendre photo</span>
                  </button>
                  <button type="button" onClick={() => storyFileInputRef.current?.click()} className="py-8 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition">
                    <FolderOpen className="w-6 h-6" /><span className="text-xs font-semibold">Galerie</span>
                  </button>
                </div>
              )}
              
              <div className="space-y-2">
                <input type="text" placeholder="Légende de la story..." value={storyCaption} onChange={(e) => setStoryCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" />
                
                <div className="pt-1.5 pb-2">
                  <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1 mb-2">
                    <Hash className="w-3 h-3 text-orange-500" /> Hashtags rapides :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_HASHTAGS.slice(0, 6).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddStoryHashtag(tag)}
                        className="px-2.5 py-1.5 bg-neutral-950 hover:bg-orange-600/20 border border-neutral-800 hover:border-orange-500 text-neutral-300 hover:text-orange-400 rounded-lg text-[10px] font-semibold transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={storyUploading || !storyImageFile} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs">
                {storyUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Partager ma story"}
              </button>
            </form>
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
            {unreadChatCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-neutral-950 rounded-full animate-pulse"></span>}
          </div>
          <span className="text-[10px]">Chat</span>
        </button>
        <button onClick={() => setCurrentTab('leaderboard')} className={`flex flex-col items-center gap-1 ${currentTab === 'leaderboard' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Trophy className="w-5 h-5" /><span className="text-[10px]">Records</span></button>
        <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center gap-1 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><User className="w-5 h-5" /><span className="text-[10px]">Profil</span></button>
      </nav>
    </div>
  );
}
