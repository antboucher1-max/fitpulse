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
  BookOpen,
  Calculator,
  Bot,
  Check
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
  {
    name: 'Basic-Fit Tournai (Bastion)',
    address: 'Chaussée de Lille 322',
    city: 'Tournai',
    zip: '7500',
    lat: 50.6095,
    lng: 3.3762
  },
  {
    name: 'Basic-Fit Tournai (Froyennes)',
    address: 'Boulevard des Déportés 30',
    city: 'Tournai',
    zip: '7500',
    lat: 50.6051,
    lng: 3.3934
  },
  {
    name: 'Basic-Fit Mouscron',
    address: 'Rue de Menin 435',
    city: 'Mouscron',
    zip: '7700',
    lat: 50.7423,
    lng: 3.2091
  },
  {
    name: 'Basic-Fit Mons',
    address: 'Chaussée de Binche 113',
    city: 'Mons',
    zip: '7000',
    lat: 50.4542,
    lng: 3.9658
  },
  {
    name: 'Basic-Fit La Louvière',
    address: 'Rue de Bouvy 50',
    city: 'La Louvière',
    zip: '7100',
    lat: 50.4812,
    lng: 4.1905
  },
  {
    name: 'Basic-Fit Charleroi (Ville 2)',
    address: 'Rue de Couillet 31',
    city: 'Charleroi',
    zip: '6000',
    lat: 50.4131,
    lng: 4.4447
  },
  {
    name: 'Basic-Fit Waterloo',
    address: 'Chaussée de Bruxelles 254',
    city: 'Waterloo',
    zip: '1410',
    lat: 50.7224,
    lng: 4.3981
  },
  {
    name: 'Basic-Fit Wavre',
    address: 'Chaussée de Louvain 20',
    city: 'Wavre',
    zip: '1300',
    lat: 50.7183,
    lng: 4.6072
  },
  {
    name: 'Basic-Fit Namur (Bouge)',
    address: 'Chaussée de Louvain 445',
    city: 'Bouge (Namur)',
    zip: '5004',
    lat: 50.4735,
    lng: 4.8712
  },
  {
    name: 'Basic-Fit Liège (Saint-Lambert)',
    address: 'Place Saint-Lambert 32',
    city: 'Liège',
    zip: '4000',
    lat: 50.6452,
    lng: 5.5734
  },
  {
    name: 'Basic-Fit Liège (Ans)',
    address: 'Chaussée du Roi Albert 7/13',
    city: 'Ans',
    zip: '4430',
    lat: 50.6548,
    lng: 5.5291
  },
  {
    name: 'Basic-Fit Arlon (Hydrion)',
    address: "Parc Commercial de l'Hydrion 31b",
    city: 'Arlon',
    zip: '6700',
    lat: 49.6841,
    lng: 5.8173
  }
];

interface ExerciseGuide {
  id: string;
  name: string;
  category: 'Pectoraux' | 'Dos' | 'Jambes' | 'Épaules' | 'Bras';
  target: string;
  description: string;
  tips: string[];
  mediaType: 'image' | 'video';
  mediaUrl: string;
}

const EXERCISE_GUIDES_DATABASE: ExerciseGuide[] = [
  {
    id: 'ex-1',
    name: 'Développé couché (Barre)',
    category: 'Pectoraux',
    target: 'Grand pectoral, Triceps, Deltoïdes antérieurs',
    description: "Le roi des exercices pour le haut du corps. Allongé sur le banc, descendez la barre de manière contrôlée vers le milieu de la poitrine avant de développer explosivement vers le haut.",
    tips: [
      "Gardez les pieds bien à plat sur le sol pour la stabilité.",
      "Resserrez les omoplates et sortez la cage thoracique.",
      "Évitez de rebondir avec la barre sur la poitrine."
    ],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
  },
  {
    id: 'ex-2',
    name: 'Squat barre nuque',
    category: 'Jambes',
    target: 'Quadriceps, Fessiers, Ischio-jambiers, Sangle abdominale',
    description: "Exercice fondamental pour le bas du corps. Placez la barre sur les trapèzes, fléchissez les genoux et poussez les fesses vers l'arrière comme pour vous asseoir.",
    tips: [
      "Regardez droit devant vous pour garder le dos neutre.",
      "Gardez les genoux alignés dans la direction des pointes de pieds.",
      "Descendez au moins jusqu'à ce que les cuisses soient parallèles au sol."
    ],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800'
  },
  {
    id: 'ex-3',
    name: 'Soulevé de terre (Deadlift)',
    category: 'Dos',
    target: 'Chaîne postérieure complète (Lombaires, Fessiers, Ischios)',
    description: "Soulevez une charge lourde posée au sol en tendant les jambes et le buste simultanément tout en maintenant le dos parfaitement droit.",
    tips: [
      "Gardez la barre au plus près des tibias et des cuisses tout au long du mouvement.",
      "Verrouillez le gainage abdominal avant de soulever.",
      "Ne arrondissez jamais le bas du dos en fin de mouvement."
    ],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'
  },
  {
    id: 'ex-4',
    name: 'Tractions à la barre fixe (Pull-up)',
    category: 'Dos',
    target: 'Grand dorsal, Brachial, Biceps',
    description: "Suspendez-vous à une barre fixe en pronation et tirez votre corps vers le haut jusqu'à ce que votre menton dépasse la barre.",
    tips: [
      "Initiez le mouvement en abaissant les omoplates.",
      "Évitez de vous balancer (élan excessif).",
      "Contrôlez la phase de descente pour maximiser l'hypertrophie."
    ],
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'
  }
];

