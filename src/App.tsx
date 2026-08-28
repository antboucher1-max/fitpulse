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
  Bell,
  Key,
  CheckCheck,
  Calculator,
  Bot,
  PlayCircle,
  CheckCircle,
  Mic,
  MicOff
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration Supabase
const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration Gemini IA
const genAI = new GoogleGenerativeAI("AQ.Ab8RN6L5GPKu3cqeAOO-coXkHJQMtUAEAKStoOsmAlURUqizfw");

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
  detailedDescription: string;
}

const EXERCISES_DATABASE: ExerciseGuide[] = [
  { 
    id: 'ex-1', 
    name: 'Développé couché (Barre / Haltères)', 
    category: 'Pectoraux', 
    equipment: 'Banc de musculation & Barre olympique', 
    targetMuscles: 'Pectoraux, Triceps, Deltoïdes antérieurs', 
    settings: 'Régler le banc à plat. Allonge-toi les yeux sous la barre. Pieds bien à plat au sol.', 
    execution: 'Saisir la barre un peu plus large que les épaules. Descendre de manière contrôlée jusqu’au milieu de la poitrine, puis pousser en expirant.', 
    tips: 'Garde les omoplates serrées contre le banc et évite de cambrer excessivement le dos.', 
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
    detailedDescription: 'Le développé couché est l’exercice roi pour bâtir de la masse musculaire sur la partie supérieure du corps.'
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
    image_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
    detailedDescription: 'La machine chest press guide parfaitement la trajectoire du mouvement pour se concentrer sur la contraction.'
  },
  { 
    id: 'ex-3', 
    name: 'Tirage vertical / Lat Pulldown', 
    category: 'Dos', 
    equipment: 'Poulie haute avec barre large', 
    targetMuscles: 'Grand dorsal, Biceps, Ronds majeurs', 
    settings: 'Ajuste les boudins de cuisses pour être bien calé. Saisis la barre avec une prise large.', 
    execution: 'Tire la barre vers le haut de ta poitrine en sortant la poitrine et en tirant les coudes vers le bas et l’arrière.', 
    tips: 'Évite de te pencher trop en arrière ; garde le buste légèrement incliné.', 
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800',
    detailedDescription: 'Le tirage vertical cible principalement le grand dorsal pour donner de la largeur au dos.'
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
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    detailedDescription: 'Le rowing assis développe l’épaisseur du haut et du milieu du dos.'
  },
  { 
    id: 'ex-5', 
    name: 'Squat', 
    category: 'Jambes', 
    equipment: 'Barre libre ou Guidée / Smith Machine', 
    targetMuscles: 'Quadriceps, Fessiers, Ischio-jambiers', 
    settings: 'Place la barre sur tes trapèzes (haut du dos). Élargissement des pieds largeur d’épaules.', 
    execution: 'Fléchis les genoux et descends les fesses vers l’arrière comme pour t’asseoir sur une chaise, le dos bien droit.', 
    tips: 'Garde les genoux bien alignés dans l’axe des pointes de pieds.', 
    image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
    detailedDescription: 'Le squat est l’exercice fondamental pour le bas du corps et la force globale.'
  },
  { 
    id: 'ex-6', 
    name: 'Leg Press', 
    category: 'Jambes', 
    equipment: 'Machine Leg Press inclinée', 
    targetMuscles: 'Quadriceps, Fessiers', 
    settings: 'Assieds-toi, place tes pieds au milieu de la plateforme largeur d’épaules.', 
    execution: 'Fléchis les jambes pour ramener le chariot vers toi puis pousse puissamment.', 
    tips: 'Ne décolle jamais le bas du dos ou les talons du dossier.', 
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    detailedDescription: 'La presse à cuisses permet de charger lourdement les quadriceps en protégeant la colonne.'
  }
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
  id: string; username: string; email: string; gender?: 'M' | 'F'; birth_date?: string; age: number; goal?: string; home_club: string; preferred_time?: string; avatar_url: string; last_seen?: string; is_verified?: boolean; is_admin?: boolean;
}

interface FriendRequest {
  id: string; sender_id: string; receiver_id: string; status: 'pending' | 'accepted'; timestamp?: number;
}

interface DBMessage {
  id: string; sender_id: string; receiver_id: string; sender_name: string; text: string; created_at: string;
}

interface LiveWorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

interface LiveWorkoutExercise {
  id: string;
  name: string;
  sets: LiveWorkoutSet[];
}

interface AIChatMessage {
  sender: 'user' | 'bot';
  text: string;
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
  // ==========================================
  // 1. ALL DÉCLARATIONS D'ÉTAT (USESTATE & USEREF)
  // ==========================================
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
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);

  const [isLiveActive, setIsLiveActive] = useState<boolean>(() => { try { return localStorage.getItem('fitpulse_live_active') === 'true'; } catch { return false; } });
  const [liveWorkoutName, setLiveWorkoutName] = useState<string>('Séance Full Body');
  const [liveExercises, setLiveExercises] = useState<LiveWorkoutExercise[]>([]);
  const [selectedExToAdd, setSelectedExToAdd] = useState(EXERCISES_DATABASE[0].name);
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState<number>(0);

  const [aiChatMessages, setAiChatMessages] = useState<AIChatMessage[]>([
    { sender: 'bot', text: "Salut l'athlète ! Je suis **FitBot**, ton coach IA personnel. Comment puis-je t'aider aujourd'hui ? (Programme pour ton Basic-Fit, nutrition, conseils d'exécution...)" }
  ]);
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
  
  const [sentPushUps, setSentPushUps] = useState<Record<string, number>>({});
  const [viewingProfileUser, setViewingProfileUser] = useState<RealUser | null>(null);

  const [buddyTabSubMode, setBuddyTabSubMode] = useState<'discover' | 'my_friends' | 'requests'>('discover');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterWomenOnly, setFilterWomenOnly] = useState(false);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('all');
  const [selectedAgeGroupFilter, setSelectedAgeGroupFilter] = useState<string>('all');
  
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchGoal, setMatchGoal] = useState('Tous');
  const [matchTime, setMatchTime] = useState('Tous');
  const [matchWomenOnly, setMatchWomenOnly] = useState(false);
  
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

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'post' | 'story' | 'trans_before' | 'trans_after' | 'profile_avatar'>('post');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [targetWeight, setTargetWeight] = useState<number | ''>(100);
  const [barbellWeight, setBarbellWeight] = useState<number>(20);

  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);

  const [inviteModalTarget, setInviteModalTarget] = useState<RealUser | null>(null);
  const [inviteType, setInviteType] = useState('Jambes (Leg Day)');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newTransNote, setNewTransNote] = useState('');
  const [newTransWeight, setNewTransWeight] = useState<number | ''>('');
  const [newTransBefore, setNewTransBefore] = useState<string | null>(null);
  const [newTransAfter, setNewTransAfter] = useState<string | null>(null);
  const [newTransIsPrivate, setNewTransIsPrivate] = useState<boolean>(true);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

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
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([{ exercise: 'Développé couché', weight: 100, reps: 5, date: '2026-08-10' }]);
  const [newPrExercise, setNewPrExercise] = useState('');
  const [newPrWeight, setNewPrWeight] = useState<number | ''>('');
  const [newPrReps, setNewPrReps] = useState<number | ''>('');
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>(DEFAULT_WEEKLY_PLAN);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editFocus, setEditFocus] = useState(WORKOUT_CHOICES[0]);
  const [editExercisesText, setEditExercisesText] = useState('');
  const [activeAnatomyExercise, setActiveAnatomyExercise] = useState<string | null>(null);
  
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);


  // ==========================================
  // 2. FONCTIONS HISSÉES (TOUTES DÉCLARÉES EN PREMIER)
  // ==========================================

  const convertJJMMAAAAtoYYYYMMDD = (input: string): string => {
    const parts = input.split('/');
    if (parts.length === 3 && parts[2].length === 4) { return `${parts[2]}-${parts[1]}-${parts[0]}`; }
    return '1995-01-01';
  };

  const handleTabChange = (tab: 'feed' | 'buddy' | 'workout' | 'exercises' | 'chat' | 'leaderboard' | 'profile' | 'calculator' | 'live_tracker' | 'fitbot') => {
    setCurrentTab(tab);
    try { sessionStorage.setItem('fitpulse_current_tab', tab); } catch (e) {}
  };

  const startRestTimer = (seconds: number) => { 
    setRestTimerSeconds(seconds); 
    setRestTimeRemaining(seconds); 
    setIsRestTimerActive(true); 
  };

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

  const stopCameraStream = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setIsCameraActive(false);
    if (cameraTarget === 'story') { setIsCreatingStory(true); }
  };

  const startCameraHandler = (target: 'post' | 'story' | 'trans_before' | 'trans_after' | 'profile_avatar') => {
    if (target === 'story') { setIsCreatingStory(false); }
    setCameraTarget(target);
    setIsCameraActive(true);
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
        const myName = user.user_metadata?.username || 'Un utilisateur';
        await supabase.from('direct_messages').insert([{ sender_id: 'system-bot', receiver_id: adminId, sender_name: '⚠️ Bot', text: `🚨 SIGNALEMENT : ${myName} a signalé le post de ${post.username}.` }]);
      }
    }
    alert("🚨 Publication signalée aux modérateurs.");
  };


  // ==========================================
  // 3. VARIABLES DÉRIVÉES ET CALCULÉES
  // ==========================================
  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const calculatePlates = (target: number | '', bar: number) => {
    if (target === '' || target <= bar) return [];
    let remaining = (target - bar) / 2;
    const result: { weight: number; count: number }[] = [];
    for (const plate of availablePlates) {
      if (remaining <= 0) break;
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        result.push({ weight: plate, count });
        remaining = Number((remaining - count * plate).toFixed(2));
      }
    }
    return result;
  };
  const plateBreakdown = targetWeight !== '' ? calculatePlates(targetWeight, barbellWeight) : [];

  const acceptedFriendIds = friendRequests.filter(req => req.status === 'accepted').map(req => (req.sender_id === user?.id ? req.receiver_id : req.sender_id));

  const botUser: RealUser = { id: 'system-bot', username: '⚠️ Modération Bot', email: 'bot@fitpulse', home_club: 'Système', age: 99, avatar_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150' };
  const hasBotMessages = allMessages.some(m => m.sender_id === 'system-bot' && m.receiver_id === user?.id);
  const activeChatUsers = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    const hasExchanged = allMessages.some(m => (m.sender_id === user?.id && m.receiver_id === u.id) || (m.sender_id === u.id && m.receiver_id === user?.id));
    return acceptedFriendIds.includes(u.id) || hasExchanged;
  });
  if (hasBotMessages) activeChatUsers.unshift(botUser);

  const myFriendsList = registeredUsers.filter((u) => acceptedFriendIds.includes(u.id));
  const suggestedBuddiesList = registeredUsers.filter((u) => u.id !== user?.id && !acceptedFriendIds.includes(u.id));
  const incomingRequests = friendRequests.filter(req => req.receiver_id === user?.id && req.status === 'pending');

  const filteredBuddies = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    if (buddyTabSubMode === 'my_friends' && !acceptedFriendIds.includes(u.id)) return false;
    if (filterWomenOnly && u.gender === 'M') return false;
    if (selectedGoalFilter !== 'all' && u.goal && !u.goal.toLowerCase().includes(selectedGoalFilter.toLowerCase())) return false;
    if (selectedAgeGroupFilter !== 'all') {
      const ageLabel = getAgeRangeLabel(u.birth_date);
      if (ageLabel !== selectedAgeGroupFilter) return false;
    }
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.home_club.toLowerCase().includes(q);
    }
    return true;
  });

  const matchedBuddiesList = registeredUsers.filter((u) => {
    if (u.id === user?.id) return false;
    if (matchWomenOnly && u.gender === 'M') return false;
    const matchG = matchGoal === 'Tous' || (u.goal && u.goal.toLowerCase().includes(matchGoal.toLowerCase()));
    const matchT = matchTime === 'Tous' || (u.preferred_time && u.preferred_time.includes(matchTime));
    return matchG && matchT;
  });

  const displayedPosts = posts.filter((post) => {
    if (post.is_private && post.user_id !== user?.id && !acceptedFriendIds.includes(post.user_id)) return false;
    return isMatchingClub(post.club_name, selectedClub);
  });

  const currentChatMessages = allMessages.filter(
    (m) => selectedBuddyChat && user && ((m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id) || (m.sender_id === selectedBuddyChat.id && m.receiver_id === user.id))
  );

  const isSelectedChatFriend = selectedBuddyChat ? acceptedFriendIds.includes(selectedBuddyChat.id) || selectedBuddyChat.id === 'system-bot' : true;
  const mySentMessagesCount = selectedBuddyChat && user ? allMessages.filter(m => m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id).length : 0;
  const isMessageLimitReached = !isSelectedChatFriend && mySentMessagesCount >= 3;

  const friendStoriesList = cloudStories.filter((s) => {
    const storyDate = new Date(s.created_at).getTime();
    return !isNaN(storyDate) ? storyDate >= Date.now() - 24 * 3600 * 1000 : true;
  });

  const activeViewingStory = activeStoryIndex !== null ? friendStoriesList[activeStoryIndex] : null;
  const activePostForComments = posts.find((p) => p.id === activeCommentPostId);
  
  const unreadChatCount = activeChatUsers.filter(friend => {
    const lastRead = lastReadTimestamps[friend.id] || 0;
    const friendMsgs = allMessages.filter(m => m.sender_id === friend.id && m.receiver_id === user?.id);
    return friendMsgs.some(m => new Date(m.created_at).getTime() > lastRead);
  }).length;

  const notifications = allMessages.filter(m => m.receiver_id === user?.id && m.sender_id === 'system-notification');
  const unreadNotifsCount = notifications.filter(m => new Date(m.created_at).getTime() > lastNotifOpenTime).length;

  const currentUserProfile = registeredUsers.find(u => u.id === user?.id);
  const isAdmin = currentUserProfile?.is_admin || user?.email === 'antbou@fitpulse.be';


  // ==========================================
  // 4. TOUTES LES FONCTIONS MÉTIER
  // ==========================================

  const handleStartLiveWorkout = () => {
    setIsLiveActive(true);
    setLiveElapsedSeconds(0);
    setLiveExercises([]);
    handleTabChange('live_tracker');
  };

  const handleAddLiveExercise = () => {
    const newEx: LiveWorkoutExercise = {
      id: 'lex-' + Date.now(),
      name: selectedExToAdd,
      sets: [{ setNumber: 1, weight: 50, reps: 10, completed: false }]
    };
    setLiveExercises([...liveExercises, newEx]);
  };

  const handleAddLiveSet = (exId: string) => {
    setLiveExercises(liveExercises.map(ex => {
      if (ex.id === exId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        const nextSetNum = ex.sets.length + 1;
        return {
          ...ex,
          sets: [...ex.sets, { setNumber: nextSetNum, weight: lastSet ? lastSet.weight : 50, reps: lastSet ? lastSet.reps : 10, completed: false }]
        };
      }
      return ex;
    }));
  };

  const handleToggleLiveSet = (exId: string, setIndex: number) => {
    setLiveExercises(liveExercises.map(ex => {
      if (ex.id === exId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed };
        if (newSets[setIndex].completed) { startRestTimer(90); }
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const handleFinishLiveWorkout = async () => {
    if (!user) return;
    if (liveExercises.length === 0) { alert("Ajoute au moins un exercice avant de terminer !"); return; }
    const formattedExercises: ExerciseEntry[] = liveExercises.map(ex => ({
      name: ex.name, sets: ex.sets.length, reps: ex.sets[0]?.reps || 10, weight: ex.sets[0]?.weight || 50
    }));

    const newPostData = {
      user_id: user.id, username: user.user_metadata?.username || 'Athlète', avatar_url: userAvatarUrl, image_url: null, club_name: selectedClub, session_type: liveWorkoutName, caption: `Séance en direct terminée en ${Math.floor(liveElapsedSeconds / 60)} min ! 💪 #gym #nopainnogain`, exercises: formattedExercises, likes_count: 0, liked_by: [], comments_count: 0, comments: [], is_private: isPrivateMode
    };

    const { data, error } = await supabase.from('posts').insert([newPostData]).select('*');
    if (!error && data) {
      setPosts([data[0] as Post, ...posts]);
      setUserStreak(prev => prev + 1);
      setIsLiveActive(false);
      localStorage.removeItem('fitpulse_live_active');
      localStorage.removeItem('fitpulse_live_timer');
      localStorage.removeItem('fitpulse_live_exercises');
      alert("🎉 Séance enregistrée et partagée sur le flux avec succès !");
      handleTabChange('feed');
    } else {
      alert("Erreur lors de l'enregistrement de la séance.");
    }
  };

  const handleSendAIChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || aiInputText;
    if (!textToSend.trim()) return;
    const userText = textToSend.trim();
    if (!customText) setAiInputText('');
    
    const newHistory: AIChatMessage[] = [...aiChatMessages, { sender: 'user', text: userText }];
    setAiChatMessages(newHistory);
    
    const loadingHistory: AIChatMessage[] = [...newHistory, { sender: 'bot', text: "Hmm, laisse-moi réfléchir... 🧠" }];
    setAiChatMessages(loadingHistory);
    setTimeout(() => aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Tu es FitBot, le coach sportif IA expert en musculation de l'application FitPulse. Ton athlète s'appelle Antoine (il adore les séances Full Body). L'utilisateur te dit : "${userText}". Réponds de manière experte, super motivante, et tutoie-le. Formate ta réponse de manière très visuelle et claire. Ajoute des emojis sportifs !`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botReply = response.text();

      setAiChatMessages([...newHistory, { sender: 'bot', text: botReply }]);
      setTimeout(() => aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    } catch (error) {
      console.error("Erreur Gemini:", error);
      setAiChatMessages([...newHistory, { sender: 'bot', text: "Oups, j'ai eu un coup de barre 🍫. Mon cerveau IA est temporairement indisponible !" }]);
      setTimeout(() => aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const toggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("La reconnaissance vocale n'est pas supportée par ton navigateur.");
      return;
    }
    if (isListening) { setIsListening(false); return; }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); };
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setAiInputText(speechToText);
      setIsListening(false);
      handleSendAIChat(undefined, speechToText);
    };
    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !acceptCGU) { alert("Veuillez accepter les CGU pour continuer."); return; }
    const formattedBirthDate = isSignUp ? convertJJMMAAAAtoYYYYMMDD(birthDateInput) : '1995-01-01';

    setAuthLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, password, 
        options: { data: { first_name: firstName, last_name: lastName, username: username || `${firstName}_${lastName}`.toLowerCase(), birth_date: formattedBirthDate, gender, level, home_club: homeClub, preferred_time: preferredTime, avatar_url: userAvatarUrl } } 
      });
      if (error) alert("Erreur d'inscription : " + error.message);
      else setSignupSuccessEmail(email);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Erreur de connexion : " + error.message);
    }
    setAuthLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { alert("Veuillez entrer votre adresse e-mail."); return; }
    setAuthLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setAuthLoading(false);
    if (error) alert("Erreur : " + error.message);
    else setForgotPasswordSent(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) { alert("Les mots de passe ne correspondent pas ou sont vides."); return; }
    setAuthLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setAuthLoading(false);
    if (error) alert("Erreur de mise à jour : " + error.message);
    else {
      alert("🔒 Mot de passe mis à jour avec succès !");
      setIsResetPasswordMode(false);
      setPassword(''); setConfirmPassword('');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const syncProfile = async (sessionUser: SupabaseUser) => {
    try {
      const bDate = sessionUser.user_metadata?.birth_date || '1995-01-01';
      const profileData = {
        id: sessionUser.id,
        username: sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0],
        email: sessionUser.email,
        gender: sessionUser.user_metadata?.gender || 'M',
        birth_date: bDate,
        age: calculateAge(bDate),
        goal: sessionUser.user_metadata?.goal || 'Sportif',
        home_club: sessionUser.user_metadata?.home_club || selectedClub,
        preferred_time: sessionUser.user_metadata?.preferred_time || TIME_SLOTS[2],
        avatar_url: sessionUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        last_seen: new Date().toISOString()
      };
      await supabase.from('profiles').upsert(profileData);
    } catch(e) {}
  };

  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setFeedLoading(false);
  };

  const fetchCloudStories = async () => {
    try {
      const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) setCloudStories(data as Story[]);
    } catch (err) {}
  };

  const fetchDirectMessages = async () => {
    const { data, error } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (!error && data) setAllMessages(data as DBMessage[]);
  };

  const fetchRealUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
    let combinedUsers = new Map();

    if (!profilesError && profilesData && profilesData.length > 0) {
      profilesData.forEach((p) => {
        combinedUsers.set(p.id, {
          id: p.id, username: p.username, email: p.email || '', gender: p.gender || 'M', birth_date: p.birth_date || '1995-01-01', age: p.age || 25, goal: p.goal || 'Sportif', home_club: p.home_club || selectedClub, preferred_time: p.preferred_time || '🌆 Soir (17h - 20h)', avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', last_seen: p.last_seen, is_verified: p.is_verified || false, is_admin: p.is_admin || false
        });
      });
    }

    const { data: postsData } = await supabase.from('posts').select('user_id, username, club_name, avatar_url').limit(100);
    if (postsData) {
      postsData.forEach((p) => {
        if (!combinedUsers.has(p.user_id)) {
          combinedUsers.set(p.user_id, {
            id: p.user_id, username: p.username, email: `${p.username}@fitpulse.be`, gender: 'M', birth_date: '1995-01-01', age: 28, goal: 'Prise de masse & Force', home_club: p.club_name || selectedClub, preferred_time: '🌆 Soir (17h - 20h)', avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', is_verified: false, is_admin: false
          });
        }
      });
    }

    if (user) {
      combinedUsers.set(user.id, {
        id: user.id, username: user.user_metadata?.username || user.email?.split('@')[0] || 'Moi', email: user.email || '', gender: user.user_metadata?.gender || 'M', birth_date: user.user_metadata?.birth_date || '1995-01-01', age: calculateAge(user.user_metadata?.birth_date), goal: user.user_metadata?.goal || 'Sportif', home_club: user.user_metadata?.home_club || selectedClub, preferred_time: user.user_metadata?.preferred_time || '🌆 Soir (17h - 20h)', avatar_url: userAvatarUrl, last_seen: new Date().toISOString()
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

  const sendSystemNotification = async (receiverId: string, message: string) => {
    await supabase.from('direct_messages').insert([{ sender_id: 'system-notification', receiver_id: receiverId, sender_name: '📣 Notification', text: message }]);
  };

  const switchCameraFacing = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacing }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {}
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const previewUrl = URL.createObjectURL(blob);
      if (cameraTarget === 'trans_before') setNewTransBefore(previewUrl);
      else if (cameraTarget === 'trans_after') setNewTransAfter(previewUrl);
      else if (cameraTarget === 'profile_avatar') handleUpdateProfileAvatar(new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      else if (cameraTarget === 'post') { setPostImageFile(new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })); setPostImagePreview(previewUrl); setPostImageZoom(1); setPostImageOffset({ x: 0, y: 0 }); } 
      else { setStoryImageFile(new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })); setStoryImagePreview(previewUrl); setIsCreatingStory(true); }
      stopCameraStream();
    }, 'image/jpeg', 0.85);
  };

  const handleAddExerciseRow = () => setWorkoutExercises([...workoutExercises, { name: '', sets: 3, reps: 10, weight: 50 }]);
  const handleRemoveExerciseRow = (index: number) => setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));

  const renderCaptionWithHashtags = (text: string) => {
    if (!text) return null;
    return text.split(' ').map((word, i) => word.startsWith('#') ? <span key={i} className="text-orange-500 font-bold">{word} </span> : word + ' ');
  };

  const handleAddPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrExercise.trim() || newPrWeight === '' || newPrReps === '') return;
    setPersonalRecords([{ exercise: newPrExercise.trim(), weight: Number(newPrWeight), reps: Number(newPrReps), date: new Date().toISOString().split('T')[0] }, ...personalRecords]);
    setNewPrExercise(''); setNewPrWeight(''); setNewPrReps('');
    alert('🏆 Nouveau record enregistré avec succès !');
  };

  const handleSaveWeeklyPlanEdit = (index: number) => {
    const updated = [...weeklyPlan];
    updated[index] = { ...updated[index], focus: editFocus, exercisesText: editExercisesText };
    setWeeklyPlan(updated); setEditingDayIndex(null);
  };

  const handleAddWorkoutHashtag = (tag: string) => { if (!workoutCaption.includes(tag)) setWorkoutCaption((prev) => (prev ? `${prev} ${tag}` : tag)); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentMessageInput(val);
    if (typingChannelRef.current && user && selectedBuddyChat) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, isTyping: true }
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: user.id, isTyping: false }
        });
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessageInput.trim() || !selectedBuddyChat || !user) return;
    if (isMessageLimitReached) { alert("Limite de 3 messages atteinte. Attendez que la personne accepte la conversation."); return; }
    const text = currentMessageInput.trim();
    setCurrentMessageInput('');
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, isTyping: false }
      });
    }
    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    const tempMsg: DBMessage = {
      id: 'temp-' + Date.now(),
      sender_id: user.id,
      receiver_id: selectedBuddyChat.id,
      sender_name: myName,
      text,
      created_at: new Date().toISOString()
    };
    setAllMessages((prev) => [...prev, tempMsg]);
    const { error } = await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: selectedBuddyChat.id, sender_name: myName, text }]);
    if (error) alert("Erreur d'envoi du message.");
    else { fetchDirectMessages(); messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const likedByList = post.liked_by || [];
    const hasAlreadyLiked = likedByList.includes(user.id);
    let updatedLikedBy = [...likedByList];
    let newCount = post.likes_count;

    if (hasAlreadyLiked) { updatedLikedBy = updatedLikedBy.filter(id => id !== user.id); newCount = Math.max(0, newCount - 1); } 
    else { 
      updatedLikedBy.push(user.id); newCount += 1; 
      if (post.user_id !== user.id) {
         const myName = user.user_metadata?.username || user.email?.split('@')[0] || 'Un athlète';
         sendSystemNotification(post.user_id, `❤️ ${myName} a aimé votre séance "${post.session_type}".`);
      }
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount, liked_by: updatedLikedBy } : p));
    await supabase.from('posts').update({ likes_count: newCount, liked_by: updatedLikedBy }).eq('id', postId);
  };


  // ==========================================
  // 5. EFFETS SECONDAIRES DE COMPOSANT (useEffect)
  // ==========================================
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user ?? null;
      if (event === 'PASSWORD_RECOVERY') {
        setUser(null);
        setIsResetPasswordMode(true);
      } else {
        setUser(activeUser);
        if (activeUser) {
          if (activeUser.user_metadata?.home_club) setSelectedClub(activeUser.user_metadata.home_club);
          if (activeUser.user_metadata?.avatar_url) setUserAvatarUrl(activeUser.user_metadata.avatar_url);
          syncProfile(activeUser);
          fetchTransformations(activeUser.id);
          fetchFriendRequests(activeUser.id);
        }
      }
    });

    fetchCloudPosts();
    fetchDirectMessages();
    fetchCloudStories();
    fetchRealUsers();

    const presenceInterval = setInterval(() => { if (user) syncProfile(user); }, 30000);
    const universalPollingInterval = setInterval(() => { fetchDirectMessages(); }, 2000);

    const channel = supabase
      .channel('public:direct_messages_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        setAllMessages((prev) => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as DBMessage];
        });
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
      clearInterval(presenceInterval);
      clearInterval(universalPollingInterval);
      stopCameraStream();
    };
  }, [user?.id]);

  useEffect(() => {
    let storyTimer: NodeJS.Timeout | null = null;
    if (activeStoryIndex !== null && !isStoryPaused) {
      storyTimer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) { handleNextStory(); return 0; }
          return prev + 2;
        });
      }, 100);
    }
    return () => { if (storyTimer) clearInterval(storyTimer); };
  }, [activeStoryIndex, isStoryPaused, friendStoriesList.length]);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: cameraTarget === 'profile_avatar' ? 'user' : 'environment' } },
        audio: false
      }).then(stream => {
        currentStream = stream;
        streamRef.current = stream;
        setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      }).catch(err => {
        alert("Erreur caméra : " + err.message);
        setIsCameraActive(false);
      });
    }
    return () => { if (currentStream) currentStream.getTracks().forEach(t => t.stop()); };
  }, [isCameraActive, cameraTarget, facingMode]);

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


  // ==========================================
  // 6. RENDU FINAL (JSX)
  // ==========================================

  if (isResetPasswordMode) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex justify-center"><div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500"><Key className="w-7 h-7" /></div></div>
          <h1 className="text-xl font-black text-center tracking-tight">Définir un nouveau mot de passe</h1>
          <p className="text-xs text-neutral-400 text-center leading-relaxed">Veuillez entrer et confirmer votre nouveau mot de passe sécurisé.</p>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <input type="password" required placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
            <input type="password" required placeholder="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
            <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm flex justify-center">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mettre à jour le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    if (signupSuccessEmail) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-500 mx-auto"><Mail className="w-8 h-8 animate-bounce" /></div>
            <h2 className="text-xl font-black">Vérifie ta boîte mail !</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">Un e-mail a été envoyé à <strong className="text-orange-400">{signupSuccessEmail}</strong>.</p>
            <button onClick={() => { setSignupSuccessEmail(null); setIsSignUp(false); }} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-sm transition">Retour à la connexion</button>
          </div>
        </div>
      );
    }

    if (isForgotPassword) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-center mb-4"><div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500"><Key className="w-7 h-7" /></div></div>
            <h1 className="text-xl font-black text-center tracking-tight mb-1">Mot de passe oublié</h1>
            {forgotPasswordSent ? (
              <div className="space-y-4 text-center mt-4">
                <p className="text-sm text-neutral-300">Un lien de réinitialisation a été envoyé à <strong className="text-orange-400">{email}</strong>.</p>
                <button onClick={() => { setIsForgotPassword(false); setForgotPasswordSent(false); }} className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-xl text-sm transition">Retour à la connexion</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4 mt-6">
                <p className="text-xs text-neutral-400 leading-relaxed">Entre ton e-mail pour recevoir les instructions de réinitialisation.</p>
                <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
                <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm flex justify-center">
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le lien"}
                </button>
                <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-center text-sm text-neutral-400 hover:text-white mt-3 transition">Retour</button>
              </form>
            )}
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
                  <div><input type="text" required placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" /></div>
                  <div><input type="text" required placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div><input type="text" required placeholder="Pseudo" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" /></div>
                  <div>
                    <input 
                      type="text" 
                      required 
                      placeholder="JJ/MM/AAAA" 
                      value={birthDateInput} 
                      onChange={(e) => setBirthDateInput(e.target.value)} 
                      maxLength={10}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" 
                    />
                  </div>
                </div>
                <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500">{TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select>
              </>
            )}
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
            <input type="password" required placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
            
            {!isSignUp && (
              <div className="text-right">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-orange-400 hover:underline">Mot de passe oublié ?</button>
              </div>
            )}

            {isSignUp && (
              <div className="flex items-start gap-2.5 pt-1">
                <input type="checkbox" id="cgu" checked={acceptCGU} onChange={(e) => setAcceptCGU(e.target.checked)} className="mt-1 accent-orange-500 w-4 h-4" />
                <label htmlFor="cgu" className="text-xs text-neutral-400 leading-tight">J'accepte les <button type="button" onClick={() => setIsCGUModalOpen(true)} className="text-orange-400 underline font-semibold">Conditions Générales d'Utilisation</button>.</label>
              </div>
            )}
            <button type="submit" disabled={authLoading} className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm flex justify-center">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-sm text-neutral-400 hover:text-white mt-5 transition">{isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}</button>
        </div>
        {isCGUModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-base font-black text-white">Conditions Générales d'Utilisation (CGU) - FitPulse</h3>
              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <p><strong>1. Objet :</strong> FitPulse est une application de réseau social sportif permettant aux membres de partager leurs entraînements, de se connecter avec des partenaires (Buddies) et d'échanger via messagerie.</p>
                <p><strong>2. Tolérance Zéro & Modération :</strong> Nous appliquons une politique de tolérance zéro stricte concernant les contenus inappropriés (nudité, harcèlement, propos haineux, insultes ou discriminations). Toute publication ou message contraires à ces principes entraînera un bannissement immédiat et définitif de la plateforme.</p>
                <p><strong>3. Respect d'autrui :</strong> Les utilisateurs s'engagent à respecter l'ensemble de la communauté. Tout comportement suspect ou abusif doit être immédiatement signalé via les boutons de signalement dédiés.</p>
                <p><strong>4. Données personnelles :</strong> Vos données de profil et vos photos d'évolution sont gérées de manière sécurisée. Les publications de séances peuvent être configurées en mode privé.</p>
              </div>
              <button onClick={() => { setAcceptCGU(true); setIsCGUModalOpen(false); }} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl text-sm">J'ai lu et j'accepte</button>
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
          <div><h1 className="text-base font-black tracking-tight leading-none">FitPulse</h1><span className="text-xs text-orange-400 font-semibold truncate block max-w-[150px]">{selectedClub}</span></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsNotifModalOpen(true); setLastNotifOpenTime(Date.now()); localStorage.setItem('fitpulse_last_notif', Date.now().toString()); }} className="relative p-1.5 text-neutral-400 hover:text-white transition">
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && <span className="absolute top-1 right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-neutral-950 shadow-md animate-pulse">{unreadNotifsCount}</span>}
          </button>
          <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-500" /><span className="text-sm font-black text-orange-500">{userStreak}</span>
          </div>
        </div>
      </header>

      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-4 shadow-2xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /> Notifications</h3>
              <button onClick={() => setIsNotifModalOpen(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">Aucune notification pour le moment.</div>
            ) : (
              <div className="space-y-2">
                {notifications.slice().reverse().map(n => {
                  const isUnreadNotif = new Date(n.created_at).getTime() > lastNotifOpenTime;
                  return (
                    <div key={n.id} className={`p-3.5 rounded-xl border text-sm ${isUnreadNotif ? 'bg-neutral-900 border-orange-500/40 text-white font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-300 font-normal'}`}>
                      {n.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {isRestTimerActive && (
        <div className="bg-orange-600 text-white px-4 py-2.5 flex items-center justify-between sticky top-[53px] z-30 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-sm font-bold"><Timer className="w-4 h-4 animate-spin" /> Repos : {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}</div>
          <button onClick={() => setIsRestTimerActive(false)} className="text-xs bg-black/30 hover:bg-black/50 px-3 py-1 rounded-lg">Arrêter</button>
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
                  <span className="text-xs font-semibold text-neutral-300">Ta story</span>
                </div>

                {friendStoriesList.map((story, index) => {
                  const isViewed = viewedStoryIds.includes(story.id);
                  const author = registeredUsers.find(u => u.id === story.user_id);
                  const lastSeenTime = author?.last_seen ? new Date(author.last_seen).getTime() : 0;
                  const isOnline = (Date.now() - lastSeenTime) / 60000 < 5;
                  const realAvatar = author?.avatar_url || story.avatar_url;

                  return (
                    <div key={story.id || index} onClick={() => { setActiveStoryIndex(index); setStoryProgress(0); setIsStoryPaused(false); if (!viewedStoryIds.includes(story.id)) setViewedStoryIds([...viewedStoryIds, story.id]); }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full ${isViewed ? 'border-2 border-dashed border-neutral-600 opacity-70' : 'bg-gradient-to-tr from-orange-500 via-pink-500 to-amber-400'} p-[2.5px]`}>
                          <div className="w-full h-full bg-neutral-950 rounded-full p-[2px]"><img src={realAvatar} alt="" className="w-full h-full rounded-full object-cover" /></div>
                        </div>
                        {isOnline && <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-neutral-950 rounded-full" />}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[64px] text-center">{story.username.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {feedLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-sm bg-neutral-900/50 rounded-3xl border border-neutral-800/60 p-6">Aucune publication pour l'instant dans ce club.</div>
            ) : (
              displayedPosts.map((post) => {
                const isAlreadyLikedByMe = user ? (post.liked_by || []).includes(user.id) : false;
                const authorUser = registeredUsers.find(u => u.id === post.user_id) || { id: post.user_id, username: post.username, email: '', age: 25, home_club: post.club_name, avatar_url: post.avatar_url };
                const postRealAvatar = authorUser.avatar_url || post.avatar_url;

                return (
                  <article key={post.id} className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3.5 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingProfileUser(authorUser)}>
                        <img src={postRealAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm leading-snug hover:text-orange-400 transition">{post.username}</h3>
                            {authorUser.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                            {post.is_private && <Lock className="w-3.5 h-3.5 text-neutral-500" />}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-orange-400 font-medium"><MapPin className="w-3.5 h-3.5" />{post.club_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleReportPost(post)} title="Signaler" className="p-2 text-neutral-500 hover:text-orange-400 rounded-lg transition"><Flag className="w-4 h-4" /></button>
                        {post.user_id === user?.id && <button onClick={() => handleDeletePost(post.id)} title="Supprimer" className="p-2 text-neutral-500 hover:text-red-400 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-inner aspect-square flex items-center justify-center">
                      {post.image_url ? (
                        <><img src={post.image_url} alt="" className="w-full h-full object-cover pointer-events-none" /><div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500 animate-pulse" /><span className="text-sm font-black text-white">{post.session_type}</span></div></>
                      ) : (
                        <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 flex flex-col justify-center items-center text-center space-y-2"><Dumbbell className="w-10 h-10 text-orange-500 mb-1" /><span className="text-base font-black text-white">{post.session_type}</span></div>
                      )}
                    </div>
                    {post.caption && <p className="text-sm text-neutral-200 leading-relaxed font-normal">{renderCaptionWithHashtags(post.caption)}</p>}
                    
                    {post.exercises && post.exercises.length > 0 && (
                      <div className="bg-neutral-950/80 rounded-2xl p-4 border border-neutral-800/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Dumbbell className="w-4 h-4 text-orange-500" /> Exercices</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => startRestTimer(60)} className="px-2.5 py-1 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded-lg text-xs">⏱ 60s</button>
                            <button onClick={() => startRestTimer(90)} className="px-2.5 py-1 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded-lg text-xs">⏱ 90s</button>
                          </div>
                        </div>
                        {post.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-900 last:border-none">
                            <span className="font-semibold text-neutral-200">{ex.name}</span>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs text-orange-400 font-bold">{ex.sets} s × {ex.reps} r ({ex.weight} kg)</span>
                              <button onClick={() => setActiveAnatomyExercise(ex.name)} className="p-1.5 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg"><Activity className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-neutral-400 text-sm">
                      <button onClick={() => handleToggleLike(post.id)} className={`flex items-center gap-2 transition ${isAlreadyLikedByMe ? 'text-red-500 font-bold' : 'hover:text-white'}`}><Heart className={`w-4 h-4 ${isAlreadyLikedByMe ? 'fill-red-500 text-red-500' : ''}`} /><span>{post.likes_count}</span></button>
                      <button onClick={() => setActiveCommentPostId(post.id)} className="flex items-center gap-2 hover:text-white transition"><MessageSquare className="w-4 h-4" /><span>{post.comments_count || 0}</span></button>
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

              {/* Bouton Lancer le Tracker en Direct */}
              <div className="bg-gradient-to-r from-orange-600/20 to-amber-500/20 border border-orange-500/40 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5"><PlayCircle className="w-4 h-4 text-orange-500" /> Mode Actif / Live</h4>
                  <p className="text-xs text-neutral-300 mt-0.5">Suivez vos séries en direct avec chrono de repos.</p>
                </div>
                <button type="button" onClick={handleStartLiveWorkout} className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl text-xs shadow-lg hover:opacity-90">
                  Lancer Live 🚀
                </button>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 text-xs text-red-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Rappel CGU : Tolérance zéro pour la nudité ou les photos explicites sur le flux public. Tout contrevenant sera banni.</span>
              </div>

              <div className="space-y-1">
                <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500">
                  {WORKOUT_CHOICES.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <div className="absolute top-2.5 left-2.5 bg-black/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-white/80 text-xs"><Move className="w-3.5 h-3.5" /> Pince/Glisse pour recadrer</div>
                    <button type="button" onClick={() => setPostImagePreview(null)} className="absolute top-2.5 right-2.5 p-1.5 bg-black/80 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                    <ZoomIn className="w-5 h-5 text-neutral-400" />
                    <input type="range" min="1" max="4" step="0.05" value={postImageZoom} onChange={(e) => setPostImageZoom(Number(e.target.value))} className="flex-1 accent-orange-500" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2.5 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-orange-400 uppercase tracking-wider">Exercices réalisés :</label>
                  <button type="button" onClick={handleAddExerciseRow} className="px-3 py-1 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Ajouter</button>
                </div>
                {workoutExercises.map((ex, index) => (
                  <div key={index} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Nom de l'exercice" value={ex.name} onChange={(e) => { const updated = [...workoutExercises]; updated[index].name = e.target.value; setWorkoutExercises(updated); }} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-orange-500" />
                      <button type="button" onClick={() => handleRemoveExerciseRow(index)} className="p-2 text-neutral-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" placeholder="Séries" value={ex.sets} onChange={(e) => { const updated = [...workoutExercises]; updated[index].sets = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2 text-sm text-white text-center focus:border-orange-500" />
                      <input type="number" placeholder="Reps" value={ex.reps} onChange={(e) => { const updated = [...workoutExercises]; updated[index].reps = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2 text-sm text-white text-center focus:border-orange-500" />
                      <input type="number" placeholder="Poids" value={ex.weight} onChange={(e) => { const updated = [...workoutExercises]; updated[index].weight = Number(e.target.value); setWorkoutExercises(updated); }} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2 text-sm text-white text-center focus:border-orange-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-2 border-t border-neutral-800">
                <textarea rows={3} placeholder="Comment s'est passée la séance ?" value={workoutCaption} onChange={(e) => setWorkoutCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" />
                <div className="flex flex-wrap gap-2">
                  {POPULAR_HASHTAGS.map((tag) => (
                    <button key={tag} type="button" onClick={() => handleAddWorkoutHashtag(tag)} className="px-3 py-1.5 bg-neutral-950 hover:bg-orange-600/20 border border-neutral-800 text-neutral-300 text-xs rounded-lg">{tag}</button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isUploading} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Partager ma séance'}
              </button>
            </div>
          </form>
        )}

        {currentTab === 'live_tracker' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500 animate-pulse" /> Tracker en Direct
                  </h2>
                  <span className="text-xs text-orange-400 font-mono font-bold">
                    ⏱️ {Math.floor(liveElapsedSeconds / 60)}:{(liveElapsedSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <button onClick={() => setIsLiveActive(false)} className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition">
                  Quitter le Live
                </button>
              </div>

              <input 
                type="text" 
                value={liveWorkoutName} 
                onChange={(e) => setLiveWorkoutName(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-orange-500" 
                placeholder="Nom de la séance..."
              />

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">Ajouter un exercice :</span>
                <div className="flex gap-2">
                  <select 
                    value={selectedExToAdd} 
                    onChange={(e) => setSelectedExToAdd(e.target.value)} 
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    {EXERCISES_DATABASE.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                  </select>
                  <button onClick={handleAddLiveExercise} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {liveExercises.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">Aucun exercice dans cette séance en direct. Ajoute-en un ci-dessus !</div>
                ) : (
                  liveExercises.map((ex, exIdx) => (
                    <div key={ex.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{ex.name}</span>
                        <button onClick={() => handleAddLiveSet(ex.id)} className="text-xs text-orange-400 hover:underline flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Série
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-neutral-500 uppercase px-1">
                          <span className="col-span-2 text-center">Série</span>
                          <span className="col-span-4 text-center">Poids (kg)</span>
                          <span className="col-span-4 text-center">Reps</span>
                          <span className="col-span-2 text-center">Valider</span>
                        </div>
                        {ex.sets.map((set, sIdx) => (
                          <div key={sIdx} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border ${set.completed ? 'bg-green-950/20 border-green-500/40' : 'bg-neutral-900 border-neutral-800'}`}>
                            <span className="col-span-2 text-center font-bold text-xs text-neutral-300">#{set.setNumber}</span>
                            <div className="col-span-4">
                              <input 
                                type="number" 
                                value={set.weight} 
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setLiveExercises(liveExercises.map(item => item.id === ex.id ? { ...item, sets: item.sets.map((s, i) => i === sIdx ? { ...s, weight: val } : s) } : item));
                                }}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 text-center text-xs text-white" 
                              />
                            </div>
                            <div className="col-span-4">
                              <input 
                                type="number" 
                                value={set.reps} 
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setLiveExercises(liveExercises.map(item => item.id === ex.id ? { ...item, sets: item.sets.map((s, i) => i === sIdx ? { ...s, reps: val } : s) } : item));
                                }}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 text-center text-xs text-white" 
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <button 
                                onClick={() => handleToggleLiveSet(ex.id, sIdx)} 
                                className={`p-2 rounded-xl transition ${set.completed ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {liveExercises.length > 0 && (
                <button onClick={handleFinishLiveWorkout} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-sm mt-4">
                  <CheckCircle className="w-5 h-5" /> Terminer & Publier ma séance
                </button>
              )}
            </div>
          </div>
        )}

        {currentTab === 'fitbot' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
              <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">FitBot IA <Sparkles className="w-3.5 h-3.5 text-orange-500" /></h3>
                    <span className="text-[10px] text-green-500 font-semibold">● En ligne 24/7 (Voie vocale dispo 🎤)</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {aiChatMessages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.sender === 'user' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isListening && (
                  <div className="flex items-start">
                    <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-2xl text-xs animate-pulse flex items-center gap-2">
                      <Mic className="w-4 h-4 animate-bounce" /> J'écoute ta voix... Parle maintenant !
                    </div>
                  </div>
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              <form onSubmit={(e) => handleSendAIChat(e)} className="p-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2.5">
                <button 
                  type="button" 
                  onClick={toggleVoiceDictation} 
                  title="Parler à FitBot" 
                  className={`p-3 rounded-xl transition ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <input 
                  type="text" 
                  placeholder={isListening ? "Parlez..." : "Pose ta question à FitBot..."} 
                  value={aiInputText} 
                  onChange={handleInputChange} 
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" 
                />
                <button type="submit" className="p-3 bg-orange-600 text-white rounded-xl shadow-lg"><SendHorizontal className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
        )}

        {currentTab === 'exercises' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2"><BookOpen className="w-6 h-6 text-orange-500" /> Guide des Exercices</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-orange-500" />
                <input type="text" placeholder="Rechercher un exercice..." value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:border-orange-500" />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras'].map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategoryFilter(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedCategoryFilter === cat ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>{cat}</button>
                ))}
              </div>
              <div className="space-y-3 pt-1">
                {EXERCISES_DATABASE.filter((ex) => (selectedCategoryFilter === 'Tous' || ex.category === selectedCategoryFilter) && (ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || ex.targetMuscles.toLowerCase().includes(exerciseSearch.toLowerCase()))).map((ex) => (
                  <div key={ex.id} onClick={() => setSelectedExerciseDetail(ex)} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 hover:border-orange-500/50 cursor-pointer flex items-center justify-between transition">
                    <div className="flex items-center gap-4">
                      <img src={ex.image_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-neutral-800 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-white">{ex.name}</span><span className="text-xs bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded-md border border-orange-500/20">{ex.category}</span></div>
                        <p className="text-xs text-neutral-400">🎯 {ex.targetMuscles}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'buddy' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="text-base font-black tracking-tight">Réseau & Athlètes</h2><span className="text-xs text-orange-400 font-semibold">{selectedClub}</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMatchModalOpen(true)} className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-90"><Sparkles className="w-4 h-4" /> Match</button>
                  <button onClick={() => setFilterWomenOnly(!filterWomenOnly)} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${filterWomenOnly ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white ring-2 ring-pink-400' : 'bg-neutral-950 text-neutral-400 border border-neutral-800'}`}><span>🚺</span> {filterWomenOnly && '✓'}</button>
                </div>
              </div>
              
              <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
                <button onClick={() => setBuddyTabSubMode('discover')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'discover' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Découvrir</button>
                <button onClick={() => setBuddyTabSubMode('my_friends')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'my_friends' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Mes Amis ({myFriendsList.length})</button>
                <button onClick={() => setBuddyTabSubMode('requests')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition relative ${buddyTabSubMode === 'requests' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Demandes {incomingRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{incomingRequests.length}</span>}</button>
              </div>

              {buddyTabSubMode === 'requests' ? (
                <div className="space-y-3 pt-1">
                  {incomingRequests.length === 0 ? <div className="text-center py-8 text-neutral-500 text-sm">Aucune demande en attente.</div> : incomingRequests.map((req) => {
                      const senderUser = registeredUsers.find(u => u.id === req.sender_id) || { username: 'Athlète', home_club: selectedClub, avatar_url: '' };
                      return (
                        <div key={req.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={senderUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-700" />
                            <div><h3 className="font-bold text-sm text-white">{senderUser.username}</h3></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleAcceptFriendRequest(req.id)} className="px-3.5 py-2 bg-green-600 text-white rounded-xl text-xs font-bold">Accepter</button>
                            <button onClick={() => handleRejectFriendRequest(req.id)} className="p-2.5 bg-neutral-900 border border-neutral-800 text-red-400 rounded-xl"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      );
                  })}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {[{ label: 'Tous', value: 'all' }, { label: '💪 Prise de masse', value: 'masse' }, { label: '🔥 Cardio & HIIT', value: 'cardio' }, { label: '🧘 Remise en forme', value: 'remise' }].map((goal) => (
                        <button key={goal.value} onClick={() => setSelectedGoalFilter(goal.value)} className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedGoalFilter === goal.value ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>{goal.label}</button>
                      ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {[{ label: 'Tous les âges', value: 'all' }, { label: '18 - 25 ans', value: '18 - 25 ans' }, { label: '26 - 35 ans', value: '26 - 35 ans' }, { label: '36 - 45 ans', value: '36 - 45 ans' }, { label: '46+ ans', value: '46+ ans' }].map((group) => (
                        <button key={group.value} onClick={() => setSelectedAgeGroupFilter(group.value)} className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedAgeGroupFilter === group.value ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>{group.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <Search className="absolute left-3.5 top-4.5 w-4 h-4 text-orange-500" />
                    <input type="text" placeholder="Rechercher par pseudo..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:border-orange-500" />
                  </div>

                  <div className="space-y-3 pt-1">
                    {filteredBuddies.length === 0 ? <div className="text-center py-8 text-neutral-500 text-sm">Aucun autre athlète trouvé.</div> : filteredBuddies.map((realUser) => {
                        const isFriend = acceptedFriendIds.includes(realUser.id);
                        const existingReq = friendRequests.find(r => (r.sender_id === user?.id && r.receiver_id === realUser.id) || (r.sender_id === realUser.id && r.receiver_id === user?.id));
                        const isPending = existingReq && existingReq.status === 'pending';
                        
                        const pushUpTime = sentPushUps[realUser.id];
                        const isPushUpSent = pushUpTime && (Date.now() - pushUpTime < 24 * 3600 * 1000);

                        const lastSeenTime = realUser.last_seen ? new Date(realUser.last_seen).getTime() : 0;
                        const diffMinutes = (Date.now() - lastSeenTime) / 60000;
                        
                        let dotColor = 'bg-red-500';
                        let statusText = 'Absent';
                        if (diffMinutes < 5) { dotColor = 'bg-green-500'; statusText = 'En ligne'; }
                        else if (diffMinutes < 30) { dotColor = 'bg-amber-500'; statusText = 'Récemment actif'; }

                        return (
                          <div key={realUser.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setViewingProfileUser(realUser)}>
                              <div className="relative flex-shrink-0">
                                <img src={realUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${dotColor} border-2 border-neutral-950 rounded-full`} title={statusText} />
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-white flex items-center gap-1.5 hover:text-orange-400 transition">
                                  {realUser.username} {realUser.gender === 'F' && '🚺'}
                                  {realUser.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                                </h3>
                                <span className="text-xs text-orange-400 font-medium block mt-0.5">🎯 {realUser.goal || 'Sportif'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isFriend ? (
                                isPushUpSent ? (
                                  <button disabled className="px-3 py-2 bg-green-600/30 border border-green-500/50 text-green-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed">
                                    <Check className="w-4 h-4" /> Envoyé
                                  </button>
                                ) : (
                                  <button onClick={() => setInviteModalTarget(realUser)} className="px-3 py-2 bg-orange-600/20 border border-orange-500/50 hover:bg-orange-600 text-orange-400 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                                    <Zap className="w-4 h-4" /> Push Up
                                  </button>
                                )
                              ) : isPending ? (
                                <button disabled className="px-3.5 py-2 bg-neutral-900 text-neutral-400 rounded-xl text-xs font-medium">En attente</button>
                              ) : (
                                <button onClick={() => handleSendFriendRequest(realUser.id)} className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Ajouter</button>
                              )}
                              <button onClick={() => { handleSelectBuddyChat(realUser); setCurrentTab('chat'); }} className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-orange-500 text-neutral-200 rounded-xl"><MessageCircle className="w-4 h-4" /></button>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </>
              )}
            </div>

            {suggestedBuddiesList.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
                <h3 className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-500" /> Personnes que vous connaissez peut-être
                </h3>
                <div className="space-y-2.5 pt-1">
                  {suggestedBuddiesList.slice(0, 3).map((sUser) => (
                    <div key={sUser.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingProfileUser(sUser)}>
                        <img src={sUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                        <div>
                          <h4 className="font-bold text-xs text-white hover:text-orange-400 transition flex items-center gap-1">
                            {sUser.username} {sUser.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />}
                          </h4>
                          <span className="text-[10px] text-neutral-400">{sUser.home_club}</span>
                        </div>
                      </div>
                      <button onClick={() => handleSendFriendRequest(sUser.id)} className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1">
                        <UserPlus className="w-3.5 h-3.5" /> Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'chat' && (
          <div className="space-y-4">
            {selectedBuddyChat ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
                <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedBuddyChat(null)} className="p-1.5 text-neutral-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                    <h3 className="font-bold text-sm text-white cursor-pointer hover:text-orange-400 flex items-center gap-1.5" onClick={() => setViewingProfileUser(selectedBuddyChat)}>
                      {selectedBuddyChat.username} {selectedBuddyChat.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleReportConversation(selectedBuddyChat.username)} title="Signaler la conversation" className="p-2 text-amber-500 hover:text-amber-400 bg-amber-500/10 rounded-xl transition"><Flag className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteConversationForBuddy(selectedBuddyChat.id, selectedBuddyChat.username)} title="Supprimer" className="p-2 text-neutral-500 hover:text-red-400 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {currentChatMessages.map((msg, index, arr) => {
                    const isMine = msg.sender_id === user?.id;
                    const friendLastRead = lastReadTimestamps[selectedBuddyChat.id] || 0;
                    
                    const isLastMyMessage = isMine && arr.slice(index + 1).every(m => m.sender_id === user?.id);
                    const isReadByFriend = isLastMyMessage && new Date(msg.created_at).getTime() <= friendLastRead;

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isMine ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                          {msg.text}
                        </div>
                        {isLastMyMessage && (
                          <span className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                            {isReadByFriend ? (
                              <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                                <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> lu
                              </span>
                            ) : (
                              <span>envoyé</span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Animation des trois petits points si le correspondant écrit */}
                  {isOtherUserTyping && (
                    <div className="flex items-start">
                      <div className="bg-neutral-800 px-4 py-3 rounded-2xl flex items-center gap-1.5 w-16">
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
                {selectedBuddyChat.id !== 'system-bot' && (
                  <div className="p-3.5 bg-neutral-950 border-t border-neutral-800">
                    {isMessageLimitReached ? (
                      <div className="text-center py-2 text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        🔒 Limite de 3 messages atteinte. En attente d'acceptation.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="text" 
                          placeholder="Écrire un message..." 
                          value={currentMessageInput} 
                          onChange={handleInputChange} 
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" 
                        />
                        <button onClick={() => handleSendMessage()} className="p-3 bg-orange-600 text-white rounded-xl"><SendHorizontal className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black tracking-tight">Messagerie</h2>
                    <span className="text-xs text-neutral-500">Conversations & Alertes 💬</span>
                  </div>
                  {activeChatUsers.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 text-sm">Aucun ami dans ton réseau. Va dans l'onglet **Buddy** pour ajouter des athlètes !</div>
                  ) : (
                    activeChatUsers.map((friend) => {
                      const lastSeenTime = friend.last_seen ? new Date(friend.last_seen).getTime() : 0;
                      const isOnline = (Date.now() - lastSeenTime) / 60000 < 5;

                      const friendMessages = allMessages.filter(
                        m => (m.sender_id === user?.id && m.receiver_id === friend.id) || (m.sender_id === friend.id && m.receiver_id === user?.id)
                      );
                      const lastMsg = friendMessages[friendMessages.length - 1];
                      
                      const lastRead = lastReadTimestamps[friend.id] || 0;
                      const unreadCountForFriend = friendMessages.filter(m => m.sender_id !== user?.id && new Date(m.created_at).getTime() > lastRead).length;
                      const isUnread = unreadCountForFriend > 0;

                      return (
                        <div 
                          key={friend.id} 
                          onClick={() => handleSelectBuddyChat(friend)} 
                          className="p-4 bg-neutral-950 hover:bg-neutral-900/80 rounded-2xl border border-neutral-800 flex items-center justify-between cursor-pointer transition"
                        >
                          <div className="flex items-center gap-3.5 overflow-hidden">
                            <div className="relative flex-shrink-0">
                              <img src={friend.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                              {isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-neutral-950 rounded-full" />}
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <h3 className={`text-sm truncate ${isUnread ? 'font-black text-white' : 'font-bold text-neutral-300'}`}>
                                  {friend.username}
                                </h3>
                                {friend.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20 flex-shrink-0" />}
                              </div>
                              <p className={`text-xs truncate mt-0.5 ${isUnread ? 'font-bold text-blue-400' : 'text-neutral-500 font-normal'}`}>
                                {lastMsg ? (lastMsg.sender_id === user?.id ? `Vous : ${lastMsg.text}` : lastMsg.text) : 'Aucun message'}
                              </p>
                            </div>
                          </div>
                          {isUnread && (
                            <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 shadow-md animate-pulse">
                              {unreadCountForFriend}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'calculator' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-500" /> Calculateur de charge (disques par côté)
              </h2>
              <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Poids total cible (kg) :</label>
                  <input 
                    type="number" 
                    value={targetWeight} 
                    onChange={(e) => setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500" 
                    placeholder="Ex: 100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Poids de la barre (kg) :</label>
                  <select 
                    value={barbellWeight} 
                    onChange={(e) => setBarbellWeight(Number(e.target.value))} 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500"
                  >
                    <option value={20}>Barre olympique standard (20 kg)</option>
                    <option value={15}>Barre féminine / technique (15 kg)</option>
                    <option value={10}>Petite barre droite (10 kg)</option>
                    <option value={0}>Sans barre (0 kg)</option>
                  </select>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Disques à charger de chaque côté :</h3>
                {plateBreakdown.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">Entrez un poids cible supérieur à la barre.</p>
                ) : (
                  <div className="space-y-2">
                    {plateBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-sm">
                        <span className="font-bold text-white">Disque de {item.weight} kg</span>
                        <span className="font-mono font-black text-orange-400">× {item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Mes Records Personnels (PRs)</h2>
              <form onSubmit={handleAddPR} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-orange-400 block">Ajouter un record</span>
                <div className="grid grid-cols-3 gap-2.5">
                  <input type="text" placeholder="Exercice" value={newPrExercise} onChange={(e) => setNewPrExercise(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500" />
                  <input type="number" placeholder="Poids (kg)" value={newPrWeight} onChange={(e) => setNewPrWeight(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500" />
                  <input type="number" placeholder="Reps" value={newPrReps} onChange={(e) => setNewPrReps(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition">Enregistrer</button>
              </form>
              <div className="space-y-2.5 pt-1">
                {personalRecords.map((pr, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800">
                    <div><span className="text-sm font-bold text-white block">{pr.exercise}</span><span className="text-xs text-neutral-400">Atteint le {pr.date}</span></div>
                    <div className="flex items-center gap-2.5"><span className="text-sm font-black font-mono text-orange-400">{pr.weight} kg ({pr.reps} reps)</span><span>🏆</span></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500" /> Planificateur</h2>
              <div className="space-y-3">
                {weeklyPlan.map((plan, i) => (
                  <div key={i} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400">{plan.day}</span>
                      {editingDayIndex === i ? (
                        <button onClick={() => handleSaveWeeklyPlanEdit(i)} className="px-3.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"><Check className="w-4 h-4" /> OK</button>
                      ) : (
                        <button onClick={() => { setEditingDayIndex(i); setEditFocus(plan.focus); setEditExercisesText(plan.exercisesText); }} className="p-1.5 text-neutral-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                      )}
                    </div>
                    {editingDayIndex === i ? (
                      <div className="space-y-3 pt-1">
                        <select value={editFocus} onChange={(e) => setEditFocus(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white">
                          {WORKOUT_CHOICES.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
                        </select>
                        <input type="text" placeholder="ex: Développé couché..." value={editExercisesText} onChange={(e) => setEditExercisesText(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                      </div>
                    ) : (
                      <><span className="text-xs bg-neutral-900 px-3 py-1.5 rounded-lg text-neutral-200 font-medium inline-block">{plan.focus}</span><p className="text-xs text-neutral-400">Exercices : {plan.exercisesText}</p></>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto group cursor-pointer" onClick={() => profileAvatarInputRef.current?.click()}>
                <img src={userAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-orange-500 shadow-xl" />
                <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition"><Camera className="w-6 h-6 text-white" /></div>
              </div>
              <input type="file" accept="image/*" ref={profileAvatarInputRef} onChange={(e) => handleImageSelect(e, 'profile_avatar')} className="hidden" />
              <div>
                <h2 className="font-extrabold text-lg text-white flex items-center justify-center gap-1.5">
                  {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  {currentUserProfile?.is_verified && <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
                </h2>
              </div>
            </div>

            {isAdmin && (
              <div className="bg-neutral-900 border border-orange-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
                <h3 className="text-sm font-black text-orange-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Gestion des Certifications (Admin)
                </h3>
                <p className="text-xs text-neutral-400">Certifiez les comptes des coachs ou partenaires en un clic.</p>
                <div className="space-y-2 pt-1 max-h-60 overflow-y-auto">
                  {registeredUsers.map(u => (
                    <div key={u.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-white block flex items-center gap-1">
                            {u.username} {u.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />}
                          </span>
                          <span className="text-[10px] text-neutral-400">{u.home_club}</span>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          const newStatus = !u.is_verified;
                          await supabase.from('profiles').update({ is_verified: newStatus }).eq('id', u.id);
                          setRegisteredUsers(prev => prev.map(item => item.id === u.id ? { ...item, is_verified: newStatus } : item));
                          alert(`Statut de certification mis à jour pour ${u.username}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${u.is_verified ? 'bg-orange-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
                      >
                        {u.is_verified ? 'Certifié ✓' : 'Certifier'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2"><ImageIcon className="w-4 h-4 text-orange-500" /> Carnet Avant/Après</h3>
              </div>
              <form onSubmit={handleAddTransformation} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => startCameraHandler('trans_before')} className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center justify-center gap-2"><Camera className="w-4 h-4 text-orange-500" /> {newTransBefore ? '(✓)' : 'Avant'}</button>
                  <button type="button" onClick={() => startCameraHandler('trans_after')} className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center justify-center gap-2"><Camera className="w-4 h-4 text-orange-500" /> {newTransAfter ? '(✓)' : 'Après'}</button>
                </div>
                <input type="file" accept="image/*" ref={beforeFileInputRef} onChange={(e) => handleImageSelect(e, 'trans_before')} className="hidden" />
                <input type="file" accept="image/*" ref={afterFileInputRef} onChange={(e) => handleImageSelect(e, 'trans_after')} className="hidden" />
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="number" step="0.1" placeholder="Poids (kg)" value={newTransWeight} onChange={(e) => setNewTransWeight(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                  <input type="text" placeholder="Note" value={newTransNote} onChange={(e) => setNewTransNote(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                </div>
                <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2"><EyeOff className="w-4 h-4 text-orange-500" /><span className="text-xs font-semibold text-neutral-200">Privé (que moi)</span></div>
                  <button type="button" onClick={() => setNewTransIsPrivate(!newTransIsPrivate)} className={`relative w-11 h-6 rounded-full transition-colors ${newTransIsPrivate ? 'bg-orange-500' : 'bg-neutral-800'}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${newTransIsPrivate ? 'translate-x-5.5' : 'translate-x-0.5'}`} /></button>
                </div>
                <button type="submit" className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-xl text-sm">Enregistrer</button>
              </form>
              <div className="space-y-3.5 pt-1">
                {transformations.length === 0 ? <div className="text-center py-6 text-neutral-500 text-sm">Aucune photo enregistrée.</div> : transformations.map((item) => (
                  <div key={item.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between text-xs"><span className="font-bold text-orange-400">📅 {item.date} — {item.weight} kg</span></div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-800"><img src={item.before_url} alt="" className="w-full h-full object-cover" /><span className="absolute bottom-1.5 left-1.5 bg-black/70 text-[10px] text-white px-2 py-0.5 rounded">Avant</span></div>
                      <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-800"><img src={item.after_url} alt="" className="w-full h-full object-cover" /><span className="absolute bottom-1.5 left-1.5 bg-black/70 text-[10px] text-white px-2 py-0.5 rounded">Après</span></div>
                    </div>
                    <button onClick={() => handleShareTransformationToFeed(item)} className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:border-orange-500 text-neutral-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"><Share2 className="w-4 h-4" /> Partager ce bilan</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2"><Key className="w-4 h-4 text-orange-500" /> Sécurité & Mot de passe</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!password || password !== confirmPassword) { alert("Les mots de passe ne correspondent pas ou sont vides."); return; }
                const { error } = await supabase.auth.updateUser({ password });
                if (error) alert("Erreur : " + error.message);
                else { alert("🔒 Mot de passe mis à jour avec succès !"); setPassword(''); setConfirmPassword(''); }
              }} className="space-y-3">
                <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500" />
                <input type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500" />
                <button type="submit" className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition">Changer mon mot de passe</button>
              </form>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <div><span className="font-bold text-sm text-white block">Compte Privé</span><p className="text-xs text-neutral-400 mt-1">Séances visibles uniquement par tes Buddies.</p></div>
                <button onClick={() => setIsPrivateMode(!isPrivateMode)} className={`relative w-12 h-6 rounded-full transition-colors ${isPrivateMode ? 'bg-orange-500' : 'bg-neutral-800'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPrivateMode ? 'translate-x-7' : 'translate-x-1'}`} /></button>
              </div>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-red-400 rounded-3xl text-sm font-bold transition border border-neutral-800 flex items-center justify-center gap-2"><LogOut className="w-5 h-5" /> Déconnexion</button>
          </div>
        )}
      </main>

      {viewingProfileUser && (() => {
        const isFriend = acceptedFriendIds.includes(viewingProfileUser.id);
        const existingReq = friendRequests.find(r => (r.sender_id === user?.id && r.receiver_id === viewingProfileUser.id) || (r.sender_id === viewingProfileUser.id && r.receiver_id === user?.id));
        const isPending = existingReq && existingReq.status === 'pending';
        const ageRange = getAgeRangeLabel(viewingProfileUser.birth_date);

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">
              <button onClick={() => setViewingProfileUser(null)} className="absolute top-4 right-4 p-2 bg-neutral-800 text-white rounded-full"><X className="w-4 h-4" /></button>
              
              <div className="text-center space-y-3 pt-2">
                <img src={viewingProfileUser.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-orange-500 mx-auto shadow-xl" />
                <div>
                  <h3 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
                    {viewingProfileUser.username} {viewingProfileUser.gender === 'F' && '🚺'}
                    {viewingProfileUser.is_verified && <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
                  </h3>
                  <span className="text-xs text-orange-400 font-semibold block mt-0.5"><MapPin className="w-3.5 h-3.5 inline mr-1" />{viewingProfileUser.home_club}</span>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Objectif :</span><strong className="text-white">{viewingProfileUser.goal || 'Sportif'}</strong></div>
                <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Créneau préféré :</span><strong className="text-white">{viewingProfileUser.preferred_time || 'Flexible'}</strong></div>
                <div className="flex justify-between py-1"><span className="text-neutral-400">Tranche d'âge :</span><strong className="text-white">{ageRange}</strong></div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button onClick={() => { const target = viewingProfileUser; setViewingProfileUser(null); handleSelectBuddyChat(target); setCurrentTab('chat'); }} className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"><MessageCircle className="w-4 h-4" /> Message</button>
                
                {!isFriend && !isPending && viewingProfileUser.id !== user?.id && (
                  <button onClick={() => handleSendFriendRequest(viewingProfileUser.id)} className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"><UserPlus className="w-4 h-4 text-orange-400" /> Demander en ami</button>
                )}
                {isPending && (
                  <button disabled className="px-4 py-3 bg-neutral-800 text-neutral-400 rounded-xl text-xs">Demande en attente</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {activeViewingStory && (
        <div 
          className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none"
          onMouseDown={() => setIsStoryPaused(true)}
          onMouseUp={() => setIsStoryPaused(false)}
          onTouchStart={() => setIsStoryPaused(true)}
          onTouchEnd={() => setIsStoryPaused(false)}
        >
          <div className="w-full flex gap-1.5 pt-2 z-10">
            <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${storyProgress}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 z-10">
            <div className="flex items-center gap-2.5">
              <img src={activeViewingStory.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-white/20" />
              <div>
                <h4 className="font-bold text-xs text-white leading-none">{activeViewingStory.username}</h4>
                <span className="text-[10px] text-white/70">{activeViewingStory.club_name}</span>
              </div>
            </div>
            <button onClick={() => { setActiveStoryIndex(null); setIsStoryPaused(false); }} className="p-2 bg-black/40 text-white rounded-full"><X className="w-5 h-5" /></button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src={activeViewingStory.image_url} alt="" className="w-full h-full object-cover" />
            {activeViewingStory.caption && (
              <div className="absolute bottom-28 left-4 right-4 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl text-center border border-white/10 pointer-events-auto">
                <p className="text-sm text-white font-medium">{activeViewingStory.caption}</p>
              </div>
            )}
          </div>

          <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-0" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }} />
          <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-0" onClick={(e) => { e.stopPropagation(); handleNextStory(); }} />

          <div className="space-y-2.5 z-10 pb-4">
            <div className="flex justify-center gap-3 bg-black/50 backdrop-blur-md py-2 px-4 rounded-full border border-white/10 w-fit mx-auto">
              {['❤️', '🔥', '👏', '😮', '💪', '🏆'].map((emoji) => (
                <button key={emoji} onClick={(e) => { e.stopPropagation(); handleQuickEmojiReaction(emoji); }} className="text-xl hover:scale-125 transition transform">{emoji}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <form onSubmit={handleSendStoryComment} className="flex-1 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                <input type="text" placeholder={`Répondre à ${activeViewingStory.username}...`} value={storyCommentInput} onChange={(e) => setStoryCommentInput(e.target.value)} className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-white/60" />
                <button type="submit" className="text-orange-400"><SendHorizontal className="w-4 h-4" /></button>
              </form>
              <button onClick={() => handleToggleStoryLike(activeViewingStory.id)} className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-white transition">
                <Heart className={`w-5 h-5 ${likedStories[activeViewingStory.id] ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-500" /> Trouver un partenaire (Match)</h3>
              <button onClick={() => setIsMatchModalOpen(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Objectif :</label>
                <select value={matchGoal} onChange={(e) => setMatchGoal(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500">
                  <option value="Tous">Tous les objectifs</option>
                  <option value="masse">Prise de masse & Force</option>
                  <option value="cardio">Cardio & HIIT</option>
                  <option value="remise">Remise en forme</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Horaire recherché :</label>
                <select value={matchTime} onChange={(e) => setMatchTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500">
                  <option value="Tous">Tous les horaires</option>
                  {TIME_SLOTS.map((slot) => <option key={slot} value={slot.split(' ')[1]}>{slot}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-400">Filtrer uniquement entre femmes :</span>
                <button
                  onClick={() => setMatchWomenOnly(!matchWomenOnly)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${matchWomenOnly ? 'bg-pink-600 text-white' : 'bg-neutral-950 text-neutral-400 border border-neutral-800'}`}
                >
                  {matchWomenOnly ? 'Activé (🚺)' : 'Désactivé'}
                </button>
              </div>
            </div>
            <div className="space-y-2.5 pt-2 border-t border-neutral-800 max-h-60 overflow-y-auto">
              <span className="text-xs font-bold text-orange-400 block mb-1">Résultats ({matchedBuddiesList.length}) :</span>
              {matchedBuddiesList.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-sm">Aucun athlète ne correspond à cet horaire/objectif.</div>
              ) : (
                matchedBuddiesList.map((buddy) => (
                  <div key={buddy.id} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={buddy.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-700" />
                      <div>
                        <h4 className="font-bold text-sm text-white">{buddy.username} {buddy.gender === 'F' && '🚺'}</h4>
                        <span className="text-xs text-orange-400 block">🎯 {buddy.goal || 'Sportif'}</span>
                        <span className="text-[11px] text-amber-400 font-semibold">🕒 {buddy.preferred_time || 'Flexible'}</span>
                      </div>
                    </div>
                    <button onClick={() => { setIsMatchModalOpen(false); handleSelectBuddyChat(buddy); setCurrentTab('chat'); }} className="px-3.5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> Contacter</button>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setIsMatchModalOpen(false)} className="w-full py-3 bg-neutral-950 text-white font-bold rounded-xl text-sm border border-neutral-800">Fermer</button>
          </div>
        </div>
      )}

      {inviteModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Lancer un Push Up !</h3>
              <button onClick={() => setInviteModalTarget(null)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-neutral-300">Invite <strong>{inviteModalTarget.username}</strong> à s'entraîner.</p>
              <div>
                <select value={inviteType} onChange={(e) => setInviteType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-orange-500">
                  <option value="Jambes (Leg Day)">Jambes (Leg Day)</option>
                  <option value="Push (Pecs, Épaules, Triceps)">Push (Pecs, Épaules)</option>
                  <option value="Pull (Dos, Biceps)">Pull (Dos, Biceps)</option>
                  <option value="Cardio & HIIT">Cardio & HIIT</option>
                  <option value="Full Body">Full Body</option>
                </select>
              </div>
            </div>
            <button onClick={handleSendInvite} className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Envoyer</button>
          </div>
        </div>
      )}

      {selectedExerciseDetail && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-end sm:justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full mx-auto p-5 space-y-4 max-h-[88vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg font-bold">{selectedExerciseDetail.category}</span>
                <h3 className="text-sm font-black text-white">{selectedExerciseDetail.name}</h3>
              </div>
              <button onClick={() => setSelectedExerciseDetail(null)} className="p-2 bg-neutral-800 text-white rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-48 w-full relative">
              <img src={selectedExerciseDetail.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-neutral-300">
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1.5">
                <span className="font-bold text-orange-400 uppercase text-xs block">Description détaillée</span>
                <p>{selectedExerciseDetail.detailedDescription}</p>
              </div>
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1.5">
                <span className="font-bold text-orange-400 uppercase text-xs block">Équipement requis</span>
                <p className="text-neutral-200">{selectedExerciseDetail.equipment}</p>
              </div>
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1.5">
                <span className="font-bold text-orange-400 uppercase text-xs block">Exécution du mouvement</span>
                <p className="text-neutral-200">{selectedExerciseDetail.execution}</p>
              </div>
              <div className="bg-orange-950/20 p-4 rounded-2xl border border-orange-500/20 space-y-1.5">
                <span className="font-bold text-orange-400 uppercase text-xs block">Conseil du Coach</span>
                <p className="text-neutral-200 italic">{selectedExerciseDetail.tips}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center p-4">
          <div className="w-full flex items-center justify-between z-10 pt-2">
            <span className="text-xs font-bold text-white bg-black/50 px-3.5 py-1.5 rounded-full border border-neutral-800">Caméra</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={switchCameraFacing} className="p-3 bg-black/60 rounded-full text-white"><SwitchCamera className="w-5 h-5" /></button>
              <button type="button" onClick={stopCameraStream} className="p-3 bg-black/60 rounded-full text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="relative w-full flex-1 max-w-sm my-auto rounded-3xl overflow-hidden bg-neutral-950 flex items-center justify-center border border-neutral-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="w-full flex justify-center items-center pb-6 z-10">
            <button type="button" onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1"><div className="w-full h-full bg-orange-500 rounded-full shadow-lg" /></button>
          </div>
        </div>
      )}

      {isCreatingStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-500" /> Ajouter à ma story (24h)</h3>
              <button onClick={() => setIsCreatingStory(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePublishStory} className="space-y-4">
              <input type="file" accept="image/*" ref={storyFileInputRef} onChange={handleImageSelect} className="hidden" />
              {storyImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 h-56 flex items-center justify-center">
                  <img src={storyImagePreview} alt="" className="max-h-full object-contain" />
                  <button type="button" onClick={() => setStoryImagePreview(null)} className="absolute top-2.5 right-2.5 p-1.5 bg-black/80 text-white rounded-full"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => startCameraHandler('story')} className="py-8 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition">
                    <Camera className="w-6 h-6 text-orange-500" /><span className="text-xs font-semibold">Prendre photo</span>
                  </button>
                  <button type="button" onClick={() => storyFileInputRef.current?.click()} className="py-8 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition">
                    <FolderOpen className="w-6 h-6 text-neutral-400" /><span className="text-xs font-semibold">Album tel</span>
                  </button>
                </div>
              )}
              <div className="space-y-2">
                <input type="text" placeholder="Légende de la story..." value={storyCaption} onChange={(e) => setStoryCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-orange-500" />
              </div>
              <button type="submit" disabled={storyUploading || !storyImageFile} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
                {storyUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Partager ma story"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeCommentPostId && activePostForComments && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-neutral-900 border-t border-neutral-800 rounded-t-3xl h-[70vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-orange-500" /> Commentaires ({activePostForComments.comments_count || 0})</h3>
              <button onClick={() => setActiveCommentPostId(null)} className="p-2 bg-neutral-800 text-white rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(!activePostForComments.comments || activePostForComments.comments.length === 0) ? (
                <div className="text-center text-neutral-500 text-sm py-8">Aucun commentaire. Sois le premier à réagir !</div>
              ) : (
                activePostForComments.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <img src={c.avatar_url} className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
                    <div className="flex-1 bg-neutral-950 p-3.5 rounded-2xl rounded-tl-none border border-neutral-800">
                      <span className="font-bold text-xs text-white block mb-1">{c.username}</span>
                      <p className="text-sm text-neutral-300 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddPostComment} className="p-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2.5">
              <input type="text" placeholder="Ajouter un commentaire..." value={postCommentInput} onChange={e => setPostCommentInput(e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500" />
              <button type="submit" disabled={!postCommentInput.trim()} className="p-3 bg-orange-600 disabled:bg-neutral-800 text-white rounded-xl"><SendHorizontal className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/80 px-2 py-2 flex justify-around items-center">
        <button onClick={() => handleTabChange('feed')} className={`flex flex-col items-center gap-1 ${currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Home className="w-5 h-5" /><span className="text-[10px]">Accueil</span></button>
        <button onClick={() => handleTabChange('buddy')} className={`flex flex-col items-center gap-1 ${currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Users className="w-5 h-5" /><span className="text-[10px]">Buddy</span></button>
        <button onClick={() => handleTabChange('fitbot')} className={`flex flex-col items-center gap-1 ${currentTab === 'fitbot' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Bot className="w-5 h-5" /><span className="text-[10px]">FitBot IA</span></button>
        <button onClick={() => handleTabChange('workout')} className={`flex flex-col items-center gap-1 ${currentTab === 'workout' || currentTab === 'live_tracker' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}>
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center -mt-2.5 shadow-lg"><Plus className="w-5 h-5" /></div>
          <span className="text-[10px]">Séance</span>
        </button>
        <button onClick={() => handleTabChange('calculator')} className={`flex flex-col items-center gap-1 ${currentTab === 'calculator' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Calculator className="w-5 h-5" /><span className="text-[10px]">Calculateur</span></button>
        <button onClick={() => handleTabChange('chat')} className={`flex flex-col items-center gap-1 ${currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}>
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {unreadChatCount > 0 && <span className="absolute top-1 right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-neutral-950 shadow-md animate-pulse">{unreadChatCount}</span>}
          </div>
          <span className="text-[10px]">Chat</span>
        </button>
        <button onClick={() => handleTabChange('profile')} className={`flex flex-col items-center gap-1 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><User className="w-5 h-5" /><span className="text-[10px]">Profil</span></button>
      </nav>
    </div>
  );
}