const isMatchingClub = (postClubName?: string, selectedClubName?: string): boolean => {
  if (!postClubName || !selectedClubName) return false;
  if (postClubName === selectedClubName) return true;

  const normalize = (str: string) =>
    str.toLowerCase().replace(/basic-fit\s*/gi, '').replace(/[()]/g, '').trim();

  const p = normalize(postClubName);
  const s = normalize(selectedClubName);

  if (p === s) return true;

  if (p.includes('froyennes') && s.includes('froyennes')) return true;
  if ((p === 'tournai' || p.includes('bastion')) && (s === 'tournai' || s.includes('bastion'))) return true;
  if (p.includes('mouscron') && s.includes('mouscron')) return true;
  if (p.includes('mons') && s.includes('mons')) return true;
  if (p.includes('louvière') && s.includes('louvière')) return true;
  if (p.includes('charleroi') && s.includes('charleroi')) return true;
  if (p.includes('namur') && s.includes('namur')) return true;
  if (p.includes('waterloo') && s.includes('waterloo')) return true;
  if (p.includes('wavre') && s.includes('wavre')) return true;
  if (p.includes('arlon') && s.includes('arlon')) return true;
  if (p.includes('ans') && s.includes('ans')) return true;
  if (p.includes('lambert') && s.includes('lambert')) return true;

  return false;
};

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
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

        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
};

interface SetEntry {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface LiveExercise {
  name: string;
  sets: SetEntry[];
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
  image_zoom?: number;
  image_pos_x?: number;
  image_pos_y?: number;
  club_name: string;
  session_type: string;
  caption: string;
  duration_minutes: number;
  calories_burned: number;
  exercises: { name: string; sets: number; reps: number; weight: number }[];
  likes_count: number;
  comments_count: number;
  comments?: Comment[];
  created_at: string;
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

interface Buddy {
  id: string;
  name: string;
  gender: 'F' | 'M';
  avatar_url: string;
  level: string;
  schedule: string;
  goal: string;
  club: string;
}

interface DBMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

interface AIChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const DEFAULT_FRIEND_STORIES: Story[] = [
  {
    id: 'demo-s1',
    user_id: 'b1',
    username: 'Thomas D.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    caption: 'Prêt pour exploser le PR au dev couché 🔥',
    club_name: 'Basic-Fit Tournai (Bastion)',
    likes_count: 3,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'demo-s2',
    user_id: 'b2',
    username: 'Sarah L.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    caption: 'Fin de séance HIIT cardio, les jambes en feu 💦',
    club_name: 'Basic-Fit Tournai (Bastion)',
    likes_count: 5,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [level, setLevel] = useState<'Débutant' | 'Intermédiaire' | 'Avancé'>('Intermédiaire');
  const [homeClub, setHomeClub] = useState<string>('Basic-Fit Tournai (Bastion)');

  const [clubsList, setClubsList] = useState<ClubLocation[]>(CLUBS_DATABASE);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'tools' | 'chat' | 'leaderboard' | 'profile'>('feed');
  const [toolsSubTab, setToolsSubTab] = useState<'calculator' | 'guides' | 'coach'>('calculator');
  const [feedFilterMode, setFeedFilterMode] = useState<'all' | 'friends'>('all');
  const [selectedClub, setSelectedClub] = useState<string>('Basic-Fit Tournai (Bastion)');

  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    { sender: 'ai', text: "Salut ! Je suis **FitBot**, ton coach sportif personnel. Quel est ton objectif du moment ou de quelle séance as-tu besoin aujourd'hui au Basic-Fit ?" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [liveWorkoutType, setLiveWorkoutType] = useState('Musculation (Push)');
  const [liveExercises, setLiveExercises] = useState<LiveExercise[]>([
    {
      name: 'Développé couché',
      sets: [
        { setNumber: 1, reps: 10, weight: 70, completed: false },
        { setNumber: 2, reps: 10, weight: 75, completed: false },
        { setNumber: 3, reps: 8, weight: 80, completed: false }
      ]
    }
  ]);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  const [targetWeight, setTargetWeight] = useState<number>(80);
  const [barWeight, setBarWeight] = useState<number>(20);

  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const [friendIds, setFriendIds] = useState<string[]>(['b1', 'b2']);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState<string[]>(['b3']);
  const [buddyTabSubMode, setBuddyTabSubMode] = useState<'discover' | 'my_friends'>('discover');

  const [cloudStories, setCloudStories] = useState<Story[]>([]);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [storyCommentInput, setStoryCommentInput] = useState('');
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyUploading, setStoryUploading] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const [workoutCaption, setWorkoutCaption] = useState('');
  const [taggedPartner, setTaggedPartner] = useState<string>('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // États pour le cadrage et le glisser-déposer de l'image (requis pour la compilation)
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'post' | 'story'>('post');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(90);

  const [filterWomenOnly, setFilterWomenOnly] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');

  const buddiesList: Buddy[] = [
    {
      id: 'b1',
      name: 'Thomas D.',
      gender: 'M',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      level: 'Avancé',
      schedule: 'Lun, Mer, Ven (18h-20h)',
      goal: 'Prise de masse & Force',
      club: 'Basic-Fit Tournai (Bastion)'
    },
    {
      id: 'b2',
      name: 'Sarah L.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      level: 'Intermédiaire',
      schedule: 'Mardi & Jeudi (12h-13h30)',
      goal: 'Cardio, HIIT & Tonification',
      club: 'Basic-Fit Tournai (Bastion)'
    },
    {
      id: 'b3',
      name: 'Élodie M.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 'Débutant',
      schedule: 'Mercredi & Samedi matin',
      goal: 'Remise en forme & Fessiers',
      club: 'Basic-Fit Tournai (Froyennes)'
    },
    {
      id: 'b4',
      name: 'Maxime V.',
      gender: 'M',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      level: 'Avancé',
      schedule: 'Samedi & Dimanche matin',
      goal: 'Powerlifting (Squat / Dev couché)',
      club: 'Basic-Fit Mouscron'
    },
    {
      id: 'b5',
      name: 'Camille R.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      level: 'Intermédiaire',
      schedule: 'Tous les soirs (17h30-19h)',
      goal: 'Prise de masse & Musculation',
      club: 'Basic-Fit Mons'
    }
  ];

  const [selectedBuddyChat, setSelectedBuddyChat] = useState<Buddy | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Gestionnaires de glisser-déposer pour le recadrage de photo (souris & tactile)
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - imagePos.x, y: e.clientY - imagePos.y });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    setImagePos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDraggingImage(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDraggingImage(true);
    setDragStart({ x: touch.clientX - imagePos.x, y: touch.clientY - imagePos.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingImage) return;
    const touch = e.touches[0];
    setImagePos({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDraggingImage(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) {
        setSelectedClub(activeUser.user_metadata.home_club);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) {
        setSelectedClub(activeUser.user_metadata.home_club);
      }
    });

    fetchCloudPosts();
    fetchDirectMessages();
    fetchCloudStories();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          setAllMessages((prev) => [...prev, payload.new as DBMessage]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'direct_messages' },
        (payload) => {
          setAllMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stories' },
        (payload) => {
          setCloudStories((prev) => [payload.new as Story, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedBuddyChat]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutActive]);

  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
    setFeedLoading(false);
  };

  const fetchCloudStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCloudStories(data as Story[]);
      }
    } catch (err) {}
  };

  const fetchDirectMessages = async () => {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAllMessages(data as DBMessage[]);
    }
  };

  const combinedAllStories = [...cloudStories, ...DEFAULT_FRIEND_STORIES];
  const myFriendsList = buddiesList.filter((b) => friendIds.includes(b.id));
  const myFriendNames = myFriendsList.map((f) => f.name);
  const friendRequestsList = buddiesList.filter((b) => friendRequestsReceived.includes(b.id));

  const twentyFourHoursAgoMs = Date.now() - 24 * 3600 * 1000;
  const friendStoriesList = combinedAllStories.filter((s) => {
    const storyDate = new Date(s.created_at).getTime();
    const isUnder24h = !isNaN(storyDate) ? storyDate >= twentyFourHoursAgoMs : true;
    const isFriendOrMe =
      s.user_id === user?.id ||
      friendIds.includes(s.user_id) ||
      myFriendNames.includes(s.username);
    return isUnder24h && isFriendOrMe;
  });

  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userText = aiInput.trim();
    setAiMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setAiInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      let reply = "C'est une excellente question pour ton entraînement au Basic-Fit ! Je te conseille de bien t'hydrater, de garder 90 secondes de repos entre tes séries lourdes et de maintenir une exécution propre pour maximiser ton recrutement musculaire.";
      const lower = userText.toLowerCase();

      if (lower.includes('programme') || lower.includes('split') || lower.includes('push')) {
        reply = "Voici une base solide pour une séance **Push** (Pectoraux, Épaules, Triceps) :\n1. Développé couché (4 séries de 8-10 reps)\n2. Développé incliné aux haltères (3 séries de 10-12 reps)\n3. Élévations latérales aux câbles (4 séries de 15 reps)\n4. Extension triceps à la poulie (3 séries de 12 reps).";
      } else if (lower.includes('nutrition') || lower.includes('manger') || lower.includes('protéine')) {
        reply = "Pour optimiser ta récupération et ta prise de masse, vise environ 1,6g à 2g de protéines par kilo de poids de corps par jour. Privilège les sources de qualité (poulet, œufs, skyr, tofu) et prends une collation riche en glucides et protéines 1h30 avant d'aller t'entraîner.";
      } else if (lower.includes('dos') || lower.includes('pull')) {
        reply = "Pour une séance **Pull** (Dos / Biceps) efficace :\n1. Tractions ou Tirage vertical (4 séries de 8-10 reps)\n2. Rowing barre ou haltère (3 séries de 10 reps)\n3. Pull-over à la poulie (3 séries de 15 reps)\n4. Curl biceps haltères (3 séries de 12 reps).";
      }

      setAiMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsAiThinking(false);
    }, 1000);
  };

  const handleToggleSetComplete = (exIndex: number, setIndex: number) => {
    const updated = [...liveExercises];
    const targetSet = updated[exIndex].sets[setIndex];
    targetSet.completed = !targetSet.completed;
    setLiveExercises(updated);

    if (targetSet.completed) {
      setTimerSeconds(90);
      setIsTimerRunning(true);
    }
  };

  const addLiveExerciseRow = () => {
    setLiveExercises([
      ...liveExercises,
      {
        name: 'Nouvel exercice',
        sets: [
          { setNumber: 1, reps: 10, weight: 50, completed: false },
          { setNumber: 2, reps: 10, weight: 50, completed: false },
          { setNumber: 3, reps: 10, weight: 50, completed: false }
        ]
      }
    ]);
  };

  const updateLiveSetField = (exIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const updated = [...liveExercises];
    updated[exIndex].sets[setIndex][field] = value;
    setLiveExercises(updated);
  };

  const handleFinishLiveWorkout = async () => {
    if (!user) return;
    setIsUploading(true);

    let uploadedImageUrl = undefined;
    if (postImageFile) {
      try {
        const compressedBlob = await compressImage(postImageFile, 800, 0.7);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {}
    }

    const flattenedExercises = liveExercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets.length,
      reps: ex.sets[0]?.reps || 10,
      weight: ex.sets[0]?.weight || 0
    }));

    const durationMin = Math.max(1, Math.round(workoutElapsedSeconds / 60));
    const caloriesEst = durationMin * 7;

    const newPostData = {
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'Athlète',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      partner_name: taggedPartner || null,
      image_url: uploadedImageUrl || null,
      image_zoom: imageZoom,
      image_pos_x: imagePos.x,
      image_pos_y: imagePos.y,
      club_name: selectedClub,
      session_type: liveWorkoutType,
      caption: workoutCaption || 'Séance intense validée avec FitPulse Tracker 💪',
      duration_minutes: durationMin,
      calories_burned: caloriesEst,
      exercises: flattenedExercises,
      likes_count: 0,
      comments_count: 0,
      comments: []
    };

    const { data, error } = await supabase.from('posts').insert([newPostData]).select('*');

    if (!error && data && data.length > 0) {
      setPosts([data[0] as Post, ...posts]);
      setIsWorkoutActive(false);
      setWorkoutCaption('');
      setTaggedPartner('');
      setPostImageFile(null);
      setPostImagePreview(null);
      setImageZoom(1);
      setImagePos({ x: 0, y: 0 });
      setWorkoutElapsedSeconds(0);
      setCurrentTab('feed');
    }

    setIsUploading(false);
  };

  const formatElapsedTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const calculatePlates = (totalWeight: number, bar: number) => {
    let weightPerSide = (totalWeight - bar) / 2;
    if (weightPerSide < 0) weightPerSide = 0;

    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const breakdown: { plate: number; count: number }[] = [];

    let remaining = weightPerSide;
    for (const plate of availablePlates) {
      if (remaining <= 0) break;
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        breakdown.push({ plate, count });
        remaining = Number((remaining - count * plate).toFixed(2));
      }
    }
    return { weightPerSide, breakdown };
  };

  const plateResult = calculatePlates(targetWeight, barWeight);

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500">
              <Zap className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center tracking-tight mb-1">FitPulse</h1>
          <p className="text-xs text-neutral-400 text-center mb-6">
            {isSignUp ? 'Création de ton profil athlète' : 'Connecte-toi à ton espace'}
          </p>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Pseudo public</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex_Fit"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Âge</label>
                    <input
                      type="number"
                      required
                      min="14"
                      max="99"
                      placeholder="28"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Genre</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300"
                    >
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Niveau</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Mon Basic-Fit "Maison"
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={gpsLoading}
                      className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      {gpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                      GPS autour de moi
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Ville, code postal, rue..."
                      value={clubSearchQuery}
                      onChange={(e) => setClubSearchQuery(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {displayedClubs.map((club) => {
                      const isSelected = homeClub === club.name;
                      return (
                        <div
                          key={club.name}
                          onClick={() => setHomeClub(club.name)}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition border ${
                            isSelected
                              ? 'bg-orange-600/20 border-orange-500 text-white font-bold'
                              : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 ${isSelected ? 'text-orange-500' : 'text-neutral-600'}`} />
                            <div>
                              <span className="block leading-tight text-neutral-200">{club.name}</span>
                              <span className="text-[10px] text-neutral-500 leading-tight">
                                {club.address ? `${club.address}, ` : ''}{club.zip} {club.city}
                              </span>
                            </div>
                          </div>
                          {club.distance !== null && (
                            <span className="text-[10px] text-orange-400 font-mono font-semibold ml-2 whitespace-nowrap">
                              {club.distance} km
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 text-xs"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-xs text-neutral-400 hover:text-white mt-5 transition"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    );
  }

  const activePostForComments = posts.find((p) => p.id === activeCommentPostId);

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

        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-[11px] rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-orange-500 max-w-[170px] truncate"
        >
          {clubsList.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 pb-24">
        {currentTab === 'feed' && (
          <div className="space-y-4">
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-3">
              <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
                <div
                  onClick={() => setIsCreatingStory(true)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                >
                  <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center p-0.5 group-hover:border-orange-500 transition">
                    <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">
                      {user.user_metadata?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '+'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white border-2 border-neutral-950 shadow-md">
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-300 tracking-tight">Ta story</span>
                </div>

                {friendStoriesList.map((story, index) => {
                  const isViewed = viewedStoryIds.includes(story.id);
                  return (
                    <div
                      key={story.id}
                      onClick={() => {
                        setActiveStoryIndex(index);
                        setStoryProgress(0);
                        setIsStoryPaused(false);
                      }}
                      className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
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

            <div className="bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
              <button
                onClick={() => setFeedFilterMode('all')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition truncate px-2 ${
                  feedFilterMode === 'all' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Fil du club ({selectedClub.replace('Basic-Fit ', '')})
              </button>
              <button
                onClick={() => setFeedFilterMode('friends')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  feedFilterMode === 'friends' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Mes Amis ({myFriendsList.length})
              </button>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                  {timerSeconds}s
                </div>
                <div>
                  <h4 className="text-xs font-bold">Chronomètre de repos</h4>
                  <p className="text-[11px] text-neutral-400">Garde le tempo entre tes séries</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-500 text-xs"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(initialTime);
                  }}
                  className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {feedLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900/50 rounded-3xl border border-neutral-800/60 p-6">
                {feedFilterMode === 'friends'
                  ? "Aucune publication de tes amis pour l'instant."
                  : `Aucune publication pour l'instant à ${selectedClub}. Sois le premier à publier !`}
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isLiked = likedPosts[post.id];
                const isMyPost = post.user_id === user.id || post.username === (user.user_metadata?.username || user.email?.split('@')[0]);

                return (
                  <article
                    key={post.id}
                    className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-sm overflow-hidden relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm leading-snug">{post.username}</h3>
                            {post.partner_name && (
                              <span className="text-[10px] bg-orange-500/10 text-orange-400 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-orange-500/20">
                                <Users className="w-3 h-3" /> avec {post.partner_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-orange-400 font-medium">
                            <MapPin className="w-3 h-3" />
                            {post.club_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/50">
                          {post.session_type}
                        </span>
                        {isMyPost && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            title="Supprimer ma publication"
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {post.image_url && (
                      <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-72 w-full relative flex items-center justify-center">
                        <img
                          src={post.image_url}
                          alt="Séance"
                          style={{
                            transform: `translate(${post.image_pos_x || 0}px, ${post.image_pos_y || 0}px) scale(${post.image_zoom || 1})`,
                            transformOrigin: 'center center'
                          }}
                          className="max-h-full max-w-full object-contain pointer-events-none"
                        />
                      </div>
                    )}

                    {post.caption && <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>}

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-300">
                        <Clock className="w-3 h-3 text-orange-500" />
                        {post.duration_minutes || 60} min
                      </span>
                      <span className="flex items-center gap-1 text-[11px] bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-300">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {post.calories_burned || 400} kcal
                      </span>
                    </div>

                    {post.exercises && post.exercises.length > 0 && (
                      <div className="bg-neutral-950/70 rounded-2xl p-3 border border-neutral-800/60 space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                          Exercices enregistrés
                        </span>
                        {post.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-neutral-900 last:border-none">
                            <span className="font-medium text-neutral-300">{ex.name}</span>
                            <span className="font-mono text-[11px] text-orange-400 font-semibold">
                              {ex.sets} × {ex.reps} {ex.weight > 0 && `@ ${ex.weight} kg`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-neutral-400 text-xs">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-medium transition ${
                          isLiked ? 'text-red-500' : 'hover:text-neutral-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>
                      <button
                        onClick={() => setActiveCommentPostId(post.id)}
                        className="flex items-center gap-1.5 hover:text-orange-400 font-medium transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count || post.comments?.length || 0} commentaires</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-neutral-200 transition">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {currentTab === 'tools' && (
          <div className="space-y-4">
            <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
              <button
                onClick={() => setToolsSubTab('calculator')}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  toolsSubTab === 'calculator' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" /> Disques
              </button>
              <button
                onClick={() => setToolsSubTab('guides')}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  toolsSubTab === 'guides' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Fiches 3D
              </button>
              <button
                onClick={() => setToolsSubTab('coach')}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  toolsSubTab === 'coach' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" /> FitBot IA
              </button>
            </div>

            {toolsSubTab === 'calculator' ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-orange-500" />
                  <div>
                    <h2 className="text-base font-black tracking-tight">Calculateur de Disques</h2>
                    <p className="text-[11px] text-neutral-400">Calcule instantanément les disques à mettre par côté de la barre</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Poids total visé (kg)</label>
                    <input
                      type="number"
                      step="2.5"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-orange-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Poids de la barre (kg)</label>
                    <select
                      value={barWeight}
                      onChange={(e) => setBarWeight(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                    >
                      <option value={20}>Barre Olympique (20 kg)</option>
                      <option value={15}>Barre technique / Féminine (15 kg)</option>
                      <option value={10}>Petite barre droite (10 kg)</option>
                      <option value={0}>Sans barre / Machine (0 kg)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-900">
                    <span className="text-neutral-400">Charge par côté :</span>
                    <span className="font-mono font-bold text-white text-sm">{plateResult.weightPerSide} kg</span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block pt-1">
                    Disques à placer sur CHAQUE côté de la barre :
                  </span>

                  {plateResult.breakdown.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">Le poids visé est égal ou inférieur au poids de la barre.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {plateResult.breakdown.map((item, idx) => (
                        <div key={idx} className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                            {item.plate} kg
                          </span>
                          <span className="text-xs font-mono font-extrabold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                            × {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : toolsSubTab === 'guides' ? (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-neutral-300 px-1">Bibliothèque & Tutoriels Vidéo / 3D</h2>
                {EXERCISE_GUIDES_DATABASE.map((guide) => (
                  <div key={guide.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden space-y-3">
                    <div className="h-48 w-full relative bg-black">
                      {guide.mediaType === 'video' ? (
                        <video src={guide.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={guide.mediaUrl} alt={guide.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-600 text-white rounded-full text-[10px] font-bold shadow">
                        {guide.category} {guide.mediaType === 'video' && '• Animation 3D'}
                      </span>
                      <h3 className="absolute bottom-3 left-3 right-3 text-base font-extrabold text-white leading-snug">
                        {guide.name}
                      </h3>
                    </div>

                    <div className="p-4 pt-0 space-y-2.5">
                      <div className="text-[11px] text-orange-400 font-semibold bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                        🎯 Cible : {guide.target}
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{guide.description}</p>
                      
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Conseils d'exécution :</span>
                        {guide.tips.map((tip, i) => (
                          <div key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[70vh]">
                <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">FitBot • Coach IA Sport & Nutrition</h3>
                    <span className="text-[10px] text-green-400 font-medium">● En ligne pour t'aider</span>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line ${
                          msg.sender === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-neutral-700/50'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiThinking && (
                    <div className="flex items-center gap-2 text-neutral-400 text-xs italic p-2">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> FitBot réfléchit à ton programme...
                    </div>
                  )}
                </div>

                <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Donne-moi un programme Push pour ce soir..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleSendAiMessage}
                    className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition"
                  >
                    <SendHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'buddy' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-black tracking-tight">Réseau & Buddy</h2>
                </div>
              </div>

              <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
                <button
                  onClick={() => setBuddyTabSubMode('discover')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    buddyTabSubMode === 'discover' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Découvrir des partenaires
                </button>
                <button
                  onClick={() => setBuddyTabSubMode('my_friends')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    buddyTabSubMode === 'my_friends' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Mes Amis ({myFriendsList.length})
                </button>
              </div>

              {buddyTabSubMode === 'discover' && (
                <div className="space-y-2.5 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                      <Filter className="w-3.5 h-3.5 text-orange-500" />
                      <span>Filtres de recherche</span>
                    </div>

                    <button
                      onClick={() => setFilterWomenOnly(!filterWomenOnly)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        filterWomenOnly
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/20 ring-2 ring-pink-400'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>🚺</span> Entre femmes {filterWomenOnly && '✓'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-1">
                {filteredBuddies.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    {buddyTabSubMode === 'my_friends'
                      ? "Tu n'as pas encore d'amis dans ta liste."
                      : 'Aucun partenaire ne correspond à ces critères dans ce club.'}
                  </div>
                ) : (
                  filteredBuddies.map((buddy) => {
                    const isFriend = friendIds.includes(buddy.id);
                    return (
                      <div key={buddy.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col space-y-3 relative overflow-hidden">
                        {buddy.gender === 'F' && <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-bl-lg" />}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img src={buddy.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm text-white">{buddy.name}</h3>
                                {buddy.gender === 'F' && (
                                  <span className="text-[10px] bg-pink-950/80 text-pink-300 border border-pink-500/30 px-1.5 py-0.2 rounded font-semibold">
                                    Femme
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-orange-400 font-semibold">{buddy.level}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFriend(buddy.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                isFriend
                                  ? 'bg-neutral-900 border border-neutral-700 text-green-400 hover:text-red-400'
                                  : 'bg-neutral-900 border border-neutral-700 hover:border-orange-500 text-neutral-200'
                              }`}
                            >
                              {isFriend ? <><UserCheck className="w-3.5 h-3.5" /> Amis</> : <><UserPlus className="w-3.5 h-3.5" /> Ajouter</>}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBuddyChat(buddy);
                                setCurrentTab('chat');
                              }}
                              className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition shadow-md shadow-orange-600/20"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-neutral-900/60 rounded-xl p-2.5 text-[11px] space-y-1 text-neutral-300">
                          <div><strong className="text-neutral-400">Créneaux :</strong> {buddy.schedule}</div>
                          <div><strong className="text-neutral-400">Objectif :</strong> {buddy.goal}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'workout' && (
          <div className="space-y-4">
            {!isWorkoutActive ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto border border-orange-500/30">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Prêt pour ta séance au Basic-Fit ?</h2>
                  <p className="text-xs text-neutral-400 mt-1">Démarre le tracker actif pour enregistrer tes séries, charges et temps de repos en direct.</p>
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Type de séance</label>
                    <select
                      value={liveWorkoutType}
                      onChange={(e) => setLiveWorkoutType(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Musculation (Push)">Musculation (Push - Pectoraux / Épaules / Triceps)</option>
                      <option value="Musculation (Pull)">Musculation (Pull - Dos / Biceps)</option>
                      <option value="Musculation (Legs)">Musculation (Legs - Jambes)</option>
                      <option value="Full Body">Full Body</option>
                      <option value="Cardio & HIIT">Cardio & HIIT</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsWorkoutActive(true);
                    setWorkoutElapsedSeconds(0);
                  }}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-white" /> Démarrer la séance en direct
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-neutral-900 border border-orange-500/40 rounded-3xl p-4 flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">Séance en cours</span>
                    <h3 className="font-extrabold text-sm text-white">{liveWorkoutType}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 font-mono text-sm font-black text-orange-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {formatElapsedTime(workoutElapsedSeconds)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {liveExercises.map((ex, exIndex) => (
                    <div key={exIndex} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => {
                            const updated = [...liveExercises];
                            updated[exIndex].name = e.target.value;
                            setLiveExercises(updated);
                          }}
                          className="bg-transparent text-xs font-bold text-white border-b border-neutral-700 focus:outline-none focus:border-orange-500 pb-1 w-2/3"
                        />
                        <button
                          onClick={() => setLiveExercises(liveExercises.filter((_, i) => i !== exIndex))}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-12 text-[10px] font-bold text-neutral-500 uppercase px-1">
                          <span className="col-span-2 text-center">Série</span>
                          <span className="col-span-4 text-center">Poids (kg)</span>
                          <span className="col-span-4 text-center">Reps</span>
                          <span className="col-span-2 text-center">Validé</span>
                        </div>

                        {ex.sets.map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className={`grid grid-cols-12 items-center gap-1.5 p-2 rounded-xl border transition ${
                              set.completed ? 'bg-green-950/20 border-green-500/40' : 'bg-neutral-950 border-neutral-800'
                            }`}
                          >
                            <span className="col-span-2 text-center font-bold text-xs text-neutral-400">#{set.setNumber}</span>
                            <div className="col-span-4 px-1">
                              <input
                                type="number"
                                value={set.weight}
                                onChange={(e) => updateLiveSetField(exIndex, setIndex, 'weight', Number(e.target.value))}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1 text-xs text-center font-bold text-orange-400"
                              />
                            </div>
                            <div className="col-span-4 px-1">
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => updateLiveSetField(exIndex, setIndex, 'reps', Number(e.target.value))}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1 text-xs text-center font-bold text-white"
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <button
                                onClick={() => handleToggleSetComplete(exIndex, setIndex)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                                  set.completed ? 'bg-green-600 text-white shadow-md shadow-green-600/30' : 'bg-neutral-800 text-neutral-500 hover:text-white'
                                }`}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          const updated = [...liveExercises];
                          const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
                          updated[exIndex].sets.push({
                            setNumber: updated[exIndex].sets.length + 1,
                            reps: lastSet ? lastSet.reps : 10,
                            weight: lastSet ? lastSet.weight : 50,
                            completed: false
                          });
                          setLiveExercises(updated);
                        }}
                        className="w-full py-2 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-orange-400" /> Ajouter une série
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLiveExerciseRow}
                  className="w-full py-3 bg-neutral-900 border border-dashed border-neutral-700 hover:border-orange-500 rounded-2xl text-xs font-bold text-neutral-300 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4 text-orange-400" /> Ajouter un exercice à la séance
                </button>

                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Partager ma séance</h4>

                  {/* Zone de preview photo de séance avec glisser-déposer résolu */}
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Photo de séance (Optionnel)</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPostImageFile(file);
                        setPostImagePreview(URL.createObjectURL(file));
                        setImageZoom(1);
                        setImagePos({ x: 0, y: 0 });
                      }
                    }} className="hidden" />

                    {postImagePreview ? (
                      <div className="space-y-3">
                        <div
                          ref={previewContainerRef}
                          className="relative rounded-2xl overflow-hidden border border-neutral-700 w-full aspect-square bg-neutral-950 flex items-center justify-center touch-none cursor-move"
                          onMouseDown={handleDragStart}
                          onMouseMove={handleDragMove}
                          onMouseUp={handleDragEnd}
                          onMouseLeave={handleDragEnd}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        >
                          <img
                            src={postImagePreview}
                            alt=""
                            style={{
                              transform: `translate(${imagePos.x}px, ${imagePos.y}px) scale(${imageZoom})`,
                              transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out',
                              objectFit: 'cover',
                              width: '100%',
                              height: '100%',
                              transformOrigin: 'center'
                            }}
                            className="pointer-events-none select-none"
                            draggable={false}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPostImageFile(null);
                              setPostImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-full z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <ZoomIn className="w-4 h-4 text-neutral-400" />
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={imageZoom}
                            onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-xl text-xs text-neutral-400 flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-orange-500" /> Ajouter une photo
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Partenaire (Buddy)</label>
                    <select
                      value={taggedPartner}
                      onChange={(e) => setTaggedPartner(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">Séance solo</option>
                      {myFriendsList.map((f) => (
                        <option key={f.id} value={f.name}>{f.name} (Ami ✓)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Notes / Ressenti</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Super séance de push, grosse congestion !"
                      value={workoutCaption}
                      onChange={(e) => setWorkoutCaption(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    onClick={handleFinishLiveWorkout}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 text-xs"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Terminer et publier sur le fil'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'chat' && (
          <div className="space-y-4">
            {selectedBuddyChat ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
                <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedBuddyChat(null)}
                      className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <img src={selectedBuddyChat.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-orange-500/30" />
                    <div>
                      <h3 className="font-bold text-xs text-white">{selectedBuddyChat.name}</h3>
                      <span className="text-[10px] text-green-400 font-medium">● Direct ({selectedBuddyChat.club})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendMessage("Dispo pour une séance ensemble aujourd'hui ? 🏋️‍♂️")}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-orange-400 text-[11px] font-bold flex items-center gap-1 border border-neutral-700"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Séance duo
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversationForBuddy(selectedBuddyChat.id, selectedBuddyChat.name, e)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {currentChatMessages.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs">
                      Aucun message. Envoie le premier message pour lancer la discussion !
                    </div>
                  ) : (
                    currentChatMessages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                              isMe ? 'bg-orange-600 text-white rounded-tr-none shadow-md shadow-orange-600/10' : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-neutral-500 mt-1 px-1">{timeStr}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Écrire à ${selectedBuddyChat.name}...`}
                    value={currentMessageInput}
                    onChange={(e) => setCurrentMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition"
                  >
                    <SendHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    <h2 className="text-base font-black tracking-tight">Messagerie Directe</h2>
                  </div>
                  <span className="text-[11px] text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                    {myFriendsList.length} contact{myFriendsList.length > 1 ? 's' : ''}
                  </span>
                </div>

                {friendRequestsList.length > 0 && (
                  <div className="space-y-2.5 bg-orange-500/5 border border-orange-500/20 p-3.5 rounded-2xl">
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" /> Demandes d'amis reçues ({friendRequestsList.length})
                    </span>
                    <div className="space-y-2">
                      {friendRequestsList.map((req) => (
                        <div key={req.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img src={req.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
                            <div>
                              <h4 className="font-bold text-xs text-white leading-tight">{req.name}</h4>
                              <span className="text-[10px] text-neutral-400">{req.club}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAcceptFriendRequest(req.id)}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Accepter
                            </button>
                            <button
                              onClick={() => handleDeclineFriendRequest(req.id)}
                              className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded-lg text-xs transition border border-neutral-800"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Discussions actives</span>
                  {myFriendsList.map((friend) => {
                    const friendMessages = allMessages.filter(
                      (m) => user && ((m.sender_id === user.id && m.receiver_id === friend.id) || (m.sender_id === friend.id && m.receiver_id === user.id))
                    );
                    const lastMessage = friendMessages[friendMessages.length - 1];

                    return (
                      <div
                        key={friend.id}
                        onClick={() => setSelectedBuddyChat(friend)}
                        className="bg-neutral-950 hover:bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800/80 flex items-center justify-between cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={friend.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-700" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-950 rounded-full" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-xs text-white">{friend.name}</h3>
                              <span className="text-[10px] text-neutral-500">● {friend.club.replace('Basic-Fit ', '')}</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                              {lastMessage ? (
                                <span>{lastMessage.sender_id === user?.id ? 'Moi : ' : ''}{lastMessage.text}</span>
                              ) : (
                                <span className="italic text-neutral-500">Commencer la conversation...</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-black tracking-tight">Records du club ({selectedClub})</h2>
            </div>

            <div className="space-y-2">
              {[
                { exercise: 'Développé couché', name: 'Maxime R.', weight: '145 kg', rank: '🥇' },
                { exercise: 'Squat', name: 'Julien D.', weight: '200 kg', rank: '🥇' },
                { exercise: 'Soulevé de terre', name: 'Thomas L.', weight: '230 kg', rank: '🥇' },
                { exercise: 'Tractions lestées', name: 'Romain B.', weight: '+45 kg', rank: '🥇' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                  <div>
                    <span className="text-xs font-bold text-white block">{item.exercise}</span>
                    <span className="text-[11px] text-neutral-400">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono text-orange-400">{item.weight}</span>
                    <span className="text-base">{item.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 mx-auto">
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-2xl">
                {user.user_metadata?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>

            <div>
              <h2 className="font-extrabold text-lg leading-tight">
                {user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user.email?.split('@')[0]}
              </h2>
              <p className="text-xs text-neutral-400">@{user.user_metadata?.username || user.email?.split('@')[0]}</p>
              <div className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 mt-2 font-semibold">
                <MapPin className="w-3 h-3" />
                {user.user_metadata?.home_club || selectedClub}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-red-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-neutral-800"
              >
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/80 px-2 py-2 flex justify-around items-center">
        <button
          onClick={() => setCurrentTab('feed')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Accueil</span>
        </button>

        <button
          onClick={() => setCurrentTab('buddy')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Buddy</span>
        </button>

        <button
          onClick={() => setCurrentTab('workout')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'workout' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center -mt-2.5 shadow-lg shadow-orange-600/30">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Séance</span>
        </button>

        <button
          onClick={() => setCurrentTab('tools')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'tools' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Outils</span>
        </button>

        <button
          onClick={() => setCurrentTab('chat')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Chat</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>
      </nav>
    </div>
  );
}
